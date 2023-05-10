import { Order } from "@/menu/structures";
import postRequest from "@/utility/netUtil";
import { ObjectId } from "mongodb";
import { useCallback, useEffect, useState } from "react";

export default function useOrders(type: "all" | "active") {
	const [orders, setOrders] = useState<Order[]>();
	const [ordersLoaded, setOrdersLoaded] = useState<"loading" | "loaded" | "failed">("loading");

	const reFetch = useCallback(async () => {
		await postRequest("order", { intent: type === "all" ? "getall" : "get" }, async response => {
			if(response.status === 200) {
				const body = await response.json();
				setOrders(body.orders);
				setOrdersLoaded("loaded");
			} else {
				setOrdersLoaded("failed");
			}
		});
	}, [type]);

	useEffect(() => {
		reFetch();
	}, [reFetch]);

	async function closeout(id: ObjectId) {
		await postRequest("order", { intent: "closeout", id });
	}

	return {
		orders, ordersLoaded,
		reFetch,
		closeout
	}
}