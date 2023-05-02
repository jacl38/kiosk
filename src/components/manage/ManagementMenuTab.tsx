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
import useMenu from "@/hooks/useMenu"
import withLoading from "../higherOrder/withLoading"

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
	{ title: "Categories", key: "categories", element: CategoryEdit },
	{ title: "Items", key: "items", element: ItemEdit },
	{ title: "Addons", key: "addons", element: AddonEdit },
]

export default function ManagementMenuTab() {
	const [tabIndex, setTabIndex] = useState(0);
	const { unsaved, setUnsaved } = useContext(UnsavedContext);

	const menu = useMenu(true);

	function getRenderList() {
		const key = menuTabs[tabIndex].key as "categories" | "items" | "addons";
		return menu.menu?.[key];
	}

	return <div className={commonStyles.management.menu.outerContainer}>
		<div className={commonStyles.management.menu.list.container}>
			<div className="flex lg:space-x-2 max-lg:flex-col-reverse">
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
					<button className={tw(styles.tab.overlay, "relative aspect-square shrink-0 ml-2")}>
						&#x1f705;
					</button>
				</div>
				<div className="min-w-[6rem] w-0 max-lg:w-full max-lg:mb-2">
					{
						withLoading(!menu.settingsLoaded,
							<form onChange={e => setUnsaved?.(true)} onSubmit={e => e.preventDefault()} >
								<TextConfirmField inputProps={{
									placeholder: `${menu.settings?.taxRate ?? 0}`
								}}
								label="Tax Rate"
								suffix="%" />
							</form>
						)
					}
				</div>
			</div>
			{
				withLoading(!menu.menuLoaded,
					<div className="max-md:max-h-96 overflow-y-scroll space-y-2">
						{getRenderList()?.map((object, i) => {
							return <button
								key={i}
								className={commonStyles.management.menu.list.item(false)}>
								<div className="flex justify-between space-x-2">
									<div className="flex shrink truncate">
										<span className="font-bold truncate">{object.name}</span>
									</div>
									<span className="opacity-60 w-16 shrink-0">{"price" in object ? object.price : ""}</span>
								</div>
								<div className="flex shrink w-11/12">
									<p className="opacity-60 truncate">{"description" in object ? object.description : ""}</p>
								</div>
								<span className={commonStyles.management.menu.list.arrow}></span>
							</button>
						})}
					</div>
				)
			}
		</div>

		<div className={commonStyles.management.menu.sideContainer}>
			
		</div>
	</div>
}