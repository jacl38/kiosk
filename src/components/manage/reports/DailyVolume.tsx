import { Menu } from "@/menu/menuUtil";
import { Order } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { mod } from "@/utility/mathUtil";
import { tw } from "@/utility/tailwindUtil";
import { useState } from "react";

const styles = {
	typeSelector: {
		container: tw(
			`flex justify-evenly`
		)
	},
	chart: {
		container: tw(
			`flex lg:flex-col lg:gap-y-2 max-lg:gap-x-2`
		),
		hour: {
			container: tw(
				`flex lg:gap-x-4 max-lg:flex-col-reverse`
			),
			label: tw(
				`flex lg:justify-between justify-center`,
				`w-12 text-md font-semibold`,
			),
			barVertical: tw(
				`w-12`,
				`bg-blue-500`,
				`lg:hidden`
			),
			barHorizontal: tw(
				`max-lg:hidden`,
				`h-12`,
				`bg-blue-500`
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

		<div className={styles.chart.container}>
			{getAllHours(date).map((hour, h) => {
				const start = mod(h - 1, 12) + 1;
				const end = mod(start, 12) + 1

				return <div className={styles.chart.hour.container}>
					<span className={styles.chart.hour.label}>
						<span>{start}</span>
						&ndash;
						<span>{end}</span>
					</span>
					<div className={styles.chart.hour.barVertical} style={{ height: Math.random() * 100 }}></div>
					<div className={styles.chart.hour.barHorizontal} style={{ width: `${Math.random() * 100}%` }}></div>
				</div>
			})}
		</div>

	</div>
}