import ManagementCard, { CardProps } from "@/components/manage/ManagementCard";
import { AuthRequest } from "./api/auth";
import { tw } from "@/utility/tailwindUtil";
import DarkButton from "@/components/DarkButton";
import useAuth from "@/hooks/useAuth";
import commonStyles from "@/styles/common";
import { useRouter } from "next/router";
import { deleteCookie } from "cookies-next";
import withLoading from "@/components/higherOrder/withLoading";

const styles = {
	innerContainer: tw(
		`flex flex-col`,
		`max-sm:w-80 w-96`,
		`space-y-4`,
		`border rounded-xl`,
		`border-stone-400 dark:border-gray-600`,
		`m-auto p-4`,
		`transition-all`,
	),
	// Adds a green checkmark or red x depending on
	// if the admin account is logged in
	authStatus: (auth: boolean) => tw(
		auth ? `before:content-['✓'] before:text-green-400` : `before:content-['×'] before:text-rose-700`,
		`before:font-black before:mr-1`,
		`text-lg font-semibold`
	)
}

// Determins the contents of the cards based on
// whether the administration account has been created
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

export default function Index() {
	// Empty function in useAuth hook to prevent
	// automatic redirect if not logged in.
	const { authenticated, hasAdminAccount } = useAuth(() => {});

	const router = useRouter();

	// Still loading if server has not been reached yet.
	// Used to prevent normal rendering and show loading spinner in UI.
	const stillLoading = authenticated === "unknown" || hasAdminAccount === "unknown";

	// Deletes auth token and reloads the page
	async function logout() {
		deleteCookie("token");
		router.reload();
	}

	return <div className={commonStyles.management.outerContainer}>
		{
			withLoading(stillLoading,

				<div className={styles.innerContainer}>

					{cardContents(hasAdminAccount === "admin").map((card, i) => <ManagementCard key={i} {...card} />)}
					<div className="flex justify-between px-2">

						<p className={styles.authStatus(authenticated === "authenticated")}>Admin</p>

						<button
							onClick={authenticated === "authenticated" ? logout : () => router.push("/login")}
							className={tw(commonStyles.management.subtitle, "underline", hasAdminAccount !== "admin" ? "hidden" : "")}>
								{authenticated === "authenticated" ? "Logout" : "Login"}
						</button>

					</div>
				</div>
			)
		}
		<DarkButton />
	</div>
}