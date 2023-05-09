import Header from "@/components/Kiosk/Header";
import usePair from "@/hooks/usePair";
import { tw } from "@/utility/tailwindUtil";
import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react";

const styles = {
	outerContainer: tw(
		`bg-hotchocolate-50`,
		`flex flex-col flex-auto`,
	),
	unpaired: {
		outerContainer: tw(
			`flex flex-auto`
		),
		innerContainer: tw(
			`m-auto`,
			`bg-white`,
			`w-96 h-60`,
			`border-b-2 border-hotchocolate-200`,
			`rounded-2xl`,
			`shadow-md`,
			`flex flex-col items-center justify-center`,
			`p-4`
		)
	}
}

export const HeaderContext = createContext<{
	header?: string,
	setHeader?: Dispatch<SetStateAction<string>>
}>({});

export default function Kiosk(props: { children: ReactNode | ReactNode[] }) {
	const device = usePair("kiosk");
	
	const [header, setHeader] = useState<string>(device.paired === "paired" ? "" : "An error occurred...");

	return <div className={styles.outerContainer}>
		<HeaderContext.Provider value={{ header, setHeader }}>
			<Header title={header}/>
			{
				device.paired === "paired"
				? props.children
				: <div className={styles.unpaired.outerContainer}>
					<div className={styles.unpaired.innerContainer}>
						<div className="text-center">
							<h2 className="text-3xl font-semibold">This device is not paired</h2>
							<p className="text-xl text-zinc-500">Please contact a store employee</p>
						</div>
					</div>
				</div>
			}
		</HeaderContext.Provider>
	</div>
}