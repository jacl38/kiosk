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
			`w-full`,
			`px-2 py-1`,
			`bg-stone-100 dark:bg-gray-600`,
			`border-2 border-stone-400 dark:border-gray-700`,
			`transition-colors`,
			`rounded-2xl`,
		),
		button: tw(
			`px-4 py-1`,
			`font-bold`,
			`bg-stone-300 dark:bg-gray-700`,
			`enabled:hover:bg-stone-400 enabled:dark:hover:bg-gray-600`,
			`border-2 border-stone-400 dark:border-gray-600`,
			`rounded-full`,
			`shrink-0`,
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
			`text-5xl`,
			`flex items-center justify-center`,
			`pb-3 pr-1`,
			`w-16 h-16`,
			`bg-gray-700 dark:bg-stone-300`,
			`bg-opacity-0 dark:bg-opacity-0`,
			`hover:bg-opacity-20 dark:hover:bg-opacity-20`,
			`rounded-full`,
			`transition-all`
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
		splitScreen: {
			container: tw(
				`lg:grid h-full`,
				`grid-cols-2 grid-rows-1`,
				`gap-4`
			),
			details: {
				backdrop: (open: boolean) => open ? tw(
						`max-lg:fixed max-lg:inset-0`,
						`max-lg:backdrop-blur-sm`,
						`max-lg:bg-gray-700 max-lg:dark:bg-stone-800`,
						`max-lg:bg-opacity-20 max-lg:dark:bg-opacity-20`,
						`max-lg:flex`,
						`transition-[backdrop-filter,opacity] duration-200`,
					) : "max-lg:hidden",
				container: tw(
					`h-full`,
					`overflow-y-hidden`,
					`max-lg:max-h-[80%] max-lg:max-w-[calc(100vw-4rem)] max-lg:w-96`,
					`max-lg:m-auto`,
					`p-4`,
					`bg-stone-200 dark:bg-gray-600`,
					`border-2 border-stone-300 dark:border-gray-500`,
					`shadow-lg`,
					`rounded-lg`,
					`transition-colors`
				)
			}
		},
		menu: {
			outerContainer: tw(
				`flex max-md:flex-col`,
				`h-full`,
				`md:space-x-4 max-md:space-y-4`,
				`relative`,
			),
			list: {
				container: tw(
					`space-y-4`,
					`flex flex-col`,
					`w-full md:max-w-[50%]`,
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
				`sticky top-0 self-start`,
				`rounded-2xl`,
				`grow w-full h-full`,
				`p-4`,
				`flex flex-col space-y-4`,
				`bg-stone-700 dark:bg-gray-300 bg-opacity-10 dark:bg-opacity-20`,
				`border-2 border-stone-400 dark:border-gray-500`,
				`transition-all`
			)
		}
	},
	loadingSpinner: tw(
		`relative flex items-center justify-center`,
		`w-full h-full`,
		`after:absolute`,
		`after:w-10 after:h-10`,
		`after:aspect-square`,
		`after:rounded-full`,
		`after:border-8 after:border-t-transparent after:dark:border-t-transparent`,
		`after:border-stone-400 after:dark:border-gray-500`,
		`after:animate-spin`,
	),
	order: {
		button: tw(
			`bg-emerald-700`,
			`py-1.5 px-4`,
			`font-bold text-white`,
			`rounded-full`,
			`border-b-4 border-emerald-800`,
			`hover:border-b-2`,
			`transition-all`
		),
		buttonDisabled: tw(
			`opacity-50`,
			`hover:border-b-4`,
			`cursor-default`
		)
	}
}

export default commonStyles;