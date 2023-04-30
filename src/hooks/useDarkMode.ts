import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

/** Hook which uses local device storage to get/set dark theme.*/
export const useDarkMode = () => {
	const [enabled, setEnabled] = useLocalStorage("dark-theme", false);

	useEffect(() => {
		//Sets "dark" class name on root <html> tag to allow for TailwindCSS to detect dark mode changes 
		const className = "dark";
		const bodyClass = document.getElementsByTagName("html")[0].classList;

		enabled ? bodyClass.add(className) : bodyClass.remove(className);
	}, [enabled]);

	return [enabled, setEnabled] as const;
}
