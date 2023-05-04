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

	useEffect(() => {
		const newAddon: Addon = {
			type: "Addon",
			_id: props._id,
			name: addonName || props.name,
			price: addonPrice || props.price
		}
		props.onChange?.(newAddon);
	}, [addonName, addonPrice]);

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
				placeholder={props.name}
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
				placeholder={formatMoney(props.price)}
				className={commonStyles.management.inputBox} />
		</div>
	</div>
}