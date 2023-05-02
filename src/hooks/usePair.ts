import { DeviceType, PairRequest } from "@/pages/api/device";
import postRequest from "@/utility/netUtil";
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

			await postRequest("device", request, async response => {
				if(response.status === 200) {
					const id: number = (await response.json()).id;
					setID(id);
					setPaired("paired");
				} else {
					setPaired("unpaired");
				}
			});
		})();
	}, []);

	return { id, paired };
}