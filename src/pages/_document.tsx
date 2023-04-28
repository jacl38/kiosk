import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
	return (
		<Html lang="en" className="h-full">
			<Head>
				
			</Head>
			<body className="h-full [&>div]:h-full">
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
