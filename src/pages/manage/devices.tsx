import { ReactElement } from "react"
import Index from "."

export default function Devices() {
	return <p>devices tab</p>
}

Devices.getLayout = (page: ReactElement) => {
	return <Index>{page}</Index>
}