import { DeviceType, PairRequest } from "@/pages/api/device";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function usePair(type: DeviceType, then?: (paired: boolean) => void) {
	const router = useRouter();
	
	const [paired, setPaired] = useState<"unknown" | "unpaired" | "paired">("unknown");
	const [id, setID] = useState<number>();
	
	useEffect(() => {
		(async function() {
			const request: PairRequest = {
				intent: "pair",
				deviceType: type
			}

			const response = await fetch("/api/device", {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify(request)
			}).then(async response => {
				if(response.status === 200) {
					const id: number = (await response.json()).id;
					setID(id);
					setPaired("paired");
				} else {
					setPaired("unpaired");
				}
			}, reason => console.error(reason));
		})();
	}, []);

	return { id, paired };
}