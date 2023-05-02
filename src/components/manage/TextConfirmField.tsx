import { tw } from "@/utility/tailwindUtil"
import { ButtonHTMLAttributes, InputHTMLAttributes, useRef } from "react"

const styles = {
	outerContainer: tw(
		`rounded-2xl overflow-hidden`,
		`w-full h-11`,
		`relative flex`,
		`bg-stone-300 dark:bg-gray-600`,
		`border-2 border-stone-400 dark:border-gray-500`,
		`transition-colors`,
		`group`
	),
	textInput: tw(
		`w-full`,
		`px-3`,
		`bg-transparent`,
		`outline-none`
	),
	label: tw(
		`absolute`,
		`left-3 -top-1`,
		`text-sm`,
		`opacity-50 group-hover:opacity-100`,
		`transition-opacity`
	),
	button: tw(
		`w-12 pb-2`,
		`text-3xl font-black`,
		`hover:bg-stone-400 dark:hover:bg-gray-500`,
		`focus-visible:bg-stone-400 dark:focus-visible:bg-gray-500`,
		`outline-none`,
		`transition-colors`,
	)
}

type TextConfirmFieldProps = {
	key?: string,
	label?: string,
	suffix?: string,
	inputProps?: InputHTMLAttributes<HTMLInputElement>,
	buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>,
	onSubmit?: (value: string) => void
}

export default function TextConfirmField(props: TextConfirmFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	function submit() {
		props.onSubmit?.(inputRef.current?.value ?? "");
	}

	return <div className={styles.outerContainer} onSubmit={submit}>
		<label htmlFor={`${props.key}-input`} className={styles.label}>{props.label}</label>
		<input id={`${props.key}-input`} ref={inputRef} {...props.inputProps} className={styles.textInput} />
		<span className="my-auto select-none font-semibold">{props.suffix}</span>
		<button className={styles.button} onClick={submit}>&rsaquo;</button>
	</div>
}