import { ReactElement, useEffect, useRef, useState } from "react"
import Index from "."
import { tw } from "@/utility/tailwindUtil"
import { DeviceInfo, PairRequest } from "@/pages/api/device";
import postRequest from "@/utility/netUtil";
import withLoading from "@/components/higherOrder/withLoading";
import List from "@/components/manage/List";
import ListItem from "@/components/manage/ListItem";
import commonStyles from "@/styles/common";
import TextConfirmField from "@/components/manage/TextConfirmField";

const styles = {
	pairingContainer: tw(
		`w-full flex items-center max-sm:justify-center`,
		`pb-1 px-4 space-x-2`,
	)
}

function formatPairDate(pairDate: number) {
	return new Date(pairDate)
		.toLocaleString(undefined, {
			dateStyle: "medium",
			timeStyle: "short"
		});
}

/** Time before resending signal to keep pairing open (seconds). */
const signalPairTimeout = 10;

export default function Devices() {
	const [selectedDeviceID, setSelectedDeviceID] = useState<number>();
	const [stateChanged, setStateChanged] = useState(false);

	async function deleteSelectedDevice() {
		if(selectedDeviceID === undefined) return;
		const request: PairRequest = {
			intent: "delete",
			deviceID: selectedDeviceID
		}
		
		await postRequest("device", request);
		setStateChanged(c => !c);
	}

	async function renameSelectedDevice(newName: string) {
		if(selectedDeviceID === undefined) return;

		const request: PairRequest = {
			intent: "rename",
			deviceID: selectedDeviceID,
			newName
		}

		await postRequest("device", request);
		setStateChanged(c => !c);
	}

	async function signalPair() {
		const request: PairRequest = { intent: "open" }

		await postRequest("device", request);
		setStateChanged(c => !c);
	}

	const [pairing, setPairing] = useState(false);
	const pairTimer = useRef<NodeJS.Timer | null>(null);
	useEffect(() => {
		if(pairTimer.current) {
			clearInterval(pairTimer.current);
			pairTimer.current = null;
		}
		if(pairing) {
			signalPair();
			pairTimer.current = setInterval(signalPair, signalPairTimeout * 1000);
		}
	}, [pairing]);

	const [foundDevices, setFoundDevices] = useState<"unknown" | "error" | "found">("unknown");
	const [devices, setDevices] = useState<DeviceInfo[]>([]);

	const selectedDevice = devices?.find(d => d.id === selectedDeviceID);

	useEffect(() => {
		(async function() {
			const request: PairRequest = {
				intent: "query"
			}

			await postRequest("device", request, async response => {
				if(response.status === 200) {
					const body = await response.json() as { devices: DeviceInfo[] };
					setDevices(body.devices);
					setFoundDevices("found");
				} else {
					setFoundDevices("error");
				}
			});
		})();
	}, [stateChanged]);

	return <div className="flex flex-col h-full">
		<div className={styles.pairingContainer}>
			<label className={commonStyles.management.subtitle} htmlFor="pairing-checkbox">Enable pairing: </label>
			<input
				type="checkbox"
				id="pairing-checkbox"
				className={commonStyles.management.checkbox}
				onChange={e => setPairing(e.currentTarget.checked)} />
		</div>
		<div className={commonStyles.management.splitScreen.container} key={stateChanged ? 1 : 0}>
			<div className="flex flex-col h-full">
				<List>
					{
						withLoading(foundDevices === "unknown",
							devices.length > 0
								? <>
									{devices.map((device, i) => <ListItem key={i}
										selected={selectedDeviceID === device.id}
										onClick={() => setSelectedDeviceID(device.id)}>
										<div className="flex h-full p-3">
											<div className="flex flex-col justify-between grow-0 w-full truncate">
												<p className="truncate font-bold"><span className="italic opacity-50">({device.type})</span> {device.name}</p>
												<p className="truncate">Paired: {formatPairDate(device.pairDate)}</p>
											</div>
											<div className="shrink-0">
												ID {device.id}
											</div>
											<span className={commonStyles.management.menu.list.arrow}></span>
										</div>
									</ListItem>)}
								</>
								: <ListItem>
									<div className="px-4 flex h-full flex-col items-start justify-center">
										{
											foundDevices === "error"
												? <>
													<p className={commonStyles.management.title}>Authorization has expired.</p>
													<p className={commonStyles.management.subtitle}>Reload the page and log in.</p>
												</>
												: <>
													<p className={commonStyles.management.title}>No devices found.</p>
													<p className={commonStyles.management.subtitle}>Enable pairing mode, then navigate to <a className="underline" href={window.location.origin}>{window.location.origin}</a> on the device.</p>
												</>
										}
									</div>
								</ListItem>
						)
					}
				</List>
			</div>
			<div onClick={e => { if(e.target === e.currentTarget) setSelectedDeviceID(undefined) }} className={commonStyles.management.splitScreen.details.backdrop(selectedDeviceID !== undefined)}>
				<div className={commonStyles.management.splitScreen.details.container}>
					{
						selectedDevice !== undefined
						? <>
							<div className="flex max-lg:flex-col max-lg:space-y-2 lg:space-x-2">
									<TextConfirmField
										label="Device name"
										inputProps={{
											type: "text",
											placeholder: selectedDevice?.name
										}}
										onSubmit={renameSelectedDevice}/>
									<button onClick={deleteSelectedDevice} className={commonStyles.management.button}>Remove Device</button>
							</div>
							<p className="text-center my-4">ID {selectedDevice?.id} &mdash; Paired on {formatPairDate(selectedDevice.pairDate)}</p>
						</>
						: <h2 className={tw(commonStyles.management.title, "text-center")}>Select a device from the list</h2>
					}
				</div>
			</div>
		</div>
	</div>
}

Devices.getLayout = (page: ReactElement) => {
	return <Index>{page}</Index>
}