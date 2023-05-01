/** Formats a floating point number as money.
 * 	e.g. 1.61803398875 -> "$1.62" */
export function formatMoney(money: number) {
	const rounded = Math.abs(money).toFixed(2);
	return `${money >= 0 ? "" : "-"}$${rounded}`;
}