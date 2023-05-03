import DarkButton from "@/components/DarkButton";
import withLoading from "@/components/higherOrder/withLoading";
import MenuButton from "@/components/manage/MenuButton";
import useAuth from "@/hooks/useAuth";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react"

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
	},
	contentContainer: tw(
		`w-full h-full`,
		`flex flex-col`,
		`max-sm:p-2 p-4`,
		`bg-stone-300 dark:bg-gray-700`,
		`max-sm:rounded-none sm:rounded-2xl`,
		`transition-all`,
	)
}

const tabs = [
	{ title: "Menu", route: "menu" },
	{ title: "Reports", route: "reports" },
	{ title: "Devices", route: "devices" }
]

export default function Index(props: { children?: ReactNode | ReactNode[] }) {
	const router = useRouter();
	const { authenticated, hasAdminAccount } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [tabIndex, setTabIndex] = useState(0);

	useEffect(() => {
		const route = router.pathname.split("/").slice(1).pop() ?? "";
		if(route === "manage") {
			router.push("manage/menu");
		}
		setTabIndex(tabs.findIndex(t => t.route === route));
	}, [router]);

	return <div className={commonStyles.management.outerContainer}>
		{
			withLoading(authenticated === "unknown", <>
				<header className="flex h-20 justify-between py-4 sm:pt-8 sm:pb-4 px-6 items-center transition-all">
					<h1 className={tw(commonStyles.management.title, "sm:pl-10 pl-8 transition-all")}>Kiosk Management Panel</h1>

					{/* Displays each of the tabs as buttons which set the current tab index */}
					{/* Uses Framer Motion to smoothly animate the highlight between each tab label */}
					<nav className={styles.tabs.container}>
						{tabs.map((tab, i) => <Link
							key={tab.route}
							href={`./${tab.route}`}
							className={styles.tabs.button}>
							{
								// Moves the highlight over the tab label where
								// the current route == the route of the tab
								tabIndex === i &&
								<motion.div
									layoutId="active-tab"
									transition={{ ease: "backOut" }}
									className={styles.tabs.overlay}>
								</motion.div>
							}
							<span className={commonStyles.management.subtitle}>{tab.title}</span>
						</Link>)}
					</nav>
					
					{/* Show mobile menu button, only on small screens (640px) */}
					{/* Toggles mobile menu open/closed on click */}
					<MenuButton onClick={() => setMobileMenuOpen(o => !o)} className="sm:hidden z-50" size={24} />

					{/* Displays the mobile menu */}
					{/* Uses conditional rendering based on mobileMenuOpen state */}
					{/* Uses AnimatePresence to wait until exit animation (fade out)
						finishes playing before removing from the DOM */}
					<AnimatePresence>
						{
							mobileMenuOpen &&
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								key="mobile-menu"
								onClick={() => setMobileMenuOpen(false)}
								className={styles.mobileMenu.container}>
								{tabs.map((tab, i) => <Link
									key={tab.route}
									href={`./${tab.route}`}
									className={styles.mobileMenu.button}>
										{tab.title}
									</Link>
								)}
							</motion.div>
						}
					</AnimatePresence>
				</header>
				
				<div className="h-[calc(100vh-5rem)] sm:px-4 sm:pb-4 transition-all">
					<div className={styles.contentContainer}>
						<AnimatePresence mode="popLayout">
							<motion.div
								key={`tab-${tabIndex}-container`}
								initial={{ opacity:0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="h-full flex flex-col">
								<h2 className={commonStyles.management.title}>{tabs[tabIndex]?.title}</h2>
								<hr className={commonStyles.management.separator} />
								<motion.div
									initial={{ opacity:0, translateY: -10 }}
									animate={{ opacity: 1, translateY: 0 }}
									exit={{ opacity: 0, transition: { duration: 0 } }}
									transition={{ duration: 0.3 }}
									key={`tab-${tabIndex}-content`}
									className="overflow-y-scroll h-full relative">
									{props.children}
								</motion.div>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</> )
		}

		{/* Back to main screen button */}
		<Link href="/" className={commonStyles.management.backButton}>&lsaquo;</Link>
		<DarkButton />
	</div>
}