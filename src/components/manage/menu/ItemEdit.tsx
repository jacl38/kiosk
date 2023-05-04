import { formatMoney } from "@/menu/moneyUtil";
import { Item } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import { useRef } from "react";
import MultiPicker from "../MultiPicker";

export default function ItemEdit(props: Item) {

	const nameInput = useRef<HTMLInputElement>(null);
	const descriptionInput = useRef<HTMLTextAreaElement>(null);

	const priceInput = useRef<HTMLInputElement>(null);

	return <div className="flex h-full max-xl:flex-col xl:space-x-2 max-xl:space-y-4 justify-between">
		<div>
			<div className="w-full grid grid-cols-2 grid-rows-2 gap-x-1">
				<div>
					<label className={commonStyles.management.subtitle} htmlFor="name-input">Item name:</label>
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

				<div className="col-span-2">
					<label className={commonStyles.management.subtitle} htmlFor="description-input">Item description:</label>
					<textarea
						id="description-input"
						ref={descriptionInput}
						placeholder={props.description}
						className={tw(commonStyles.management.inputBox, "resize-none")} />
				</div>

			</div>
		</div>
		<div className="w-full h-full flex flex-col space-y-2">
			<label className={commonStyles.management.subtitle}>Categories:</label>
			<div className="h-full max-h-48 flex flex-col">
				<MultiPicker keyId="category-options" options={[...Array(20)].map((_, i) => ({ id: Math.random(), label: `Test item ${i}` }))} />
			</div>
			<label className={commonStyles.management.subtitle}>Addons:</label>
			<div className="h-full max-h-48 flex flex-col">
				<MultiPicker keyId="addon-options" options={[...Array(20)].map((_, i) => ({ id: Math.random(), label: `Test item ${i}` }))} />
			</div>
		</div>
	</div>
}