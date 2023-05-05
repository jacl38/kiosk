import { NextApiRequest, NextApiResponse } from "next";
import getCollection from "./db";
import { BinaryLike, createHash } from "crypto";
import { validateCredentials } from "../setup";
import { getCookie, setCookie } from "cookies-next";
import { DeviceInfo } from "./device";

// Defines types needed for various authentication actions
// Query: Check client authorization status and admin account setup status
// Login: Logs client into the admin account
// Signup: Creates admin account
export type AuthCredentials = { username: string, password: string }
export type AuthIntent = "query" | "login" | "signup"
export type AuthRequest = {
	intent: AuthIntent,
	credentials: AuthCredentials
}

// Defines the admin account type entered into the database
export type AuthFormat = {
	adminUsername: string,
	adminPasswordHash: string,
	adminLastLogin: number,
	adminToken: string,
	connectedClients: DeviceInfo[]
}

/** Seconds before admin account session is invalidated and user needs to log in again. */
export const sessionTimeout = 60 * 60 * 24;

/** Used to validate client authentication status and existence of the admin account */
export async function query(req: NextApiRequest, res: NextApiResponse) {

	// Finds the admin account from the database
	const authCollection = await getCollection("auth");
	const adminAccount = await authCollection.findOne({}) as unknown as AuthFormat;
	const hasAdminAccount = adminAccount.adminToken !== undefined;

	// Checks if the admin account stored in the database was last logged into
	// less than the sessionTimeout ago
	const adminTimeout = (Date.now() - adminAccount.adminLastLogin) / 1000 >= sessionTimeout;

	
	// Checks if the (hash of the) user token is equal to the found admin account's token
	const userToken = getCookie("token", { req, res }) ?? "";
	const authenticated = hash(userToken as string) === adminAccount.adminToken;

	const body = { hasAdminAccount, authenticated: authenticated && !adminTimeout }

	const valid = hasAdminAccount && authenticated && !adminTimeout;

	// OK response if valid, Unauthorized if invalid
	const status = valid ? 200 : 401;

	return { status, body };
}

/** API route to handle admin account authentication */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if(req.method === "POST") {
			const request = req.body as AuthRequest;
			const passwordHash = hash(request.credentials.password);
			
			// Find admin account from database for comparison
			const authCollection = await getCollection("auth");
			const adminAccount = await authCollection.findOne({}) as unknown as AuthFormat;
			
			switch (request.intent) {
				case "signup": {
					// If admin account already exists, send error message
					if(await adminAccountExists()) {
						res.status(401).send({ message: "Cannot setup admin account: admin account already exists" });
						return;
					}

					// If credentials do not meet requirements, send error message
					if(!validateCredentials(request.credentials.username, request.credentials.password, request.credentials.password)) {
						res.status(400).send({ message: "Username and password do not meet requirements" });
						return;
					}

					// Otherwise, create new admin account with given credentials.
					authCollection.insertOne({
						adminUsername: request.credentials.username,
						adminPasswordHash: passwordHash,
						adminLastLogin: Date.now(),
						adminToken: "",
						connectedClients: []
					} as AuthFormat);

					// Send OK status
					res.status(200).send({ message: `Admin account created successfully: ${request.credentials.username}` });

					break;
				}
				case "query": {
					const { status, body } = await query(req, res);
					res.status(status).send(body);

					break;
				}
				case "login": {
					// Check if (hash of the) supplied password matches stored (hash of the) admin password in database.
					// Send error if not
					if(!await adminAccountExists() || passwordHash !== adminAccount.adminPasswordHash) {
						res.status(401).send({ error: "Incorrect username or password" });
						return;
					}

					// Generate session token and hand it to client to store as cookie
					// Cookie expires in {sessionTimeout} seconds
					const sessionToken = hash(`${Date.now()}${request.credentials.password}`);
					setCookie("token", sessionToken, { req, res, maxAge: sessionTimeout, secure: process.env.NODE_ENV !== "development", httpOnly: true });

					// Update the admin account in the database with the new values
					// for adminLastLogin and adminToken
					await authCollection.replaceOne({} as AuthFormat, {
						...adminAccount,
						adminLastLogin: Date.now(),
						adminToken: hash(sessionToken)
					} as AuthFormat);

					// Send OK status
					res.status(200).send({ message: `Logged in user ${request.credentials.username}` });

					break;
				}
			}

		}
	} catch(e) {
		// If error occurs not handled by exceptions above,
		// Send 500 Internal Server Error status
		console.error(e);
		res.status(500).send({ error: e });
	}
}

/** Uses SHA-512 encryption to hash a message to 128-character hex string */
export function hash(message: BinaryLike) {
	return createHash("sha512").update(message).digest("hex");
}

export async function adminAccountExists() {
	const authCollection = await getCollection("auth");
	return (await authCollection.countDocuments()) > 0;
}