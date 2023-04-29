import { NextApiRequest, NextApiResponse } from "next";
import { query } from "./auth";

export type DeviceType = "kiosk" | "orders";
export type DeviceInfo = {
	id: number,
	name: string,
	token: string,
	type: DeviceType,
	uptime: number
}

export type PairRequest = {
	intent: "open" | "pair"
}

let pairingEnabled = false;
let pairingTimer: NodeJS.Timer;

/** Time before pairing automatically closes (seconds). */
const closePairTimeout = 30;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if(req.method === "POST") {
			const request = req.body as PairRequest;

			switch (request.intent) {
				case "open": {
					const authenticated = (await query(req, res)).status === 200;
					if(authenticated) {
						pairingEnabled = true;
						clearTimeout(pairingTimer);
						pairingTimer = setTimeout(() => pairingEnabled = false, closePairTimeout * 1000);
						res.status(200).send({ message: "Refreshed pair timer" });
						return;
					}
					res.status(401).send({ error: "Unauthorized" });
				}
				case "pair": {
					
				}
			}
		}
	} catch(e) {
		res.status(500).send({ error: e });
		console.log(e);
	}
}