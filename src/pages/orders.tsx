import OrderListItem from "@/components/orders/OrderListItem";
import useMenu from "@/hooks/useMenu";
import useOrders from "@/hooks/useOrders";
import usePair from "@/hooks/usePair"
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import { ObjectId } from "mongodb";
import { useEffect } from "react";

const styles = {
	outerContainer: tw(
		`h-full flex flex-col`,
		`bg-black`,
		`text-white`
	),
	footer: {
		container: tw(
			`shrink-0`,
			`flex justify-between items-center`,
			`bg-gray-800`
		),
		text: tw(
			`font-mono ml-4`
		),
		button: tw(
			`text-3xl font-black`,
			`bg-gray-700`,
			`p-4 aspect-square`,
			`flex items-center justify-center`
		)
	},
	header: tw(
		`p-4 shrink-0`,
		`bg-gray-800`,
		`text-4xl`
	),
	orderList: {
		container: tw(
			`flex-auto`,
			`overflow-y-scroll`
		)
	}
}

const pollRate = 5 * 1000;

export default function Orders() {
	const device = usePair("orders");
	const orders = useOrders("active");

	const menu = useMenu(false);

	useEffect(() => {
		async function pollOrders() {
			await orders.reFetch();
		}

		const interval = setInterval(pollOrders, pollRate);
		return () => clearInterval(interval);
	}, [orders, orders.reFetch]);

	async function closeoutOrder(id: ObjectId) {
		await orders.closeout(id);
		await orders.reFetch();
	}

	return <div className={styles.outerContainer}>
		{
			(device.paired === "unknown" || !menu.menu) &&
			<div className={commonStyles.loadingSpinner}></div>
		}

		{
			device.paired === "unpaired" &&
			<div className="m-auto">
				<p>Device is not paired. A manager should set up this device at {window.location.origin}/manage</p>
			</div>
		}

		{
			device.paired === "paired" && menu.menu &&
			<>
				<div className={styles.header}>
					{orders.orders?.length ? orders.orders.length : "No"} Order{orders.orders?.length === 1 ? "" : "s"}
				</div>
				
				<ul className={styles.orderList.container}>
					{orders.orders?.map(order => <OrderListItem key={order._id?.toString()} onCloseout={() => closeoutOrder(order._id!)} menu={menu.menu!} order={order} />)}
				</ul>

				<div className={styles.footer.container}>
					<span className={styles.footer.text}>Device {device.id} | {device.name}</span>
					<button onClick={orders.reFetch} className={styles.footer.button}>&#10227;</button>
				</div>
			</>
		}
	</div>
}