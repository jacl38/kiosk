import { tw } from "@/utility/tailwindUtil"
import { useState } from "react"
import commonStyles from "@/styles/common"

const styles = {
	outerContainer: tw(
		`h-full overflow-y-scroll`,
		`overflow-hidden rounded-xl`,
		`shadow-inner shadow-stone-400 dark:shadow-gray-800`,
		`border-2 border-stone-400 dark:border-gray-600`,
		`relative`,
		`divide-y-2 divide-stone-300 dark:divide-gray-500`,
		`transition-all`,
	),
	listItem: (checked: boolean) => tw(
		`relative`,
		`flex justify-between items-center`,
		`px-2`,
		checked ? `bg-stone-100 dark:bg-gray-500` : ``,
		`transition-colors`
	),
	label: (checked: boolean) => tw(
		`w-full h-full p-2`,
		`cursor-pointer select-none`,
		checked ? "font-bold" : "font-semibold"
	)
}

type Option = {
	id: any,
	label: string,
	checked: boolean
}

export default function MultiPicker(props: {
	keyId: string,
	options: Option[],
	onChange?: (checked: any[]) => void
}) {
	const [checked, setChecked] = useState<any[]>(() => props.options.filter(o => o.checked).map(o => o.id));

	return <ul className={styles.outerContainer}>
		{
			props.options.map((option, i) => {
				const isChecked = checked.includes(option.id);

				return <li key={`${props.keyId}-${option.id}`} className={styles.listItem(isChecked)}>
					<label
						className={styles.label(isChecked)}
						htmlFor={option.id}>
							{option.label}
					</label>
					<input
						onChange={e => {
							setChecked(c => {
								const newChecked = isChecked
									? Array.from(new Set(c?.filter(cc => cc !== option.id)))
									: Array.from(new Set([...c, option.id]));
								props.onChange?.(newChecked);
								return newChecked;
							});
						}}
						checked={isChecked}
						className={commonStyles.management.checkbox}
						type="checkbox"
						id={option.id}
					/>
				</li>
			})
		}
	</ul>
}