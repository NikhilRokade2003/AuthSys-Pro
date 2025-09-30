import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="SecureAuth Pro - Secure Authentication System" />
      </Head>
      <body className="bg-black text-green-400">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}