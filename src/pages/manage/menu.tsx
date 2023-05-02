import { ReactElement } from "react"
import Index from "."
import useUnsavedChanges from "@/hooks/useUnsavedChanges";

export default function Menu() {
	const { unsaved, setUnsaved } = useUnsavedChanges();
	
	return <div>
		<button onClick={e => setUnsaved(s => !s)}>unsaved: {unsaved ? "true" : "false"}</button>
	</div>
}

Menu.getLayout = (page: ReactElement) => {
	return <Index>{page}</Index>
}