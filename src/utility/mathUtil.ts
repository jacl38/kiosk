
/** Find the lowest missing value from the source array.
 * 	e.g. [1, 2, 3, 5, 7, 12] -> 4. */
export function lowestMissingValue(values: number[]): number {
	if(values.length === 0) return 1;
	const sorted = values.sort((a, b) => a - b);
	const highestValue = sorted[sorted.length - 1];
	let lowestMissingValue = 1;

	for(let i = 1; i <= highestValue + 1; i++) {
		if(!values.includes(i)) {
			lowestMissingValue = i;
			break;
		}
	}
	return lowestMissingValue;
}