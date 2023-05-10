import { Addon, Item, Order, OrderPart } from "@/menu/structures";
import { lowestMissingValue, sum } from "./mathUtil";
import { ObjectId } from "mongodb";
import { Menu } from "@/menu/menuUtil";

export function addPart(order: Order, part: OrderPart): Order {
	const lowestMissingPartID = lowestMissingValue(order.parts.map(p => p.partID ?? 0));
	return {
		...order,
		parts: [...order.parts, {...part, partID: lowestMissingPartID} ]
	}
}

export function removePart(order: Order, partID: number): Order {
	return {
		...order,
		parts: order.parts.filter(p => p.partID !== partID)
	}
}

export function changePart(order: Order, partID: number, changedPart: Partial<OrderPart>) {
	return ({
		...order,
		parts: order.parts.map(p => {
			if(p.partID !== partID) return p;
			return { ...p, ...changedPart, partID }
		})
	});
}

export function setPersonalInfo(order: Order, info: { name?: string, notes?: string, phone?: string }): Order {
	return { ...order, ...info }
}

export function calculatePartPrice(addons: Addon[], item: Item, quantity: number) {
	if(!addons || !item) return;
	const addonPrices = addons.map(a => a.price);
	const addonTotal = sum(addonPrices);
	return quantity * (item.price + addonTotal);
}

export function calculateOrderSubtotal(items: Item[], addons: Addon[]) {
	if(!items || !addons) return;
	const itemTotal = sum(items.map(i => i.price))!;
	const addonTotal = sum(addons.map(a => a.price))!;
	return itemTotal + addonTotal;
}

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

export function formatOrder(order: Order, menu: Menu) {
	if(!order || !menu) return;
	type FormattedPart = {
		item: Item,
		addons: { type: Addon, count: number }[],
		quantity: number,
		notes: string
	}
	type FormattedOrder = {
		parts: FormattedPart[],
		name: string,
		notes: string,
		phone: string,
		price: number,
		timestamp: number
	}

	const result: FormattedOrder = {
		name: order.name,
		notes: order.notes,
		phone: order.phone,
		timestamp: order.timestamp,
		price: 0,
		parts: []
	}

	const allAddons: Addon[] = [];

	order.parts.forEach(part => {
		const foundItem = menu.item.find(i => i._id === part.itemID);
		if(!foundItem) return;

		const addonsMap = new Map<Addon, number>();
		part.addonIDs.forEach(id => {
			const foundAddon = menu.addon.find(a => a._id === id);
			if(!foundAddon) return;
			addonsMap.set(foundAddon, (addonsMap.get(foundAddon) ?? 0) + 1);
			allAddons.push(foundAddon);
			result.price += foundAddon.price * part.quantity;
		});

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