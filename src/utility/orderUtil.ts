import { Addon, Item, Order, OrderPart } from "@/menu/structures";
import { lowestMissingValue, sum } from "./mathUtil";
import { ObjectId } from "mongodb";

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
	const addonPrices = addons.map(a => a.price);
	const addonTotal = sum(addonPrices);
	return quantity * (item.price + addonTotal);
}

export function calculateOrderSubtotal(items: Item[], addons: Addon[]) {
	const itemTotal = sum(items.map(i => i.price));
	const addonTotal = sum(addons.map(a => a.price));
	return itemTotal + addonTotal;
}

export function itemsFromOrder(order: Order, items: Item[]) {
	const result: Item[] = [];
	order.parts.forEach(part => {
		for(let i = 0; i < part.quantity; i++) {
			result.push(items.find(item => item._id === part.itemID)!);
		}
	});
	return result;
}

export function addonsFromOrder(order: Order, addons: Addon[]) {
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
	const result: Addon[] = [];
	addons.forEach(addon => {
		for(let i = 0; i < (selectedAddons.get(addon._id!) ?? 0); i++) {
			result.push(addon);
		}
	});

	return result;
}