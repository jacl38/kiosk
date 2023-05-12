import { useRouter } from "next/router";
import { ReactElement, ReactNode, useEffect, useState } from "react";
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

// Generic component for /manage/menu/[object], where [object] is category, item, or addon.
// Shows the proper edit form for each object type, and manages deleting/saving
export default function Object() {
	const router = useRouter();
	const objectType = router.query.object as "category" | "item" | "addon" | undefined;

	const [objectData, setObjectData] = useState<Category | (Item & { imageData?: string }) | Addon>();
	const [modifiedData, setModifiedData] = useState<Category | (Item & { imageData?: string }) | Addon>();
	const { id } = router.query;
	const menu = useMenu(true);

	// Hook used to prevent leaving the page if there are unsaved changes
	const { unsaved, setUnsaved } = useUnsavedChanges();

	// Finds the objectData for the object ID found in the URL
	useEffect(() => {
		// If the menu hasn't loaded, or there is an invalid objectType in the URL query, cancel
		if(!menu.menuLoaded || !objectType) return;
		const collection = menu.menu?.[objectType];

		// If the collection type hasn't been found, cancel
		if(!collection) return;
		const foundObject = (menu.menu?.[objectType] as any[]).find(i => i?._id.toString() === id);

		setObjectData(foundObject);
	}, [menu.menu, menu.menuLoaded, router, id, objectType]);

	// Provides a different error message for each object type,
	// or if an error occurs
	function selectMessage() {
		switch (objectType) {
			case "category": return "Select a category";
			case "item": return "Select an item";
			case "addon": return "Select an addon";
		}
		return "An error occurred. Go back and try again.";
	}

	// Returns the edit form component for the respective object type
	function object() {
		if(objectData === undefined) return <p className={tw(commonStyles.management.title, "text-center")}>{selectMessage()}</p>;
		let EditComponent: (props: any) => JSX.Element;
		switch (objectData.type) {
			case "Category": {
				EditComponent = CategoryEdit;
				break;
			}
			case "Item": {
				EditComponent = ItemEdit;
				break;
			}
			case "Addon": {
				EditComponent = AddonEdit;
				break;
			}
		}
		if(EditComponent === undefined) return <p className={tw(commonStyles.management.title, "text-center")}>{selectMessage()}</p>;
		return <EditComponent onChange={setModifiedData} {...objectData}/>
	}

	// Sends a post request to the server to save the object currently displaying and refresh the item list
	async function saveObject() {
		if(!modifiedData || !modifiedData._id || !objectData?._id) return;
		await menu.modifyObject(objectData?._id, modifiedData);
		setUnsaved(false);
		menu.reFetch();
	}

	// Sends a post request to the server to delete the object currently displaying and refresh the item list
	async function deleteObject() {
		// Asks the user to confirm deleting the object
		if(objectData && objectData._id && confirm(`Really delete ${objectData.name}? This cannot be undone.`)) {
			console.log(`Removing ${objectData.name} ${objectData._id}`);
			await menu.removeObject(objectData.type, objectData._id);
			window.location.hash = "d";
			menu.reFetch();
		}
	}

	return <div className={styles.outerContainer}>
		{
			objectData &&
				// Delete and Save buttons
				<div className={styles.topBar.container}>
					<button onClick={deleteObject} className={commonStyles.management.button}>
						<span className="text-rose-700">&#10754;</span> Delete
					</button>

					<button onClick={saveObject} className={commonStyles.management.button}>
						<span className="text-green-700">&#10003;</span> Save
					</button>
				</div>
		}
		<div className="h-full overflow-y-auto">
			{object()}
		</div>
	</div>
}

Object.getLayout = (page: ReactElement) => {
	return <ManageIndex>
		<MenuIndex>{page}</MenuIndex>
	</ManageIndex>
}