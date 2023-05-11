import { formatMoney } from "@/menu/moneyUtil";
import { Item } from "@/menu/structures"
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil"
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react"

const styles = {
	outerContainer: tw(
		`bg-white`,
		`border-b-2 border-hotchocolate-200`,
		`rounded-md`,
		`overflow-hidden`,
		`relative flex flex-col`,
		`h-min`,
		`select-none cursor-pointer`
	),
	innerContainer: (hasImage: boolean) => tw(
		hasImage ? `min-h-[6rem]` : `min-h-[4rem]`,
		`flex flex-col`,
		`w-full`,
	),
	content: (hasImage: boolean) => tw(
		`flex`,
		hasImage ? `h-28` : `h-24`
	),
	itemInfo: {
		container: tw(
			`flex-auto`,
			`flex flex-col justify-between`,
			`p-2`,
			`truncate`,
			`bg-white z-10 shadow-sm`
		),
		image: tw(
			`w-28 shrink-0`,
			`bg-cover bg-center bg-no-repeat`
		),
		name: tw(
			`font-semibold truncate shrink-0`
		),
		price: (opened: boolean, hasImage: boolean) => tw(
			`text-gray-700 absolute z-10`,
			opened ? `bottom-5 text-xl font-semibold text-green-800` : `bottom-3`,
			!opened && hasImage ? `left-[7.75rem]` : `left-3`,
			`transition-all duration-300`
		),
		description: tw(
			`h-full whitespace-normal overflow-y-auto`
		)
	},
	hiddenContainer: tw(
		`bg-green-700 bg-opacity-10`,
		`flex justify-end items-center px-4`
	)
}

/** Component which shows an item as an interactive card on the menu.
 *  Layout is slightly different for items with vs without images */
export default function ItemCard(props: Item & { image?: string, onClick?: () => void }) {
	const [opened, setOpened] = useState(false);

	const hasImage = props.image !== undefined;

	return <motion.div layout
		initial={{ opacity: 0, translateY: 20 }}
		animate={{ opacity: 1, translateY: 0 }}
		key={props._id?.toString()}
		onClick={() => setOpened(o => !o)}
		className={styles.outerContainer}>
		<motion.div layoutRoot className={styles.innerContainer(hasImage)}>
			<div className={styles.content(hasImage)}>
				{// If the item has an image attached to it, show it here
					hasImage &&
					<div className={styles.itemInfo.image} style={{ backgroundImage: `url(${props.image})` }}></div>
				}
				<div className={styles.itemInfo.container}>
					<span className={styles.itemInfo.name}>{props.name}</span>
					<AnimatePresence>
						{// If the item card is opened, show the description
							opened &&
							<motion.div
								layout="position"
								className={styles.itemInfo.description}
								initial={{ opacity: 0, translateY: -5 }}
								animate={{ opacity: 1, translateY: 0, transition: { duration: 0.25 } }}
								exit={{ opacity: 0, translateY: -5 }}>
								{props.description}
							</motion.div>
						}
					</AnimatePresence>
				</div>
			</div>
			<AnimatePresence>
				{// If the item card is opened, show the `Add to order` button
					opened &&
					<motion.div
						className={styles.hiddenContainer}
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "4rem" }}
						exit={{ opacity: 0, height: 0 }}>
						<button onClick={e => { e.stopPropagation(); props.onClick?.(); }} className={commonStyles.order.button}>Add to order</button>
					</motion.div>
				}
			</AnimatePresence>
		</motion.div>
		<span className={styles.itemInfo.price(opened, hasImage)}>{formatMoney(props.price)}</span>
	</motion.div>
}