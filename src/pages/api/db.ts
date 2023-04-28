import { MongoClient } from "mongodb";

const dbUri = process.env.MONGODB_URI;

let client: MongoClient;
export let clientPromise: Promise<MongoClient>;

if(dbUri) {
	client = new MongoClient(dbUri);
	clientPromise = client.connect();
}

export default async function getCollection(collection: string) {
	const c = await clientPromise;
	return c.db("kiosk").collection(collection);
}