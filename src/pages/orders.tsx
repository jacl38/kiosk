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

/** Rate in milliseconds which the order screen will poll for incoming orders. */
const pollRate = 5 * 1000;

export default function Orders() {
	const device = usePair("orders");
	const orders = useOrders("active");

	const menu = useMenu(false);

	useEffect(() => {
		// Sets up a repeating function to poll for new orders every `pollRate` milliseconds
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
		{// If the device has not yet found its pair status, show a loading spinner
			(device.paired === "unknown" || !menu.menu) &&
			<div className={commonStyles.loadingSpinner}></div>
		}

		{// If the device has not been registered by the management panel, show this message
			device.paired === "unpaired" &&
			<div className="m-auto">
				<p>Device is not paired. A manager should set up this device at {window.location.origin}/manage</p>
			</div>
		}

		{// If the device has been paired and the menu has been retrieved successfully
			device.paired === "paired" && menu.menu &&
			<>
				<div className={styles.header}>
					{/* Display the number of current orders in the header */}
					{orders.orders?.length ? orders.orders.length : "No"} Order{orders.orders?.length === 1 ? "" : "s"}
				</div>
				
				<ul className={styles.orderList.container}>
					{/* Map each order to a list item to display and interact with it */}
					{orders.orders?.map(order => <OrderListItem
						key={order._id?.toString()}
						onCloseout={() => closeoutOrder(order._id!)}
						menu={menu.menu!}
						order={order}
					/>)}
				</ul>

				<div className={styles.footer.container}>
					{/* Display the device ID and name in the footer */}
					<span className={styles.footer.text}>Device {device.id} | {device.name}</span>

					{/* Button used to manually check for incoming orders */}
					<button onClick={orders.reFetch} className={styles.footer.button}>&#10227;</button>
				</div>
			</>
		}
	</div>
}