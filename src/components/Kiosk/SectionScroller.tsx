import { tw } from "@/utility/tailwindUtil"
import { AnimatePresence, motion } from "framer-motion"
import { MouseEvent, useState } from "react"

const styles = {
	outerContainer: tw(
		`overflow-x-scroll overflow-hidden`,
		`flex items-center`,
		`h-16`,
		`space-x-4 px-4`
	),
	button: {
		container: tw(
			`py-1.5 px-4 shrink-0`,
			`bg-emerald-700 bg-opacity-50`,
			`border-emerald-800 border-opacity-50 border-b-2`,
			`rounded-full`,
			`relative z-0`
		),
		overlay: tw(
			`absolute inset-0`,
			`w-full h-full`,
			`bg-emerald-700`,
			`rounded-full -z-50`
		),
		label: tw(
			`font-bold text-white z-50`
		)
	}
}

type Section = {
	label: string,
	id: any
}

type SectionScrollerProps = {
	sections: Section[],
	keyId: string,
	onSelect?: (id: any) => void
}

export default function SectionScroller(props: SectionScrollerProps) {
	const [selectedID, setSelectedID] = useState<any>(props.sections[0].id);

	function select(e: MouseEvent) {
		const elementID = e.currentTarget.id;
		const sectionID = elementID.split("-").pop();
		console.log(sectionID);
		setSelectedID(sectionID);
	}

	return <nav className={styles.outerContainer}>
			{props.sections.map(section => <button
				key={`sectionscroller-${props.keyId}-${section.id}`}
				id={`sectionscroller-${props.keyId}-${section.id}`}
				onClick={select}
				className={styles.button.container}>
				<AnimatePresence>
				{
					section.id == selectedID &&
					<motion.div
						initial={{ translateY: 50, opacity: 0 }}
						animate={{ translateY: 0, opacity: 1 }}
						exit={{ translateY: 50, opacity: 0 }}
						transition={{ ease: "easeOut" }}
						className={styles.button.overlay}>
					</motion.div>
				}
				</AnimatePresence>
				<span className={styles.button.label}>{section.label}</span>
			</button>)}
	</nav>
}