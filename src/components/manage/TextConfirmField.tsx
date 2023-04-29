import { tw } from "@/utility/tailwindUtil"
import { ButtonHTMLAttributes, InputHTMLAttributes, useRef } from "react"

const styles = {
	outerContainer: tw(
		`rounded-full overflow-hidden`,
		`border-2 border-stone-400 dark:border-gray-700`,
		`flex`,
		`transition-colors`,
	),
	textInput: tw(
		`bg-stone-300 dark:bg-gray-600`,
		`px-2 py-1`,
		`transition-colors`
	),
	button: tw(
		`font-black`,
		`w-8`,
	)
}

export default function TextConfirmField(props: {
	inputProps?: InputHTMLAttributes<HTMLInputElement>,
	buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>,
	onSubmit?: (value: string) => void
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	function submit() {
		props.onSubmit?.(inputRef.current?.value ?? "");
	}

	return <form onSubmit={e => { e.preventDefault(); submit(); }} className={styles.outerContainer}>
		<input ref={inputRef} {...props.inputProps} className={styles.textInput} />
		<button onClick={e => { e.preventDefault(); submit(); }} {...props.buttonProps} className={styles.button}>&rsaquo;</button>
	</form>
}