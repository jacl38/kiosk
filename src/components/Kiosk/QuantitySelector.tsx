import { clamp } from "@/utility/mathUtil"
import { tw } from "@/utility/tailwindUtil"
import { animate, motion, useAnimation } from "framer-motion"
import { useRef } from "react"

const styles = {
	outerContainer: tw(
		`p-0.5`,
		`rounded-full`,
		`border-2 border-black border-opacity-10`,
		`flex justify-between space-x-2 items-center`
	),
	button: tw(
		`w-9 h-9 shrink-0`,
		`border-2 border-black border-opacity-10`,
		`rounded-full`,
		`flex items-center justify-center`,
		`text-4xl font-black text-neutral-600`,
		`[&>*]:mb-2`,
	),
	input: tw(
		`self-stretch w-full`,
		`text-center`,
		`bg-transparent`,
		`font-semibold text-xl`,
		`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`
	)
}

type QuantitySelectorProps = {
	defaultValue?: number,
	min?: number,
	max?: number,
	onChange?: (value: number) => void
}

/** Quantity selector component used in the kiosk menu for item and addon quantity selection */
export default function QuantitySelector(props: QuantitySelectorProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	// Framer motion hook used to animate the number changing
	const inputAnim = useAnimation();

	async function addValue(value: number) {
		if(!inputRef.current) return;

		// Clamps the value between the supplied min and max in the props object

		const currentValue = isNaN(inputRef.current?.valueAsNumber) ? 0 : inputRef.current.valueAsNumber;
		const newValue = Math.round(clamp(currentValue + value, props.min, props.max));
		inputRef.current.value = `${newValue}`;
		props.onChange?.(newValue);

		// If the value has changed, animate the number
		if(currentValue !== newValue) {
			inputAnim.set({
				scale: 1.2
			});
			await inputAnim.start({
				scale: 1,
				transition: { ease: "easeIn", duration: 0.075 }
			});
		}
	}

	return <div className={styles.outerContainer}>
		<button onClick={() => addValue(-1)} className={styles.button}><span>&ndash;</span></button>

		<motion.input
			ref={inputRef}
			animate={inputAnim}
			className={styles.input}
			onBlur={() => addValue(0)}
			type="number"
			defaultValue={props.defaultValue}
			min={props.min}
			max={props.max}
		/>
		<button onClick={() => addValue(1)} className={styles.button}><span>+</span></button>

	</div>
}