import { tw } from "@/utility/tailwindUtil"
import { ButtonHTMLAttributes } from "react"

/** Hamburger menu button component wrapper for <button> tag.
 * Passes standard HTMLButtonElement props through.
 * @param {number} props.size Size in pixels
 */
export default function MenuButton(props: { size: number } & ButtonHTMLAttributes<HTMLButtonElement>) {
	return <button
		{...props}
		className={tw("flex flex-col justify-around", props.className ?? "")}
		style={{ width: props.size, height: props.size }}>

		{/* Creates 3 rounded rectangle elements, each 1/8 the height of the menu */}
		{[...Array(3)].map((_, i) => {
			return <div
				key={i}
				className="w-full bg-gray-700 dark:bg-stone-300 rounded-full"
				style={{ height: props.size/8 }}>
			</div>
		})}
	</button>
}