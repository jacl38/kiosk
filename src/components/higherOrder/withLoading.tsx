import commonStyles from "@/styles/common";
import { ReactNode } from "react";

/** Renders a loading spinner if isLoading is true */
export default function withLoading(isLoading: boolean, component: ReactNode) {
	return isLoading
		? <div className={commonStyles.loadingSpinner}></div>
		: component;
}