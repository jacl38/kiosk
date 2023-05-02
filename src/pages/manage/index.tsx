import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react"

export default function Index(props: { children?: ReactNode | ReactNode[] }) {

	const router = useRouter();

	const { unsaved, setUnsaved } = useUnsavedChanges();

	useEffect(() => {
		const route = router.pathname.split("/").slice(1).pop();
		if(route === "manage") {
			router.push("manage/menu");
		}
	}, []);

	return <div>
		<p>manage page</p>
		<p>Current outlet:</p>
		{props?.children}
		{["menu", "reports", "devices"].map(tab => <Link className="px-2" href={`./${tab}`}>{tab}</Link>)}
		<button onClick={e => setUnsaved(s => !s)}>{unsaved ? "unsaved" : "not unsaved"}</button>
	</div>
}