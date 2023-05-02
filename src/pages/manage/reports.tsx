import { ReactElement } from "react"
import Index from "."

export default function Reports() {
	return <p>Reports tab</p>
}

Reports.getLayout = (page: ReactElement) => {
	return <Index>{page}</Index>
}