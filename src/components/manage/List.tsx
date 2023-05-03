import { tw } from "@/utility/tailwindUtil"
import { ReactNode } from "react"

const styles = {
	container: tw(
		`h-full overflow-y-scroll`,
		`space-y-2 p-2`,
		`overflow-hidden rounded-xl`,
		`shadow-inner shadow-stone-400 dark:shadow-gray-800`,
		`border-2 border-stone-400 dark:border-gray-600`,
		`transition-all`,
		`relative`
	)
}

export default function List(props: { children?: ReactNode | ReactNode[] }) {
	return <ul className={styles.container}>
		{props.children}
	</ul>
}