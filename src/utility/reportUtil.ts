

/** Format a two-dimensional array into Comma-Separated Value format for data serialization. */
export function makeCSV(report: any[][]) {
	// Turn each cell into its .toString() value
	return report.map(row => row.map(cell => cell.toString())
		// Replace all " characters with ""
		.map(cell => `"${cell.replaceAll(`"`, `""`)}"`)
		// Join all cells in this row with a comma
		.join(`,`)
	// Join all rows with newline characters
	).join(`\n`);
}

/** Generates a URL to download the CSV file */
export function serveCSV(csv: string) {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	return url;
}