import { ReactElement, useContext } from "react"
import Kiosk, { HeaderContext } from "./layout"

export default function Checkout() {
	const { setHeader } = useContext(HeaderContext);
	setHeader?.("Checkout");

	return <p>checkout</p>
}

Checkout.getLayout = (page: ReactElement) => {
	return <Kiosk>{page}</Kiosk>
}