import { AuthRequest, adminAccountExists } from "@/pages/api/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function useAuth(then?: (authenticated: boolean, hasAdminAccount: boolean) => void) {

	const router = useRouter();

	const defaultThen = then ?? ((valid: boolean, hasAdminAccount: boolean) => {
		if(!valid) {
			router.push(hasAdminAccount ? `/login?redirect=${router.route.substring(1)}` : "/");
		}
	});

	const [authenticated, setAuthenticated] = useState<"unknown" | "unauthenticated" | "authenticated">("unknown");
	const [hasAdminAccount, setHasAdminAccount] = useState<"unknown" | "noadmin" | "admin">("unknown");

	useEffect(() => {
		(async function() {
			const request: AuthRequest = {
				intent: "query",
				credentials: { username: "", password: "" }
			}
	
			await fetch("api/auth", {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify(request)
			}).then(async response => {
				const content = await response.json() as { hasAdminAccount: boolean, authenticated: boolean };
				setAuthenticated(content.authenticated ? "authenticated" : "unauthenticated");
				setHasAdminAccount(content.hasAdminAccount ? "admin" : "noadmin");
				defaultThen(content.authenticated, content.hasAdminAccount);
			}, reason => console.error(reason));
		})();
	}, []);

	return { authenticated, hasAdminAccount };
}