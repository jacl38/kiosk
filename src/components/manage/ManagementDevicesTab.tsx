import { DeviceInfo, PairRequest } from "@/pages/api/device"
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil"
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import TextConfirmField from "./TextConfirmField";
import withLoading from "../higherOrder/withLoading";

const styles = {
	outerContainer: tw(
		`flex max-md:flex-col`,
		`h-full`,
		`md:space-x-4 max-md:space-y-4`,
		`relative`,
	),
	listContainer: tw(
		`w-full`,
		`space-y-4`,
	),
	listItem: (selected: boolean) => tw(
		`p-4`,
		`rounded-xl`,
		`w-full`,
		`bg-stone-700 dark:bg-gray-300 bg-opacity-10 dark:bg-opacity-20`,
		selected ? `bg-opacity-30 dark:bg-opacity-30` : `hover:bg-opacity-20 dark:hover:bg-opacity-25`,
		`border-2 border-stone-400 dark:border-gray-500`,
		`relative group`,
		`text-left`,
		`cursor-pointer`,
		`transition-colors`
	),
	arrow: tw(
		`max-md:hidden`,
		`text-4xl font-semibold`,
		`absolute`,
		`right-6 group-hover:right-4`,
		`bottom-2`,
		`select-none`,
		`transition-all`
	),
	deviceDetails: {
		container: tw(
			`w-full`,
			`sticky top-0 self-start`,
			`rounded-2xl`,
			`h-96`,
			`p-4`,
			`flex flex-col items-center space-y-4`,
			`bg-stone-700 dark:bg-gray-300 bg-opacity-10 dark:bg-opacity-20`,
			`border-2 border-stone-400 dark:border-gray-500`,
			`transition-all`
		),
		pairingContainer: tw(
			`w-full flex items-center justify-center`,
			`pb-2 mb-4 space-x-2`,
			`border-b-2 border-stone-400 dark:border-gray-500`,
			`transition-colors`
		)
	}
}

function formatPairDate(pairDate: number) {
	return new Date(pairDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** Time before resending signal to keep pairing open (seconds). */
const signalPairTimeout = 10;

export default function ManagementDevicesTab() {
	const router = useRouter();

	const [selectedDeviceID, setSelectedDeviceID] = useState<number>();

	function selectDevice(id?: number) {
		setSelectedDeviceID(id);
	}

	async function deleteSelectedDevice() {
		if(selectedDeviceID === undefined) return;
		const request: PairRequest = {
			intent: "delete",
			deviceID: selectedDeviceID
		}

		await fetch("/api/device", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(request)
		});
	}

	async function renameSelectedDevice(newName: string) {
		if(selectedDeviceID === undefined) return;

		const request: PairRequest = {
			intent: "rename",
			deviceID: selectedDeviceID,
			newName
		}

		await fetch("/api/device", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(request)
		});
	}

	async function signalPair() {
		const request: PairRequest = { intent: "open" }

		await fetch("/api/device", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(request)
		});
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

			await fetch("/api/device", {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify(request)
			}).then(async response => {
				if(response.status === 200) {
					const body = await response.json() as { devices: DeviceInfo[] };
					setDevices(body.devices);
					setFoundDevices("found");
				} else {
					setFoundDevices("error");
				}
			}, reason => console.error(reason));
		})();
	});

	return <div
		onClick={() => selectDevice()}
		className={styles.outerContainer}>
		<div className={styles.listContainer}>
			{
				withLoading(foundDevices === "unknown",
					devices.length > 0
						? <>
							{devices.map((device, i) => <button key={i}
								onClick={e => { e.stopPropagation(); selectDevice(device.id); }}
								className={styles.listItem(selectedDeviceID === device.id)}>
								<div className="flex justify-between space-x-2">
									<div className="flex shrink truncate">
										<span className="font-bold truncate">{device.name}</span>
										<span className="font-normal italic ml-1">({device.type})</span>
									</div>
									<span className="opacity-60 w-16 shrink-0">ID: {device.id}</span>
								</div>
								<p className="opacity-60">Paired: {formatPairDate(device.pairDate)}</p>
								<span className={styles.arrow}>&rsaquo;</span>
							</button>)}
						</>
						: <div className={styles.listItem(false)}>
							<p className={commonStyles.management.title}>
								{
									foundDevices === "error"
										? <>Authorization has expired</>
										: <>No devices found</>
								}
							</p>
							<p className={commonStyles.management.subtitle}>
								{
									foundDevices === "error"
										? <>Reload the page and log in</>
										: <>Enable pairing mode, then navigate to <a className="underline" href={window.location.origin}>{window.location.origin}</a> on the device</>
								}
							</p>
						</div>
				)
			}
		</div>

		<div className={styles.deviceDetails.container} onClick={e => e.stopPropagation()}>
			<span className={styles.deviceDetails.pairingContainer}>
				<label className={commonStyles.management.subtitle} htmlFor="pairing-checkbox">Enable pairing: </label>
				<input
					type="checkbox"
					id="pairing-checkbox"
					className={commonStyles.management.checkbox}
					onChange={e => setPairing(e.currentTarget.checked)} />
			</span>
			{
				selectedDevice !== undefined
				? <>
					<div className="text-center">
						{/* <input id="rename-device" className={tw(commonStyles.management.inputBox, "text-center")} type="text" value={selectedDevice?.name} /> */}
						{/* <button className={commonStyles.management.button + " -mr-12 ml-2"}>&rsaquo;</button> */}
						<TextConfirmField
							inputProps={{ type: "text", placeholder: selectedDevice.name }}
							onSubmit={renameSelectedDevice}
						/>
						<p>ID: {selectedDevice?.id}</p>
						<p>Paired on {formatPairDate(selectedDevice.pairDate)}</p>
					</div>
					<button onClick={deleteSelectedDevice} className={commonStyles.management.button}>Remove Device</button>
				</> : <h2 className={commonStyles.management.title}>Select a device from the list</h2>
			}
		</div>
	</div>
}