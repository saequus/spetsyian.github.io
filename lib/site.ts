/**
 * Site-wide constants used for SEO (canonical URLs, Open Graph, JSON-LD).
 *
 * SITE_URL is the canonical origin. spetsyian.com currently 308-redirects to
 * saequus.com (Vercel), and the Google Search Console property is
 * sc-domain:saequus.com, so canonical URLs point at saequus.com.
 * Keep this in sync with scripts/generate-seo-files.mjs.
 */
export const SITE_URL = 'https://saequus.com'

export const SITE_NAME = 'Viachaslau Spetsyian — AI Engineer'

export const AUTHOR_NAME = 'Viachaslau Spetsyian'

export const DEFAULT_OG_IMAGE = '/assets/img/og/default.jpg'

export const DEFAULT_DESCRIPTION =
  'Viachaslau (Slava) Spetsyian — Senior Software & AI Engineer in Warsaw: LLM agents, RAG, evals and LLMOps on production Python backends.'

export const X_HANDLE = '@slava_saequus'

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
