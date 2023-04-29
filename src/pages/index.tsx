import ManagementCard, { CardProps } from "@/components/manage/ManagementCard";
import { AuthRequest, adminAccountExists } from "./api/auth";
import { tw } from "@/utility/tailwindUtil";
import DarkButton from "@/components/DarkButton";
import useAuth from "@/hooks/useAuth";
import commonStyles from "@/styles/common";
import { useRouter } from "next/router";

function cardContents(hasAdminAccount: boolean): CardProps[] {
	return hasAdminAccount
	? [
		{ title: "Kiosk", description: "Self-serve Kiosk Interface", route: "/kiosk" },
		{ title: "Orders", description: "View and complete pending orders", route: "/orders" },
		{ title: "Management", description: "Management panel", route: "/manage" },
	] : [{
		title: "Setup",
		description: "Administration account not found. Click here to setup the administration account.",
		route: "/setup"
	}]
}

const styles = {
	innerContainer: tw(
		`flex flex-col`,
		`w-96`,
		`space-y-4`,
		`border rounded-xl`,
		`border-stone-400 dark:border-gray-600`,
		`m-auto p-4`,
		`transition-colors`,
	),
	authStatus: (auth: boolean) => tw(
		auth ? `text-green-400 after:content-['✓']` : `text-rose-700 after:content-['×']`,
		`font-black contents`
	)
}

export default function Index() {
	const { authenticated, hasAdminAccount } = useAuth(() => {});

	const stillLoading = authenticated === "unknown" || hasAdminAccount === "unknown";

	const router = useRouter();

	async function logout() {
		const request: AuthRequest = {
			intent: "logout",
			credentials: { username: "", password: "" }
		}

		await fetch("/api/auth", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(request)
		});

		router.reload();
	}

	return <div className={commonStyles.management.outerContainer}>
		{
			stillLoading
			? <div className={commonStyles.loadingSpinner}></div>
			: <div className={styles.innerContainer}>
				{cardContents(hasAdminAccount === "admin").map((card, i) => <ManagementCard key={i} {...card} />)}
				<div className="flex justify-between px-2">
					<p className={commonStyles.management.subtitle}><span className={styles.authStatus(authenticated === "authenticated")}></span> Auth</p>
					<button
						onClick={authenticated === "authenticated" ? logout : () => router.push("/login")}
						className={tw(commonStyles.management.subtitle, "underline self-center", hasAdminAccount !== "admin" ? "hidden" : "")}>
							{authenticated === "authenticated" ? "Logout" : "Login"}
					</button>
				</div>
			</div>
		}
		<DarkButton />
	</div>
}