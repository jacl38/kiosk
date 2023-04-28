import { useEffect, useState } from "react"

const useLocalStorage = <T>(key: string, defaultValue: T) => {
	const [storedValue, setStoredValue] = useState<T>(() => {
		if(typeof window === "undefined") return defaultValue;

		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : defaultValue;
		} catch(e) {
			console.error(e);
			return defaultValue;
		}
	});

	const setValue = (value: T | ((v: T) => T)) => {
		try {
			const newValue = value instanceof Function
				? value(storedValue)
				: value;
			setStoredValue(newValue);
			if(typeof window !== "undefined") {
				window.localStorage.setItem(key, JSON.stringify(newValue));
			}
			window.dispatchEvent(new Event("storage"));
		} catch (e) { console.error(e); }
	}

	useEffect(() => {
		const forceUpdate = () => {
			setStoredValue(() => {
				if(typeof window === "undefined") return defaultValue;
		
				try {
					const item = window.localStorage.getItem(key);
					return item ? JSON.parse(item) : defaultValue;
				} catch(e) {
					console.error(e);
					return defaultValue;
				}
			})
		}
		window.addEventListener("storage", forceUpdate);

		return () => { removeEventListener("storage", forceUpdate); }
	}, []);

	return [storedValue as T, setValue] as const;
}

export default useLocalStorage;