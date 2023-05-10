import { ReactElement, useContext, useEffect, useState } from "react"
import Kiosk, { HeaderContext } from "./layout"
import { tw } from "@/utility/tailwindUtil";
import SectionScroller from "@/components/Kiosk/SectionScroller";
import useMenu from "@/hooks/useMenu";
import Link from "next/link";
import commonStyles from "@/styles/common";
import ItemCard from "@/components/Kiosk/ItemCard";
import { ObjectId } from "mongodb";
import AddToOrderPopup from "@/components/Kiosk/AddToOrderPopup";
import { Addon, Item } from "@/menu/structures";
import { AnimatePresence, motion } from "framer-motion";
import useLocalOrder from "@/hooks/useLocalOrder";
import { addonsFromOrder, calculateOrderSubtotal, itemsFromOrder } from "@/utility/orderUtil";
import { formatMoney } from "@/menu/moneyUtil";
import FloatingButton from "@/components/Kiosk/FloatingButton";
import { useRouter } from "next/router";
import Searchbox from "@/components/Kiosk/Searchbox";

const styles = {
	tabBar: tw(
		`flex`,
		`bg-hotchocolate-100`,
		`border-b-2 border-hotchocolate-200`
	),
	checkoutContainer: tw(
		`px-8`,
		`flex shrink-0 justify-center items-center`
	),
	itemGrid: tw(
		`grid grid-cols-2 lg:grid-cols-3`,
		`gap-x-1 gap-y-4`,
		`p-4`
	),
	description: {
		container: tw(
			`px-4 py-2`
		),
		text: tw(
			`text-xl italic text-hotchocolate-800`
		)
	}
}

export default function Menu() {
	const { setHeader } = useContext(HeaderContext);
	useEffect(() => {
		setHeader?.("Menu");
	}, [setHeader]);

	const [category, setCategory] = useState<ObjectId>();
	const [selectedItem, setSelectedItem] = useState<Item>();

	const [searchQuery, setSearchQuery] = useState<string>();
	const [filteredItems, setFilteredItems] = useState<Item[]>(getItemsByCategory);

	useEffect(() => {
		setFilteredItems(getItemsByCategory());
	}, [category]);

	const menu = useMenu(false);
	const order = useLocalOrder();
	const router = useRouter();

	const orderSubtotal = menu.menu ? calculateOrderSubtotal(itemsFromOrder(order.current, menu.menu.item)!, addonsFromOrder(order.current, menu.menu.addon)!) : 0;

	const itemsWithoutImages = filteredItems?.filter(i => i.imageID === null);
	const itemsWithImages = filteredItems?.filter(i => i.imageID !== null);
	const categoryInfo = menu.menu?.category.find(c => c._id === category);

	function getImage(item: Item) {
		const imageID = item.imageID!;
		const foundImage = menu.images?.find(img => img._id === imageID);
		return foundImage;
	}

	function getAddons(item: Item) {
		const addons: Addon[] = [];
		item.addonIDs.forEach(id => {
			const foundAddon = menu.menu?.addon.find(a => a._id === id);
			if(foundAddon) {
				addons.push(foundAddon);
			}
		});

		return addons;
	}

	function getItemsByCategory() {
		const result = category && menu.menu?.item.filter(i => i.categoryIDs.includes(category));
		return result ?? [];
	}

	function search(query: string) {
		setSearchQuery(query);
		query = query.toLowerCase().replaceAll(" ", "")
		
		if(query === "") {
			setFilteredItems([]);
			return;
		}

		const allItems = menu.menu?.item!;
		const match = allItems.filter(i => {
			return i.name.toLowerCase().replaceAll(" ", "").includes(query)
				|| i.description.toLowerCase().replace(" ", "").includes(query);
		});
		console.log(match);
		setFilteredItems(match);
	}

	return <>
		<div className={styles.tabBar}>
			<SectionScroller
				loading={!menu.menuLoaded}
				keyId="categories"
				sections={[...menu.menu?.category.map(c => ({ id: c._id, label: c.name })) ?? [], { id: "SEARCH", label: "Search 🔍\uFE0E" }]}
				onSelect={id => setCategory(id)} />
			<div className={styles.checkoutContainer}>
				<Link
					href={orderSubtotal ? `./checkout` : {}}
					className={tw(commonStyles.order.button, orderSubtotal ? "" : commonStyles.order.buttonDisabled)}>
					Checkout {orderSubtotal ? `(${formatMoney(orderSubtotal)})` : ""} &rsaquo;
				</Link>
			</div>
		</div>

		<AnimatePresence mode="popLayout">
			<motion.div
				key={category?.toString()}
				initial={{ opacity: 0, translateX: -20, scale: 0.9 }}
				animate={{ opacity: 1, translateX: 0, scale: 1 }}
				exit={{ opacity: 0, translateX: 20, scale: 0.9 }}
				className={styles.description.container}>
				<p className={styles.description.text}>{categoryInfo?.description}</p>
			</motion.div>
		</AnimatePresence>

		<AnimatePresence mode="popLayout">
			<motion.div
				initial={{ opacity: 0, translateY: -20 }}
				animate={{ opacity: 1, translateY: 0, transition: { delay: 0.2 } }}
				exit={{ opacity: 0, translateY: 20 }}
				key={category?.toString()}>

				{
					category?.toString() === "SEARCH" &&
					<>
						<Searchbox onSearch={search} />
						{
							filteredItems.length === 0 && searchQuery?.trim() !== "" &&
							<p className="text-center text-2xl my-4 text-hotchocolate-700">
								Sorry, no items match the term &quot;{searchQuery}&quot;
							</p>
						}
					</>
				}

				<div className={styles.itemGrid}>
					{itemsWithoutImages?.map(i => {
						return <ItemCard onClick={() => setSelectedItem(i)} key={`imagecard-${i._id}`} {...i}/>
					})}
				</div>

				<div className={styles.itemGrid}>
					{itemsWithImages?.map(i => {
						return <ItemCard onClick={() => setSelectedItem(i)} key={`imagecard-${i._id}`} {...i} image={getImage(i)?.data}/>
					})}
				</div>
			</motion.div>
		</AnimatePresence>
		
		<AnimatePresence>
			{
				selectedItem &&
				<AddToOrderPopup
					selectedItem={selectedItem}
					addons={getAddons(selectedItem)}
					image={getImage(selectedItem)?.data}
					backdropClicked={() => setSelectedItem(undefined)}
				/>
			}
		</AnimatePresence>

		<FloatingButton
			action={() => {
				if(orderSubtotal && confirm("Are you sure you want to end this order?")) {
					order.clear();
					router.push("/kiosk");
				}
				if(!orderSubtotal) router.push("/kiosk");
			}}>
			<span className={tw(
				`font-mono text-5xl`,
				`group-hover:-translate-x-1 transition-transform`)}>
				&lsaquo;
			</span>
		</FloatingButton>
	</>
}

Menu.getLayout = (page: ReactElement) => {
	return <Kiosk>{page}</Kiosk>
}