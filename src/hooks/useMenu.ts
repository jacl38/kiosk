import { Menu } from "@/menu/menuUtil";
import { Addon, Category, Item, Settings } from "@/menu/structures";
import { MenuRequest } from "@/pages/api/menu";
import postRequest from "@/utility/netUtil";
import { ObjectId } from "mongodb";
import { useEffect, useState } from "react";

export default function useMenu(admin: boolean) {
	const [menu, setMenu] = useState<Menu>();
	const [menuLoaded, setMenuLoaded] = useState(false);

	const [settings, setSettings] = useState<Settings>();
	const [settingsLoaded, setSettingsLoaded] = useState(false);

	useEffect(() => {
		(async function () {			
			await postRequest("menu", { intent: "get" }, async response => {
				if(response.status === 200) {
					const body = await response.json();
					setMenu(body.menu);
					setMenuLoaded(true);
				}
			});
			
			if(admin) {
				await postRequest("menu", { intent: "getsettings" }, async response => {
					if(response.status === 200) {
						const body = await response.json();
						setSettings(body.settings);
						setSettingsLoaded(true);
					}
				});
			}
		})();
	}, []);

	async function addObject(object: Category | Item | Addon) {
		if(!admin) return;
		const request: MenuRequest = { intent: "add", object }
		
		await postRequest("menu", request, async response => {
			return response.status === 200;
		});
	}

	async function removeObject(type: "Category" | "Item" | "Addon", id: ObjectId) {
		if(!admin) return;
		const request: MenuRequest = { intent: "remove", type, id };

		await postRequest("menu", request, async response => {
			return response.status === 200;
		});
	}

	async function modifyObject(id: ObjectId, modifiedObject: Category | Item | Addon) {
		if(!admin) return;
		const request: MenuRequest = { intent: "modify", id, modifiedObject };

		await postRequest("menu", request, async response => {
			return response.status === 200;
		});
	}

	async function modifySettings(modifiedSettings: Settings) {
		if(!admin) return;
		const request: MenuRequest = { intent: "modifysettings", modifiedSettings };

		await postRequest("menu", request, async response => {
			return response.status === 200;
		});
	}

	return {
		menu, menuLoaded,
		settings, settingsLoaded,
		addObject, removeObject, modifyObject,
		modifySettings
	};
}