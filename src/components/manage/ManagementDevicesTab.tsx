import { hash } from "@/pages/api/auth";
import { DeviceInfo, PairRequest } from "@/pages/api/device"
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil"
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const styles = {
	outerContainer: tw(
		`flex max-md:flex-col`,
		`md:space-x-4 max-md:space-y-4`,
		`relative`,
	),
	listContainer: tw(
		`w-full`,
		`space-y-2`,
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

function fakeHash() {
	const hex = "0123456789abcdef";
	return [...Array(128)].map(_ => hex[Math.floor(Math.random() * 16)]).join("");
}

const devices: DeviceInfo[] = [
	{ id: 123, name: "device-name jlakwjlkwa rklwaj rlwej", type: "kiosk", token: fakeHash(), uptime: 912830 },
	{ id: 456, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 53124 },
	{ id: 183, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 432 },
	{ id: 798, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 86400 },
	{ id: 798, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 8965451 },
	{ id: 798, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 8965451 },
	{ id: 798, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 8965451 },
	{ id: 798, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 8965451 },
	{ id: 798, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 8965451 },
	{ id: 798, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 8965451 },
	{ id: 798, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 8965451 },
	{ id: 798, name: "device-name", type: "kiosk", token: fakeHash(), uptime: 8965451 },
];

function formatUptime(uptime: number) {
	const seconds = uptime % 60;
	const minutes = Math.floor(uptime / 60) % 60;
	const hours = Math.floor(uptime / (60 * 60)) % 24;
	const days = Math.floor(uptime / (60 * 60 * 24));

	return `${days > 0 ? `${days}d ` : ""}${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""}${seconds > 0 ? `${seconds}s` : ""}`;
}

/** Time before resending signal to keep pairing open (seconds). */
const signalPairTimeout = 10;

export default function ManagementDevicesTab() {
	const router = useRouter();

	const [selectedDeviceID, setSelectedDeviceID] = useState<number>();

	function selectDevice(id?: number) {
		setSelectedDeviceID(id);
	}

	const selectedDevice = devices.find(d => d.id === selectedDeviceID);

	async function signalPair() {
		const request: PairRequest = { intent: "open" }

		const response = await fetch("/api/device", {
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
			pairTimer.current = setInterval(signalPair, 10 * 1000);
		}
	}, [pairing]);

	return <div
		onClick={() => selectDevice()}
		className={styles.outerContainer}>
		<div className={styles.listContainer}>
			{
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
						<p className="opacity-60">Uptime: {formatUptime(device.uptime)}</p>
						<span className={styles.arrow}>&rsaquo;</span>
					</button>)}
				</>
				: <div className={styles.listItem(false)}>
					<p className={commonStyles.management.title}>No devices found</p>
					<p className={commonStyles.management.subtitle}>Enable pairing mode, then navigate to <a className="underline" href={window.location.origin}>{window.location.origin}</a> on the device</p>
				</div>
			}
		</div>

		<div className={styles.deviceDetails.container}>
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
						<h2 className={commonStyles.management.title}>{selectedDevice?.name}</h2>
						<p>{selectedDevice?.id}</p>
						<p>{formatUptime(selectedDevice?.uptime ?? 0)}</p>
					</div>
					<button className={commonStyles.management.button}>Remove Device</button>
				</> : <h2 className={commonStyles.management.title}>Select a device from the list</h2>
			}
		</div>
	</div>
}