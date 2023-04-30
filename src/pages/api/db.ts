import { MongoClient } from "mongodb";

// Get URI of the Mongo database instance from environment variable
const dbUri = process.env.MONGODB_URI;

let client: MongoClient;
export let clientPromise: Promise<MongoClient>;

// Set up the database client if the URI is found
// Print an error if connection fails
if(dbUri) {
	client = new MongoClient(dbUri);
	clientPromise = client.connect();
} else {
	console.error(`Cannot connect to MongoDB. Check environment variables (MONGODB_URI)`);
}

export default async function getCollection(collection: string) {
	const c = await clientPromise;
	return c.db("kiosk").collection(collection);
}