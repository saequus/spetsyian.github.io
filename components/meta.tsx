import Head from 'next/head'

const Meta = () => {
  return (
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/assets/favicon/favicon-72x72.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/assets/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/assets/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/assets/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/assets/favicon/favicon-72x73"
        color="#000000"
      />
      <link rel="shortcut icon" href="/assets/favicon/favicon.png" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-config" content="/assets/favicon/browserconfig.xml" />
      <meta name="theme-color" content="#000" />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />

      <meta property="og:url" content="https://spetsyian.com" data-shuvi-head="true" />
      <meta property="og:type" content="website" data-shuvi-head="true" />
      <meta property="og:title" content="Slava Spetsyian | Full Stack Engineer" data-shuvi-head="true" />
      <meta property="og:site_name" content="spetsyian.com" data-shuvi-head="true" />
      <meta property="og:image" content="https://spetsyian.com/assets/img/ogImage.webp" data-shuvi-head="true" />
      <meta
        name="description"
        content="Meet Slava Spetsyian, a full stack engineer, growth hacker, and author with wide experience in finance and web-development."
        data-shuvi-head="true"
      />

      <meta property="twitter:title" content="Slava Spetsyian | Full Stack Engineer" data-shuvi-head="true" />
      <meta property="twitter:site" content="spetsyian.com" data-shuvi-head="true" />
      <meta property="twitter:image" content="https://spetsyian.com/assets/img/ogImage.webp" data-shuvi-head="true" />
      <meta property="twitter:image:src" content="https://spetsyian.com/assets/img/ogImage.webp" data-shuvi-head="true" />
      <meta property="twitter:card" content="summary_large_image" data-shuvi-head="true" />

    </Head>
  )
}

export default Meta
