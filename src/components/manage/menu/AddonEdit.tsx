import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import { formatMoney } from "@/menu/moneyUtil";
import { Addon } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { useEffect, useRef, useState } from "react";

export default function AddonEdit(props: Addon & { onChange: (addon: Addon) => void }) {
	const nameInput = useRef<HTMLInputElement>(null);
	const priceInput = useRef<HTMLInputElement>(null);

	const { unsaved, setUnsaved } = useUnsavedChanges();
	
	const [addonName, setAddonName] = useState(props.name);
	const [addonPrice, setAddonPrice] = useState(props.price);

	const { _id, name, price, onChange } = props;

	useEffect(() => {
		const newAddon: Addon = {
			type: "Addon", _id,
			name: addonName || name,
			price: addonPrice ?? price
		}
		onChange(newAddon);
	}, [_id,
		addonName, name,
		addonPrice, price,
		onChange]);

	return <div className="flex space-x-2">
		<div className="w-full">
			<label className={commonStyles.management.subtitle} htmlFor="name-input">Addon name:</label>
			<input
				onChange={e => {
					setAddonName(e.target.value);
					setUnsaved(true);
				}}
				id="name-input"
				ref={nameInput}
				type="text"
				defaultValue={props.name}
				className={commonStyles.management.inputBox} />
		</div>

		<div>
			<label className={commonStyles.management.subtitle} htmlFor="price-input">Price:</label>
			<input
				onChange={e => {
					const price = parseFloat(e.target.value);
					setAddonPrice(Number.isNaN(price) ? 0 : price);
					setUnsaved(true);
				}}
				id="price-input"
				ref={priceInput}
				type="number"
				defaultValue={props.price}
				className={commonStyles.management.inputBox} />
		</div>
	</div>
}