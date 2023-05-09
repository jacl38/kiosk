import { tw } from "@/utility/tailwindUtil"
import { ReactNode } from "react"

const styles = {
	container: (side: "left" | "right") => tw(
		`fixed flex items-center justify-center`,
		side === "left" ? `left-8` : `right-8`,
		`bottom-8`,
		`min-w-[4rem] h-16`,
		`px-4`,
		`bg-emerald-700`,
		`text-white text-3xl font-bold`,
		`rounded-3xl`,
		`group`
	)
}

type FloatingButtonProps = {
	side?: "left" | "right",
	children?: ReactNode | ReactNode[],
	action?: () => void
}

export default function FloatingButton(props: FloatingButtonProps) {
	return <button
		onClick={props.action}
		className={styles.container(props.side ?? "left")}>
		{props.children}
	</button>
}