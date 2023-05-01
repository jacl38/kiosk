import { lowestMissingValue } from '@/utility/mathUtil';
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
});