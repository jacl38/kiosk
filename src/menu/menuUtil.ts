import getCollection from "@/pages/api/db";
import { Addon, AddonCollectionName, Category, CategoryCollectionName, Item, ItemCollectionName, Order, OrderCollectionName } from "./structures";

// Helper functions to get menu structure collections from the database
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

export async function getMenu() {
	return {
		categories: await getCategories(),
		items: await getItems(),
		addons: await getAddons(),
		orders: await getOrders()
	}
}

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