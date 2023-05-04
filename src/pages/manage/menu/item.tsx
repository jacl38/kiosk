import useMenu from "@/hooks/useMenu";
import { Item } from "@/menu/structures";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import MenuIndex from ".";
import ManageIndex from "..";
import ItemEdit from "@/components/manage/menu/ItemEdit";
import { tw } from "@/utility/tailwindUtil";
import commonStyles from "@/styles/common";
import ObjectEdit from "@/components/manage/menu/ObjectEdit";

export default function Item() {
	const [item, setItem] = useState<Item>();
	const router = useRouter();
	const { id } = router.query;
	const menu = useMenu(true);

	useEffect(() => {
		if(!menu) return;
		const foundItem = menu.menu?.item.find(i => i._id.toString() === id);
		setItem(foundItem);
	}, [menu.menuLoaded, router.query]);

	return item
		? <ObjectEdit object={item}/>
		: <p className={tw(commonStyles.management.title, "text-center")}>Select an item</p>
}

Item.getLayout = (page: ReactElement) => {
	return <ManageIndex>
		<MenuIndex>{page}</MenuIndex>
	</ManageIndex>
}