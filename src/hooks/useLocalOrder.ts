import { Order, OrderPart } from "@/menu/structures";
import useLocalStorage from "./useLocalStorage";
import postRequest from "@/utility/netUtil";
import * as orderUtil from "@/utility/orderUtil";

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
		setCurrent(o => ({
			name: "",
			notes: "",
			parts: [],
			phone: "",
			timestamp: 0
		}));
	}

	async function finalizeOrder() {
		const request/*: OrderRequest = { intent: "order", order: current }; */ = {  };

		await postRequest("order", request, async response => {


			if(response.status === 200) {
				clear();
			}
		});
	}

	return {
		current,
		addPart, removePart, changePart,
		setPersonalInfo,
		clear, finalizeOrder
	}
}