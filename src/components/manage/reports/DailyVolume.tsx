import { Menu } from "@/menu/menuUtil";
import { formatMoney } from "@/menu/moneyUtil";
import { Order } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { clamp, mod, sum } from "@/utility/mathUtil";
import { formatOrder } from "@/utility/orderUtil";
import { serveCSV, makeCSV } from "@/utility/reportUtil";
import { tw } from "@/utility/tailwindUtil";
import { motion } from "framer-motion";
import { useState } from "react";

const styles = {
	typeSelector: {
		container: tw(
			`flex justify-evenly`
		)
	},
	chart: {
		container: tw(
			`flex lg:flex-col lg:gap-y-2 max-lg:gap-x-2`,
			`overflow-x-scroll`
		),
		hour: {
			container: tw(
				`flex lg:gap-x-4 max-lg:flex-col-reverse`,
			),
			label: tw(
				`flex lg:justify-between items-center justify-center`,
				`w-12 text-md font-semibold`,
			),
			barVertical: tw(
				`w-10`,
				`bg-slate-500 dark:bg-zinc-500 bg-opacity-50`,
				`transition-colors`,
				`rounded-md`,
				`lg:hidden`,
				`flex items-start justify-center`
			),
			barHorizontal: tw(
				`max-lg:hidden`,
				`h-6`,
				`bg-slate-500 dark:bg-zinc-500 bg-opacity-50`,
				`transition-colors`,
				`rounded-md`,
				`flex justify-end items-center`,
			),
			dataLabel: tw(
				`lg:mr-2`,
				`text-white font-semibold`,
				`[text-shadow:0px_1.5px_4px_#000]`
			)
		}
	}
}

export default function DailyVolume(props: { orders: Order[], menu: Menu }) {
	const [date, setDate] = useState(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return today;
	});
	const [volumeType, setVolumeType] = useState<"count" | "revenue">("count");

	function getOrdersByDay(date: Date) {
		return props.orders.filter(o => o.timestamp > date.getTime() && o.timestamp < date.getTime() + 1000 * 60 * 60 * 24);
	}
	
	function getOrdersByHour(hour: Date) {
		return getOrdersByDay(hour).filter(o => o.timestamp > hour.getTime() && o.timestamp < hour.getTime() + 1000 * 60 * 60);
	}

	function getHourlyCountVolume(hour: Date) {
		const hours = getAllHours(hour);
		const ordersByHour = hours.map(getOrdersByHour);

		function countOrderParts(order: Order) {
			const itemCounts = order.parts.map(p => p.quantity);
			return sum(itemCounts);
		}

		function countHour(orders: Order[]) {
			const orderCounts = orders.map(countOrderParts);
			return sum(orderCounts);
		}

		const volume = ordersByHour.map(countHour);

		const total = sum(volume);
		return { volume, total }
	}

	function getHourlyRevenueVolume(hour: Date) {
		const hours = getAllHours(hour);
		const ordersByHour = hours.map(getOrdersByHour);
		const formattedOrdersByHour = ordersByHour.map(h => h.map(o => formatOrder(o, props.menu)!));

		const volume = formattedOrdersByHour.map(orders => sum(orders.map(o => o.price)));
		const total = sum(volume);
		return { volume, total }
	}

	function getAllHours(date: Date) {
		const midnight = new Date(date);
		midnight.setHours(0, 0, 0, 0);
		const result: Date[] = [...Array(24)].map((_, h) => {
			const newTime = new Date(midnight);
			newTime.setHours(h);
			return newTime;
		});

		return result;
	}

	function formatAsCsv() {
		const days = getAllHours(date);
		const count = getHourlyCountVolume(date);
		const revenue = getHourlyRevenueVolume(date);

		const transformedInfo = days.map((day, i) => [
			day.toLocaleTimeString(undefined, { timeStyle: "short" }),
			count.volume[i], count.total === 0 ? 0 : count.volume[i] / count.total,
			revenue.volume[i], revenue.total === 0 ? 0 : revenue.volume[i] / revenue.total
		]);

		return [["Hour", "Items sold (count)", "Items sold (proportion)", "Revenue (total)", "Revenue (proportion)"], ...transformedInfo];
	}

	function getFilename() {
		function fileFriendlyDateString(date: Date) {
			return date.toLocaleDateString().replaceAll("/", "_");
		}

		const dateStamp = fileFriendlyDateString(new Date());
		const timeStamp = new Date().toLocaleTimeString().replaceAll(":", "-");

		return `Daily volume report for ${fileFriendlyDateString(date)} generated on ${dateStamp} at ${timeStamp}`;
	}

	return <div>
		<input onChange={e => {
			const selectedDate = e.target.valueAsDate;
			selectedDate?.setTime(selectedDate.getTime() + selectedDate.getTimezoneOffset() * 60 * 1000);
			setDate(selectedDate ?? new Date());
		}} className={commonStyles.management.inputBox} type="date" />

		<div className={styles.typeSelector.container}>
			<div className="space-x-2">
				<input onChange={() => setVolumeType("count")} defaultChecked id="count" type="radio" name="volume-type" />
				<label htmlFor="count">By count</label>
			</div>

			<div className="space-x-2">
				<input onChange={() => setVolumeType("revenue")} id="revenue" type="radio" name="volume-type" />
				<label htmlFor="revenue">By revenue</label>
			</div>
		</div>

		<p className={tw(commonStyles.management.subtitle, "text-center")}>
			{date.toLocaleDateString(undefined, { dateStyle: "medium" })}
		</p>
		
		<div className="flex justify-center mb-4 mt-2">
			<a href={serveCSV(makeCSV(formatAsCsv()))} download={getFilename()} className={commonStyles.management.download}>Download report</a>
		</div>

		<div className={styles.chart.container}>
			{getAllHours(date).map((hour, h) => {
				const start = mod(h - 1, 12) + 1;
				const end = mod(start, 12) + 1

				const volume = volumeType === "count"
					? getHourlyCountVolume(hour)
					: getHourlyRevenueVolume(hour);
				
				const label = volumeType === "count"
					? volume.volume[h]
					: formatMoney(volume.volume[h]);
				
				const proportion = volume.total === 0 ? 0 : volume.volume[h] / volume.total

				return <div key={h} className={styles.chart.hour.container}>
					<span className={styles.chart.hour.label}>
						<span>{start}</span>
						&ndash;
						<span>{end}</span>
					</span>
					
					<motion.div
						key={`${h}-vertical`}
						layoutId={`${h}-vertical`}
						className={styles.chart.hour.barVertical}
						style={{ height: clamp(proportion * 200, 3) }}>
						<span className={styles.chart.hour.dataLabel}>{volume.volume[h] === 0 ? "" : label}</span>
					</motion.div>
					
					<motion.div
						key={`${h}-horizontal`}
						layoutId={`${h}-horizontal`}
						className={styles.chart.hour.barHorizontal}
						style={{ width: proportion === 0 ? 3 : `${proportion * 100}%` }}>
						<span className={styles.chart.hour.dataLabel}>{volume.volume[h] === 0 ? "" : label}</span>
					</motion.div>
				</div>
			})}
		</div>
	</div>
}