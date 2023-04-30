export type OrderPart = {
	itemID: number,
	addonIDs: number[],
	notes: string
}

type Order = {
	parts: OrderPart[],
	notes: string,
	name: string,
	phone: string
}

export default Order;