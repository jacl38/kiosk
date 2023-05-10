import { Menu } from "@/menu/menuUtil";
import { formatMoney } from "@/menu/moneyUtil";
import { Order } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { remap, sum } from "@/utility/mathUtil";
import { formatOrder } from "@/utility/orderUtil";
import { tw } from "@/utility/tailwindUtil";
import { useState } from "react";

const styles = {
	typeSelector: {
		container: tw(
			`flex justify-evenly`
		)
	},
	heatmap: {
		container: tw(
			`flex flex-col`,
			`gap-y-2`
		),
		day: {
			container: tw(
				`flex gap-x-2 items-center`
			),
			label: tw(
				`text-xl text-center`,
				`w-12 whitespace-nowrap`,
			),
			box: tw(
				`flex-auto`,
				`border-b-4`,
				`rounded-xl`,
				`w-full h-12`,
				`flex`
			)
		}
	}
}

export default function WeeklyVolume(props: { orders: Order[], menu: Menu }) {
	const [date, setDate] = useState<Date>(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return today;
	});
	const [volumeType, setVolumeType] = useState<"count" | "revenue">("count");
	
	function getWeekFromDate(date: Date) {
		const weekday = date.getDay();
		const startOfWeek = new Date(date);
		startOfWeek.setDate(date.getDate() - weekday);
		return [...Array(7)].map((_, dow) => {
			const result = new Date(startOfWeek);
			result.setDate(startOfWeek.getDate() + dow);
			return result;
		});
	}

	function getOrdersByDay(date: Date) {
		return props.orders.filter(o => o.timestamp > date.getTime() && o.timestamp < date.getTime() + 1000 * 60 * 60 * 24);
	}

	function getWeeklyCountVolume(date: Date) {
		const week = getWeekFromDate(date);
		const ordersByDay = week.map(getOrdersByDay);

		function countOrderParts(order: Order) {
			const itemCounts = order.parts.map(p => p.quantity);
			return sum(itemCounts);
		}

		function countDay(orders: Order[]) {
			const orderCounts = orders.map(countOrderParts);
			return sum(orderCounts);
		}

		const volume = ordersByDay.map(countDay);
		
		const total = sum(volume);
		return { volume, total }
	}

	function getWeeklyRevenueVolume(date: Date) {
		const week = getWeekFromDate(date);
		const ordersByDay = week.map(getOrdersByDay);
		const formattedOrdersByDay = ordersByDay.map(d => d.map(o => formatOrder(o, props.menu)!));

		const volume = formattedOrdersByDay.map(orders => sum(orders.map(o => o.price)));
		const total = sum(volume);
		return { volume, total }
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
			Week of {date?.toLocaleDateString(undefined, { dateStyle: "medium" })}
		</p>

		<div className={styles.heatmap.container}>

			{
				getWeekFromDate(date).map((day, dow) => {
					const volume = volumeType === "count"
						? getWeeklyCountVolume(day)
						: getWeeklyRevenueVolume(day);
					
					const label = volumeType === "count"
						? `${volume.volume[dow]} items`
						: formatMoney(volume.volume[dow]);
					
					const proportion = volume.total === 0 ? 0 : volume.volume[dow] / volume.total;

					const opacity = remap(Math.sqrt(proportion), { min: 0, max: 1 }, { min: 0.15, max: 0.85 });

					return <div className={styles.heatmap.day.container}>
						<span className={styles.heatmap.day.label}>{day.getDate()} {day.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
						<div className={styles.heatmap.day.box} style={{
							backgroundColor: `rgba(0, 0, 0, ${opacity})`,
							borderColor: `rgba(0, 0, 0, ${opacity * 0.4})`
						}}>
						<span className="m-auto text-white [text-shadow:0px_1.5px_4px_#000]">{(proportion * 100).toFixed(2)}% &ndash; ({label})</span>
						</div>
					</div>
				})
			}
		</div>
	</div>
}