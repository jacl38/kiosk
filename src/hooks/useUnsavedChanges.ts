import { Router } from "next/router";
import { createContext, useEffect, useState } from "react";

export const UnsavedContext = createContext<{
	unsaved?: boolean,
	setUnsaved?: (value: boolean) => void
}>({});

export default function useUnsavedChanges() {
	const [unsaved, setUnsaved] = useState(false);

	function manuallyCheck() {
		return confirm("There are unsaved changes. If you leave this page, they will be lost.");
	}

	useEffect(() => {
		function onRouteChange() {
			if(!manuallyCheck()) {
				Router.events.emit("routeChangeError");
				throw "Cancel page change";
			}
		}
		if(unsaved) {
			Router.events.on("routeChangeStart", onRouteChange);
		} else {
			Router.events.off("routeChangeStart", onRouteChange);
		}

		return () => Router.events.off("routeChangeStart", onRouteChange);
	}, [unsaved]);

	return { unsaved, setUnsaved, manuallyCheck };
}