import Head from 'next/head'
import {
  AUTHOR_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  X_HANDLE,
  absoluteUrl,
} from '../lib/site'

export type JsonLd = Record<string, unknown>

export type SeoProps = {
  title: string
  description?: string
  /** Path of the page, e.g. "/blog/". Used for canonical + og:url. */
  path: string
  ogType?: 'website' | 'article' | 'profile'
  image?: string
  imageAlt?: string
  noindex?: boolean
  jsonLd?: JsonLd[]
  article?: {
    publishedTime: string
    modifiedTime?: string
    tags?: string[]
  }
}

/** Escape "<" so JSON-LD can never close the surrounding script tag. */
function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  ogType = 'website',
  image = DEFAULT_OG_IMAGE,
  imageAlt = `${AUTHOR_NAME} — AI Engineer`,
  noindex = false,
  jsonLd = [],
  article,
}: SeoProps) {
  const url = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} key="description" />
      <meta
        name="robots"
        content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}
        key="robots"
      />
      {noindex ? null : <link rel="canonical" href={url} key="canonical" />}
      <meta name="author" content={AUTHOR_NAME} key="author" />

      <meta property="og:site_name" content={SITE_NAME} key="og:site_name" />
      <meta property="og:locale" content="en_US" key="og:locale" />
      <meta property="og:type" content={ogType} key="og:type" />
      <meta property="og:title" content={title} key="og:title" />
      <meta property="og:description" content={description} key="og:description" />
      <meta property="og:url" content={url} key="og:url" />
      <meta property="og:image" content={imageUrl} key="og:image" />
      <meta property="og:image:alt" content={imageAlt} key="og:image:alt" />
      {article ? (
        <>
          <meta property="article:published_time" content={article.publishedTime} key="article:published_time" />
          <meta
            property="article:modified_time"
            content={article.modifiedTime ?? article.publishedTime}
            key="article:modified_time"
          />
          <meta property="article:author" content={absoluteUrl('/')} key="article:author" />
          {(article.tags ?? []).map((tag) => (
            <meta property="article:tag" content={tag} key={`article:tag:${tag}`} />
          ))}
        </>
      ) : null}

      <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
      <meta name="twitter:site" content={X_HANDLE} key="twitter:site" />
      <meta name="twitter:creator" content={X_HANDLE} key="twitter:creator" />
      <meta name="twitter:title" content={title} key="twitter:title" />
      <meta name="twitter:description" content={description} key="twitter:description" />
      <meta name="twitter:image" content={imageUrl} key="twitter:image" />
      <meta name="twitter:image:alt" content={imageAlt} key="twitter:image:alt" />

      {jsonLd.map((data, i) => (
        <script
          key={`jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
    </Head>
  )
}
