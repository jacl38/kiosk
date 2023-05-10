import { Order } from "@/menu/structures";
import postRequest from "@/utility/netUtil";
import { useEffect, useState } from "react";

export default function useOrders(type: "all" | "active") {
	const [orders, setOrders] = useState<Order[]>();
	const [ordersLoaded, setOrdersLoaded] = useState<"loading" | "loaded" | "failed">("loading");

	async function getActive(): Promise<Order[]> {
		let orders: Order[] = [];
		await postRequest("order", { intent: "get" }, async response => {
			if(response.status === 200) {
				const body = await response.json();
				orders = body.orders;
			}
		});
		return orders;
	}

	async function reFetch() {
		await postRequest("order", { intent: type === "all" ? "getall" : "get" }, async response => {
			if(response.status === 200) {
				const body = await response.json();
				setOrders(body.orders);
				setOrdersLoaded("loaded");
			} else {
				setOrdersLoaded("failed");
			}
		});
	}

	useEffect(() => {
		reFetch();
	}, [orders, ordersLoaded]);

	return {
		orders, ordersLoaded,
		reFetch
	}
}