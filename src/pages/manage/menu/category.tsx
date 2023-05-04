import useMenu from "@/hooks/useMenu";
import { Category } from "@/menu/structures";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import MenuIndex from ".";
import ManageIndex from "..";
import CategoryEdit from "@/components/manage/menu/CategoryEdit";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import ObjectEdit from "@/components/manage/menu/ObjectEdit";

export default function Category() {
	const [category, setCategory] = useState<Category>();
	const router = useRouter();
	const { id } = router.query;
	const menu = useMenu(true);

	useEffect(() => {
		if(!menu) return;
		const foundCategory = menu.menu?.category.find(c => c._id.toString() === id);
		setCategory(foundCategory);
	}, [menu.menuLoaded, router.query]);

	return category
		? <ObjectEdit object={category}/>
		: <p className={tw(commonStyles.management.title, "text-center")}>Select a category</p>
}

Category.getLayout = (page: ReactElement) => {
	return <ManageIndex>
		<MenuIndex>{page}</MenuIndex>
	</ManageIndex>
}