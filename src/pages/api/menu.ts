import { NextApiRequest, NextApiResponse } from "next";
import { query } from "./auth";
import { getAddons, getCategories, getItems, getMenu } from "@/menu/menuUtil";
import { Addon, AddonCollectionName, Category, CategoryCollectionName, Item, ItemCollectionName } from "@/menu/structures";
import { ObjectId } from "mongodb";
import getCollection from "./db";

export type MenuIntent = "get" | "add" | "remove" | "modify";
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
	modifiedObject: Category | Item | Addon
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
						const deleted = await (await getCollectionByType(request.type)).deleteOne({ _id: request.id });
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
						const modified = await (await getCollectionByType(request.modifiedObject.type))
							.updateOne({ _id: request.id }, request.modifiedObject);
						if(modified.acknowledged) {
							res.status(200).send({ message: `Modified ${modified.modifiedCount} from ${request.modifiedObject.type}` });
						} else {
							res.status(500).send({ error: "An error ocurred. No object deleted." });
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