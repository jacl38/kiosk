import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";

/** Hook used to warn user before going to a different page if there are unsaved changes */
export default function useUnsavedChanges() {
	const router = useRouter();
	const [_unsaved, _setUnsaved] = useState(false);

	/** Ask user to confirm leaving the page */
	function manuallyCheck() {
		return confirm("There are unsaved changes. If you leave this page, they will be lost.");
	}

	function urlUnsaved() {
		const unsaved = window.location.hash.includes("unsaved");
		return unsaved;
	}

	function setUnsaved(u: boolean) {
		window.location.hash = u ? "unsaved" : "";
	}

	useEffect(() => {
		let confirmed: boolean | undefined = undefined;

		// Sets up events to confirm with the user before navigating away from the page
		function onRouteChange() {
			if(!urlUnsaved() || confirmed !== undefined) return;
			confirmed = manuallyCheck();
			if(!confirmed) {
				Router.events.emit("routeChangeError");
				throw "Cancel page change";
			}
		}
		
		function beforeUnload(e: Event) {
			if(!urlUnsaved() || confirmed !== undefined) return;
			confirmed = manuallyCheck();
			if(!confirmed) {
				e.preventDefault();
			}
		}

		Router.events.on("routeChangeStart", onRouteChange);
		window.addEventListener("beforeunload", beforeUnload);

		return () => {
			Router.events.off("routeChangeStart", onRouteChange);
			window.removeEventListener("beforeunload", beforeUnload);
		}
	}, []);

	return { unsaved: urlUnsaved(), setUnsaved, manuallyCheck };
}