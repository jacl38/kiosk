import { Menu } from "@/menu/menuUtil";
import { Addon, Category, Item } from "@/menu/structures";
import { MenuRequest } from "@/pages/api/menu";
import postRequest from "@/utility/netUtil";
import { ObjectId } from "mongodb";
import { useEffect, useState } from "react";

export default function useMenu() {
	const [loaded, setLoaded] = useState(false);

	const [menu, setMenu] = useState<Menu>();

	useEffect(() => {
		(async function () {
			const request: MenuRequest = { intent: "get" }
			
			await postRequest("menu", request, async response => {
				if(response.status === 200) {
					setMenu(await response.json());
					setLoaded(true);
				}
			});
		})();
	}, []);

	async function addObject(object: Category | Item | Addon) {
		const request: MenuRequest = { intent: "add", object }
		
		await postRequest("menu", request, async response => {
			return response.status === 200;
		});
	}

	async function removeObject(type: "Category" | "Item" | "Addon", id: ObjectId) {
		const request: MenuRequest = { intent: "remove", type, id };

		await postRequest("menu", request, async response => {
			return response.status === 200;
		});
	}

	async function modifyObject(id: ObjectId, modifiedObject: Category | Item | Addon) {
		const request: MenuRequest = { intent: "modify", id, modifiedObject };

		await postRequest("menu", request, async response => {
			return response.status === 200;
		});
	}

	return { menu, loaded, addObject, removeObject, modifyObject };
}