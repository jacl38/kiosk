
/** Post request helper function for posting and receiving JSON content from an API route */
export default async function postRequest(apiRoute: string, body: any, then?: (response: Response) => void) {
	await fetch(`/api/${apiRoute}`, {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body)
	}).then(async response => {
		then?.(response);
	}, rejected => console.error(rejected));
}