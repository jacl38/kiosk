// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {

}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if(uri) {
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

type Data = {
	name: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	const client = await clientPromise;

	const db = client.db("kiosk");

	await db.collection("kiosk-test").insertOne({ testField: 1234 });

	const testNum = await db.collection("kiosk-test").countDocuments();

	res.status(200).json({ name: `tested ${testNum} times` });
}
