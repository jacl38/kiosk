export const SettingsCollectionName = "MenuSettings";
export type Settings = {
	taxRate: number
}

export const CategoryCollectionName = "MenuCategory";
export type Category = {
	type: "Category",
	name: string,
	description: string
}

export const ItemCollectionName = "MenuItem";
export type Item = {
	type: "Item",
	name: string,
	description: string,
	categoryIDs: number[],
	availableAddonIDs: number[],
	price: number
}

export const AddonCollectionName = "MenuAddon";
export type Addon = {
	type: "Addon",
	name: string,
	price: string
}

export type OrderPart = {
	itemID: number,
	addonIDs: number[],
	notes: string
}

export const OrderCollectionName = "MenuOrder";
export type Order = {
	parts: OrderPart[],
	notes: string,
	name: string,
	phone: string,
	timestamp: number
}