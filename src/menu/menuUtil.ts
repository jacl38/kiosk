import getCollection from "@/pages/api/db";
import {
	Category,	CategoryCollectionName,
	Item,		ItemCollectionName,
	Addon,		AddonCollectionName,
	Order,		OrderCollectionName,
	Settings,	SettingsCollectionName
} from "./structures";
import { ObjectId } from "mongodb";


export async function getSettings() {
	return await getCollection(SettingsCollectionName) as unknown as Category[];
}

export async function setSettings(settings: Settings) {
	(await getCollection(SettingsCollectionName)).replaceOne({}, settings);
}

// Helper functions to get menu structure collections from the database as arrays
export async function getCategories() {
	return await getCollection(CategoryCollectionName) as unknown as Category[];
}

export async function getItems() {
	return await getCollection(ItemCollectionName) as unknown as Item[];
}

export async function getAddons() {
	return await getCollection(AddonCollectionName) as unknown as Addon[];
}

export async function getOrders() {
	return await getCollection(OrderCollectionName) as unknown as Addon[];
}

export type Menu = {
	categories: Category[],
	items: Item[],
	addons: Addon[]
}

export async function getMenu(): Promise<Menu> {
	const categories = await getCategories();
	const items = await getItems();
	const addons = await getAddons();
	return { categories, items, addons }
}

// Helper functions to add menu structure objects to database collections

export async function addCategory(category: Category) {
	(await getCollection(CategoryCollectionName)).insertOne(category);
}

export async function addItem(item: Item) {
	(await getCollection(ItemCollectionName)).insertOne(item);
}

export async function addAddon(addon: Addon) {
	(await getCollection(AddonCollectionName)).insertOne(addon);
}

export async function addOrder(order: Order) {
	(await getCollection(OrderCollectionName)).insertOne(order);
}

// Helper functions to delete menu structure object from database collections
export async function deleteCategory(id: ObjectId) {
	(await getCollection(CategoryCollectionName)).deleteOne({ _id: id });
}

export async function deleteItem(id: ObjectId) {
	(await getCollection(ItemCollectionName)).deleteOne({ _id: id });
}

export async function deleteAddon(id: ObjectId) {
	(await getCollection(AddonCollectionName)).deleteOne({ _id: id });
}

export async function deleteOrder(id: ObjectId) {
	(await getCollection(OrderCollectionName)).deleteOne({ _id: id });
}

// Helper functions to modify menu structure objects from database collections
export async function modifyCategory(id: ObjectId, modifiedCategory: Category) {
	(await getCollection(CategoryCollectionName)).replaceOne(id, modifiedCategory);
}

export async function modifyItem(id: ObjectId, modifiedItem: Item) {
	(await getCollection(ItemCollectionName)).replaceOne(id, modifiedItem);
}

export async function modifyAddon(id: ObjectId, modifiedAddon: Addon) {
	(await getCollection(AddonCollectionName)).replaceOne(id, modifiedAddon);
}

export async function modifyOrder(id: ObjectId, modifiedOrder: Order) {
	(await getCollection(OrderCollectionName)).replaceOne(id, modifiedOrder);
}