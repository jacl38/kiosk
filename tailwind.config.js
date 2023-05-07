/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/styles/common.ts'
	],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				hotchocolate: {
					950: "#1F1714",
					900: "#3A2923",
					800: "#684033",
					700: "#98634D",
					600: "#B2846C",
					500: "#D1A78B",
					400: "#DFB89A",
					300: "#E8C9A8",
					200: "#E8D0B5",
					100: "#EEDBC1",
					 50: "#F4E3CE",
				},
			}
		},
	},
	plugins: [],
}
