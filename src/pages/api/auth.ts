import { NextApiRequest, NextApiResponse } from "next";
import getCollection from "./db";
import { BinaryLike, createHash } from "crypto";
import { validateCredentials } from "../setup";
import { getCookie, setCookie } from "cookies-next";

export type AuthCredentials = { username: string, password: string }
export type AuthIntent = "query" | "login" | "logout" | "signup"
export type AuthRequest = {
	intent: AuthIntent,
	credentials: AuthCredentials
}

type Client = { id: number, token: string, lastLogin: number }

export type AuthFormat = {
	adminUsername: string,
	adminPasswordHash: string,
	adminLastLogin: number,
	adminToken: string,
	connectedClients: Client[]
}

/** Seconds before admin account session is invalidated and user needs to log in again. */
export const sessionTimeout = 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if(req.method === "POST") {

			const request = req.body as AuthRequest;
			const authCollection = await getCollection("auth");
			const passwordHash = hash(request.credentials.password);
			const adminAccount = await authCollection.findOne({}) as unknown as AuthFormat;

			switch (request.intent) {
				case "signup": {
					if(await adminAccountExists()) {
						res.status(400).send({
							message: "Cannot setup admin account: admin account already exists"
						});
						return;
					}
					if(!validateCredentials(request.credentials.username, request.credentials.password, request.credentials.password)) {
						res.status(400).send({
							message: "Username and password do not meet requirements"
						});
						return;
					}

					authCollection.insertOne({
						adminUsername: request.credentials.username,
						adminPasswordHash: passwordHash,
						adminLastLogin: Date.now(),
						adminToken: "",
						connectedClients: []
					} as AuthFormat);

					res.status(200).send({
						message: `Admin account created successfully: ${request.credentials.username}`
					});

					break;
				}
				case "query": {
					const userToken = getCookie("token", { req, res }) ?? "";

					const hasAdminAccount = adminAccount.adminToken !== undefined;
					const authenticated = hash(userToken as string) === adminAccount.adminToken;
					const adminTimeout = (Date.now() - adminAccount.adminLastLogin) / 1000 >= sessionTimeout;

					const body = { hasAdminAccount, authenticated: authenticated && !adminTimeout }

					const valid = hasAdminAccount && authenticated && !adminTimeout;

					const status = valid ? 200 : 401;

					res.status(status).send(body);
					return;

					break;
				}
				case "login": {
					if(!await adminAccountExists() || passwordHash !== adminAccount.adminPasswordHash) {
						res.status(400).send({ error: "Incorrect username or password" });
						return;
					}

					const sessionToken = hash(`${Date.now()}${request.credentials.password}`);
					setCookie("token", sessionToken, { req, res, maxAge: sessionTimeout, secure: true });

					await authCollection.replaceOne({
						adminUsername: request.credentials.username,
						adminPasswordHash: passwordHash
					} as AuthFormat, {
						adminUsername: request.credentials.username,
						adminPasswordHash: passwordHash,
						adminLastLogin: Date.now(),
						adminToken: hash(sessionToken)
					} as AuthFormat);

					res.status(200).send({ message: `Logged in user ${request.credentials.username}` });

					break;
				}
				case "logout": {
					
					break;
				}
			}

		}
	} catch(e) {
		console.error(e);
		res.status(400).send({});
	}
}

function hash(message: BinaryLike) {
	return createHash("sha512").update(message).digest("hex");
}

export async function adminAccountExists() {
	const authCollection = await getCollection("auth");
	return (await authCollection.countDocuments()) > 0;
}