import { ReactElement, useContext, useEffect, useState } from "react"
import Kiosk, { HeaderContext } from "./layout"
import { tw } from "@/utility/tailwindUtil";
import FloatingButton from "@/components/Kiosk/FloatingButton";
import { useRouter } from "next/router";
import useMenu from "@/hooks/useMenu";
import useLocalOrder from "@/hooks/useLocalOrder";
import CheckoutItem from "@/components/Kiosk/CheckoutItem";
import commonStyles from "@/styles/common";
import { OrderRequest } from "../api/order";
import postRequest from "@/utility/netUtil";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatMoney } from "@/menu/moneyUtil";
import { addonsFromOrder, calculateOrderSubtotal, itemsFromOrder } from "@/utility/orderUtil";

const styles = {
	heading: {
		container: tw(
			`flex`,
			`bg-hotchocolate-100`,
			`border-b-2 border-hotchocolate-200`,
			`py-4 px-8`
		),
		label: tw(
			`text-3xl`,
			`font-semibold`,
			`text-hotchocolate-900`
		)
	},
	itemList: tw(
		`flex flex-col`,
		`p-8 gap-y-4`
	),
	miscInfo: {
		container: tw(
			`mb-12 px-8`,
			`flex flex-col`,
			`gap-y-8`
		),
		inputGrid: tw(
			`grid grid-cols-2`,
			`gap-4`
		),
		inputBox: tw(
			`px-4 py-2`,
			`w-full`,
			`rounded-lg`,
			`border-b-2 border-b-hotchocolate-200`
		),
		label: tw(
			`text-lg font-semibold`
		)
	},
	totalsContainer: tw(
		`flex justify-between`,
		`px-8 mb-4`,
		`text-lg font-semibold`,
		`text-hotchocolate-800`
	),
	sentBox: {
		container: tw(
			`bg-white`,
			`shadow-xl`,
			`rounded-2xl`,
			`overflow-hidden`,
			`border-b-4 border-green-700 border-opacity-25`,
			`m-auto`,
			`w-96 h-96`,
			`flex flex-col justify-between`
		),
		confirmationContainer: tw(
			`flex flex-col justify-center items-center`,
			`gap-y-4`,
			`shadow flex-auto`
		),
		itemContainer: tw(
			`bg-green-700 bg-opacity-10`,
			`flex justify-center`,
			`py-4 shrink-0`
		)
	}
}

export default function Checkout() {
	const { setHeader } = useContext(HeaderContext);

	useEffect(() => {
		setHeader?.("Checkout");
	}, [setHeader]);

	const router = useRouter();

	const menu = useMenu(false);
	const order = useLocalOrder();

	// Keeps track of the order send state
	const [sending, setSending] = useState<"none" | "sending" | "sent">("none");

	// Sends a post request to the server to send the order
	async function placeOrder() {
		setSending("sending");
		const body: OrderRequest = {
			intent: "add",
			order: {...order.current, finished: false, timestamp: Date.now()}
		}

		await postRequest("order", body, async response => {
			if(response.status === 200) {
				setSending("sent");
			}
		});
	}

	const [errorText, setErrorText] = useState<string>();

	const items = itemsFromOrder(order.current, menu.menu?.item!)!;
	const addons = addonsFromOrder(order.current, menu.menu?.addon!)!;
	const subtotal = calculateOrderSubtotal(items, addons)!;
	const taxRate = menu.settings?.taxRate ?? 1;
	const total = subtotal * (1 + taxRate / 100);

	useEffect(() => {
		if(order.current.name.length === 0 && errorText !== undefined) {
			setErrorText("Name field is required");
		} else {
			setErrorText("");
		}
	}, [order.current]);

	return <>
		<div className={styles.heading.container}>
			<h2 className={styles.heading.label}>Let&apos;s make sure we got everything...</h2>
		</div>

		{/* Maps each order part to a CheckoutItem component and passes in the data to display */}
		<ul className={styles.itemList}>
			{menu.menu && order.current.parts.map(part => <CheckoutItem key={part.partID} menu={menu.menu!} part={part} />)}
		</ul>

		{/* Shows the subtotal, tax, and total */}
		<div className={styles.totalsContainer}>
			{
				(subtotal !== undefined && total !== undefined) &&
				<>
					<div className="flex flex-col">
						<span>Subtotal: {formatMoney(subtotal)}</span>
						<span>Tax: {formatMoney(total - subtotal)}</span>
					</div>
					<span className="text-xl font-bold text-green-700">Total: {formatMoney(total)}</span>
				</>
			}
		</div>

		{/* Shows the name, phone number, and notes input fields */}
		<div className={styles.miscInfo.container}>
			<div className={styles.miscInfo.inputGrid}>
				<div>
					<label htmlFor="order-name" className={styles.miscInfo.label}>* Name:</label>
					<input
						defaultValue={order.current.name}
						onBlur={e => {
							setErrorText(e => e ?? "");
							order.setPersonalInfo({ name: e.target.value } );
						}}
						id="order-name"
						type="text"
						className={styles.miscInfo.inputBox} />
				</div>
				<div>
					<label htmlFor="order-phone" className={styles.miscInfo.label}>Phone number:</label>
					<input
						defaultValue={order.current.phone}
						onBlur={e => order.setPersonalInfo({ phone: e.target.value })}
						id="order-phone"
						type="tel"
						className={styles.miscInfo.inputBox} />
				</div>

				{/* Display an error message, such as "Name field is required" */}
				<p className="col-span-2 text-red-700 font-semibold">{errorText}</p>

				<div className="col-span-2">
					<label htmlFor="order-notes" className={styles.miscInfo.label}>Notes:</label>
					<textarea
						defaultValue={order.current.notes}
						onBlur={e => order.setPersonalInfo({ notes: e.target.value })}
						id="order-notes"
						className={tw(styles.miscInfo.inputBox, "resize-none")} />
				</div>
			</div>

			<button
				disabled={sending !== "none" || order.current.name === ""}
				onClick={placeOrder}
				className={tw(
					commonStyles.order.button, `text-2xl mx-auto`,
					sending !== "none" || order.current.name === ""
						? tw(commonStyles.order.buttonDisabled, `animate-pulse`)
						: "")}>
				Place Order
			</button>
		</div>

		{
			// After sending, show a dialog to send the customer back to the main screen
			sending === "sent" &&
			<div className={commonStyles.order.backdrop}>
				<motion.div
					initial={{ opacity: 0, translateY: 40, scale: 0.8 }}
					animate={{ opacity: 1, translateY: 0, scale: 1 }}
					className={styles.sentBox.container}>

					<div className={styles.sentBox.confirmationContainer}>
						<span className="text-3xl font-semibold">Order placed!</span>
						<span className="text-xl text-center">You&apos;re all set,<br />{order.current.name}.</span>
					</div>

					<div className={styles.sentBox.itemContainer}>
						{/* Finish button attaches #c hash to url to signal to /kiosk index page to clear the saved order */}
						<Link href="/kiosk#c" className={tw(commonStyles.order.button, "text-xl")}>Finish</Link>
					</div>
				</motion.div>
			</div>
		}

		{/* Floating button to send user back to menu screen to add other items */}
		<FloatingButton
			action={() => router.push("/kiosk/menu")}>
			<span className={tw(
				`font-mono text-5xl`,
				`group-hover:-translate-x-1 transition-transform`)}>
				&lsaquo;
			</span>
		</FloatingButton>
	</>
}

Checkout.getLayout = (page: ReactElement) => {
	return <Kiosk>{page}</Kiosk>
}