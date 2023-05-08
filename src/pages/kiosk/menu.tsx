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
	setHeader?.("Menu");
	const [category, setCategory] = useState<ObjectId>();

	const menu = useMenu(false);

	const filteredItems = category && menu.menu?.item.filter(i => i.categoryIDs.includes(category));

	const itemsWithoutImages = filteredItems?.filter(i => i.imageID === null);
	const itemsWithImages = filteredItems?.filter(i => i.imageID !== null);

	const [selectedItem, setSelectedItem] = useState<Item>();

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
				keyId="categories"
				sections={
					menu.menu
						? menu.menu?.category.map(c => ({ id: c._id, label: c.name }))
						: []
				}
				onSelect={id => setCategory(id)}
			/>
			<div className={styles.checkoutContainer}>
				<Link
					href="./checkout"
					className={commonStyles.order.button}>
					Checkout &rsaquo;
				</Link>
			</div>
		</div>

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
		
		{
			selectedItem &&
			<AddToOrderPopup
				selectedItem={selectedItem}
				addons={getAddons(selectedItem)}
				image={getImage(selectedItem)?.data}
				backdropClicked={() => setSelectedItem(undefined)}
			/>
		}
	</>
}

Menu.getLayout = (page: ReactElement) => {
	return <Kiosk>{page}</Kiosk>
}