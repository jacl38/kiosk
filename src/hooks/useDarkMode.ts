import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

export const useDarkMode = () => {
	const [enabled, setEnabled] = useLocalStorage("dark-theme", false);

	useEffect(() => {
		const className = "dark";
		const bodyClass = document.getElementsByTagName("html")[0].classList;

		enabled ? bodyClass.add(className) : bodyClass.remove(className);
	}, [enabled]);

	return [enabled, setEnabled] as const;
}
