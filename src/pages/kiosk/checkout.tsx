import { ReactElement, useContext } from "react"
import Kiosk, { HeaderContext } from "./layout"
import { tw } from "@/utility/tailwindUtil";
import FloatingButton from "@/components/Kiosk/FloatingButton";
import { useRouter } from "next/router";
import useMenu from "@/hooks/useMenu";
import useLocalOrder from "@/hooks/useLocalOrder";
import CheckoutItem from "@/components/Kiosk/CheckoutItem";

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
	)
}

export default function Checkout() {
	const { setHeader } = useContext(HeaderContext);
	setHeader?.("Checkout");

	const router = useRouter();

	const menu = useMenu(false);
	const order = useLocalOrder();

	return <>
		<div className={styles.heading.container}>
			<h2 className={styles.heading.label}>Let's make sure we got everything...</h2>
		</div>

		<ul className={styles.itemList}>
			{menu.menu && order.current.parts.map(part => <CheckoutItem menu={menu.menu!} part={part} />)}
		</ul>

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