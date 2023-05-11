import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import { query } from "./auth";
import { getImages, getMenu } from "@/menu/menuUtil";
import { Addon, AddonCollectionName, Category, CategoryCollectionName, Item, ItemCollectionName, Settings, SettingsCollectionName } from "@/menu/structures";
import { ObjectId } from "mongodb";
import getCollection from "./db";
import sharp from "sharp";

// Define types needed for various device menu actions
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

// Finds the correct database collection by the specified menu object type
function getCollectionByType(type: "Category" | "Item" | "Addon") {
	switch (type) {
		case "Category": return getCollection(CategoryCollectionName);
		case "Item": return getCollection(ItemCollectionName);
		case "Addon": return getCollection(AddonCollectionName);
	}
}

export const config: PageConfig = {
	api: {
		responseLimit: false,
		bodyParser: {
			sizeLimit: '5mb'
		}
	}
}

/** API route to handle getting/sending data to the menu */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if(req.method === "POST") {
			// Check if the user is authorized as an admin
			const authorized = (await query(req, res)).status === 200;

			const menu = await getMenu();
			const images = await getImages();

			const request = req.body as MenuRequest;

			switch (request.intent) {
				case "get": {
					// If the user is requesting the menu, send it along with the image
					res.status(200).send({ menu, images });
					return;
				}
				case "add": {
					// If the user is requesting to change the menu, check authorization first
					if(authorized) {
						// Then, insert the attached object
						(await getCollectionByType(request.object.type))
							.insertOne(request.object);
						res.status(200).send({ message: `Added ${request.object.name} to ${request.object.type} Collection` });
					} else {
						// If the user is not authorized, deny the request
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "remove": {
					// If the user is requesting to change the menu, check authorization first
					if(authorized) {
						const objectCollection = await getCollectionByType(request.type);

						// Find the object from the collection and remove it from the database

						if(request.type === "Item") {
							// If the object to remove is an Item and it has an image, delete the image from the image collection as well
							const existingItem = await objectCollection.findOne({ _id: new ObjectId(request.id) });
							const imgId = existingItem?.imageID;

							if(imgId) {
								const imageCollection = await getCollection("MenuImages");
								imageCollection.deleteOne({ _id: new ObjectId(imgId) });
							}
						}

						const result = await objectCollection.deleteOne({ _id: new ObjectId(request.id) });

						if(result.acknowledged) {
							res.status(200).send({ message: `Removed ${result.deletedCount} from ${request.type}` });
						} else {
							res.status(500).send({ error: "An error occurred. No object removed." });
						}
					} else {
						// If the user is not authorized, deny the request
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "modify": {
					// If the user is requesting to change the menu, check authorization first
					if(authorized) {
						delete request.modifiedObject._id;

						const objectCollection = await getCollectionByType(request.modifiedObject.type);

						if(request.modifiedObject.type == "Item") {
							// If modifying an object, check if an image is attached to the request
							// Handle adding the new image, or changing/deleting the existing image
							const imageCollection = await getCollection("MenuImages");
							const existingItem = await objectCollection.findOne({ _id: new ObjectId(request.id) });
							const imgId = existingItem?.imageID;

							if(request.modifiedObject.imageData && request.modifiedObject.imageData.length !== 0) {

								// Use the Sharp image library to compress the image
								// Compresses the image to (at most) 360x360 jpg at 90% quality
								const parts = request.modifiedObject.imageData.split(";");
								const mimeType = parts[0].split(":")[1];
								const imageData = parts[1].split(",")[1];

								const buffer = Buffer.from(imageData, "base64");

								const compressed = sharp(buffer)
									.resize({
										width: 360,
										height: 360,
										fit: "inside"
									})
									.jpeg({
										quality: 90,
										force: true
									});
								
								const compressed64 = `data:${mimeType};base64,${(await (compressed.toBuffer())).toString("base64")}`;

								if(imgId) {
									await imageCollection.updateOne(
										{ _id: new ObjectId(imgId) },
										{ $set: { data: compressed64 } },
										{ upsert: false }
									);
								} else {
									const imageUpload = await imageCollection.insertOne({ data: compressed64 });
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
						// If the user is not authorized, deny the request
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "getsettings": {
					const settingsCollection = await getCollection(SettingsCollectionName);
					const settingsDocument = await settingsCollection.findOne({});
					const settings = settingsDocument as unknown as Settings;
					res.status(200).send({ settings });
					return;
				}
				case "modifysettings": {
					// If the user is requesting to change the settings, check authorization first
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
						// If the user is not authorized, deny the request
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