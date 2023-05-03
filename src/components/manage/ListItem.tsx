import { tw } from "@/utility/tailwindUtil";
import { ReactNode } from "react";

const styles = {
	container: (selected?: boolean) => tw(
		`relative`,
		`h-24 shrink-0`,
		`overflow-hidden`,
		`rounded-xl`,
		selected ? `bg-stone-200 dark:bg-gray-500` : `bg-stone-100 dark:bg-gray-600`,
		`hover:bg-stone-200 dark:hover:bg-gray-500`,
		`border-2 border-stone-300 dark:border-gray-500`,
		`shadow-sm hover:shadow-md`,
		`transition-all`,
		`group`
	),
	button: tw(
		`absolute w-full h-full`,
	)
}

export default function ListItem(props: { children?: ReactNode | ReactNode[], selected?: boolean, onClick?: () => void }) {
	return <li className={styles.container(props.selected)}>
		<button onClick={props.onClick} className={styles.button}></button>
		{props.children}
	</li>
}