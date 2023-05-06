import useLocalOrder from "@/hooks/useLocalOrder";
import usePair from "@/hooks/usePair"

export default function Kiosk() {

	const pairInfo = usePair("kiosk");

	const order = useLocalOrder();

	return <div>
		<p>Kiosk</p>
		<p>{pairInfo.paired}</p>
		<p>{pairInfo.name}</p>
		<p>{pairInfo.id ?? "No ID set"}</p>
	</div>
}