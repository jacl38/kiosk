import DarkButton from "@/components/DarkButton";
import withLoading from "@/components/higherOrder/withLoading";
import useAuth from "@/hooks/useAuth";
import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react"

const styles = {
	tabs: {
		container: tw(
			`flex space-x-4`,
			`max-sm:hidden`
		),
		button: tw(
			`relative px-2 py-1`
		),
		overlay: tw(
			`absolute inset-0`,
			`bg-stone-800 bg-opacity-20`,
			`dark:bg-gray-300 dark:bg-opacity-10`,
			`rounded-full`,
			`transition-colors`
		)
	},
	mobileMenu: {
		container: tw(
			`fixed inset-0`,
			`bg-black bg-opacity-50 backdrop-blur-sm`,
			`flex flex-col`,
			`items-center justify-center`,
			`space-y-8`,
			`z-10`
		),
		button: tw(
			`text-4xl`,
			`text-gray-200 dark:text-stone-300`,
			`transition-colors`
		)
	}
}

const tabs = [
	{ title: "Menu", route: "menu" },
	{ title: "Reports", route: "reports" },
	{ title: "Devices", route: "devices" }
]

export default function Index(props: { children?: ReactNode | ReactNode[] }) {
	const router = useRouter();
	const { authenticated, hasAdminAccount } = useAuth();

	useEffect(() => {
		const route = router.pathname.split("/").slice(1).pop();
		if(route === "manage") {
			router.push("manage/menu");
		}
	}, []);

	return <div className={tw(commonStyles.management.outerContainer, "p-8")}>
		{
			withLoading(authenticated === "unknown", <>
				<header className="flex pl-16 mb-4 justify-between py-1 items-center">
					<h1 className={commonStyles.management.title}>Kiosk Management Panel</h1>

					<nav className={styles.tabs.container}>
						{tabs.map((tab, i) => <Link
							
							href={`./${tab.route}`}
							className={styles.tabs.button}>
							{
								router.pathname.split("/").slice(1).pop() === tab.route &&
								<motion.div
									layoutId="active-tab"
									transition={{ ease: "backOut" }}
									className={styles.tabs.overlay}>
								</motion.div>
							}
							<span className={commonStyles.management.subtitle}>{tab.title}</span>
						</Link>)}
					</nav>
				</header>
				{props.children}
			</> )
		}
		<DarkButton />
	</div>
}