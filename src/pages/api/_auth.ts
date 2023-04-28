// import { NextApiRequest, NextApiResponse } from "next";
// import getCollection from "./db";
// import { createHash } from "crypto";
// import { setCookie, getCookie, deleteCookie } from "cookies-next";

// export type AuthCredentials = { username: string, password: string }
// // export type AuthIntent = "query" | "modify" | "login" | "logout" | "signup" | "delete"

// export type AuthRequest = {
// 	intent: "query" | "login" | "logout" | "signup" | "delete",
// 	credentials: AuthCredentials
// } | {
// 	intent: "modify",
// 	credentials: AuthCredentials,
// 	newCredentials: AuthCredentials
// }

// const sessionTimeout = 10;

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
// 	try {
// 		const authCollection = await getCollection("auth");
		
// 		const request = req.body as AuthRequest;
// 		const passwordHash = createHash("sha512").update(request.credentials.password).digest("hex");

// 		const foundUser = (await authCollection.find({ username: request.credentials.username }).toArray())[0] ?? null;
// 		const userExists = foundUser !== null;
// 		const matchedPassword = userExists && foundUser.passwordHash === passwordHash;
// 		const foundSessionIsValid = userExists && foundUser.token === getCookie("token", { req: req, res: res });

// 		const foundSessionTimedOut = (Date.now() - foundUser.lastLogin)/1000 >= sessionTimeout;

// 		if(foundSessionTimedOut) {
// 			await authCollection.replaceOne({
// 				username: request.credentials.username
// 			}, { ...foundUser, token: "" });
// 			console.log(`Successfully timed out user "${request.credentials.username}"`);
// 		}

// 		let problems: string[] = [];

// 		if(req.method === "POST") {
// 			switch (request.intent) {
// 				case "query": {
// 					console.log(`Querying user ${request.credentials.username}`);
// 					if(userExists) {
// 						console.log(`-	User ${request.credentials.username} exists`);
// 						console.log(`-	Last login: ${new Date(foundUser.lastLogin).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })}`)
// 						if(matchedPassword) {
// 							console.log(`-	Matched ${request.credentials.username} password`);
// 						} else {
// 							console.log(`-	Incorrect password for ${request.credentials.username}`);
// 						}
// 						if(foundSessionIsValid && !foundSessionTimedOut) {
// 							console.log(`-	Session for ${request.credentials.username} is valid`);
// 						} else {
// 							console.log(`-	Session for ${request.credentials.username} is not valid`);
// 						}
// 					} else {
// 						console.log(`-	User ${request.credentials.username} does not exist`);
// 					}
// 					break;
// 				}

// 				case "login": {
// 					// No user found by given username
// 					// Or password hashes do not match
// 					if(!userExists || !matchedPassword) {
// 						problems.push(`Incorrect username or password`);
// 						break;
// 					}
					
// 					// Generate unique session token for cookie
// 					const sessionToken = createHash("sha512").update(`${Date.now()}${request.credentials.username}`).digest("hex");
// 					setCookie("token", sessionToken, { secure: true, sameSite: true, req: req, res: res, maxAge: sessionTimeout });

// 					// Update login info with latest login and new token
// 					await authCollection.replaceOne({
// 						username: request.credentials.username,
// 						passwordHash: passwordHash
// 					}, {
// 						username: request.credentials.username,
// 						passwordHash: passwordHash,
// 						lastLogin: Date.now(),
// 						token: sessionToken
// 					});

// 					console.log(`Successfully logged in user "${request.credentials.username}"`);

// 					break;
// 				}

// 				case "logout": {
// 					if(foundSessionIsValid) {
// 						await authCollection.replaceOne({
// 							username: request.credentials.username
// 						}, { ...foundUser, token: "" });
// 						deleteCookie("token", { req: req, res: res });
// 						console.log(`Successfully logged out user "${request.credentials.username}"`);
// 					}

// 					break;
// 				}

// 				case "signup": {
// 					if(userExists) { // cancel signup if user with that username already exists
// 						problems.push(`User with name ${request.credentials.username} already exists`);
// 						break;
// 					}
					
// 					// check if username and password meet requirements
					
// 					await authCollection.insertOne({
// 						username: request.credentials.username,
// 						passwordHash: passwordHash
// 					});

// 					console.log(`Successfully created user "${request.credentials.username}"`);

// 					break;
// 				}

// 				case "modify": {
// 					// check if current credentials are correct
// 					// change to new credentials
// 					break;
// 				}

// 				case "delete": {
// 					// check if current credentials are correct
// 					// delete from db
// 					// delete cookie
// 					break;
// 				}
// 			}

// 			if(problems.length > 0) {
// 				problems.forEach(problem => console.log(`Authentication problem: ${problem}`));
// 				res.status(400).send(problems);
// 				return;
// 			}
// 			res.status(200).send({});
// 		}
// 	} catch {
// 		res.status(400).send({});
// 	}
// }