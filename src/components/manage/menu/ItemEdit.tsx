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

export default function ItemEdit(props: Item & { onChange: (item: Item & { imageData?: string }) => void }) {

	const { unsaved, setUnsaved } = useUnsavedChanges();

	const nameInput = useRef<HTMLInputElement>(null);
	const descriptionInput = useRef<HTMLTextAreaElement>(null);
	const priceInput = useRef<HTMLInputElement>(null);

	const [itemName, setItemName] = useState(props.name);
	const [itemPrice, setItemPrice] = useState(props.price);
	const [itemDescription, setItemDescription] = useState(props.description);

	const [selectedCategories, setSelectedCategories] = useState<ObjectId[]>(props.categoryIDs);
	const [selectedAddons, setSelectedAddons] = useState<ObjectId[]>(props.addonIDs ?? []);
	const [imageData, setImageData] = useState<string | undefined>();

	const { _id, name, price, description, onChange } = props;

	useEffect(() => {
		const newItem: Item = {
			type: "Item", _id,
			name: itemName || name,
			price: itemPrice ?? price,
			description: itemDescription || description,
			addonIDs: selectedAddons,
			categoryIDs: selectedCategories
		}
		onChange({...newItem, imageData });
	}, [_id,
		itemName, name,
		itemPrice, price,
		itemDescription, description,
		selectedCategories,
		selectedAddons,
		imageData,
		onChange]);

	const menu = useMenu(true);

	useEffect(() => {
		if(menu.menuLoaded) {
			const foundImage = menu.images?.find(i => i._id === props.imageID);
			setImageData(foundImage?.data);
		}
	}, [menu.menuLoaded, menu.images, props.imageID]);

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
			<div className="w-full flex justify-center p-4">
				<ImageUpload defaultImg={imageData} keyId="item-image" onUpload={imageData => {
					setImageData(imageData);
					setUnsaved(true);
				}} />
			</div>
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