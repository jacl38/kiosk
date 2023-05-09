import { ReactElement, useContext, useEffect } from "react"
import Kiosk, { HeaderContext } from "./layout"
import { tw } from "@/utility/tailwindUtil";
import Link from "next/link";
import commonStyles from "@/styles/common";

const styles = {
	outerContainer: tw(
		`flex flex-auto`
	),
	innerContainer: tw(
		`m-auto`,
		`bg-white`,
		`w-96 h-60`,
		`border-b-2 border-hotchocolate-200`,
		`rounded-2xl`,
		`shadow-md`,
		`flex flex-col items-center justify-evenly`,
		`p-4`
	),
	label: tw(
		`text-3xl font-semibold`
	)
}

export default function Order() {
	const { setHeader } = useContext(HeaderContext);

	useEffect(() => {
		setHeader?.("Order here!");
	}, [setHeader]);

	return <div className={styles.outerContainer}>
		<div className={styles.innerContainer}>
			<h2 className={styles.label}>Place an order</h2>
			<Link className={tw(commonStyles.order.button, "text-3xl")} href="/kiosk/menu">Start &rsaquo;</Link>
		</div>
	</div>
}

Order.getLayout = (page: ReactElement) => {
	return <Kiosk>{page}</Kiosk>
}