import { ObjectId } from "mongodb";

interface IBuyable {
	_id?: ObjectId,
	name: string,
	price: number
}

export const ItemCollectionName = "MenuItem";
export interface Item extends IBuyable {
	type: "Item",
	imageID?: ObjectId,
	description: string,
	categoryIDs: ObjectId[],
	addonIDs: ObjectId[]
}

export const AddonCollectionName = "MenuAddon";
export interface Addon extends IBuyable {
	type: "Addon"
}

export const SettingsCollectionName = "MenuSettings";
export type Settings = {
	taxRate: number
}

export const CategoryCollectionName = "MenuCategory";
export type Category = {
	_id?: ObjectId,
	type: "Category",
	name: string,
	description: string
}

export type OrderPart = {
	partID?: number,
	itemID: ObjectId,
	quantity: number,
	addonIDs: ObjectId[],
	notes: string
}

export const OrderCollectionName = "MenuOrder";
export type Order = {
	_id?: ObjectId,
	parts: OrderPart[],
	notes: string,
	name: string,
	phone: string,
	timestamp: number
}