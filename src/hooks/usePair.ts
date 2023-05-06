import { DeviceType, PairRequest } from "@/pages/api/device";
import postRequest from "@/utility/netUtil";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function usePair(type: DeviceType) {
	const router = useRouter();
	
	const [paired, setPaired] = useState<"unknown" | "unpaired" | "paired">("unknown");
	const [id, setID] = useState<number>();
	const [name, setName] = useState<string>();
	
	useEffect(() => {
		(async function() {
			const request: PairRequest = {
				intent: "pair",
				deviceType: type
			}

			await postRequest("device", request, async response => {
				if(response.status === 200) {
					const deviceInfo = await response.json();
					setID(deviceInfo.id);
					setName(deviceInfo.name)
					setPaired("paired");
				} else {
					setPaired("unpaired");
				}
			});
		})();
	}, [type]);

	return { id, name, paired };
}