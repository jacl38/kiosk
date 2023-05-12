import Header from "@/components/Kiosk/Header";
import usePair from "@/hooks/usePair";
import { tw } from "@/utility/tailwindUtil";
import { Dispatch, ReactNode, SetStateAction, createContext, useEffect, useState } from "react";

const styles = {
	outerContainer: tw(
		`bg-hotchocolate-50`,
		`flex flex-col flex-auto`,
		`overflow-x-hidden`
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

// Kiosk common layout component
export default function Kiosk(props: { children: ReactNode | ReactNode[] }) {
	const device = usePair("kiosk");
	
	// `setHeader` function is passed to the HeaderContext to allow each page
	// to set a different string as the header text.
	// An error message displays if the device pair state is invalid 
	const [header, setHeader] = useState<string>(device.paired === "unpaired" ? "An error occurred..." : "");

	// Make the tablet browser enter fullscreen mode when loading the page
	useEffect(() => {
		(async function () {
			try {
				await document.body.requestFullscreen({ navigationUI: "hide" });
			} catch {}
		})();
	}, []);

	return <div className={styles.outerContainer}>
		<HeaderContext.Provider value={{ header, setHeader }}>
			<Header title={header}/>

			{/* If the device is properly paired, show the rest of the page */}
			{device.paired === "paired" && props.children}
			
			{// If the device is unpaired, show an error message
				device.paired === "unpaired" &&
				<div className={styles.unpaired.outerContainer}>
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