import DarkButton from "@/components/DarkButton"
import { tw } from "@/utility/tailwindUtil"
import { AuthRequest, adminAccountExists } from "./api/auth";
import Link from "next/link";
import commonStyles from "@/styles/common";
import { useState } from "react";
import { useRouter } from "next/router";

const styles = {
	innerContainer: tw(
		`flex flex-col`,
		`w-96`,
		`space-y-4`,
		`border rounded-xl`,
		`border-stone-400 dark:border-gray-600`,
		`m-auto p-4`,
		`transition-colors`,
	)
}

export default function Setup(props: { hasAdminAccount: boolean }) {
	// Stateful variables to temporarily store entered credentials
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const router = useRouter();

	// Sends server request to sign up
	// with the entered credentials
	async function submit() {
		if(!validateCredentials(username, password, confirmPassword)) return;

		const request: AuthRequest = {
			intent: "signup",
			credentials: { username, password }
		}

		await fetch("api/auth", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(request)
		}).then(
			response => {
				if(response.status === 200) {
					router.push("/");
				}
			},
			rejected => alert("Something went wrong. Reload the page and try again.")
		);
	}

	return <div className={commonStyles.management.outerContainer}>
		{
			props.hasAdminAccount
			// If the admin account already exists, show a message
			? <p className="m-auto">Administration account is already setup. If you believe this is in error, or need help resetting it, contact support.</p>

			// Otherwise, show admin account setup form
			: <form onSubmit={e => { e.preventDefault(); submit(); }} className={styles.innerContainer}>

				<h1 className={commonStyles.management.title}>Administration account setup</h1>

				<input
					onChange={e => setUsername(e.currentTarget.value)}
					className={commonStyles.management.inputBox}
					placeholder="Username"
					type="text" />

				<input
					onChange={e => setPassword(e.currentTarget.value)}
					className={commonStyles.management.inputBox}
					placeholder="Password"
					type="password" />

				<input
					onChange={e => setConfirmPassword(e.currentTarget.value)}
					className={commonStyles.management.inputBox}
					placeholder="Confirm Password"
					type="password" />

				<button
					onClick={submit}
					disabled={!validateCredentials(username, password, confirmPassword)}
					className={commonStyles.management.button}>
					Submit
				</button>
				
				{/* Displays a list of username and password requirements. */}
				{/* Text is red when requirement is not met. */}
				<div>
					<p className="font-semibold underline">Username requirements:</p>
					<ul>
						{
							Object.values(usernameRequirements).map((req, i) => {
								const meetsThisRequirement = req.validator(username);
								return <li
									key={i}
									className={meetsThisRequirement ? "" : commonStyles.management.errorText}>
									{req.message}
								</li>
							})
						}
					</ul>

					<hr className={commonStyles.management.separator} />

					<p className="font-semibold underline">Password requirements:</p>
					<ul>
						{
							Object.values(passwordRequirements).map((req, i) => {
								const meetsThisRequirement = req.validator(password);
								return <li
									key={i}
									className={meetsThisRequirement ? "" : commonStyles.management.errorText}>
									{req.message}
								</li>
							})
						}
						<li className={password === confirmPassword ? "" : commonStyles.management.errorText}>Passwords must match</li>
					</ul>
				</div>
			</form>
		}
		<Link href="/" className={commonStyles.management.backButton}>&lsaquo;</Link>
		<DarkButton />
	</div>
}

// Checks if the administration account exists while serving the page.
// Used to conditionally show message in UI
export async function getServerSideProps() {
	const hasAdminAccount = await adminAccountExists();

	return { props: { hasAdminAccount } }
}

type Requirement = { message: string, validator: (item: string) => boolean }

// Defines a list of requirements that the username must have in order to sign up
const usernameRequirements: Requirement[] = [
	{ message: "Username must be at least 4 characters", validator: item => item.length >= 4 },
	{ message: "Username must be alphanumerical (A-Z, 0-9)", validator: item => !!item.match(/^[0-9a-z]+$/i) }
]

// Defines a list of requirements that the password must have in order to sign up
const passwordRequirements: Requirement[] = [
	{ message: "Password must be at least 8 characters", validator: item => item.length >= 8 },
	{ message: "Password must contain one number", validator: item => /[0-9]/.test(item) },
	{ message: "Password must contain one lowercase letter", validator: item => /[a-z]/.test(item) },
	{ message: "Password must contain one uppercase letter", validator: item => /[A-Z]/.test(item) }
]

/** Returns true if username and password meet requirements, and if the passwords match */
export function validateCredentials(username: string, password: string, confirmPassword: string) {
	const usernameGood = usernameRequirements.every(u => u.validator(username));
	const passwordGood = passwordRequirements.every(p => p.validator(password)) && password === confirmPassword;
	return usernameGood && passwordGood;
}
