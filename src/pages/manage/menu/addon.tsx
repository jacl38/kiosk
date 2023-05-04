import useMenu from "@/hooks/useMenu";
import { Addon } from "@/menu/structures";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import MenuIndex from ".";
import ManageIndex from "..";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import ObjectEdit from "@/components/manage/menu/ObjectEdit";

export default function Addon() {
	const [addon, setAddon] = useState<Addon>();
	const router = useRouter();
	const { id } = router.query;
	const menu = useMenu(true);

	useEffect(() => {
		if(!menu) return;
		const foundAddon = menu.menu?.addon.find(i => i._id.toString() === id);
		setAddon(foundAddon);
	}, [menu.menuLoaded, router.query]);

	return addon
		? <ObjectEdit object={addon}/>
		: <p className={tw(commonStyles.management.title, "text-center")}>Select an addon</p>
}

Addon.getLayout = (page: ReactElement) => {
	return <ManageIndex>
		<MenuIndex>{page}</MenuIndex>
	</ManageIndex>
}