import { Order, OrderCollectionName } from "@/menu/structures";
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "./auth";
import getCollection from "./db";
import { devicePaired } from "./device";
import { ObjectId } from "mongodb";

export type OrderIntent = "get" | "add" | "remove" | "closeout";
export type OrderRequest = {
	intent: "get"
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if(req.method === "POST") {
			const authorized = (await query(req, res)).status === 200;
			const paired = (await devicePaired(req, res));
			const allOrders = await getCollection(OrderCollectionName);

			const request = req.body as OrderRequest;

			switch(request.intent) {
				case "get": {
					if(authorized) {
						const o = await allOrders.find({}).toArray() as Order[];
						res.status(200).send({ orders: o });
					} else {
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "add": {
					if(paired) {
						await allOrders.insertOne(request.order);
						res.status(200).send({ message: `Added ${request.order._id} to orders` });
					} else {
						res.status(401).send({ error: "Unauthorized" });
					}
					return;
				}
				case "remove": {
					if(paired) {
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
					if(paired) {
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