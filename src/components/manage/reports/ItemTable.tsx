import { Menu } from "@/menu/menuUtil";
import { Item, Order } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import { useState } from "react";
import Table from "../Table";
import { formatOrder } from "@/utility/orderUtil";
import { ObjectId } from "mongodb";
import { sum } from "@/utility/mathUtil";
import { formatMoney } from "@/menu/moneyUtil";
import { makeCSV, serveCSV } from "@/utility/reportUtil";

const styles = {
	outerContainer: tw(
		`flex flex-col items-center gap-y-4`
	)
}

type TimeFrame = {
	label: string,
	ms: number
}

const timeFrames: TimeFrame[] = [
	{ label: "All", ms: Infinity },
	{ label: "Year", ms: 1000 * 60 * 60 * 24 * 365 },
	{ label: "Month", ms: 1000 * 60 * 60 * 24 * 30 },
	{ label: "Week", ms: 1000 * 60 * 60 * 24 * 7 },
	{ label: "Day", ms: 1000 * 60 * 60 * 24 },
];

/** Component used in the /manage/reports page to display items in a table */
export default function ItemTable(props: { orders: Order[], menu: Menu }) {
	const [timeframeIndex, setTimeframeIndex] = useState<number>();

	/** Filters item list by items within the selected timeframe */
	function filterByTimeframe() {
		if(timeframeIndex === undefined) return props.orders;

		const now = Date.now();
		const filtered = props.orders.filter(o => now - o.timestamp < timeFrames[timeframeIndex].ms);
		return filtered;
	}

	/** Get an array of objects of type { itemName: string, soldCount: number, revenue: number } for each item */
	function getItemQuantities() {
		const formattedOrders = filterByTimeframe().map(o => formatOrder(o, props.menu));
		const allItems = new Set<Item>();
		const countMap = new Map<ObjectId, number>();
		const revenueMap = new Map<ObjectId, number>();
		formattedOrders.forEach(o => {
			o?.parts.forEach(p => {
				allItems.add(p.item);
				countMap.set(p.item._id!, (countMap.get(p.item._id!) ?? 0) + p.quantity);
				revenueMap.set(p.item._id!, (revenueMap.get(p.item._id!) ?? 0) + p.quantity * (p.item.price + sum(p.addons.map(a => a.type.price))));
			});
		});

		return Array.from(allItems).map(i => ({
			itemName: i.name,
			soldCount: countMap.get(i._id!) ?? 0,
			revenue: revenueMap.get(i._id!) ?? 0
		}));
	}

	function formatAsCsv() {
		const itemQuantities = getItemQuantities().map(i => [ i.itemName, i.soldCount, formatMoney(i.revenue) ]);
		return [["Item name", "Quantity sold", "Total revenue"], ...itemQuantities];
	}

	function getFilename() {
		const date = new Date();
		const reportType = timeFrames[timeframeIndex ?? 0].label;
		
		const dateStamp = date.toLocaleDateString().replaceAll("/", "_");
		const timeStamp = date.toLocaleTimeString().replaceAll(":", "-");

		return `Item Report (${reportType}) generated on ${dateStamp} at ${timeStamp}`;
	}

	return <div className={styles.outerContainer}>

		<select onChange={e => setTimeframeIndex(e.target.selectedIndex)} className={commonStyles.management.inputBox}>
			{timeFrames.map((timeframe, i) => <option id={`${i}`} key={timeframe.label}>
				{timeframe.label}
			</option>)}
		</select>

		<Table sortable firstIsRowLabel
			headings={["Quantity sold", "Total revenue"]}
			rows={getItemQuantities().map(i => [ i.itemName, i.soldCount, formatMoney(i.revenue) ])}
		/>

		<a href={serveCSV(makeCSV(formatAsCsv()))} download={getFilename()} className={commonStyles.management.download}>Download report</a>
	</div>
}