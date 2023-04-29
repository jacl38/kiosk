import commonStyles from "@/styles/common"
import { tw } from "@/utility/tailwindUtil"
import { motion } from "framer-motion"
import { ReactNode } from "react"

export type ManagementTabProps = {
	name: string,
	children?: ReactNode | ReactNode[]
}

const styles = {
	container: tw(
		`absolute w-full h-full`,
		`flex flex-col`,
		`p-4`,
		`bg-stone-300 dark:bg-gray-700`,
		`rounded-2xl`,
		`transition-colors`,
	)
}

export default function ManagementTab(props: ManagementTabProps) {
	return <motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		transition={{ duration: 0.3 }}
		key={`${props.name}-tab`}
		className={styles.container}>
			
		<h2 className={commonStyles.management.title}>{props.name}</h2>
		<hr className={commonStyles.management.separator} />
		<div className="overflow-y-scroll h-full relative">
			{props.children}
		</div>
	</motion.div>
}