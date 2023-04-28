import DarkButton from "@/components/DarkButton";
import commonStyles from "@/styles/common";
import Link from "next/link";

export default function Manage() {
	return <div className={commonStyles.management.outerContainer}>
		<Link href="/" className={commonStyles.management.backButton}>&lsaquo;</Link>
		<DarkButton />
	</div>
}