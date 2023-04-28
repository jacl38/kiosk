import DarkButton from "@/components/DarkButton";
import { tw } from "@/utility/tailwindUtil";
import { useState } from "react";
import { AuthRequest, adminAccountExists } from "./api/auth";
import { useRouter } from "next/router";
import commonStyles from "@/styles/common";
import useAuth from "@/hooks/useAuth";

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

export default function Login(props: { hasAdminAccount: boolean }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [incorrect, setIncorrect] = useState(false);
	
	const router = useRouter();

	const { authenticated } = useAuth((valid: boolean, hasAdminAccount: boolean) => {
		if(valid || !hasAdminAccount) {
			router.push("/");
		}
	});

	async function submit() {
		const request: AuthRequest = {
			intent: "login",
			credentials: { username, password }
		}

		const res = await fetch("api/auth", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(request)
		});

		if(res.status === 200) {
			router.push("/");
		} else {
			setIncorrect(true);
		}
	}

	return <div className={styles.outerContainer}>
		<form onSubmit={e => { e.preventDefault(); submit(); }} method="post" className={styles.innerContainer}>
			<h1 className={styles.title}>Administration Login</h1>
				<input onChange={e => { setUsername(e.currentTarget.value); setIncorrect(false); }} className={commonStyles.management.inputBox} placeholder="Username" type="text" />
				<input onChange={e => { setPassword(e.currentTarget.value); setIncorrect(false); }} className={commonStyles.management.inputBox} placeholder="Password" type="password" />

				<button
					onClick={submit}
					disabled={username.length * password.length === 0}
					className={commonStyles.management.button}>
						Submit
				</button>
			{
				incorrect && <p className={styles.errorText}>Incorrect username or password. Try again.</p>
			}
		</form>
		<DarkButton />
	</div>
}

export async function getServerSideProps() {
	const hasAdminAccount = await adminAccountExists();

	return { props: { hasAdminAccount } }
}