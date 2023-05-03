import { ReactElement, useContext, useEffect, useState } from "react"
import Index from "."
import useUnsavedChanges, { UnsavedContext } from "@/hooks/useUnsavedChanges";
import commonStyles from "@/styles/common";
import List from "@/components/manage/List";
import ListItem from "@/components/manage/ListItem";
import { ObjectId } from "mongodb";
import TextConfirmField from "@/components/manage/TextConfirmField";
import { Addon, Category, Item } from "@/menu/structures";
import { tw } from "@/utility/tailwindUtil";
import { motion } from "framer-motion";
import withLoading from "@/components/higherOrder/withLoading";
import useMenu from "@/hooks/useMenu";
import { formatMoney } from "@/menu/moneyUtil";
import CategoryEdit from "@/components/manage/menu/CategoryEdit";
import ItemEdit from "@/components/manage/menu/ItemEdit";
import AddonEdit from "@/components/manage/menu/AddonEdit";
import ObjectEdit from "@/components/manage/menu/ObjectEdit";

const styles = {
	tab: {
		container: tw(
			`flex grow overflow-x-scroll overflow-y-hidden`,
		),
		overlay: tw(
			`absolute inset-0`,
			`bg-stone-800 bg-opacity-20`,
			`dark:bg-gray-300 dark:bg-opacity-10`,
			`rounded-full`,
			`transition-colors`
		)
	},
	newButton: tw(
		`absolute left-1/2 -translate-x-1/2`,
		`w-12 h-12`,
		`bg-stone-100 dark:bg-gray-600`,
		`rounded-full`,
		`border-2 border-stone-300 dark:border-gray-500`,
		`shadow hover:shadow-md`,
		`flex items-center justify-center`,
		`after:absolute after:w-6 after:h-1.5 after:bg-gray-700 after:dark:bg-stone-300 after:transition-all`,
		`before:absolute before:w-1.5 before:h-6 before:bg-gray-700 before:dark:bg-stone-300 before:transition-all`,
		`hover:scale-110`,
		`transition-all ease-out`
	)
}

const tabs = [
	{ type: "Category", label: "Categories" },
	{ type: "Item", label: "Items" },
	{ type: "Addon", label: "Addons" },
];

export default function Menu() {
	const { unsaved, setUnsaved } = useUnsavedChanges();
	
	const [stateChanged, setStateChanged] = useState(false);
	const [selectedObjectId, setSelectedObjectId] = useState<ObjectId>();
	const { unsaved: pageUnsaved, setUnsaved: setPageUnsaved } = useContext(UnsavedContext);
	const { unsaved: objectUnsaved, setUnsaved: setObjectUnsaved } = useUnsavedChanges();

	const [tabIndex, setTabIndex] = useState(0);
	const selectedType = tabs[tabIndex];

	const menu = useMenu(true);
	const key = tabs[tabIndex].label.toLowerCase() as "categories" | "items" | "addons";

	function getRenderList() {
		return menu.menu?.[key];
	}

	function getSelectedObject(): Category | Item | Addon | undefined {
		return getRenderList()?.map(o => o as any).find(o => o._id === selectedObjectId);
	}

	function selectObject(object: Category | Item | Addon | undefined) {
		if(getSelectedObject() === undefined) {
			setSelectedObjectId(object?._id);
			return;
		}

		if(objectUnsaved) {
			if(confirm(`There are unsaved changes to this ${getSelectedObject()?.type}. If you leave now, these changes will be lost.`)) {
				setSelectedObjectId(object?._id);
				setObjectUnsaved(false);
				setPageUnsaved?.(false);
			}
		} else {
			setSelectedObjectId(object?._id);
		}
	}

	return <div className={commonStyles.management.splitScreen.container} key={stateChanged ? 1 : 0}>
		<div className="flex flex-col h-full">
			<div className="flex sm:space-x-2 max-sm:flex-col-reverse mb-1.5 sm:items-center">
				<div className={styles.tab.container}>
					{tabs.map((tab, i) => <button
						key={tab.label}
						onClick={e => { e.preventDefault(); setTabIndex(i); }}
						className="relative px-1 py-1 w-full">
							{
								tabIndex === i &&
								<motion.div
									layoutId="active-menu-tab"
									transition={{ ease: "backOut" }}
									className={styles.tab.overlay}>
								</motion.div>
							}
							<span className={tw()}>{tab.label}</span>
					</button>)}
					<button className={tw(commonStyles.management.button, "relative aspect-square shrink-0 ml-2")}>
						&#x1f705;
					</button>
				</div>
				<div className="min-w-[6rem] w-0 max-sm:w-full max-sm:mb-2">
					{
						withLoading(!menu.settingsLoaded,
							<form onChange={e => setPageUnsaved?.(true)} onSubmit={e => e.preventDefault()} >
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
			<List>
				{
					(getRenderList()?.length ?? 0) > 0
					? withLoading(!menu.menuLoaded,
						getRenderList()?.map((object, i) => {
							return <ListItem key={i}
								onClick={() => selectObject(object)}
								selected={selectedObjectId === object._id}>
								<div className="flex h-full p-3">
									<div className="flex flex-col justify-between grow-0 w-[calc(100%-2rem)] truncate">
										<p className="truncate font-bold">{object.name}</p>
										<p className="truncate">{"description" in object ? object.description : ""}</p>
									</div>
									<div className="shrink-0">
										{"price" in object ? formatMoney(object.price) : ""}
									</div>
									<span className={commonStyles.management.menu.list.arrow}></span>
								</div>
							</ListItem>
						})
					) : <ListItem>
						<div className="flex flex-col justify-between h-full p-3">
							<p className="font-bold">No {tabs[tabIndex].label} found.</p>
							<p>Click the button below to get started.</p>
						</div>
					</ListItem>
				}
				<button className={styles.newButton}></button>
			</List>
		</div>
		<div onClick={e => { if(e.target === e.currentTarget) selectObject(undefined) }} className={commonStyles.management.splitScreen.details.backdrop(selectedObjectId !== undefined)}>
			<div className={commonStyles.management.splitScreen.details.container}>
				{
					getSelectedObject() !== undefined
						? <ObjectEdit object={getSelectedObject()} />
						: <h2 className={tw(commonStyles.management.title, "text-center")}>Select a{"AEIOU".includes(selectedType.type[0]) ? "n" : ""} {selectedType.type} from the list</h2>
				}
			</div>
		</div>
	</div>
}

Menu.getLayout = (page: ReactElement) => {
	return <Index>{page}</Index>
}