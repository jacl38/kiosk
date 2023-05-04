import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import { Category } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import { useRef } from "react";

export default function CategoryEdit(props: Category & { onChange: (category: Category) => void }) {
	const nameInput = useRef<HTMLInputElement>(null);
	const descriptionInput = useRef<HTMLTextAreaElement>(null);

	const { unsaved, setUnsaved } = useUnsavedChanges();

	return <div className="flex flex-col space-y-4">
		<div className="flex flex-col">
			<label className={commonStyles.management.subtitle} htmlFor="name-input">Category name:</label>
			<input
				onChange={e => setUnsaved(true)}
				id="name-input"
				ref={nameInput}
				type="text"
				placeholder={props.name}
				className={commonStyles.management.inputBox} />
		</div>

		<div className="flex flex-col">
			<label className={commonStyles.management.subtitle} htmlFor="description-input">Category description:</label>
			<textarea
				onChange={e => setUnsaved(true)}
				id="description-input"
				ref={descriptionInput}
				placeholder={props.description}
				className={tw(commonStyles.management.inputBox, "resize-none")} />
		</div>
	</div>
}