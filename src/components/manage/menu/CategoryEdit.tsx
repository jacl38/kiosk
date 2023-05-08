import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import { Category } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import { useEffect, useRef, useState } from "react";

export default function CategoryEdit(props: Category & { onChange: (category: Category) => void }) {
	const nameInput = useRef<HTMLInputElement>(null);
	const descriptionInput = useRef<HTMLTextAreaElement>(null);

	const { unsaved, setUnsaved } = useUnsavedChanges();

	const [categoryName, setCategoryName] = useState(props.name);
	const [categoryDescription, setCategoryDescription] = useState(props.description);

	const { _id, name, description, onChange } = props;

	useEffect(() => {
		const newCategory: Category = {
			type: "Category", _id,
			name: categoryName || name,
			description: categoryDescription || description
		}
		onChange(newCategory);
	}, [_id,
		categoryName, name,
		categoryDescription, description,
		onChange]);

	return <div className="flex flex-col space-y-4">
		<div className="flex flex-col">
			<label className={commonStyles.management.subtitle} htmlFor="name-input">Category name:</label>
			<input
				onChange={e => {
					setCategoryName(e.target.value);
					setUnsaved(true)
				}}
				id="name-input"
				ref={nameInput}
				type="text"
				placeholder={props.name}
				className={commonStyles.management.inputBox} />
		</div>

		<div className="flex flex-col">
			<label className={commonStyles.management.subtitle} htmlFor="description-input">Category description:</label>
			<textarea
				onChange={e => {
					setCategoryDescription(e.target.value);
					setUnsaved(true)
				}}
				id="description-input"
				ref={descriptionInput}
				placeholder={props.description}
				className={tw(commonStyles.management.inputBox, "resize-none")} />
		</div>
	</div>
}