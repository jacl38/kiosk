import { tw } from "@/utility/tailwindUtil"
import Image from "next/image"
import logoSrc from "#/logo.svg";

const styles = {
	outerContainer: tw(
		`shrink-0`,
		`flex justify-between items-center py-6 px-10`,
		`bg-hotchocolate-900`,
		`text-white font-serif text-4xl`,
	)
}

/** Kiosk menu header component */
export default function Header(props: { title?: string }) {
	return <header className={styles.outerContainer}>
		<Image alt="Breaking Bread Logo" src={logoSrc} width={192} height={72} />
		<h1>{props.title}</h1>
	</header>
}