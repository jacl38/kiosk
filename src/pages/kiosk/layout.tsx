import Header from "@/components/Kiosk/Header";
import { tw } from "@/utility/tailwindUtil";
import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react";

const styles = {
	outerContainer: tw(
		`h-full flex flex-col`,
		`bg-hotchocolate-50`,
	),
	innerContainer: tw(
		`flex-auto`
	)
}

export const HeaderContext = createContext<{
	header?: string,
	setHeader?: Dispatch<SetStateAction<string | undefined>>
}>({});

export default function Kiosk(props: { children: ReactNode | ReactNode[] }) {
	const [header, setHeader] = useState<string>();

	return <div className={styles.outerContainer}>
		<HeaderContext.Provider value={{ header, setHeader }}>
			<Header title={header}/>
			<main className={styles.innerContainer}>
				{props.children}
			</main>
		</HeaderContext.Provider>
	</div>
}