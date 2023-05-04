import { ReactElement, ReactNode, useContext, useEffect, useState } from "react"
import Index from ".."
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
import Link from "next/link";
import { useRouter } from "next/router";

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

// const tabs = [
// 	{ type: "Category", label: "Categories" },
// 	{ type: "Item", label: "Items" },
// 	{ type: "Addon", label: "Addons" },
// ];

const tabs = {
	category: { type: "Category", label: "Categories" },
	item: { type: "Item", label: "Items" },
	addon: { type: "Addon", label: "Addons" },
}

export default function Menu(props: { children?: ReactNode | ReactNode[] }) {
	const { unsaved, setUnsaved } = useUnsavedChanges();

	const router = useRouter();
	
	const [stateChanged, setStateChanged] = useState(false);
	const [selectedObjectId, setSelectedObjectId] = useState<ObjectId>();
	const { unsaved: objectUnsaved, setUnsaved: setObjectUnsaved } = useUnsavedChanges();

	const [selectedTab, setSelectedTab] = useState<keyof typeof tabs>();
	const tab = tabs[selectedTab ?? "category"] ?? { label: "Object", type: "None" };

	useEffect(() => {
		const route = router.pathname.split("/").slice(1).pop() ?? ""
		if(route === "menu") {
			router.push("/manage/menu/category");
		}
		setSelectedTab(route as keyof typeof tabs);

		setUnsaved(router.pathname.includes("#"));
	}, [router.pathname]);

	const menu = useMenu(true);

	function getRenderList() {
		return menu.menu?.[selectedTab ?? "category"];
	}

	function getSelectedObject(): Category | Item | Addon | undefined {
		return getRenderList()?.map(o => o as any).find(o => o._id === selectedObjectId);
	}
	
	return <div className={commonStyles.management.splitScreen.container} key={stateChanged ? 1 : 0}>
		<div className="flex flex-col h-full">
			<div className="flex sm:space-x-2 max-sm:flex-col-reverse mb-1.5 sm:items-center">
				<div className={styles.tab.container}>
					{Object.keys(tabs).map((t, i) => {
						const route = t as keyof typeof tabs;
						const tab = tabs[route];
						return <Link href={`/manage/menu/${tab.type.toLowerCase()}`}
							key={tab.label}
							className="relative px-1 py-1 w-full flex items-center justify-center">
								{
									route === selectedTab &&
									<motion.div
										layoutId="active-menu-tab"
										transition={{ ease: "backOut" }}
										className={styles.tab.overlay}>
									</motion.div>
								}
								<span className={commonStyles.management.subtitle}>{tab.label}</span>
						</Link>
					})}
					<button className={tw(commonStyles.management.button, "relative aspect-square shrink-0 ml-2")}>
						&#x1f705;
					</button>
				</div>
				<div className="min-w-[6rem] w-0 max-sm:w-full max-sm:mb-2">
					{
						withLoading(!menu.settingsLoaded,
							<TextConfirmField
								onSubmit={v => {
									if(menu.settings) {
										menu.modifySettings({...menu.settings, taxRate: parseFloat(v)});
									}
								}}
								inputProps={{
									onBlur: e => {
										if(menu.settings) {
											menu.modifySettings({...menu.settings, taxRate: parseFloat(e.target.value ?? 0)});
										}
									},
									placeholder: `${menu.settings?.taxRate ?? 0}`
								}
							}
							label="Tax Rate"
							suffix="%" />
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
								onClick={() => router.push(`/manage/menu/${selectedTab}?id=${object._id.toString()}`)}
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
							<p className="font-bold">No {tab.label} found.</p>
							<p>Click the button below to get started.</p>
						</div>
					</ListItem>
				}
				<button className={styles.newButton}></button>
			</List>
		</div>
		<div onClick={e => { if(e.target === e.currentTarget) router.push(`/manage/menu/${selectedTab}`) }} className={commonStyles.management.splitScreen.details.backdrop(selectedObjectId !== undefined)}>
			<div className={commonStyles.management.splitScreen.details.container}>
				{props.children}
			</div>
		</div>
	</div>
}

Menu.getLayout = (page: ReactElement) => {
	return <Index>{page}</Index>
}