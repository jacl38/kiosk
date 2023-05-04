import { ReactElement, ReactNode, useEffect, useState } from "react"
import Index from ".."
import commonStyles from "@/styles/common";
import List from "@/components/manage/List";
import ListItem from "@/components/manage/ListItem";
import TextConfirmField from "@/components/manage/TextConfirmField";
import { tw } from "@/utility/tailwindUtil";
import { motion } from "framer-motion";
import withLoading from "@/components/higherOrder/withLoading";
import useMenu from "@/hooks/useMenu";
import { formatMoney } from "@/menu/moneyUtil";
import Link from "next/link";
import { useRouter } from "next/router";
import { Category, Item, Addon } from "@/menu/structures";

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

const tabs = {
	category: { type: "Category", label: "Categories" },
	item: { type: "Item", label: "Items" },
	addon: { type: "Addon", label: "Addons" },
}

export default function Menu(props: { children?: ReactNode | ReactNode[] }) {
	const router = useRouter();
	
	const [selectedObjectId, setSelectedObjectId] = useState<string | undefined>();

	const [selectedTab, setSelectedTab] = useState<keyof typeof tabs>();
	const tab = tabs[selectedTab ?? "category"] ?? { label: "Object", type: "None" };

	useEffect(() => {
		const route = router.pathname.split("/").slice(1).pop() ?? "";
		const objectType = router.query.object as keyof typeof tabs;
		if(route === "menu" || !(objectType in tabs)) {
			router.push("/manage/menu/category");
		}

		setSelectedTab(objectType);
		setSelectedObjectId(router.query.id as string);
	}, [router]);
	
	const menu = useMenu(true);

	useEffect(() => {
		function hashChange() {
			if(window.location.hash === "" || window.location.hash === "#d") {
				menu.reFetch();
			}
		}

		window.addEventListener("hashchange", hashChange);
		return () => window.removeEventListener("hashchange", hashChange);
	}, []);

	function getRenderList() {
		return menu.menu?.[selectedTab ?? "category"];
	}

	async function addObject() {
		if(selectedTab !== undefined) {
			let newObj: Category | Item | Addon;

			switch (selectedTab) {
				case "category": {
					newObj = {
						type: "Category",
						name: "New category",
						description: "Category description"
					}
					break;
				}
				case "item": {
					newObj = {
						type: "Item",
						price: 0.00,
						name: "New item",
						description: "Item description",
						addons: [],
						categoryIDs: []
					}
					break;
				}
				case "addon": {
					newObj = {
						type: "Addon",
						price: 0.00,
						name: "New addon"
					}
					break;
				}
			}

			await menu.addObject(newObj);
			await menu.reFetch();
		}
	}
	
	return <div className={commonStyles.management.splitScreen.container}>
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
								onClick={() => router.push(`/manage/menu/${selectedTab}?id=${object._id?.toString()}`)}
								selected={selectedObjectId === object._id?.toString()}>
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
				<button onClick={addObject} className={styles.newButton}></button>
			</List>
		</div>
		<div onClick={e => { if(e.target === e.currentTarget) router.push(`/manage/menu/${selectedTab}`) }} className={commonStyles.management.splitScreen.details.backdrop(selectedObjectId !== undefined)}>
			<div className={commonStyles.management.splitScreen.details.container} key={selectedObjectId?.toString()}>
				{props.children}
			</div>
		</div>
	</div>
}

Menu.getLayout = (page: ReactElement) => {
	return <Index>{page}</Index>
}