import { Order, OrderPart } from "@/menu/structures";
import { lowestMissingValue } from "./mathUtil";

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

export function setPersonalInfo(order: Order, info: { name: string, notes: string, phone: string }): Order {
	return { ...order, ...info }
}