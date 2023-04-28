import { NextApiRequest, NextApiResponse } from "next";
import getCollection from "./db";
import { createHash } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

export type AuthCredentials = { username: string, password: string }
export type AuthIntent = "query" | "login" | "logout" | "signup"
export type AuthRequest = {
	intent: AuthIntent,
	credentials: AuthCredentials
}

const sessionTimeout = 10;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const authCollection = await getCollection("auth");

		const request = req.body as AuthRequest;

		const passwordHash = createHash("sha512").update(request.credentials.password).digest("hex");
		const foundAdmin = (await authCollection.find({ adminUsername: request.credentials.username }).toArray())[0] ?? null;
		const matchedPassword = foundAdmin.adminPasswordHash === passwordHash;
		const sessionIsValid = foundAdmin.token === getCookie("token", { req, res });

		const sessionTimedOut = (Date.now() - foundAdmin.lastLogin)/1000 >= sessionTimeout;

		if(sessionTimedOut) {
			await authCollection.replaceOne({
				adminUsername: request.credentials.username
			}, { ...foundAdmin, token: "" });
			console.log(`Successfully timed out "${request.credentials.username}"`);
		}

		let problems: string[] = [];

		if(req.method === "POST") {
			switch (request.intent) {
				case "query": {
					console.log(`Querying user ${request.credentials.username}`);
					if(foundAdmin != null) {
						console.log(`-	User ${request.credentials.username} exists`);
						console.log(`-	Last login: ${new Date(foundAdmin.adminLastLogin).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })}`)
						if(matchedPassword) {
							console.log(`-	Matched ${request.credentials.username} password`);
						} else {
							console.log(`-	Incorrect password for ${request.credentials.username}`);
						}
						if(sessionIsValid && !sessionTimedOut) {
							console.log(`-	Session for ${request.credentials.username} is valid`);
						} else {
							console.log(`-	Session for ${request.credentials.username} is not valid`);
						}
					} else {
						console.log(`-	User ${request.credentials.username} does not exist`);
					}
					break;
				}

				case "login": {
					// No user found by given username
					// Or password hashes do not match
					if(!foundAdmin != null || !matchedPassword) {
						problems.push(`Incorrect username or password`);
						break;
					}
					
					// Generate unique session token for cookie
					const sessionToken = createHash("sha512").update(`${Date.now()}${request.credentials.username}`).digest("hex");
					setCookie("token", sessionToken, { secure: true, sameSite: true, req, res, maxAge: sessionTimeout });

					// Update login info with latest login and new token
					await authCollection.replaceOne({
						adminUsername: request.credentials.username,
						adminPasswordHash: passwordHash
					}, {
						adminUsername: request.credentials.username,
						adminPasswordHash: passwordHash,
						adminLastLogin: Date.now(),
						token: sessionToken
					});

					console.log(`Successfully logged in admin "${request.credentials.username}"`);

					break;
				}

				case "logout": {
					if(sessionIsValid) {
						await authCollection.replaceOne({
							adminUsername: request.credentials.username
						}, { ...foundAdmin, token: "" });
						deleteCookie("token", { req: req, res: res });
						console.log(`Successfully logged out user "${request.credentials.username}"`);
					}

					break;
				}

				case "signup": {
					
				}
			}
			res.status(200).send({});
		}
	} catch {
		
	}
}

export async function adminAccountExists() {
	const authCollection = await getCollection("auth");
	return (await authCollection.countDocuments()) > 0;
}