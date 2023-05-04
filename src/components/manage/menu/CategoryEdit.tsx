import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import { Category } from "@/menu/structures";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import { useRouter } from "next/router";
import { useRef } from "react";

export default function CategoryEdit(props: Category) {
	const nameInput = useRef<HTMLInputElement>(null);
	const descriptionInput = useRef<HTMLTextAreaElement>(null);

	const router = useRouter();

	return <div className="flex flex-col space-y-4">
		<div className="flex flex-col">
			<label className={commonStyles.management.subtitle} htmlFor="name-input">Category name:</label>
			<input
				id="name-input"
				ref={nameInput}
				type="text"
				placeholder={props.name}
				className={commonStyles.management.inputBox} />
		</div>
		
		<div className="flex flex-col">
			<label className={commonStyles.management.subtitle} htmlFor="description-input">Category description:</label>
			<textarea
				id="description-input"
				ref={descriptionInput}
				placeholder={props.description}
				className={tw(commonStyles.management.inputBox, "resize-none")} />
		</div>
	</div>
}