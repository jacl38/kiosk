import { Addon, Item, Order, OrderPart } from "@/menu/structures";
import { lowestMissingValue, sum } from "./mathUtil";
import { ObjectId } from "mongodb";
import { Menu } from "@/menu/menuUtil";

/** Add an OrderPart to the list of parts of an existing Order */
export function addPart(order: Order, part: OrderPart): Order {
	const lowestMissingPartID = lowestMissingValue(order.parts.map(p => p.partID ?? 0));
	return {
		...order,
		parts: [...order.parts, {...part, partID: lowestMissingPartID} ]
	}
}

/** Remove an existing OrderPart from the list of parts on an Order */
export function removePart(order: Order, partID: number): Order {
	return {
		...order,
		parts: order.parts.filter(p => p.partID !== partID)
	}
}

/** Change fields of an OrderPart from the list of parts of an Order, given a partID */
export function changePart(order: Order, partID: number, changedPart: Partial<OrderPart>) {
	return ({
		...order,
		parts: order.parts.map(p => {
			if(p.partID !== partID) return p;
			return { ...p, ...changedPart, partID }
		})
	});
}

/** Set supplied personal info, such as name, notes, and phone number of an order (all fields optional) */
export function setPersonalInfo(order: Order, info: { name?: string, notes?: string, phone?: string }): Order {
	return { ...order, ...info }
}

/** Finds the sum of the addon prices and base item price, and multiplies by the quantity */
export function calculatePartPrice(addons: Addon[], item: Item, quantity: number) {
	if(!addons || !item) return;
	const addonPrices = addons.map(a => a.price);
	const addonTotal = sum(addonPrices);
	return quantity * (item.price + addonTotal);
}

/** Finds the sum of all parts of the order */
export function calculateOrderSubtotal(items: Item[], addons: Addon[]) {
	if(!items || !addons) return;
	const itemTotal = sum(items.map(i => i.price))!;
	const addonTotal = sum(addons.map(a => a.price))!;
	return itemTotal + addonTotal;
}

/** Splits an order into an array of all of its parts */
export function itemsFromOrder(order: Order, items: Item[]) {
	if(!order || !items) return;
	const result: Item[] = [];
	order.parts.forEach(part => {
		for(let i = 0; i < part.quantity; i++) {
			result.push(items!.find(item => item._id === part.itemID)!);
		}
	});
	return result;
}

/** Splits an order into an array of all of its addons */
export function addonsFromOrder(order: Order, addons: Addon[]) {
	if(!order || !addons) return;
	const result: Addon[] = [];
	order.parts.forEach(part => {
		part.addonIDs.forEach(id => {
			const foundAddon = addons.find(a => a._id === id);
			if(foundAddon) {
				for(let i = 0; i < part.quantity; i++) {
					result.push(foundAddon);
				}
			}
		});
	});
	return result;
}

/** Takes in a Map<ObjectId, number>, where the ObjectId is an Addon ID, and the number
 *  is how many of that addon is in the OrderPart. Flattens this map into a one-dimensional
 *  array of addons, possibly with repeats */
export function flattenAddons(selectedAddons: Map<ObjectId, number>, addons: Addon[]) {
	if(!selectedAddons || !addons) return [];
	const result: Addon[] = [];
	addons.forEach(addon => {
		for(let i = 0; i < (selectedAddons.get(addon._id!) ?? 0); i++) {
			result.push(addon);
		}
	});

	return result;
}

/** Maps an Order's Item and Addon IDs to their respective objects,
 *  and attaches the calculated order subtotal. */
export function formatOrder(order: Order, menu: Menu) {
	// If either supplied inputs are null/undefined, return undefined
	if(!order || !menu) return;

	// This will be the return type of the function
	type FormattedOrder = {
		parts: FormattedPart[],
		name: string,
		notes: string,
		phone: string,
		price: number,
		timestamp: number
	}

	// Helper type to format a single OrderPart
	type FormattedPart = {
		item: Item,
		addons: { type: Addon, count: number }[],
		quantity: number,
		notes: string
	}

	// Set up the return value
	const result: FormattedOrder = {
		name: order.name,
		notes: order.notes,
		phone: order.phone,
		timestamp: order.timestamp,
		price: 0,
		parts: []
	}

	order.parts.forEach(part => {
		// Find the part that is represented by the itemID of this OrderPart
		const foundItem = menu.item.find(i => i._id === part.itemID);

		// If nothing found, do not try to add undefined to the array
		if(!foundItem) return;

		// Set up a map to keep track of how many times each
		// type of Addon appears in the list of addonIDs
		const addonsMap = new Map<Addon, number>();

		part.addonIDs.forEach(id => {
			// Find the addon represented by this addonID
			const foundAddon = menu.addon.find(a => a._id === id);

			// If nothing found, do not try to add undefined to the array
			if(!foundAddon) return;

			// Otherwise, add it to the addon map. Increment by 1 if it already exists
			addonsMap.set(foundAddon, (addonsMap.get(foundAddon) ?? 0) + 1);
			result.price += foundAddon.price * part.quantity;
		});

		// Create an array of objects of type { type: Addon, count: number } from the map
		const addons = Array.from(addonsMap).map(a => ({ type: a[0], count: a[1]}));

		result.parts.push({
			item: foundItem,
			quantity: part.quantity,
			addons,
			notes: part.notes
		});

		result.price += foundItem.price * part.quantity;
	});
	
	return result;
}