import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="icon"
          href="/assets/favicon/s-favicon.jpg"
          type="image/jpeg"
        />
        <link
          rel="apple-touch-icon"
          href="/assets/favicon/s-favicon.jpg"
        />
        <meta name="theme-color" content="#0a0a0c" />
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