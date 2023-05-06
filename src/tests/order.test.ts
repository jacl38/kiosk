import { Addon, Item, Order } from "@/menu/structures";
import { ObjectId } from "mongodb";
import '@testing-library/jest-dom';

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

const testOrder: Partial<Order> = {
	parts: []
}

describe("Order operations", () => {

});