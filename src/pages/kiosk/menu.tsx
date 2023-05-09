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
	)
}

export default function Menu() {
	const { setHeader } = useContext(HeaderContext);
	useEffect(() => {
		setHeader?.("Menu");
	}, [setHeader]);

	const [category, setCategory] = useState<ObjectId>();
	const [selectedItem, setSelectedItem] = useState<Item>();

	const menu = useMenu(false);
	const order = useLocalOrder();
	const router = useRouter();

	const orderSubtotal = menu.menu ? calculateOrderSubtotal(itemsFromOrder(order.current, menu.menu.item), addonsFromOrder(order.current, menu.menu.addon)) : 0;

	const filteredItems = category && menu.menu?.item.filter(i => i.categoryIDs.includes(category));
	const itemsWithoutImages = filteredItems?.filter(i => i.imageID === null);
	const itemsWithImages = filteredItems?.filter(i => i.imageID !== null);

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

	return <>
		<div className={styles.tabBar}>
			<SectionScroller
				loading={!menu.menuLoaded}
				keyId="categories"
				sections={menu.menu?.category.map(c => ({ id: c._id, label: c.name })) ?? []}
				onSelect={id => setCategory(id)}
			/>
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
				initial={{ opacity: 0, translateY: -20 }}
				animate={{ opacity: 1, translateY: 0, transition: { delay: 0.2 } }}
				exit={{ opacity: 0, translateY: 20 }}
				key={category?.toString()}>
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