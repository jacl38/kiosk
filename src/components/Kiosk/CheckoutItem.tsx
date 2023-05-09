import { Menu } from "@/menu/menuUtil"
import { Addon, Item, OrderPart } from "@/menu/structures"
import { tw } from "@/utility/tailwindUtil"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import QuantitySelector from "./QuantitySelector"
import { calculatePartPrice, flattenAddons } from "@/utility/orderUtil"
import useLocalOrder from "@/hooks/useLocalOrder"
import { formatMoney } from "@/menu/moneyUtil"
import { ObjectId } from "mongodb"

const styles = {
	outerContainer: tw(
		`bg-white`,
		`border-b-2 border-hotchocolate-200`,
		`rounded-md`,
		`overflow-hidden`,
		`select-none cursor-pointer`
	),
	itemInfo: {
		container: tw(
			`flex justify-between`,
			`h-24 px-4 py-2`,
			`shadow`
		),
		leftSide: tw(
			`flex flex-col`,
			`justify-center`
		),
		rightSide: tw(
			`flex items-center`,
			`gap-x-4`
		),
		deleteButton: tw(
			`p-1.5 aspect-square`,
			`flex items-center`,
			`border-2 border-red-500`,
			`text-red-500`,
			`font-black`,
			`rounded-full`
		),
		name: tw(
			`text-2xl`
		),
		price: tw(
			`text-2xl font-semibold`,
			`text-gray-500`
		)
	},
	addonInfo: {
		list: tw(
			`px-4 py-2`,
			`flex flex-col gap-y-2`
		),
		innerContainer: tw(
			`flex justify-between`,
			`px-4 py-2`
		)
	},
	notes: {
		container: tw(
			`bg-green-700 bg-opacity-10`,
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
}

type CheckoutItemProps = {
	part: OrderPart,
	menu: Menu
}

export default function CheckoutItem(props: CheckoutItemProps) {
	const [expanded, setExpanded] = useState(false);

	const notesRef = useRef<HTMLTextAreaElement>(null);

	const { part } = props;

	const item = props.menu.item.find(item => item._id === props.part.itemID) as Item;
	const allAddons = item.addonIDs.map(id => props.menu.addon.find(a => a._id === id)) as Addon[];
	const [selectedAddons, setSelectedAddons] = useState<Map<ObjectId, number>>(new Map(allAddons.map(a => [a._id!, 0] as const)));
	
	useEffect(() => {
		part.addonIDs.forEach(id => setSelectedAddons(a => {
			return new Map(a.set(id, part.addonIDs.filter(addon => addon === id).length));
		}));
	}, [part]);
	
	const addons = flattenAddons(selectedAddons, allAddons);
	const order = useLocalOrder();

	function changeAddonQuantity(id: ObjectId, value: number) {
		setSelectedAddons(a => new Map(a.set(id, value)));
	}

	const singleItemSubtotal = calculatePartPrice(addons, item, 1);

	return <motion.li
		onClick={() => setExpanded(e => !e)}
		className={styles.outerContainer}>
		<div className={styles.itemInfo.container}>

			<div className={styles.itemInfo.leftSide}>
				<span className={styles.itemInfo.name}>{item.name}</span>
				<motion.div layout
					transition={{ duration: 0.1 }}
					onClick={e => e.stopPropagation()}
					className={tw(expanded ? `w-56 h-14` : `w-24 h-10`, `flex items-center transition-all`)}>
				{
					expanded
					? <QuantitySelector
						min={1} defaultValue={props.part.quantity}
						onChange={v => order.changePart(props.part.partID!, {
							quantity: v
						})}
						/>
					: <span className="m-auto font-semibold text-lg">{props.part.quantity}</span>
				}
				<span className="shrink-0">&nbsp;&times; {formatMoney(singleItemSubtotal ?? 0)}</span>
				</motion.div>
			</div>

			<div className={styles.itemInfo.rightSide}>
				<span className={styles.itemInfo.price}>{formatMoney((singleItemSubtotal ?? 0) * props.part.quantity)}</span>
				<button className={styles.itemInfo.deleteButton}>✕</button>
			</div>
		</div>

		<AnimatePresence>
			{
				expanded &&
				<motion.div
					onClick={e => e.stopPropagation()}
					initial={{ height: 0 }}
					animate={{ height: "auto" }}
					exit={{ height: 0 }}>
					<ul className={styles.addonInfo.list}>
						{allAddons.map(addon => {
							const quantity = selectedAddons.get(addon._id!) ?? 0;

							return <ul key={addon._id?.toString()} className={styles.addonInfo.innerContainer}>
								<div className="flex flex-col w-56">
									<span className={styles.itemInfo.name}>{addon.name}</span>
									<div className="flex items-center">
										<QuantitySelector
											defaultValue={quantity}
											min={0} max={5}
											onChange={v => changeAddonQuantity(addon._id!, v)} />
											<span className="shrink-0">&nbsp;&times; {formatMoney(addon.price)}</span>
									</div>
								</div>

								<div className="flex items-center">
									<span className={styles.itemInfo.price}>{formatMoney(quantity * addon.price)}</span>
								</div>
							</ul>
						})}
					</ul>
					<div className={styles.notes.container}>
						<label htmlFor={`orderpart-${part.partID}-notes`} className={styles.notes.label}>Notes</label>
						<textarea
							ref={notesRef}
							defaultValue={part.notes}
							onBlur={e => {
								order.changePart(part.partID!, {
									notes: e.target.value ?? ""
								})
							}}
							id={`orderpart-${part.partID}-notes`}
							className={styles.notes.input} />
					</div>
				</motion.div>
			}
		</AnimatePresence>
	</motion.li>
}