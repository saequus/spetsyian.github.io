import type { JsonLd } from '../components/Seo'
import { EDUCATION, PROFILE, SERPENTARIA } from './profile'
import { AUTHOR_NAME, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from './site'

export const PERSON_ID = `${SITE_URL}/#person`
export const WEBSITE_ID = `${SITE_URL}/#website`

export function personSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: AUTHOR_NAME,
    givenName: 'Viachaslau',
    familyName: 'Spetsyian',
    alternateName: ['Slava Spetsyian', 'Slava Saequus', 'saequus'],
    jobTitle: PROFILE.title,
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/`,
    image: absoluteUrl('/assets/img/session-ava-2025-560.jpg'),
    email: `mailto:${PROFILE.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Warsaw',
      addressCountry: 'PL',
    },
    worksFor: {
      '@type': 'Organization',
      name: 'Serpentaria Capital',
      url: SERPENTARIA.href,
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: EDUCATION.school,
    },
    knowsLanguage: ['en', 'pl', 'ru'],
    knowsAbout: [
      'Large language models',
      'Retrieval-augmented generation',
      'AI agents',
      'Tool calling',
      'LLM evaluation',
      'LLMOps',
      'MLOps',
      'Model serving',
      'Python',
      'FastAPI',
      'PostgreSQL',
      'pgvector',
      'Qdrant',
      'Kubernetes',
      'Google Cloud Platform',
    ],
    sameAs: [PROFILE.linkedIn, PROFILE.github, PROFILE.x, PROFILE.medium],
  }
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en',
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  }
}

export function profilePageSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}/#profilepage`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': PERSON_ID },
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function blogPostingSchema(post: {
  slug: string
  title: string
  description: string
  date: string
  updated?: string
  tags: string[]
  wordCount: number
}): JsonLd {
  const url = absoluteUrl(`/blog/${post.slug}/`)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline: post.title,
    description: post.description,
    image: absoluteUrl(`/assets/img/og/${post.slug}.jpg`),
    datePublished: `${post.date}T09:00:00+01:00`,
    dateModified: `${post.updated ?? post.date}T09:00:00+01:00`,
    inLanguage: 'en',
    keywords: post.tags.join(', '),
    wordCount: post.wordCount,
    author: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: AUTHOR_NAME,
      url: `${SITE_URL}/`,
    },
    publisher: { '@id': PERSON_ID },
    isPartOf: { '@id': `${SITE_URL}/blog/#blog` },
  }
}

export function blogSchema(posts: { slug: string; title: string; date: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog/#blog`,
    url: absoluteUrl('/blog/'),
    name: `Blog — ${AUTHOR_NAME}`,
    description: 'Practical notes on building LLM applications: RAG, evaluation, agents and LLMOps.',
    inLanguage: 'en',
    author: { '@id': PERSON_ID },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}/`),
      datePublished: p.date,
    })),
  }
}
