import { Order, OrderCollectionName } from "@/menu/structures";
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "./auth";
import getCollection from "./db";
import { devicePaired } from "./device";
import { ObjectId } from "mongodb";

// Define types needed for various order actions
export type OrderIntent = "get" | "getall" | "add" | "remove" | "closeout";
export type OrderRequest = {
	intent: "get"
} | {
	intent: "getall"
} | {
	intent: "add",
	order: Order
} | {
	intent: "remove",
	id: ObjectId
} | {
	intent: "closeout",
	id: ObjectId
}

/** API route to handle getting/sending data to the order system */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if(req.method === "POST") {
			// Check if the user is authorized as an admin
			const authorized = (await query(req, res)).status === 200;
			const paired = (await devicePaired(req, res));
			const allOrders = await getCollection(OrderCollectionName);

			const request = req.body as OrderRequest;

			switch(request.intent) {
				case "get": {
					// If the client is connected as an order screen (or manager),
					if(paired === "orders" || paired === "manage") {
						// Send all unfinished orders to the client
						const o = await allOrders.find({ finished: false }).toArray() as Order[];
						res.status(200).send({ orders: o });
					} else {
						// Otherwise, deny the request
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "getall": {
					// If the client is authorized as an admin
					if(authorized) {
						// Send all orders to the client
						const o = await allOrders.find({}).toArray() as Order[];
						res.status(200).send({ orders: o });
					} else {
						// Otherwise, deny the request
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "add": {
					// If the client is connected as a kiosk screen (or manager),
					if(paired === "kiosk" || paired === "manage") {
						// Insert the attached order to the database
						await allOrders.insertOne(request.order);
						res.status(200).send({ message: `Added ${request.order._id} to orders` });
					} else {
						// Otherwise, deny the request
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "remove": {
					// If the user is connected as a manager
					if(paired === "manage") {
						// Delete the order given by the attached ID
						const result = await allOrders.deleteOne({ _id: new ObjectId(request.id) });
						if(result.acknowledged) {
							res.status(200).send({ message: `Removed ${result.deletedCount} order(s)` });
						} else {
							res.status(500).send({ error: `An error occurred. No order removed.` })
						}
					} else {
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "closeout": {
					// If the client is connected as an order screen (or manager),
					if(paired === "orders" || paired === "manage") {
						// Set the selected order as finished
						const result = await allOrders.updateOne(
							{ _id: new ObjectId(request.id) },
							{ $set: { finished: true } },
							{ upsert: false }
						);
						if(result.acknowledged) {
							res.status(200).send({ message: `Closed out order ${request.id}` });
						} else {
							res.status(500).send({ error: `An error occurred. No order closed out.` });
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
		console.log(e);
	}
}