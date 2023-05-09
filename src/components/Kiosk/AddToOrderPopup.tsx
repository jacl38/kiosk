import { Addon, Item } from "@/menu/structures"
import { tw } from "@/utility/tailwindUtil"
import { AnimatePresence, motion } from "framer-motion"
import QuantitySelector from "./QuantitySelector"
import { formatMoney } from "@/menu/moneyUtil"
import commonStyles from "@/styles/common"
import { useRef, useState } from "react"
import { ObjectId } from "mongodb"
import useLocalOrder from "@/hooks/useLocalOrder"
import { calculatePartPrice, flattenAddons } from "@/utility/orderUtil"

const styles = {
	backdrop: tw(
		`fixed inset-0 flex z-20`,
		`bg-hotchocolate-600 bg-opacity-10`
	),
	outerContainer: tw(
		`m-auto`,
		`w-[36rem]`,
		`bg-white`,
		`border-b-4 border-green-700 border-opacity-25`,
		`rounded-2xl`,
		`shadow-xl`,
		`overflow-hidden`
	),
	titlebar: {
		container: tw(
			`flex justify-between`,
			`px-5 py-3`,
			`bg-white shadow`,
			`truncate`
		),
		title: tw(
			`text-xl font-semibold`,
			`truncate`
		)
	},
	content: {
		container: tw(
			`flex w-full`,
			`max-h-32 min-h-[4rem]`,
			`shadow`
		),
		image: tw(
			`w-32 h-32 shrink-0`,
			`bg-contain bg-center bg-no-repeat`,
		),
		description: tw(
			`w-full`,
			`overflow-y-auto`,
			`px-5 py-2`
		)
	},
	addons: {
		container: tw(
			`p-4`,
			`max-h-72 overflow-y-auto`,
			`shadow-inner`,
			`border-b`
		),
		price: tw(
			`text-stone-500`
		),
		name: tw(
			`flex-auto truncate`,
			`text-xl font-semibold`,
			`text-stone-600`
		),
		addon: tw(
			`flex space-x-4 truncate items-center`,
			`border-y border-gray-200`,
			`py-3`,
			`first-of-type:border-t-0 last-of-type:border-b-0`,
			`first-of-type:pt-0 last-of-type:pb-0`,
		)
	},
	notes: {
		container: tw(
			`flex flex-col h-32`,
			`px-5 py-2`
		),
		label: tw(
			`text-lg font-semibold`
		),
		input: tw(
			`resize-none w-full flex-auto`,
			`border-2 rounded-md`,
			`py-1 px-1.5`
		)
	},
	quantity: {
		container: tw(
			`flex justify-center`,
			`pb-4 pt-2`
		)
	},
	order: {
		container: tw(
			`bg-green-700 bg-opacity-10`,
			`flex justify-between items-center`,
			`bottom-0 px-5 h-20`
		),
		price: tw(
			`text-lg text-green-800 font-semibold`
		)
	}
}

type AddToOrderPopupProps = {
	backdropClicked?: () => void,
	selectedItem: Item,
	addons: Addon[],
	image?: string,
}

export default function AddToOrderPopup(props: AddToOrderPopupProps) {
	const [selectedAddons, setSelectedAddons] = useState<Map<ObjectId, number>>(new Map(props.addons.map(a => [a._id!, 0] as const)));
	const [quantity, setQuantity] = useState(1);
	const notesRef = useRef<HTMLTextAreaElement>(null);

	const order = useLocalOrder();

	function setAddon(id: ObjectId, value: number) {
		setSelectedAddons(addons => new Map(addons.set(id, value)));
	}

	function addToOrder() {
		const notes = notesRef.current?.value ?? "";

		order.addPart({
			addonIDs: flattenAddons(selectedAddons, props.addons).map(a => a._id!),
			itemID: props.selectedItem._id!,
			notes,
			quantity
		});

		props.backdropClicked?.();
	}

	const subtotal = calculatePartPrice(flattenAddons(selectedAddons, props.addons), props.selectedItem, quantity);

	return <motion.div
		initial={{ opacity: 0, backdropFilter: "blur(0)" }}
		animate={{ opacity: 1, backdropFilter: "blur(2px)" }}
		exit={{ opacity: 0, backdropFilter: "blur(0)" }}
		onClick={e => { e.stopPropagation(); props.backdropClicked?.(); }}
		className={styles.backdrop}>
		<motion.div
			onClick={e => e.stopPropagation()}
			initial={{ translateY: 40, scale: 0.8, height: 0 }}
			animate={{ translateY: 0, scale: 1, height: "auto" }}
			exit={{ scale: 0, height: 0 }}
			className={styles.outerContainer}>

			<div className={styles.titlebar.container}>
				<span className={styles.titlebar.title}>
					{props.selectedItem.name}
				</span>
				<button onClick={props.backdropClicked}>✕</button>
			</div>

			<div className={styles.content.container}>
				{
					props.image &&
					<div className={styles.content.image} style={{ backgroundImage: `url(${props.image})` }}></div>
				}
				<div className={styles.content.description}>
					{props.selectedItem.description}
				</div>
			</div>
			{
				props.addons.length > 0 &&
				<ul className={styles.addons.container}>
					{props.addons.map(addon => <li key={addon._id?.toString()} className={styles.addons.addon}>
						<span className={styles.addons.name}>{addon.name}</span>
						<span className={styles.addons.price}>{formatMoney(addon.price)}</span>
						<div className="w-48 shrink-0">
							<QuantitySelector
								min={0} max={5}
								defaultValue={0}
								onChange={v => setAddon(addon._id!, v)}/>
						</div>
					</li>)}
				</ul>
			}

			<div className={styles.notes.container}>
				<span className={styles.notes.label}>Notes</span>
				<textarea ref={notesRef} className={styles.notes.input} />
			</div>
			
			<div className={styles.quantity.container}>
				<QuantitySelector
					defaultValue={1} min={1}
					onChange={v => setQuantity(v)} />
			</div>

			<div className={styles.order.container}>
				<span className={styles.order.price}>Subtotal: {formatMoney(subtotal)}</span>
				<button onClick={addToOrder} className={commonStyles.order.button}>Add to order</button>
			</div>
		</motion.div>
	</motion.div>
}