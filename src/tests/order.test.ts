import { Addon, Item, Order } from "@/menu/structures";
import { ObjectId } from "mongodb";
import '@testing-library/jest-dom';
import { addPart, changePart, removePart, setPersonalInfo } from "@/utility/orderUtil";
import { experimental_useEffectEvent } from "react";
import { parseIsolatedEntityName } from "typescript";

const testAddons: (Partial<Addon> & { _id: ObjectId })[] = [
	{ _id: new ObjectId(0), name: "Test Addon A", price: 0.49 },
	{ _id: new ObjectId(1), name: "Test Addon B", price: 0.99 },
	{ _id: new ObjectId(2), name: "Test Addon C", price: 2.09 }
]

const testItems: Partial<Item>[] = [
	{
		_id: new ObjectId(0),
		name: "Test Item A",
		price: 1.23,
		addonIDs: testAddons.map(a => a._id)
	},
	{
		_id: new ObjectId(1),
		name: "Test Item B",
		price: 4.56,
		addonIDs: testAddons.map(a => a._id)
	},
	{
		_id: new ObjectId(2),
		name: "Test Item C",
		price: 7.89,
		addonIDs: testAddons.map(a => a._id)
	}
];

describe("Order operations", () => {
	it("Sets name to 'Customer Name', notes to 'Test Notes', phone to '000-000-0000'", () => {
		const testOrder: Order = { name: "", notes: "", phone: "", parts: [], timestamp: 0 }

		const actual = setPersonalInfo(testOrder, {
			name: "Customer Name",
			notes: "Test Notes",
			phone: "000-000-0000"
		});

		const expected: Order = {
			name: "Customer Name",
			notes: "Test Notes",
			phone: "000-000-0000",
			parts: [],
			timestamp: 0
		}

		expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
	});

	it("Adds Test Item A with Test Addon A to the order", () => {
		const testOrder: Order = { name: "", notes: "", phone: "", parts: [], timestamp: 0 }

		const actual = addPart(testOrder, {
			itemID: testItems[0]._id!,
			addonIDs: [testAddons[0]._id],
			notes: "",
			quantity: 1
		});

		const expected: Order = {
			name: "",
			notes: "",
			phone: "",
			parts: [
				{
					itemID: testItems[0]._id!,
					addonIDs: [testAddons[0]._id],
					notes: "",
					quantity: 1,
					partID: 1
				}
			],
			timestamp: 0
		}

		expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
	});

	it("Removes Test Item A from the order", () => {
		const testOrder: Order = {
			name: "", notes: "", phone: "", timestamp: 0,
			parts: [
				{
					itemID: testItems[0]._id!,
					addonIDs: [testAddons[0]._id],
					notes: "",
					quantity: 1,
					partID: 1
				}
			]
		}

		const expected: Order = { name: "", notes: "", phone: "", timestamp: 0, parts: [] }
		const actual = removePart(testOrder, 1);

		expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
	});

	it("Sets the quantity of Test Item A to 5", () => {
		const testOrder: Order = {
			name: "", notes: "", phone: "", timestamp: 0,
			parts: [
				{
					itemID: testItems[0]._id!,
					addonIDs: [testAddons[0]._id],
					notes: "",
					quantity: 1,
					partID: 1
				}
			]
		}

		const expected: Order = {
			name: "", notes: "", phone: "", timestamp: 0,
			parts: [
				{
					itemID: testItems[0]._id!,
					addonIDs: [testAddons[0]._id],
					notes: "",
					quantity: 5,
					partID: 1
				}
			]
		}
		const actual = changePart(testOrder, 1, { quantity: 5 });

		expect(JSON.stringify(expected)).toBe(JSON.stringify(actual));
	});
});