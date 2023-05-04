import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import MenuIndex from ".";
import ManageIndex from "..";
import { Addon, Category, Item } from "@/menu/structures";
import useMenu from "@/hooks/useMenu";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import AddonEdit from "@/components/manage/menu/AddonEdit";
import CategoryEdit from "@/components/manage/menu/CategoryEdit";
import ItemEdit from "@/components/manage/menu/ItemEdit";
import useUnsavedChanges from "@/hooks/useUnsavedChanges";

const styles = {
	outerContainer: tw(
		`flex justify-between`,
		`flex-col max-lg:flex-col-reverse`,
		`h-full`,
	),
	topBar: {
		container: tw(
			`flex justify-between`,
			`lg:pb-2 lg:mb-2`,
			`max-lg:pt-2 max-lg:mt-2`,
			`lg:border-b-2 max-lg:border-t-2`,
			`border-stone-300 dark:border-gray-500`,
			`transition-colors`
		)
	}
}

export default function Object() {
	const router = useRouter();
	const objectType = router.query.object as "category" | "item" | "addon" | undefined;

	const [objectData, setObjectData] = useState<Category | Item | Addon>();
	const [modifiedData, setModifiedData] = useState<Category | Item | Addon>();
	const { id } = router.query;
	const menu = useMenu(true);

	const { unsaved, setUnsaved } = useUnsavedChanges();

	useEffect(() => {
		if(!menu.menuLoaded || !objectType) return;
		const collection = menu.menu?.[objectType];
		if(!collection) return;
		const foundObject = (menu.menu?.[objectType] as any[]).find(i => i?._id.toString() === id);

		setObjectData(foundObject);
	}, [menu.menu, router.query]);

	function selectMessage() {
		switch (objectType) {
			case "category": return "Select a category";
			case "item": return "Select an item";
			case "addon": return "Select an addon";
		}
		return "An error occurred. Go back and try again.";
	}

	function object() {
		if(objectData === undefined) return <p className={tw(commonStyles.management.title, "text-center")}>{selectMessage()}</p>;
		switch (objectData.type) {
			case "Category": return <CategoryEdit {...objectData} />
			case "Item": return <ItemEdit onChange={setModifiedData} {...objectData} />
			case "Addon": return <AddonEdit {...objectData} />
		}
	}

	async function saveObject() {
		if(!modifiedData || !modifiedData._id) return;
		await menu.modifyObject(modifiedData._id, modifiedData);
		setUnsaved(false);
	}

	return <div className={styles.outerContainer}>
		{
			objectData &&
				<div className={styles.topBar.container}>
					<button className={commonStyles.management.button}>
						<span className="text-rose-700">&#10754;</span> Delete
					</button>

					<button onClick={saveObject} className={commonStyles.management.button}>
						<span className="text-green-700">&#10003;</span> Save
					</button>
				</div>
		}
		<div className="h-full overflow-y-scroll">
			{object()}
		</div>
	</div>
}

Object.getLayout = (page: ReactElement) => {
	return <ManageIndex>
		<MenuIndex>{page}</MenuIndex>
	</ManageIndex>
}