import { tw } from "@/utility/tailwindUtil";

const commonStyles = {
	management: {
		outerContainer: tw(
			`bg-stone-200 dark:bg-gray-800`,
			`h-full`,
			`relative`,
			`flex flex-col`,
			`overflow-scroll`,
			`text-stone-700 dark:text-stone-300`,
			`transition-colors`,
			`overflow-hidden`,
		),
		inputBox: tw(
			`px-2 py-1`,
			`bg-stone-100 dark:bg-gray-600`,
			`border-2 border-stone-400 dark:border-gray-700`,
			`transition-colors`,
			`rounded-full`,
		),
		button: tw(
			`px-4 py-1`,
			`font-bold`,
			`bg-stone-300 dark:bg-gray-600`,
			`enabled:hover:bg-stone-400 enabled:dark:hover:bg-gray-700`,
			`border-2 border-stone-400 dark:border-gray-700`,
			`rounded-full`,
			`disabled:opacity-50 disabled:cursor-not-allowed`,
			`transition-all`,
		),
		separator: tw(
			`my-2 h-0.5`,
			`border-none`,
			`bg-stone-700 dark:bg-gray-300 bg-opacity-10 dark:bg-opacity-10`,
			`transition-colors`
		),
		title: tw(
			`text-xl font-semibold`
		),
		subtitle: tw(
			`text-lg font-semibold`,
		),
		errorText: tw(
			`font-bold`,
			`text-rose-700 dark:text-red-500`,
			`transition-colors`,
			`before:content-['⨂']`,
			`before:absolute before:-ml-6`
		),
		backButton: tw(
			`absolute left-4 top-4`,
			`text-5xl`,
			`flex items-center justify-center`,
			`pb-3 pr-1`,
			`w-16 h-16`,
			`hover:bg-stone-300 dark:hover:bg-gray-700`,
			`rounded-full`,
			`transition-colors`
		),
		checkbox: tw(
			`w-5 h-5`,
			`rounded-xl checked:rounded-md`,
			`bg-stone-300 dark:bg-gray-300`,
			`checked:bg-stone-500 checked:dark:bg-gray-500`,
			`checked:border-stone-400 checked:dark:border-gray-300`,
			`border border-stone-500 dark:border-gray-400`,
			`relative`,
			`checked:after:content-['✓']`,
			`after:text-stone-300 after:dark:text-gray-300`,
			`after:font-black`,
			`after:absolute after:inset-0`,
			`after:flex after:items-center after:justify-center`,
			`transition-all`,
			`appearance-none`,
		),
		menu: {
			outerContainer: tw(
				`flex max-md:flex-col`,
				`h-full`,
				`md:space-x-4 max-md:space-y-4`,
				`relative`,
			),
			list: {
				container: tw(
					`w-full`,
					`space-y-4`,
				),
				item: (selected: boolean) => tw(
					`p-4`,
					`rounded-xl`,
					`w-full`,
					`bg-stone-700 dark:bg-gray-300 bg-opacity-10 dark:bg-opacity-20`,
					selected ? `bg-opacity-30 dark:bg-opacity-30` : `hover:bg-opacity-20 dark:hover:bg-opacity-25`,
					`border-2 border-stone-400 dark:border-gray-500`,
					`relative group`,
					`text-left`,
					`cursor-pointer`,
					`transition-colors`
				),
				arrow: tw(
					`max-md:hidden`,
					`text-4xl font-semibold`,
					`absolute`,
					`right-6 group-hover:right-4`,
					`bottom-2`,
					`select-none`,
					`transition-all`,
					`after:content-['›']`
				),
			},
			sideContainer: tw(
				`w-full`,
				`sticky top-0 self-start`,
				`rounded-2xl`,
				`h-96`,
				`p-4`,
				`flex flex-col items-center space-y-4`,
				`bg-stone-700 dark:bg-gray-300 bg-opacity-10 dark:bg-opacity-20`,
				`border-2 border-stone-400 dark:border-gray-500`,
				`transition-all`
			)
		}
	},
	loadingSpinner: tw(
		`m-auto`,
		`w-16 h-16`,
		`rounded-full`,
		`border-8 border-t-transparent`,
		`border-stone-400 dark:border-gray-500 dark:border-t-transparent`,
		`animate-spin`
	)
}

export default commonStyles;