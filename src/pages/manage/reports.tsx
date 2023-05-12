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
import WeeklyVolume from "@/components/manage/reports/WeeklyVolume"

// Set up each report type (item table, weekly/daily volume)
// Map labels to respective element and pass in orders and menu as props
export type ReportType = {
	label: string,
	element: (props: {orders: Order[], menu: Menu}) => ReactNode
}

const reportTypes: ReportType[] = [
	{ label: "Item tables", element: (props) => <ItemTable {...props} /> },
	{ label: "Weekly volume", element: (props) => <WeeklyVolume {...props} /> },
	{ label: "Daily volume", element: (props) => <DailyVolume {...props}/> }
]

export default function Reports() {
	// The index of the type of report that was selected
	const [reportIndex, setReportIndex] = useState<number>();

	const orders = useOrders("all");
	const menu = useMenu(true);

	return <div className="max-w-[56rem] mx-auto space-y-4">
		<div className="flex flex-col">

			{/* Dropdown list of each report type listed in reportTypes */}
			<select onChange={e => setReportIndex(e.target.selectedIndex - 1)} className={commonStyles.management.inputBox}>
				<option className="hidden" disabled selected value=""></option>
				{reportTypes.map((reportType, i) => <option
					id={`${i}`}
					key={reportType.label}>
					{reportType.label}
				</option>)}
			</select>

		</div>
		
		<div className={tw(commonStyles.management.splitScreen.details.container, `overflow-y-auto`)}>
			{
				// If the report index has been selected, display the corresponding element
				reportIndex !== undefined && menu.menu
				? <>
					<h2 className={tw(commonStyles.management.title, "text-center")}>{reportTypes[reportIndex].label}</h2>
					{reportTypes[reportIndex].element({
						orders: orders.orders ?? [],
						menu: menu.menu
					})}
				</>
				// Otherwise, display a message
				: <h2 className={tw(commonStyles.management.title, "text-center")}>Select a report type</h2>
			}
		</div>
	</div>
}

Reports.getLayout = (page: ReactElement) => {
	return <Index>{page}</Index>
}