import usePair from "@/hooks/usePair"

export default function Kiosk() {

	const { id, paired } = usePair("kiosk");

	return <div>
		<p>Kiosk</p>
		<p>{paired}</p>
		<p>{id ?? "No ID set"}</p>
	</div>
}