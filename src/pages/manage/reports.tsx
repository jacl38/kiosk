import { ReactElement, ReactNode, useState } from "react"
import Index from "."
import useOrders from "@/hooks/useOrders"
import useMenu from "@/hooks/useMenu"
import commonStyles from "@/styles/common"
import ItemTable from "@/components/manage/reports/ItemTable"
import { tw } from "@/utility/tailwindUtil"
import { Order } from "@/menu/structures"
import { Menu } from "@/menu/menuUtil"
import DailyVolume from "@/components/manage/reports/DailyVolume"

export type ReportType = {
	label: string,
	element: (props: {orders: Order[], menu: Menu}) => ReactNode
}

const reportTypes: ReportType[] = [
	{ label: "Item tables", element: (props) => <ItemTable {...props} /> },
	{ label: "Weekly volume", element: (props) => <DailyVolume {...props}/> },
	{ label: "Daily volume", element: () => <p>daily</p> }
]

export default function Reports() {
	const [reportIndex, setReportIndex] = useState<number>();

	const orders = useOrders("all");
	const menu = useMenu(true);

	return <div className={commonStyles.management.splitScreen.container}>
		<div className="flex flex-col h-full">
			<select onChange={e => setReportIndex(e.target.selectedIndex - 1)} className={commonStyles.management.inputBox}>
				<option className="hidden" disabled selected value=""></option>
				{reportTypes.map((reportType, i) => <option
					id={`${i}`}
					key={reportType.label}>
					{reportType.label}
				</option>)}
			</select>
		</div>
		<div onClick={e => { if(e.target === e.currentTarget) setReportIndex(undefined) }} className={commonStyles.management.splitScreen.details.backdrop(reportIndex !== undefined)}>
			<div className={commonStyles.management.splitScreen.details.container}>
				{
					reportIndex !== undefined && menu.menu
					? <>
						<h2 className={tw(commonStyles.management.title, "text-center")}>{reportTypes[reportIndex].label}</h2>
						{reportTypes[reportIndex].element({
							orders: orders.orders ?? [],
							menu: menu.menu
						})}
					</>
					: <h2 className={tw(commonStyles.management.title, "text-center")}>Select a report type</h2>
				}
			</div>
		</div>
	</div>
}

Reports.getLayout = (page: ReactElement) => {
	return <Index>{page}</Index>
}