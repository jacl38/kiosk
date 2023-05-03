import { Addon, Category, Item } from "@/menu/structures";
import { ObjectId } from "mongodb";
import AddonEdit from "./AddonEdit";
import CategoryEdit from "./CategoryEdit";
import ItemEdit from "./ItemEdit";
import { tw } from "@/utility/tailwindUtil";
import commonStyles from "@/styles/common";

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

export default function ObjectEdit(props: { object: Category | Item | Addon | undefined }) {
	
	function object() {
		if(props.object === undefined) return <>error</>;
		switch (props.object.type) {
			case "Category": return <CategoryEdit {...props.object} />
			case "Item": return <ItemEdit {...props.object} />
			case "Addon": return <AddonEdit {...props.object} />
		}
	}

	return <div className={styles.outerContainer}>
		<div className={styles.topBar.container}>
			<button className={commonStyles.management.button}>
				<span className="text-rose-700">&#10754;</span> Delete {props.object?.type}
			</button>

			<button className={commonStyles.management.button}>
				<span className="text-green-700">&#10003;</span> Save changes
			</button>
		</div>
		<div className="h-full overflow-y-scroll">
			{object()}
		</div>
	</div>
}