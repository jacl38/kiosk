import DarkButton from "@/components/DarkButton";
import withLoading from "@/components/higherOrder/withLoading";
import MenuButton from "@/components/manage/MenuButton";
import useAuth from "@/hooks/useAuth";
import commonStyles from "@/styles/common";
import postRequest from "@/utility/netUtil";
import { tw } from "@/utility/tailwindUtil";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react"
import { AuthRequest } from "../api/auth";
import useMenu from "@/hooks/useMenu";

const styles = {
	header: tw(
		`flex items-center justify-between`,
		`h-20 pr-6 pl-2`
	),
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

const tabs = {
	menu: "Menu",
	reports: "Reports",
	devices: "Devices",
}

export default function Index(props: { children?: ReactNode | ReactNode[] }) {
	const router = useRouter();
	const { authenticated, hasAdminAccount } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [tabRoute, setTabRoute] = useState<keyof typeof tabs>();

	useEffect(() => {
		const route = router.pathname.split("/").slice(1)[1] ?? ""
		if(route === "") {
			router.push("manage/menu/category");
		}
		setTabRoute(route as keyof typeof tabs);
	}, [router.pathname]);

	return <div className={commonStyles.management.outerContainer}>
		{
			withLoading(authenticated === "unknown" || authenticated === "unauthenticated", <>
				<header className={styles.header}>
					<div className="flex items-center space-x-2">
						{/* Back to main screen button */}
						<Link href="/" className={commonStyles.management.backButton}>&lsaquo;</Link>
						<h1 className={commonStyles.management.title}>Kiosk Management Panel</h1>
					</div>

					{/* Displays each of the tabs as buttons which set the current tab index */}
					{/* Uses Framer Motion to smoothly animate the highlight between each tab label */}
					<nav className={styles.tabs.container}>
						{Object.keys(tabs).map((tab, i) => {
							const route = tab as keyof typeof tabs;
							const title = tabs[route];
							return <Link
								key={route}
								href={`/manage/${route}`}
								className={styles.tabs.button}>
								{
									// Moves the highlight over the tab label where
									// the current route == the route of the tab
									tabRoute === route &&
									<motion.div
										layoutId="active-tab"
										transition={{ ease: "backOut" }}
										className={styles.tabs.overlay}>
									</motion.div>
								}
								<span className={commonStyles.management.subtitle}>{title}</span>
							</Link>
						})}
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
								{Object.keys(tabs).map((tab, i) => {
									const route = tab as keyof typeof tabs;
									const title = tabs[route];
									return <Link
										key={route}
										href={`./${route}`}
										className={styles.mobileMenu.button}>
											{title}
										</Link>
								})}
							</motion.div>
						}
					</AnimatePresence>
				</header>

				<div className="h-[calc(100vh-5rem)] sm:px-4 sm:pb-4 transition-all">
					<div className={styles.contentContainer}>
						<AnimatePresence mode="popLayout">
							<motion.div
								key={`tab-${tabRoute}-container`}
								initial={{ opacity:0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="h-full flex flex-col">
								<h2 className={commonStyles.management.title}>{tabs[tabRoute ?? "menu"]}</h2>
								<hr className={commonStyles.management.separator} />
								<motion.div
									initial={{ opacity:0, translateY: -10 }}
									animate={{ opacity: 1, translateY: 0 }}
									exit={{ opacity: 0, transition: { duration: 0 } }}
									transition={{ duration: 0.3 }}
									key={`tab-${tabRoute}-content`}
									className="overflow-y-scroll h-full relative">

									{props.children}

								</motion.div>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</> )
		}
		<DarkButton />
	</div>
}