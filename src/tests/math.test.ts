import { clamp, lowestMissingValue, sum } from '@/utility/mathUtil';
import '@testing-library/jest-dom';

describe("Math operations", () => {
	describe("Lowest Missing Value", () => {
		it("Empty array => 1?", () => {
		  const actual = lowestMissingValue([]);
		  const expected = 1;
		  expect(actual).toBe(expected);
		});
	  
		it("Single value: [1] => 2?", () => {
		  const actual = lowestMissingValue([1]);
		  const expected = 2;
		  expect(actual).toBe(expected);
		});
	  
		it("Several values: [1, 2, 3, 4] => 5?", () => {
		  const actual = lowestMissingValue([1, 2, 3, 4]);
		  const expected = 5;
		  expect(actual).toBe(expected);
		});
		
		it("Gap: [1, 3] => 2?", () => {
		  const actual = lowestMissingValue([1, 3]);
		  const expected = 2;
		  expect(actual).toBe(expected);
		});
	  
		it("Many values with gap: [1, 2, 3, 4, 5, 6, 7, 9, 10] => 8?", () => {
		  const actual = lowestMissingValue([1, 2, 3, 4, 5, 6, 7, 9, 10]);
		  const expected = 8;
		  expect(actual).toBe(expected);
		});

		it("Unsorted: [5, 2, 8, 1, 3, 4] => 6", () => {
			const actual = lowestMissingValue([5, 2, 8, 1, 3, 4]);
			const expected = 6;
			expect(actual).toBe(expected);
		});  
	});

	describe("Clamps", () => {
		it("Returns input if input is in range", () => {
			expect(clamp(5, 0, 10)).toBe(5);
			expect(clamp(0, -10, 10)).toBe(0);
			expect(clamp(-5, -10, 5)).toBe(-5);
		});

		it("Returns min value if input is less than min", () => {
			expect(clamp(-10, 0, 10)).toBe(0);
			expect(clamp(-20, -10, 10)).toBe(-10);
			expect(clamp(-10, -5, 5)).toBe(-5);
		});

		it("Returns max value if input is greater than max", () => {
			expect(clamp(20, 0, 10)).toBe(10);
			expect(clamp(20, -10, 10)).toBe(10);
			expect(clamp(20, -5, 5)).toBe(5);
		});
	});

	describe("Array sums", () => {
		it("Returns the sum of an array of numbers", () => {
			expect(sum([10, 40, 25])).toBe(75);
			expect(sum([-4, 7, 2])).toBe(5);
			expect(sum([-10, -15])).toBe(-25);
			expect(sum([1])).toBe(1);
		});

		it("Returns 0 for an empty array", () => {
			expect(sum([])).toBe(0);
		});
	});
});