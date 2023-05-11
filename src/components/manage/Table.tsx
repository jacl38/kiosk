import { tw } from "@/utility/tailwindUtil";
import { useState } from "react"

const styles = {
	outerContainer: tw(
		`rounded-xl`,
		`overflow-scroll`,
		`border-2 border-stone-300 dark:border-gray-500`,
		`transition-colors`,
		`w-fit max-w-full pb-1 max-h-full`
	),
	table: tw(
		`relative`
	),
	headingRow: tw(
		`sticky top-0 z-10`,
		`bg-stone-300 dark:bg-gray-500`,
		`select-none cursor-pointer`,
		`transition-colors`
	),
	labelCell: tw(
		`sticky left-0`,
		`bg-stone-300 dark:bg-gray-700`,
		`transition-colors`,
		`relative after:absolute`,
		`after:right-0 after:w-0.5 after:h-full`,
		`after:bg-stone-400`
	),
	cell: tw(
		`px-2 py-1 whitespace-nowrap`
	),
	sortedCell: tw(
		`bg-stone-200 dark:bg-gray-600`,
		`transition-colors`
	),
	rowBackground: tw(
		`even:bg-stone-100 dark:even:bg-gray-500`,
		`transition-colors`
	)
}

// If `firstIsRowLabel` is true, use the first item in each row array as the row's label
type TableProps = {
	sortable?: boolean,
	firstIsRowLabel?: boolean,
	headings: string[],
	rows: any[][],
	conditionalStyles?: (value: any) => string | undefined
}

/** Table component to show data in a sortable table with row labels and headings */
export default function Table(props: TableProps) {
	const [sortedColumn, setSortedColumn] = useState(0);
	const [sortDirection, setSortDirection] = useState(false);

	function sortByColumn(column: number) {
		if(column === sortedColumn) {
			setSortDirection(!sortDirection);
		} else {
			setSortDirection(true);
			setSortedColumn(column);
		}
	}

	// Sort each row by the `sortDirection` by its string value
	const sortedRows = props.sortable
		? props.rows.sort((a, b) => {
			const aVal = String(a[sortedColumn]);
			const bVal = String(b[sortedColumn]);
			return aVal.localeCompare(bVal, undefined, {
				numeric: true,
				sensitivity: "base"
			}) * (sortDirection ? -1 : 1);
		})
		: props.rows;

	return <div className={styles.outerContainer}>
		<table className={styles.table}>
			<thead className={styles.headingRow}>
				<tr>
					{/* Map each heading to a table heading cell */}
					{(((props.firstIsRowLabel) ? [""] : []).concat(props.headings)).map((heading, index) => {

						// If this is the sorting column, show an icon to indicate the sort direction
						const afterIcon = (index === sortedColumn && props.sortable)
							? sortDirection
								? <> &#10515;</>
								: <> &#10514;</>
							: "";

						return <th
							className={tw(
								styles.cell,
								index === sortedColumn && props.sortable ? styles.sortedCell : ""
							)}
							onClick={() => { if(props.sortable) sortByColumn(index) }}
							key={`table-heading-${index}`}>
							{heading}{afterIcon}
						</th>
					})}
				</tr>
			</thead>

			<tbody>
				{/* Map each row to a table row */}
				{sortedRows.map((row, rowIndex) => <tr className={styles.rowBackground} key={`table-row-${rowIndex}`}>
					{/* Map each row item to a table data cell */}
					{row.map((cell, cellIndex) => {
						return <td
							className={tw(
								cellIndex === 0 ? styles.labelCell : "",
								styles.cell
							)}
							key={`table-cell-${rowIndex}-${cellIndex}`}>
							{cell}
						</td>
					})}
				</tr>)}
			</tbody>
		</table>
	</div>
}