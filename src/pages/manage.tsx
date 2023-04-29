import DarkButton from "@/components/DarkButton";
import ManagementDevicesTab from "@/components/manage/ManagementDevicesTab";
import ManagementMenuTab from "@/components/manage/ManagementMenuTab";
import ManagementReportsTab from "@/components/manage/ManagementReportsTab";
import ManagementTab, { ManagementTabProps } from "@/components/manage/ManagementTab";
import MenuButton from "@/components/manage/MenuButton";
import useAuth from "@/hooks/useAuth";
import commonStyles from "@/styles/common";
import { tw } from "@/utility/tailwindUtil";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const tabs: ManagementTabProps[] = [
	{ name: "Menu", children: <ManagementMenuTab /> },
	{ name: "Reports", children: <ManagementReportsTab /> },
	{ name: "Devices", children: <ManagementDevicesTab /> },
];

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

export default function Manage() {
	const [tabIndex, setTabIndex] = useState(0);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const { authenticated } = useAuth();

	return <div className={tw(commonStyles.management.outerContainer, "p-8")}>
		{
			authenticated === "authenticated" ? <>
				<header className="flex pl-16 mb-4 justify-between py-1 items-center">
					<h1 className={commonStyles.management.title}>Kiosk Management Panel</h1>
		
					<AnimatePresence>
						<div className={styles.tabs.container}>
							{tabs.map((tab, i) => <button
								key={tab.name}
								onClick={() => setTabIndex(i)}
								className={styles.tabs.button}>
									{
										tabIndex === i &&
										<motion.div
										layoutId="active-tab"
										transition={{ ease: "backOut" }}
										className={styles.tabs.overlay}></motion.div>
									}
									<span className={commonStyles.management.subtitle}>{tab.name}</span>
							</button>)}
						</div>
					</AnimatePresence>
		
					<MenuButton onClick={() => setMobileMenuOpen(o => !o)} className="sm:hidden z-50" size={24} />
		
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
								{tabs.map((tab, i) => <button
									key={tab.name}
									onClick={() => setTabIndex(i)}
									className={styles.mobileMenu.button}>
										{tab.name}
									</button>
								)}
							</motion.div>
						}
					</AnimatePresence>
		
				</header>
				
				<div className="relative w-full h-full">
					<AnimatePresence mode="popLayout">
						<ManagementTab key={tabs[tabIndex].name} {...tabs[tabIndex]} />
					</AnimatePresence>
				</div>
		
				<Link href="/" className={commonStyles.management.backButton}>&lsaquo;</Link>
				<DarkButton />
			</>
			: <div className={commonStyles.loadingSpinner}></div>
		}
	</div>
}