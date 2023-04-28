import { getCookie } from 'cookies-next';
import type { NextApiRequest, NextApiResponse } from 'next'
import { AuthFormat, adminAccountExists, sessionTimeout } from './auth';
import getCollection from './db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		
		if(!await adminAccountExists()) {
			res.status(400).send({ error: "Admin account does not exist." });
			return;
		}

		const authCollection = await getCollection("auth");
		
		const userToken = getCookie("token", { req, res });
		const adminAccount = await authCollection.findOne({}) as unknown as AuthFormat;

		console.log(`User token: ${userToken}`);
		console.log(`Admin token: ${adminAccount.adminToken}`);

		if(userToken !== adminAccount.adminToken) {
			res.status(400).send({ error: "User token is invalid." });
			return;
		}

		if((Date.now() - adminAccount.adminLastLogin) / 1000 >= sessionTimeout) {
			res.status(400).send({ error: "Admin token has expired" });
			return;
		}

		res.status(200).send({ message: "Admin account exists, user token is valid." });

	} catch(e) {
		console.error(e);
		res.status(400).send({ error: e });
	}
}
