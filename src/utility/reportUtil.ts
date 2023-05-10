

export function makeCSV(report: any[][]) {
	return report.map(row => row.map(cell => cell.toString())
		.map(cell => `"${cell.replaceAll(`"`, `""`)}"`)
		.join(`,`)
	).join(`\n`);
}

export function serveCSV(csv: string) {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	return url;
}