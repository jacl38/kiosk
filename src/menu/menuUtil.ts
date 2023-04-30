import getCollection from "@/pages/api/db";

export function formatMoney(money: number) {
	const rounded = money.toFixed(2);
	return `$${rounded}`;
}

export async function getCategories() {
	return await getCollection("MenuCategory");
}

export async function getItems() {
	return await getCollection("MenuItem");
}

export async function getAddons() {
	return await getCollection("MenuAddon");
}

export async function getOrders() {
	return await getCollection("MenuOrder");
}

export async function getMenu() {
	return {
		categories: getCategories(),
		items: getItems(),
		addons: getAddons(),
		orders: getOrders()
	}
}
