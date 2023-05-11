import { ReactElement, useCallback, useContext, useEffect, useState } from "react"
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

	const menu = useMenu(false);
	const order = useLocalOrder();
	const router = useRouter();

	const [category, setCategory] = useState<ObjectId>();
	const [selectedItem, setSelectedItem] = useState<Item>();

	const [searchQuery, setSearchQuery] = useState<string>("");

	// Filters items from the full menu list by which category they belong to
	const getItemsByCategory = useCallback(() => {
		const result = category && menu.menu?.item.filter(i => i.categoryIDs.includes(category));
		return result ?? [];
	}, [menu, category]);

	const [filteredItems, setFilteredItems] = useState<Item[]>(getItemsByCategory);

	// When `category` state changes, set the filtered item list appropriately
	useEffect(() => {
		setFilteredItems(getItemsByCategory());
	}, [category]);

	// Calculate the order subtotal, or set it to 0 if the menu has not yet loaded
	const orderSubtotal = menu.menu
		? calculateOrderSubtotal(
			itemsFromOrder(order.current, menu.menu.item)!,
			addonsFromOrder(order.current, menu.menu.addon)!)
		: 0;

	// Separate the items in `filteredItems` by the ones with and without images,
	// which are displayed in separate grids
	const itemsWithoutImages = filteredItems?.filter(i => i.imageID === null);
	const itemsWithImages = filteredItems?.filter(i => i.imageID !== null);

	// Get the category info paragraph from the selected category
	const categoryInfo = menu.menu?.category.find(c => c._id === category);

	// Helper function to get the image from a selected item
	function getImage(item: Item) {
		const imageID = item.imageID!;
		const foundImage = menu.images?.find(img => img._id === imageID);
		return foundImage;
	}

	// Helper function to get the list of addons from a selected item
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

	// Function called when typing in the searchbox.
	// Sets `filteredItems` based on the query
	function search(query: string) {
		setSearchQuery(query);
		query = query.toLowerCase().replaceAll(" ", "")
		
		if(query === "") {
			setFilteredItems([]);
			return;
		}

		const allItems = menu.menu?.item!;
		const matchedItems = allItems.filter(i => {
			const transformedName = i.name.toLowerCase().replaceAll(" ", "");
			const transformedDescription = i.description.toLowerCase().replaceAll(" ", "");

			if(transformedName.includes(query)) return true;
			if(transformedDescription.includes(query)) return true;

			const addons = getAddons(i);
			let addonMatches = false;
			addons.forEach(addon => {
				const addonName = addon.name.toLowerCase().replaceAll(" ", "");
				if(addonName.includes(query)) addonMatches = true;
			});
			if(addonMatches) return true;

			return false;
		});
		setFilteredItems(matchedItems);
	}

	return <>
		<div className={styles.tabBar}>
			{/* List of menu categories in a scrollable container at the top of the page */}
			<SectionScroller
				loading={!menu.menuLoaded}
				keyId="categories"
				sections={
					(function() {
						// Maps the menu categories to an array of objects of type { id: ObjectId, label: string }
						// to display in the tab list
						const categories: { id: string | ObjectId, label: string }[] = menu.menu?.category.map(c => ({ id: c._id!, label: c.name })) ?? [];

						// Adds a search tab at the end of the list
						if(categories.length > 0) categories.push({ id: "SEARCH", label: "Search 🔍\uFE0E" });
						return categories;
					})()
				}
				onSelect={id => setCategory(id)}
			/>

			{/* Checkout button to the right of the tab list */}
			{/* Shows as disabled (faded green, unclickable) when `orderSubtotal` is 0 */}
			<div className={styles.checkoutContainer}>
				<Link
					href={orderSubtotal ? `./checkout` : {}}
					className={tw(commonStyles.order.button, orderSubtotal ? "" : commonStyles.order.buttonDisabled)}>
					Checkout {orderSubtotal ? `(${formatMoney(orderSubtotal)})` : ""} &rsaquo;
				</Link>
			</div>
		</div>

		{/* Shows the currently selected category description paragraph */}
		{/* Uses Framer Motion to animate in and out */}
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

		{/* Shows the currently selected category's item list */}
		{/* Uses Framer Motion to animate in and out */}
		<AnimatePresence mode="popLayout">
			<motion.div
				initial={{ opacity: 0, translateY: -20 }}
				animate={{ opacity: 1, translateY: 0, transition: { delay: 0.2 } }}
				exit={{ opacity: 0, translateY: 20 }}
				key={category?.toString()}>

				{
					// If the current tab is the search tab,
					// show the search box
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

				{/* Show each item without images in a grid first, then show the items with images below */}
				{/* Passes the item info into an ItemCard component */}
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
		
		{/* Shows the AddToOrderPopup if an item is selected */}
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

		{/* Shows the back button at the bottom left of the page */}
		{/* Confirms whether the user wants to end the order,
			then goes to the /kiosk page */}
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