import { tw } from "@/utility/tailwindUtil"
import { AnimatePresence, motion } from "framer-motion"
import { MouseEvent, useEffect, useState } from "react"

const styles = {
	outerContainer: tw(
		`overflow-x-scroll overflow-hidden`,
		`flex flex-auto items-center`,
		`h-16`,
		`space-x-4 px-4`,
		`relative`
	),
	button: {
		container: tw(
			`py-1.5 px-4 shrink-0`,
			`bg-emerald-700 bg-opacity-50`,
			`border-emerald-800 border-opacity-50 border-b-2`,
			`rounded-full`,
			`relative z-0`,
			`overflow-hidden`
		),
		overlay: tw(
			`absolute inset-0`,
			`bg-emerald-700 mix-blend-darken`,
			`rounded-full -z-10`
		),
		label: tw(
			`font-bold text-white`
		),
		skeleton: tw(
			`px-8 animate-pulse`
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
	loading?: boolean,
	onSelect?: (id: any) => void
}

export default function SectionScroller(props: SectionScrollerProps) {
	const { sections, onSelect } = props;
	const [selectedID, setSelectedID] = useState<any>();

	useEffect(() => {
		if(sections.length === 0 || selectedID) return;
		setSelectedID((id: any) => id ?? sections[0]?.id);
		onSelect?.(sections[0]?.id);
	}, [sections, onSelect, selectedID]);

	function select(e: MouseEvent) {
		if(sections.length === 0) return;
		const elementID = e.currentTarget.id;
		const sectionID = elementID.split("-").pop();
		setSelectedID(sectionID);
		props.onSelect?.(sectionID);
	}

	return <nav className={styles.outerContainer}>
		{
			props.loading
			? [...Array(8)].map((_, i) => <motion.button
				layoutId={`${i}`}
				key={i}
				className={tw(styles.button.container, styles.button.skeleton)}>
				<span className={styles.button.label}>&bull; &bull; &bull;</span>
			</motion.button>)
			: sections.map((section, i) => <motion.button
				key={i}
				layoutId={`${i}`}
				id={`sectionscroller-${props.keyId}-${section.id}`}
				onClick={select}
				className={styles.button.container}>
				<span className={styles.button.label}>{section.label}</span>
				<AnimatePresence>
					{
						section.id == selectedID &&
						<motion.div
							initial={{ translateY: 50 }}
							animate={{ translateY: 0, transition: { ease: "circOut", duration: 0.2 } }}
							exit={{ translateY: 50 }}
							className={styles.button.overlay}>
						</motion.div>
					}
				</AnimatePresence>
			</motion.button>)
		}
	</nav>
}