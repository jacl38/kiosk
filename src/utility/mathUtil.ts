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

/** Clamp a value between min and max. If min or max are not supplied,
 *  the input will not be clamped in that direction */
export function clamp(input: number, min?: number, max?: number) {
	const from = Math.min(min ?? -Infinity, max ?? Infinity);
	const to = Math.max(max ?? Infinity, min ?? -Infinity);

	return Math.min(Math.max(input, from), to);
}

/** Sum an array of numbers */
export function sum(input: number[]) {
	return input.reduce((a, b) => a + b, 0);
}

/** Remap a value from the domain of input.min to input.max into the range of output.min to output.max */
export function remap(value: number, input: { min: number, max: number }, output: { min: number, max: number }) {
	return output.min + (value - input.min) * (output.max - output.min) / (input.max - input.min);
}

/** Positive modulo operator, e.g. mod(-1, 12) = 11 */
export function mod(a: number, b: number) {
	return ((a % b) + b) % b;
}