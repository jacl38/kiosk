import { ReactElement } from "react"
import Index from "."
import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import commonStyles from "@/styles/common";

export default function Menu() {
	const { unsaved, setUnsaved } = useUnsavedChanges();
	
	return <div className={commonStyles.management.splitScreen.container}>
		
	</div>
}

Menu.getLayout = (page: ReactElement) => {
	return <Index>{page}</Index>
}