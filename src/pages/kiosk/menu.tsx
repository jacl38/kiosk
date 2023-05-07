import { ReactElement, useContext } from "react"
import Kiosk, { HeaderContext } from "./layout"
import { tw } from "@/utility/tailwindUtil";
import SectionScroller from "@/components/Kiosk/SectionScroller";
import useMenu from "@/hooks/useMenu";
import Link from "next/link";
import commonStyles from "@/styles/common";

const styles = {
	outerContainer: tw(
		`h-full`
	),
	tabBar: tw(
		`flex`
	),
	checkoutContainer: tw(
		`px-8`,
		`flex justify-center items-center`
	)
}

export default function Menu() {
	const { setHeader } = useContext(HeaderContext);
	setHeader?.("Menu");

	const menu = useMenu(false);

	return <div className={styles.outerContainer}>
		<div className={styles.tabBar}>
			<SectionScroller
				keyId="categories"
				sections={"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => ({ label: `Test ${c}`, id: i }))}
			/>
			<div className={styles.checkoutContainer}>
				<Link
					href="./checkout"
					className={commonStyles.order.button}>
					Checkout
				</Link>
			</div>
		</div>
	</div>
}

Menu.getLayout = (page: ReactElement) => {
	return <Kiosk>{page}</Kiosk>
}