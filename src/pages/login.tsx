import DarkButton from "@/components/DarkButton";
import { tw } from "@/utility/tailwindUtil";
import { useState } from "react";
import { AuthRequest } from "./api/auth";
import { useRouter } from "next/router";
import commonStyles from "@/styles/common";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";
import postRequest from "@/utility/netUtil";

const styles = {
	outerContainer: tw(
		`bg-stone-200 dark:bg-gray-800`,
		`h-full`,
		`flex p-8`,
		`overflow-scroll`,
		`text-stone-700 dark:text-stone-300`,
		`transition-colors`
	),
	innerContainer: tw(
		`flex flex-col`,
		`w-96`,
		`space-y-4`,
		`border rounded-xl`,
		`border-stone-400 dark:border-gray-600`,
		`m-auto p-4`,
		`transition-colors`,
	),
	title: tw(
		`text-xl font-semibold`,
		`mb-4`
	),
	backButton: tw(
		`fixed left-4 top-4`,
		`text-5xl`,
		`flex items-center justify-center`,
		`pb-3 pr-1`,
		`w-16 h-16`,
		`hover:bg-stone-300 dark:hover:bg-gray-700`,
		`rounded-full`,
		`transition-colors`
	),
	errorText: tw(
		`font-bold`,
		`text-rose-700 dark:text-red-500`,
		`transition-colors`,
		`before:content-['⨂']`,
		`before:absolute before:-ml-6`
	)
}

export default function Login() {
	// Stateful variables to temporarily store entered credentials
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [incorrect, setIncorrect] = useState(false);
	
	const router = useRouter();

	// If user enters the page while already logged in,
	// reroute to main page.
	useAuth((valid: boolean, hasAdminAccount: boolean) => {
		if(valid || !hasAdminAccount) {
			router.push("/");
		}
	});

	// Sends server request to log in
	// with the entered credentials
	async function submit() {
		const request: AuthRequest = {
			intent: "login",
			credentials: { username, password }
		}

		await postRequest("auth", request, async response => {
			if(response.status === 200) {
				// Credentials are accepted
				// Go to redirect route from url, if exists
				const redirect = new URLSearchParams(window.location.search).get("redirect") ?? "";
				router.push(redirect);
			} else {
				// Credentials are rejected
				setIncorrect(true);
			}
		});
	}

	return <div className={styles.outerContainer}>

		<form onSubmit={e => { e.preventDefault(); submit(); }} method="post" className={styles.innerContainer}>

			<h1 className={styles.title}>Administration Login</h1>

				<input
					onChange={e => { setUsername(e.currentTarget.value); setIncorrect(false); }}
					className={commonStyles.management.inputBox}
					placeholder="Username"
					type="text" />

				<input
					onChange={e => { setPassword(e.currentTarget.value); setIncorrect(false); }}
					className={commonStyles.management.inputBox}
					placeholder="Password"
					type="password" />

				<button
					onClick={submit}
					disabled={username.length * password.length === 0}
					className={commonStyles.management.button}>
					Submit
				</button>
			{
				// Display error text if invalid credentials are entered
				incorrect && <p className={styles.errorText}>Incorrect username or password. Try again.</p>
			}
		</form>

		{/* Back button to main screen */}
		<Link href="/" className={commonStyles.management.backButton}>&lsaquo;</Link>
		<DarkButton />
	</div>
}