import { formatMoney } from "@/menu/moneyUtil";
import { Addon } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { useRef } from "react";

export default function AddonEdit(props: Addon) {
	const nameInput = useRef<HTMLInputElement>(null);
	const priceInput = useRef<HTMLInputElement>(null);

	return <div className="flex space-x-2">
		<div className="w-full">
			<label className={commonStyles.management.subtitle} htmlFor="name-input">Addon name:</label>
			<input
				id="name-input"
				ref={nameInput}
				type="text"
				placeholder={props.name}
				className={commonStyles.management.inputBox} />
		</div>

		<div>
			<label className={commonStyles.management.subtitle} htmlFor="price-input">Price:</label>
			<input
				id="price-input"
				ref={priceInput}
				type="number"
				placeholder={formatMoney(props.price)}
				className={commonStyles.management.inputBox} />
		</div>
	</div>
}