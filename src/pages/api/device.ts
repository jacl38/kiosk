import { NextApiRequest, NextApiResponse } from "next";
import { AuthFormat, hash, query } from "./auth";
import getCollection from "./db";
import { getCookie, setCookie } from "cookies-next";

export type DeviceType = "kiosk" | "orders" | "manage";
export type DeviceInfo = {
	id: number,
	name: string,
	token: string,
	type: DeviceType,
	pairDate: number
}

// Defines types needed for various device authorization actions
export type PairIntent = "pair" | "open" | "query" | "delete" | "rename";
export type PairRequest = {
	intent: "pair",
	deviceType?: DeviceType
} | {
	intent: "open" | "query"
} | {
	intent: "delete",
	deviceID: number
} | {
	intent: "rename",
	deviceID: number,
	newName: string
}

let pairingEnabled = false;
let pairingTimer: NodeJS.Timer;

/** Time before pairing automatically closes (seconds). */
const closePairTimeout = 30;

/** API route to handle device (kiosk or order screen) authorization */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if(req.method === "POST") {
			const request = req.body as PairRequest;

			// Find admin account from database for comparison
			const authCollection = await getCollection("auth");
			const adminAccount = await authCollection.findOne({}) as unknown as AuthFormat;

			const authorizedDevices = adminAccount.connectedClients as unknown as DeviceInfo[] ?? [];
			const authenticated = (await query(req, res)).status === 200;

			switch (request.intent) {
				case "open": {
					// Only allow client to open pairing mode if
					// authorized as administrator
					if(authenticated) {
						pairingEnabled = true;
						clearTimeout(pairingTimer);
						pairingTimer = setTimeout(() => pairingEnabled = false, closePairTimeout * 1000);
						// Enable pairing if not already enabled, and
						// reset the timer to automatically close pairing
						// if reopen signal is not received within {closePairTimeout} seconds

						res.status(200).send({ message: "Refreshed pair timer" });
						return;
					}
					res.status(401).send({ error: "Unauthorized" });
					return;
				}
				case "pair": {
					// If the connecting client is already authenticated as administrator,
					// allow pairing without setting up as a new device
					if(authenticated) {
						res.status(200).send({ id: 0 });
						return;
					}

					const deviceToken = (getCookie("device-token", { req, res }) ?? "") as string;

					// If the client device has a token and that token is already authorized
					if(deviceToken && authorizedDevices.map(d => d.token).includes(hash(deviceToken))) {
						const foundDevice = authorizedDevices.find(d => d.token === hash(deviceToken));

						// If the client device is a different type than the one already authenticated in the database
						// e.g. connecting device is kiosk, token is registered as an order screen
						if(foundDevice?.type !== request.deviceType) {
							res.status(401).send({ error: "Device type error" });
							return;
						}

						const deviceID = foundDevice?.id;
						res.status(200).send({ id: deviceID });
						return;
					}

					// If the client does not have a valid token and pairing mode is on,
					// issue the client a token and register it in the database
					if(pairingEnabled) {

						// Find the lowest unused device ID from the list of authorized devices
						// e.g. if devices with ids [1, 2, 3, 6, 7, 12] are registered,
						// the lowest unused ID is 4
						const ids = authorizedDevices.map(d => d.id).sort((a, b) => a - b);

						let lowestUnusedDeviceID = 1;
						const highestUsedDeviceID = ids[ids.length - 1] ?? 1;
						for(let i = 1; i <= highestUsedDeviceID + 1; i++) {
							if(!ids.includes(i)) {
								lowestUnusedDeviceID = i;
								break;
							}
						}

						// Create a new token and issue it to the client
						const newToken = hash(`${new Date()}${lowestUnusedDeviceID}`);
						setCookie("device-token", newToken, { req, res, secure: process.env.NODE_ENV !== "development" });

						const info: DeviceInfo = {
							id: lowestUnusedDeviceID,
							name: `New ${request.deviceType ?? "device"} screen`,
							pairDate: Date.now(),
							type: request.deviceType ?? "kiosk",
							token: hash(newToken)
						}

						// Add the device to the list and update it in the database
						authorizedDevices.push(info);
						authCollection.replaceOne({}, {
							...adminAccount,
							connectedClients: authorizedDevices
						} as AuthFormat);

						res.status(200).send({ message: "Paired" });
						return;
					}

					res.status(401).send({ error: "Unauthorized" });
					return;
				}
				case "query": {
					// Sends the list of authorized devices if connected client
					// is authenticated as the administrator
					if(authenticated) {
						res.status(200).send({ devices: authorizedDevices });
						return;
					}
					res.status(401).send({ error: "Unauthorized" });
					return;
				}
				case "delete": {
					// Allows the administrator to delete a device from the database
					if(authenticated) {
						// Send an error if the device with the specified ID does not exist in the database
						const deviceExists = authorizedDevices.find(d => d.id === request.deviceID);
						if(!deviceExists) {
							res.status(404).send({ error: "Device not found" });
							return;
						}
						
						// Remove a device from the list if the ID matches
						authCollection.replaceOne({}, {
							...adminAccount,
							connectedClients: authorizedDevices.filter(d => d.id !== request.deviceID)
						} as AuthFormat);

						res.status(200).send({ message: "Deleted" });
						return;
					}
					res.status(401).send({ error: "Unauthorized" });
					return;
				}
				case "rename": {
					// Allows the administrator to rename a device in the database
					if(authenticated) {
						// Send an error if the device with the specified ID does not exist in the database
						const deviceExists = authorizedDevices.find(d => d.id === request.deviceID);
						if(!deviceExists) {
							res.status(404).send({ error: "Device not found" });
							return;
						}

						// Replace the found device with an identical one with the ID changed
						authCollection.replaceOne({}, {
							...adminAccount,
							connectedClients: authorizedDevices.map(d => d.id === request.deviceID ? {...d, name: request.newName} : d)
						} as AuthFormat);

						res.status(200).send({ message: "Renamed" });
						return;
					}
					res.status(401).send({ error: "Unauthorized" });
					return;
				}
			}
		}
	} catch(e) {
		// If error occurs not handled by exceptions above,
		// Send 500 Internal Server Error status
		res.status(500).send({ error: e });
		console.log(e);
	}
}