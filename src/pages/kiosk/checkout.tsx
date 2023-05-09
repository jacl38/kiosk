import { ReactElement, useContext } from "react"
import Kiosk, { HeaderContext } from "./layout"
import { tw } from "@/utility/tailwindUtil";
import FloatingButton from "@/components/Kiosk/FloatingButton";
import { useRouter } from "next/router";
import useMenu from "@/hooks/useMenu";
import useLocalOrder from "@/hooks/useLocalOrder";
import CheckoutItem from "@/components/Kiosk/CheckoutItem";
import commonStyles from "@/styles/common";

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
	}
}

export default function Checkout() {
	const { setHeader } = useContext(HeaderContext);
	setHeader?.("Checkout");

	const router = useRouter();

	const menu = useMenu(false);
	const order = useLocalOrder();

	function placeOrder() {
		
	}

	return <>
		<div className={styles.heading.container}>
			<h2 className={styles.heading.label}>Let&apos;s make sure we got everything...</h2>
		</div>

		<ul className={styles.itemList}>
			{menu.menu && order.current.parts.map(part => <CheckoutItem key={part.partID} menu={menu.menu!} part={part} />)}
		</ul>

		<div className={styles.miscInfo.container}>
			<div className={styles.miscInfo.inputGrid}>
				<div>
					<label htmlFor="order-name" className={styles.miscInfo.label}>* Name:</label>
					<input
						defaultValue={order.current.name}
						onBlur={e => order.setPersonalInfo({ name: e.target.value })}
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
				<div className="col-span-2">
					<label htmlFor="order-notes" className={styles.miscInfo.label}>Notes:</label>
					<textarea
						defaultValue={order.current.notes}
						onBlur={e => order.setPersonalInfo({ notes: e.target.value })}
						id="order-notes"
						className={tw(styles.miscInfo.inputBox, "resize-none")} />
				</div>
			</div>
			<button onClick={placeOrder} className={tw(commonStyles.order.button, `text-2xl mx-auto`)}>Place Order</button>
		</div>

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