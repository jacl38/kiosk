import { useDarkMode } from "@/hooks/useDarkMode";
import { tw } from "@/utility/tailwindUtil";

const styles = {
	button: tw(
		`fixed right-4 bottom-4 z-10`,
		`w-16 h-16`,
		`bg-gray-800 dark:bg-stone-200`,
		`text-white dark:text-black`,
		`text-3xl`,
		`rounded-full`,
		`transition-colors`,
	)
}

export default function DarkButton() {
	const [darkMode, setDarkMode] = useDarkMode();

	return <button onClick={() => setDarkMode(d => !d)} className={styles.button}>🌓︎</button>
}