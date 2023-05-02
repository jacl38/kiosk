import commonStyles from "@/styles/common"
import { tw } from "@/utility/tailwindUtil"
import { AnimatePresence, motion } from "framer-motion"

import CategoryEdit from "./menu/CategoryEdit"
import ItemEdit from "./menu/ItemEdit"
import AddonEdit from "./menu/AddonEdit"

import { useContext, useEffect, useRef, useState } from "react"
import TextConfirmField from "./TextConfirmField"
import { UnsavedContext } from "@/hooks/useUnsavedChanges"
import { Menu, getMenu } from "@/menu/menuUtil"

const styles = {
	tab: {
		container: tw(
			`flex grow overflow-hidden`,
		),
		overlay: tw(
			`absolute inset-0`,
			`bg-stone-800 bg-opacity-20`,
			`dark:bg-gray-300 dark:bg-opacity-10`,
			`rounded-full`,
			`transition-colors`
		)
	}
}

const menuTabs = [
	{ title: "Categories", element: CategoryEdit },
	{ title: "Items", element: ItemEdit },
	{ title: "Addons", element: AddonEdit },
]

export default function ManagementMenuTab() {
	const [tabIndex, setTabIndex] = useState(0);
	const { unsaved, setUnsaved } = useContext(UnsavedContext);

	return <div className={commonStyles.management.menu.outerContainer}>
		<div className={commonStyles.management.menu.list.container}>
			<div className="flex justify-between lg:space-x-2 max-lg:flex-col-reverse">
				<div className={styles.tab.container}>
					{menuTabs.map((tab, i) => <button
						key={tab.title}
						onClick={() => setTabIndex(i)}
						className="relative px-4 py-2 w-full">
							{
								tabIndex === i &&
								<motion.div
									layoutId="active-menu-tab"
									transition={{ ease: "backOut" }}
									className={styles.tab.overlay}>
								</motion.div>
							}
							<span className={commonStyles.management.subtitle}>{tab.title}</span>
					</button>)}
				</div>
				<div className="min-w-[8rem] w-0 max-lg:w-full max-lg:mb-2">
					<form onChange={e => setUnsaved?.(true)} onSubmit={e => e.preventDefault()} >
						<TextConfirmField inputProps={{
							placeholder: "1"
						}} label="Tax Rate" suffix="%" />
					</form>
				</div>
			</div>
		</div>

		<div className={commonStyles.management.menu.sideContainer}>
			
		</div>
	</div>
}