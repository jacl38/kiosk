import { ReactElement, useContext, useEffect } from "react"
import Kiosk, { HeaderContext } from "./layout"

export default function Order() {
	const { setHeader } = useContext(HeaderContext);

	useEffect(() => {
		setHeader?.("Order here!");
	}, [setHeader]);

	return <p>order</p>
}

Order.getLayout = (page: ReactElement) => {
	return <Kiosk>{page}</Kiosk>
}