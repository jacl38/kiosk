import { ReactElement, useContext } from "react"
import Kiosk, { HeaderContext } from "./layout"

export default function Order() {
	const { setHeader } = useContext(HeaderContext);
	setHeader?.("Order here!");

	return <p>order</p>
}

Order.getLayout = (page: ReactElement) => {
	return <Kiosk>{page}</Kiosk>
}