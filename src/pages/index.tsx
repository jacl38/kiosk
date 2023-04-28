import ManagementCard, { CardProps } from "@/components/manage/ManagementCard";
import { adminAccountExists } from "./api/auth";
import { tw } from "@/utility/tailwindUtil";
import DarkButton from "@/components/DarkButton";
import useAuth from "@/hooks/useAuth";
import commonStyles from "@/styles/common";

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
	)
}

export default function Index() {
	const { authenticated, hasAdminAccount } = useAuth();

	const showMenu = hasAdminAccount === "noadmin" || authenticated === "authenticated";

	return <div className={commonStyles.management.outerContainer}>
		{
			showMenu
			? <div className={styles.innerContainer}>
				{cardContents(hasAdminAccount === "admin").map((card, i) => <ManagementCard key={i} {...card} />)}
			</div>
			: <div className={commonStyles.loadingSpinner}></div>
		}
		<DarkButton />
	</div>
}