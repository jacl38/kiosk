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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if(req.method === "POST") {
			const request = req.body as PairRequest;
			const authCollection = await getCollection("auth");
			const adminAccount = await authCollection.findOne({}) as unknown as AuthFormat;
			const authorizedDevices = adminAccount.connectedClients as unknown as DeviceInfo[] ?? [];
			const authenticated = (await query(req, res)).status === 200;

			switch (request.intent) {
				case "open": {
					if(authenticated) {
						pairingEnabled = true;
						clearTimeout(pairingTimer);
						pairingTimer = setTimeout(() => pairingEnabled = false, closePairTimeout * 1000);
						res.status(200).send({ message: "Refreshed pair timer" });
						return;
					}
					res.status(401).send({ error: "Unauthorized" });
					return;
				}
				case "pair": {
					if(authenticated) {
						res.status(200).send({ id: 0 });
						return;
					}

					const deviceToken = (getCookie("device-token", { req, res }) ?? "") as string;
					if(deviceToken && authorizedDevices.map(d => d.token).includes(hash(deviceToken))) {
						const foundDevice = authorizedDevices.find(d => d.token === hash(deviceToken));

						if(foundDevice?.type !== request.deviceType) {
							res.status(401).send({ error: "Device type error" });
							return;
						}

						const deviceID = foundDevice?.id;
						res.status(200).send({ id: deviceID });
						return;
					}

					if(pairingEnabled) {
						const ids = authorizedDevices.map(d => d.id).sort((a, b) => a - b);

						let lowestUnusedDeviceID = 1;
						const highestUsedDeviceID = ids[ids.length - 1] ?? 1;
						for(let i = 1; i <= highestUsedDeviceID + 1; i++) {
							if(!ids.includes(i)) {
								lowestUnusedDeviceID = i;
								break;
							}
						}

						const newToken = hash(`${new Date()}${Math.random()}`);
						
						setCookie("device-token", newToken, { req, res, secure: process.env.NODE_ENV !== "development" });

						const info: DeviceInfo = {
							id: lowestUnusedDeviceID,
							name: `New ${request.deviceType ?? "device"} screen`,
							pairDate: Date.now(),
							type: request.deviceType ?? "kiosk",
							token: hash(newToken)
						}

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
					if(authenticated) {
						res.status(200).send({ devices: authorizedDevices });
						return;
					}
					res.status(401).send({ error: "Unauthorized" });
					return;
				}
				case "delete": {
					if(authenticated) {
						const deviceExists = authorizedDevices.find(d => d.id === request.deviceID);
						if(!deviceExists) {
							res.status(404).send({ error: "Device not found" });
							return;
						}
						
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
					if(authenticated) {
						const deviceExists = authorizedDevices.find(d => d.id === request.deviceID);
						if(!deviceExists) {
							res.status(404).send({ error: "Device not found" });
							return;
						}
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
		res.status(500).send({ error: e });
		console.log(e);
	}
}