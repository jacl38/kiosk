import useOrders from "@/hooks/useOrders";
import usePair from "@/hooks/usePair"
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
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
		`p-2 shrink-0`,
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

	useEffect(() => {
		async function pollOrders() {
			await orders.reFetch();
			console.log("fetched")
		}

		const interval = setInterval(pollOrders, pollRate);
		return () => clearInterval(interval);
	}, []);

	return <div className={styles.outerContainer}>
		{
			device.paired === "unknown" &&
			<div className={commonStyles.loadingSpinner}></div>
		}

		{
			device.paired === "unpaired" &&
			<div className="m-auto">
				<p>Device is not paired. A manager should set up this device at {window.location.origin}/manage</p>
			</div>
		}

		{
			device.paired === "paired" &&
			<>
				<div className={styles.header}>
					Orders:
				</div>
				
				<ul className={styles.orderList.container}>
					{orders.orders?.length}
				</ul>

				<div className={styles.footer.container}>
					<span className={styles.footer.text}>Device {device.id} | {device.name}</span>
					<button onClick={orders.reFetch} className={styles.footer.button}>&#10227;</button>
				</div>
			</>
		}
	</div>
}