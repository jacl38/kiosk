import { NextApiRequest, NextApiResponse } from "next";
import { query } from "./auth";
import { getAddons, getCategories, getItems, getMenu } from "@/menu/menuUtil";
import { Addon, AddonCollectionName, Category, CategoryCollectionName, Item, ItemCollectionName, Settings, SettingsCollectionName } from "@/menu/structures";
import { Binary, ObjectId } from "mongodb";
import getCollection from "./db";

export type MenuIntent = "get" | "add" | "remove" | "modify" | "getsettings" | "modifysettings";
export type MenuRequest = {
	intent: "get"
} | {
	intent: "add",
	object: Category | Item | Addon
} | {
	intent: "remove",
	type: "Category" | "Item" | "Addon",
	id: ObjectId
} | {
	intent: "modify",
	id: ObjectId,
	modifiedObject: Category | (Item & { imageData?: string }) | Addon
} | {
	intent: "getsettings"
} | {
	intent: "modifysettings",
	modifiedSettings: Settings
}

function getCollectionByType(type: "Category" | "Item" | "Addon") {
	switch (type) {
		case "Category": return getCollection(CategoryCollectionName);
		case "Item": return getCollection(ItemCollectionName);
		case "Addon": return getCollection(AddonCollectionName);
	}
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if(req.method === "POST") {
			const authorized = (await query(req, res)).status === 200;
			const menu = await getMenu();

			const request = req.body as MenuRequest;

			switch (request.intent) {
				case "get": {
					res.status(200).send({ menu });
					return;
				}
				case "add": {
					if(authorized) {
						(await getCollectionByType(request.object.type))
							.insertOne(request.object);
						res.status(200).send({ message: `Added ${request.object.name} to ${request.object.type} Collection` });
					} else {
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "remove": {
					if(authorized) {
						const deleted = await (await getCollectionByType(request.type)).deleteOne({ $where() { return this._id === request.id } });
						if(deleted.acknowledged) {
							res.status(200).send({ message: `Remove ${deleted.deletedCount} from ${request.type}` });
						} else {
							res.status(500).send({ error: "An error occurred. No object removed." });
						}
					} else {
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "modify": {
					if(authorized) {
						delete request.modifiedObject._id;

						const objectCollection = await getCollectionByType(request.modifiedObject.type);

						if(request.modifiedObject.type == "Item") {
							const imageCollection = await getCollection("MenuImages");
							const existingItem = await objectCollection.findOne({ _id: new ObjectId(request.id) });
							const imgId = existingItem?.imageID;

							if(request.modifiedObject.imageData && request.modifiedObject.imageData.length !== 0) {
								if(imgId) {
									await imageCollection.updateOne(
										{ _id: new ObjectId(imgId) },
										{ $set: { data: request.modifiedObject.imageData } },
										{ upsert: false }
									);
								} else {
									const imageUpload = await imageCollection.insertOne({ data: request.modifiedObject.imageData });
									request.modifiedObject.imageID = imageUpload.insertedId;
								}
							} else {
								await imageCollection.deleteOne({ _id: new ObjectId(imgId) });
								request.modifiedObject.imageID = undefined;
							}

							delete request.modifiedObject.imageData;
						}

						const result = await objectCollection.updateOne(
							{ _id: new ObjectId(request.id) },
							{ $set: request.modifiedObject },
							{ upsert: false }
						);

						if(result.acknowledged) {
							res.status(200).send({ message: `Modified ${result.modifiedCount} from ${request.modifiedObject.type}` });
						} else {
							res.status(500).send({ error: "An error ocurred. No object deleted." });
						}
					} else {
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "getsettings": {
					if(authorized) {
						const settingsCollection = await getCollection(SettingsCollectionName);
						const settingsDocument = await settingsCollection.findOne({});
						const settings = settingsDocument as unknown as Settings;
						res.status(200).send({ settings });
					} else {
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "modifysettings": {
					if(authorized) {
						const settingsCollection = await getCollection(SettingsCollectionName);
						const result = await settingsCollection.updateOne({ $where: () => true }, { $set: {
							taxRate: request.modifiedSettings.taxRate
						} as Settings }, { upsert: true });
						if(result.acknowledged) {
							res.status(200).send({ message: "Modified settings" });
						} else {
							res.status(500).send({ error: "An error ocurred. No settings changed." });
						}
					} else {
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
			}
		}
	} catch(e) {
		res.status(500).send({ error: e });
		console.error(e);
	}
}