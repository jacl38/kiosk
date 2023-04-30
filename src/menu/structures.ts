export type Category = {
	name: string,
	description: string
}

export type Item = {
	name: string,
	description: string,
	categoryIDs: number[],
	availableAddonIDs: number[],
	basePrice: number
}

export type Addon = {
	name: string,
	price: string
}

export type OrderPart = {
	itemID: number,
	addonIDs: number[],
	notes: string
}

export type Order = {
	parts: OrderPart[],
	notes: string,
	name: string,
	phone: string
}