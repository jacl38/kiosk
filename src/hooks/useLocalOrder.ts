import { Order, OrderPart } from "@/menu/structures";
import useLocalStorage from "./useLocalStorage";
import { lowestMissingValue } from "@/utility/mathUtil";
import postRequest from "@/utility/netUtil";

export default function useLocalOrder() {
	const [current, setCurrent] = useLocalStorage("current-order", {
		name: "",
		notes: "",
		phone: "",
		timestamp: 0,
		parts: []
	} as Order);

	function addPart(part: OrderPart) {
		setCurrent(o => {
			const lowestMissingPartID = lowestMissingValue(o.parts.map(p => p.partID));
			return {
				...o,
				parts: [...o.parts, {...part, partID: lowestMissingPartID}]
			}
		});
	}

	function removePart(partID: number) {
		setCurrent(o => ({
			...o,
			parts: o.parts.filter(p => p.partID !== partID)
		}));
	}

	function changePart(partID: number, changedPart: Partial<OrderPart>) {
		setCurrent(o => ({
			...o,
			parts: o.parts.map(p => {
				if(p.partID === partID) {
					return {
						...p,
						...changedPart,
						partID: partID
					}
				}
				return p;
			})
		}));
	}

	function setPersonalInfo(info: { name: string, notes: string, phone: string }) {
		setCurrent(o => ({ ...o, ...info }));
	}

	async function finalizeOrder() {
		const request/*: OrderRequest = { intent: "order", order: current }; */ = {  };

		await postRequest("order", request, async response => {
			
		});
	}

	return {
		current,
		addPart, removePart, changePart,
		setPersonalInfo,
		finalizeOrder
	}
}