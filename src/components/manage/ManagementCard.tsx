import { tw } from "@/utility/tailwindUtil";
import Link from "next/link";
import { ReactNode } from "react";


const styles = {
	container: tw(
		`bg-stone-300 border-stone-400`,
		`dark:bg-gray-700 dark:border-gray-600`,
		`hover:border-stone-500 dark:hover:border-gray-500`,
		`border rounded-lg`,
		`overflow-hidden`,
		`hover:shadow-md`,
		`text-stone-700 dark:text-stone-300`,
		`transition-all`,
		`relative group`,
		`flex-1`
	),
	title: tw(
		`font-bold`,
		`w-full p-2`,
		`bg-stone-400 dark:bg-gray-600`,
		`transition-colors`
	),
	description: tw(
		`p-2 mb-8`
	),
	arrowIcon: tw(
		`absolute right-6 bottom-2`,
		`text-3xl font-bold`,
		`group-hover:right-4`,
		`transition-all`
	)
}

export type CardProps = {
	title: string,
	description: ReactNode | ReactNode[] | undefined,
	route: string
}

export default function ManagementCard(props: CardProps) {
	return <Link href={props.route} className={styles.container}>
		<h2 className={styles.title}>{props.title}</h2>
		<div className={styles.description}>{props.description}</div>
		<span className={styles.arrowIcon}>&rsaquo;</span>
	</Link>
}