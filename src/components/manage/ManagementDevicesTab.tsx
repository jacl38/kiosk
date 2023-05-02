import { DeviceInfo, PairRequest } from "@/pages/api/device"
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil"
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import TextConfirmField from "./TextConfirmField";
import withLoading from "../higherOrder/withLoading";
import postRequest from "@/utility/netUtil";

const styles = {
	pairingContainer: tw(
		`w-full flex items-center justify-center`,
		`pb-2 mb-4 space-x-2`,
		`border-b-2 border-stone-400 dark:border-gray-500`,
		`transition-colors`
	)
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
		
		await postRequest("device", request);
	}

	async function renameSelectedDevice(newName: string) {
		if(selectedDeviceID === undefined) return;

		const request: PairRequest = {
			intent: "rename",
			deviceID: selectedDeviceID,
			newName
		}

		await postRequest("device", request);
	}

	async function signalPair() {
		const request: PairRequest = { intent: "open" }

		await postRequest("device", request);
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
	});

	return <div
		onClick={() => selectDevice()}
		className={commonStyles.management.menu.outerContainer}>
		<div className={commonStyles.management.menu.list.container}>
			{
				withLoading(foundDevices === "unknown",
					devices.length > 0
						? <>
							{devices.map((device, i) => <button key={i}
								onClick={e => { e.stopPropagation(); selectDevice(device.id); }}
								className={commonStyles.management.menu.list.item(selectedDeviceID === device.id)}>
								<div className="flex justify-between space-x-2">
									<div className="flex shrink truncate">
										<span className="font-bold truncate">{device.name}</span>
										<span className="font-normal italic ml-1">({device.type})</span>
									</div>
									<span className="opacity-60 w-16 shrink-0">ID: {device.id}</span>
								</div>
								<p className="opacity-60">Paired: {formatPairDate(device.pairDate)}</p>
								<span className={commonStyles.management.menu.list.arrow}></span>
							</button>)}
						</>
						: <div className={commonStyles.management.menu.list.item(false)}>
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

		<div className={commonStyles.management.menu.sideContainer} onClick={e => e.stopPropagation()}>
			<span className={styles.pairingContainer}>
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
					<div className="flex max-sm:flex-col max-sm:space-y-2 sm:space-x-2">
						<TextConfirmField
							label="Device name"
							inputProps={{ type: "text", placeholder: selectedDevice.name }}
							onSubmit={renameSelectedDevice}
						/>
						<button onClick={deleteSelectedDevice} className={commonStyles.management.button}>Remove Device</button>
					</div>
					<p className="max-sm:text-center">ID: {selectedDevice.id} &mdash; Paired on {formatPairDate(selectedDevice.pairDate)}</p>
				</> : <h2 className={tw(commonStyles.management.title, "text-center")}>Select a device from the list</h2>
			}
		</div>
	</div>
}