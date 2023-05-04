import { AuthRequest } from "@/pages/api/auth";
import postRequest from "@/utility/netUtil";
import { useRouter, Router } from "next/router";
import { useEffect, useState } from "react";

/** Hook used to provide admin login authentication for a page/component.
Returns authentication state and admin account creation status */
export default function useAuth(then?: (authenticated: boolean, hasAdminAccount: boolean) => void) {
	const router = useRouter();

	// Default action to take if authentication is invalid
	// If admin account exists, route to login with redirect back to current route
	// If admin account does not exist, route user to main page where admin account creation can begin
	const defaultThen = then ?? ((valid: boolean, hasAdminAccount: boolean) => {
		if(!valid) {
			router.push(hasAdminAccount ? `/login?redirect=${window.location.pathname}` : "/");
		}
	});

	// Stateful variables to store whether authentication is successful and admin account is found
	// Both start at "unknown"
	const [authenticated, setAuthenticated] = useState<"unknown" | "unauthenticated" | "authenticated">("unknown");
	const [hasAdminAccount, setHasAdminAccount] = useState<"unknown" | "noadmin" | "admin">("unknown");

	// When the hook is mounted, query is sent to the server
	useEffect(() => {
		(async function() {
			const request: AuthRequest = {
				intent: "query",
				credentials: { username: "", password: "" }
			}

			await postRequest("auth", request, async response => {
				const content = await response.json() as { hasAdminAccount: boolean, authenticated: boolean };

				// Sets states based on server response
				setAuthenticated(content.authenticated ? "authenticated" : "unauthenticated");
				setHasAdminAccount(content.hasAdminAccount ? "admin" : "noadmin");

				// Executes the supplied/default "then" function
				defaultThen(content.authenticated, content.hasAdminAccount);
			});
		})();
	}, []);

	return { authenticated, hasAdminAccount };
}