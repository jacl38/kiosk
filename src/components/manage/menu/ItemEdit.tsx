import { formatMoney } from "@/menu/moneyUtil";
import { Item } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import { ChangeEvent, ChangeEventHandler, useEffect, useRef, useState } from "react";
import MultiPicker from "../MultiPicker";
import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import { ObjectId } from "mongodb";
import useMenu from "@/hooks/useMenu";
import ImageUpload from "../ImageUpload";

export default function ItemEdit(props: Item & { onChange: (item: Item) => void }) {

	const nameInput = useRef<HTMLInputElement>(null);
	const descriptionInput = useRef<HTMLTextAreaElement>(null);

	const priceInput = useRef<HTMLInputElement>(null);

	const { unsaved, setUnsaved } = useUnsavedChanges();

	const [itemName, setItemName] = useState(props.name);
	const [itemPrice, setItemPrice] = useState(props.price);
	const [itemDescription, setItemDescription] = useState(props.description);

	const [selectedCategories, setSelectedCategories] = useState<ObjectId[]>(props.categoryIDs);
	const [selectedAddons, setSelectedAddons] = useState<ObjectId[]>(props.addons.map(a => a.id));

	useEffect(() => {
		const newItem: Item = {
			type: "Item",
			_id: props._id,
			name: itemName || props.name,
			price: itemPrice || props.price,
			description: itemDescription || props.description,
			addons: selectedAddons.map(a => ({
				id: a,
				enabled: false
			})),
			categoryIDs: selectedCategories
		}
		props.onChange?.(newItem);
	}, [itemName, itemPrice, itemDescription, selectedCategories, selectedAddons]);

	const menu = useMenu(true);

	return <div className="flex h-full max-xl:flex-col xl:space-x-2 max-xl:space-y-4 justify-between">
		<div>
			<div className="w-full grid grid-cols-2 grid-rows-2 gap-x-1">
				<div>
					<label className={commonStyles.management.subtitle} htmlFor="name-input">Item name:</label>
					<input
						onChange={e => {
							setItemName(e.target.value);
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
							setItemPrice(Number.isNaN(price) ? 0 : price);
							setUnsaved(true);
						}}
						id="price-input"
						ref={priceInput}
						type="number"
						placeholder={formatMoney(props.price)}
						className={commonStyles.management.inputBox} />
				</div>

				<div className="col-span-2">
					<label className={commonStyles.management.subtitle} htmlFor="description-input">Item description:</label>
					<textarea
						onChange={e => {
							setItemDescription(e.target.value);
							setUnsaved(true);
						}}
						id="description-input"
						ref={descriptionInput}
						placeholder={props.description}
						className={tw(commonStyles.management.inputBox, "resize-none")} />
				</div>

			</div>
			{/* <label>Upload an image</label> */}
			{/* <input onChange={uploadImage} id="image-upload" type="file" accept="image/png, image/jpeg" /> */}
			<ImageUpload keyId="item-image" />
			{/* <img className={image ? "" : "hidden"} ></img> */}
		</div>
		<div className="w-full h-full flex flex-col space-y-2">
			<label className={commonStyles.management.subtitle}>Categories:</label>
			<div className="h-full max-h-48 flex flex-col">
				{
					menu.menu &&
					<MultiPicker
						keyId="category-options"
						onChange={c => {
							setSelectedCategories(c);
							setUnsaved(true);
						}}
						options={menu.menu.category.map((category, i) => ({
							id: category._id,
							label: category.name,
							checked: category._id ? selectedCategories.includes(category._id) : false
						}))}
					/>
				}
			</div>
			<label className={commonStyles.management.subtitle}>Addons:</label>
			<div className="h-full max-h-48 flex flex-col">
				{
					menu.menu &&
					<MultiPicker
						keyId="addon-options"
						onChange={c => {
							setSelectedAddons(c);
							setUnsaved(true);
						}}
						options={menu.menu?.addon.map((addon, i) => ({
							id: addon._id,
							label: addon.name,
							checked: addon._id ? selectedAddons.includes(addon._id) : false
						})) || []}
					/>
				}
			</div>
		</div>
	</div>
}