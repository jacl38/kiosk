import { formatMoney } from '@/menu/moneyUtil';
import '@testing-library/jest-dom';

describe("Money operations", () => {
	it("Positive values: $1.23 + $4.56 = $5.79?", () => {
		const actual = formatMoney(1.23 + 4.56);
		const expected = "$5.79";
		expect(actual).toBe(expected);
	});
	
	it("Negative values: -$1.23 - $4.56 = -$5.79?", () => {
		const actual = formatMoney(-1.23 - 4.56);
		const expected = "-$5.79";
		expect(actual).toBe(expected);
	});

	it("Positive Rounding: 0.999 = $1.00?", () => {
		const actual = formatMoney(0.999);
		const expected = "$1.00";
		expect(actual).toBe(expected);
	});

	it("Negative Rounding: -0.999 = -$1.00?", () => {
		const actual = formatMoney(-0.999);
		const expected = "-$1.00";
		expect(actual).toBe(expected);
	});

	it("Zero value: 0 = $0.00?", () => {
		const actual = formatMoney(0);
		const expected = "$0.00";
		expect(actual).toBe(expected);
	});

	it("Large numbers: $1234567890.12 + $987654321.09 = $2222222211.21?", () => {
		const actual = formatMoney(1234567890.12 + 987654321.09);
		const expected = "$2222222211.21";
		expect(actual).toBe(expected);
	});
	
	it("More decimal places: $1.23456 + $7.89012 = $9.12?", () => {
		const actual = formatMoney(1.23456 + 7.89012);
		const expected = "$9.12";
		expect(actual).toBe(expected);
	});
});