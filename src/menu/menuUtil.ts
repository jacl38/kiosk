import getCollection from "@/pages/api/db";

/** Formats a floating point number as money.
 * 	e.g. 1.61803398875 -> "$1.62" */
export function formatMoney(money: number) {
	const rounded = money.toFixed(2);
	return `$${rounded}`;
}

// Helper functions to get menu structure collections from the database
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
