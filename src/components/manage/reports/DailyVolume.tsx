import { Menu } from "@/menu/menuUtil";
import { Order } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { useState } from "react";


export default function DailyVolume(props: { orders: Order[], menu: Menu }) {
	const [date, setDate] = useState(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return today;
	});
	
	return <div>
		<input className={commonStyles.management.inputBox} type="date" />
	</div>
}