import Header from "@/components/Kiosk/Header";
import { tw } from "@/utility/tailwindUtil";
import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react";

const styles = {
	outerContainer: tw(
		`bg-hotchocolate-50`,
		`flex-auto`,
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
			{props.children}
		</HeaderContext.Provider>
	</div>
}