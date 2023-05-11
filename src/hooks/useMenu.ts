import { Menu } from "@/menu/menuUtil";
import { Addon, Category, Item, Settings } from "@/menu/structures";
import { MenuRequest } from "@/pages/api/menu";
import postRequest from "@/utility/netUtil";
import { ObjectId } from "mongodb";
import { useCallback, useEffect, useState } from "react";

/** Hook used to retrieve and set data in the menu in the database */
export default function useMenu(admin: boolean) {
	const [menu, setMenu] = useState<Menu>();
	const [images, setImages] = useState<{ data: string, _id: ObjectId }[]>();
	const [menuLoaded, setMenuLoaded] = useState(false);

	const [settings, setSettings] = useState<Settings>();
	const [settingsLoaded, setSettingsLoaded] = useState(false);

	/** Function which sends a request to the server to fetch the menu and settings.
	 *  Stores the retrieved data in states. */
	const reFetch = useCallback(async () => {		
		await postRequest("menu", { intent: "get" }, async response => {
			if(response.status === 200) {
				const body = await response.json();
				setMenu(body.menu);
				setImages(body.images);
				setMenuLoaded(true);
			}
		});

		await postRequest("menu", { intent: "getsettings" }, async response => {
			if(response.status === 200) {
				const body = await response.json();
				setSettings(body.settings);
				setSettingsLoaded(true);
			}
		});
	}, []);

	// When the hook is mounted, fetch the data
	useEffect(() => {
		reFetch();
	}, [reFetch]);

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

	async function modifyObject(id: ObjectId, modifiedObject: Category | (Item & { imageData?: string }) | Addon) {
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
		menu, menuLoaded, reFetch,
		images,
		settings, settingsLoaded,
		addObject, removeObject, modifyObject,
		modifySettings
	};
}