import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#010103" />
        <meta name="color-scheme" content="dark" />
        <link
          rel="preconnect"
          href="https://coreprojects.blob.core.windows.net"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}