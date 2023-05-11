import { Addon, Item, Order } from "@/menu/structures";
import { ObjectId } from "mongodb";
import '@testing-library/jest-dom';
import { addPart, addonsFromOrder, calculateOrderSubtotal, calculatePartPrice, changePart, flattenAddons, itemsFromOrder, removePart, setPersonalInfo } from "@/utility/orderUtil";

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

		expect(actual).toEqual(expected);
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

		expect(actual).toEqual(expected);
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
		expect(expected).toEqual(actual);
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
		expect(expected).toEqual(actual);
	});

	it("Calculates the subtotal of an item and its addons", () => {
		const addons = [testAddons[0], testAddons[1], testAddons[1], testAddons[1], testAddons[2]];
		const item = testItems[1];
		const expected = 10.11;

		const actual = calculatePartPrice(addons as Addon[], item as Item, 1);
		expect(expected).toBe(actual);
	});

	it("Flattens a map of <addon ID, count> to an array of addon IDs", () => {
		const addons = new Map<ObjectId, number>();
		addons.set(testAddons[0]._id, 3);
		addons.set(testAddons[1]._id, 5);
		addons.set(testAddons[2]._id, 2);

		const expected = [
			testAddons[0], testAddons[0], testAddons[0],
			testAddons[1], testAddons[1], testAddons[1], testAddons[1], testAddons[1],
			testAddons[2], testAddons[2]
		];

		const actual = flattenAddons(addons, testAddons as Addon[]);

		expect(expected).toEqual(actual);
	});

	it("Returns the subtotal of an order, including all items and their addons", () => {
		const testOrder: Order = {
			name: "",
			notes: "",
			phone: "",
			timestamp: 0,
			parts: [
				{
					notes: "",
					quantity: 2,
					itemID: testItems[0]._id!,
					addonIDs: [
						testAddons[0]._id, testAddons[0]._id,
						testAddons[1]._id,
						testAddons[2]._id, testAddons[2]._id, testAddons[2]._id
					]
				},
				{
					notes: "",
					quantity: 1,
					itemID: testItems[1]._id!,
					addonIDs: [
						testAddons[0]._id,
						testAddons[1]._id, testAddons[1]._id, testAddons[1]._id, testAddons[1]._id,
						testAddons[2]._id, testAddons[2]._id
					]
				},
				{
					notes: "",
					quantity: 4,
					itemID: testItems[2]._id!,
					addonIDs: [
						testAddons[0]._id, testAddons[0]._id, testAddons[0]._id,
						testAddons[1]._id,
						testAddons[2]._id,
					]
				}
			]
		}

		const expected = 81.89;
		const actual = calculateOrderSubtotal(
			itemsFromOrder(testOrder, testItems as Item[])!,
			addonsFromOrder(testOrder, testAddons as Addon[])!);
		
		expect(expected).toBeCloseTo(actual!);
	});
});