import DarkButton from "@/components/DarkButton"
import { tw } from "@/utility/tailwindUtil"
import { AuthRequest, adminAccountExists } from "./api/auth";
import Link from "next/link";
import commonStyles from "@/styles/common";
import { useState } from "react";
import { useRouter } from "next/router";

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
	errorText: tw(
		`font-bold`,
		`text-rose-700 dark:text-red-500`,
		`transition-colors`,
		`before:content-['⨂']`,
		`before:absolute before:-ml-6`
	)
}

export default function Setup(props: { hasAdminAccount: boolean }) {

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const router = useRouter();

	async function submit() {
		if(!validateCredentials(username, password, confirmPassword)) return;

		const request: AuthRequest = {
			intent: "signup",
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

		router.push("/");
	}

	return <div className={styles.outerContainer}>
		{
			props.hasAdminAccount
			? <p className="m-auto">Administration account is already setup. If you believe this is in error, or need help resetting it, contact support.</p>
			: <div className={styles.innerContainer}>
				<h1 className={styles.title}>Administration account setup</h1>
				<input onChange={e => setUsername(e.currentTarget.value)} className={commonStyles.management.inputBox} placeholder="Username" type="text" />
				<input onChange={e => setPassword(e.currentTarget.value)} className={commonStyles.management.inputBox} placeholder="Password" type="password" />
				<input onChange={e => setConfirmPassword(e.currentTarget.value)} className={commonStyles.management.inputBox} placeholder="Confirm Password" type="password" />
				
				<button
					onClick={submit}
					disabled={!validateCredentials(username, password, confirmPassword)}
					className={commonStyles.management.button}>
						Submit
				</button>
				
				<div>
					<p className="font-semibold underline">Username requirements:</p>
					<ul>
						{
							Object.values(usernameRequirements).map((req, i) => {
								const meetsThisRequirement = req.validator(username);
								return <li key={i} className={meetsThisRequirement ? "" : styles.errorText}>{req.message}</li>
							})
						}
					</ul>
					<hr className={commonStyles.management.separator} />
					<p className="font-semibold underline">Password requirements:</p>
					<ul>
						{
							Object.values(passwordRequirements).map((req, i) => {
								const meetsThisRequirement = req.validator(password);
								return <li key={i} className={meetsThisRequirement ? "" : styles.errorText}>{req.message}</li>
							})
						}
						<li className={password === confirmPassword ? "" : styles.errorText}>Passwords must match</li>
					</ul>
				</div>
			</div>
		}
		<Link href="/" className={commonStyles.management.backButton}>&lsaquo;</Link>
		<DarkButton />
	</div>
}

export async function getServerSideProps() {
	const hasAdminAccount = await adminAccountExists();

	return { props: { hasAdminAccount } }
}

type Requirement = { message: string, validator: (item: string) => boolean }

const usernameRequirements: Requirement[] = [
	{ message: "Username must be at least 4 characters", validator: item => item.length >= 4 },
	{ message: "Username must be alphanumerical (A-Z, 0-9)", validator: item => !!item.match(/^[0-9a-z]+$/i) }
]

const passwordRequirements: Requirement[] = [
	{ message: "Password must be at least 8 characters", validator: item => item.length >= 8 },
	{ message: "Password must contain one number", validator: item => /[0-9]/.test(item) },
	{ message: "Password must contain one lowercase letter", validator: item => /[a-z]/.test(item) },
	{ message: "Password must contain one uppercase letter", validator: item => /[A-Z]/.test(item) }
]

export function validateCredentials(username: string, password: string, confirmPassword: string) {
	const usernameGood = usernameRequirements.every(u => u.validator(username));
	const passwordGood = passwordRequirements.every(p => p.validator(password)) && password === confirmPassword;
	return usernameGood && passwordGood;
}
