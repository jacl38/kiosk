import { Order, OrderPart } from "@/menu/structures";
import useLocalStorage from "./useLocalStorage";
import * as orderUtil from "@/utility/orderUtil";

/** Hook used to store and retrive order data from the browser's local storage. */
export default function useLocalOrder() {
	const [current, setCurrent] = useLocalStorage("current-order", {
		name: "",
		notes: "",
		phone: "",
		timestamp: 0,
		parts: []
	} as Order);

	function addPart(part: OrderPart) {
		setCurrent(o => orderUtil.addPart(o, part));
	}

	function removePart(partID: number) {
		setCurrent(o => orderUtil.removePart(o, partID));
	}

	function changePart(partID: number, changedPart: Partial<OrderPart>) {
		setCurrent(o => orderUtil.changePart(o, partID, changedPart));
	}

	function setPersonalInfo(info: { name?: string, notes?: string, phone?: string }) {
		setCurrent(o => orderUtil.setPersonalInfo(o, info));
	}

	function clear() {
		setCurrent({
			name: "",
			notes: "",
			parts: [],
			phone: "",
			timestamp: 0
		});
	}

	return {
		current,
		addPart, removePart, changePart,
		setPersonalInfo,
		clear
	}
}