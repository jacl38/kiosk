import { Menu } from "@/menu/menuUtil";
import { tw } from "@/utility/tailwindUtil";
import { useRef } from "react";

const styles = {
	outerContainer: tw(
		`px-4 flex`
	),
	searchbox: {
		container: tw(
			`w-full max-w-[36rem]`,
			`mx-auto`,
			`flex h-16`,
			`rounded-3xl`,
			`border-b-2 border-hotchocolate-200`,
			`shadow`,
			`overflow-hidden`,
		),
		input: tw(
			`w-full`,
			`px-4`,
			`shadow-inner`,
			`outline-none`,
			`text-xl text-hotchocolate-800`
		),
		button: tw(
			`px-5`,
			`bg-emerald-700`,
			`text-3xl text-white`
		)
	}
}

export default function Searchbox(props: { onSearch?: (query: string) => void }) {
	const inputRef = useRef<HTMLInputElement>(null);

	return <div className={styles.outerContainer}>
		<div className={styles.searchbox.container}>
			<input placeholder="Search for items" ref={inputRef} onChange={e => props.onSearch?.(e.target.value)} className={styles.searchbox.input} />
			<button onClick={() => props.onSearch?.(inputRef.current?.value ?? "")} className={styles.searchbox.button}>&#x1F50D;&#xFE0E;</button>
		</div>
	</div>
}