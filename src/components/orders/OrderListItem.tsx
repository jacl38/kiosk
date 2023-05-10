import { Menu } from "@/menu/menuUtil"
import { formatMoney } from "@/menu/moneyUtil"
import { Order } from "@/menu/structures"
import { sum } from "@/utility/mathUtil"
import { formatOrder } from "@/utility/orderUtil"
import { tw } from "@/utility/tailwindUtil"
import { useState } from "react"

const styles = {
	outerContainer: tw(
		`border-b-2 last-of-type:border-b-0`,
		`border-neutral-500`,
		`select-none`,
	),
	orderDetails: {
		container: (expanded: boolean) => tw(
			`flex`,
			`px-4 py-4`,
			`cursor-pointer`,
			expanded ? `bg-neutral-900` : ``,
			`transition-colors`
		)
	},
	closeoutButton: tw(
		`pr-4 pl-4`,
		`ml-8`,
		`bg-red-800`,
		`font-black`
	),
	separator: tw(
		`flex-auto`,
		`border-t-4 border-dotted`,
		`border-neutral-600`
	),
	quantity: tw(
		`font-mono`
	),
	expandedContainer: tw(
		`px-4 pb-2`
	),
	itemContainer: tw(
		`pl-4`,
		`border-l-2`,
		`my-4`
	),
	addonContainer: tw(
		`pl-4`
	)
}

type OrderListItemProps = {
	order: Order,
	menu: Menu,
	onCloseout?: () => void
}

export default function OrderListItem(props: OrderListItemProps) {
	const [expanded, setExpanded] = useState(false);

	const order = formatOrder(props.order, props.menu);

	function closeoutOrder() {
		if(confirm(`Are you sure you want to close out ${order?.name}'s order?`)) {
			props.onCloseout?.();
		}
	}

	return order ? <li className={styles.outerContainer}>
		<div onClick={() => setExpanded(e => !e)} className={styles.orderDetails.container(expanded)}>
			<div className="flex flex-col">
				<span className="text-xl font-semibold">{order.name}</span>
				<span className="font-light">Placed {new Date(order.timestamp).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</span>
			</div>
			<div className="flex-auto"></div>
			<div className="flex flex-col items-end">
				<span className="text-xl font-semibold">{formatMoney(order.price)}</span>
				<span className="font-light">{sum(order.parts.map(p => p.quantity))} items</span>
			</div>
			{
				expanded &&
				<button onClick={e => { e.stopPropagation(); closeoutOrder(); }} className={styles.closeoutButton}>
					Closeout
				</button>
			}
		</div>
		{
			expanded &&
			<div className={styles.expandedContainer}>
				<ul>
					{order.parts.map((part, i) => <li key={i} className={styles.itemContainer}>
						<div className="flex gap-x-4 justify-between items-center">
							<div>
								<span className={styles.quantity}>{part.quantity} &times; </span> {part.item.name}
							</div>
							<div className={styles.separator}></div>
							<span>{formatMoney(part.item.price)}</span>
						</div>
						<ul>
							{part.addons.map((addon, j) => <li key={j} className={styles.addonContainer}>
								<div className="flex gap-x-4 justify-between items-center">
									<div>
										<span className={styles.quantity}>{addon.count} &times; </span> {addon.type.name}
									</div>
									<span className="text-sm text-neutral-400">{formatMoney(addon.type.price * addon.count)}</span>
								</div>
							</li>)}
						</ul>
						{
							part.notes &&
							<p>Notes: {part.notes}</p>
						}
					</li>)}
				</ul>
				{
					order.notes &&
					<p className="text-lg">Notes: {order.notes}</p>
				}
			</div>
		}
	</li> : <></>
}