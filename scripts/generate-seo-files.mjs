#!/usr/bin/env node
/**
 * Writes public/robots.txt, public/sitemap.xml, public/feed.xml (RSS 2.0)
 * and public/atom.xml from content/blog/*.md. Runs automatically before
 * `next build` (see "prebuild" in package.json).
 *
 * When you materially change a static page, bump its lastmod below.
 */
import fs from 'node:fs'
import path from 'node:path'

const SITE_URL = 'https://saequus.com' // keep in sync with lib/site.ts
const AUTHOR = 'Viachaslau Spetsyian'
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const BLOG_DIR = path.join(ROOT, 'content', 'blog')
const PUBLIC_DIR = path.join(ROOT, 'public')

const STATIC_PAGES = [
  { path: '/', lastmod: '2026-11-24', changefreq: 'monthly', priority: '1.0' },
  { path: '/work/', lastmod: '2026-11-24', changefreq: 'monthly', priority: '0.9' },
  { path: '/blog/', lastmod: null, changefreq: 'weekly', priority: '0.8' },
  { path: '/projects/', lastmod: '2026-11-24', changefreq: 'monthly', priority: '0.7' },
  { path: '/links/', lastmod: '2026-11-24', changefreq: 'monthly', priority: '0.5' },
  { path: '/calendar/', lastmod: '2026-11-24', changefreq: 'monthly', priority: '0.5' },
]

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function readPosts() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
      const m = raw.match(/^---\n([\s\S]*?)\n---/)
      if (!m) throw new Error(`Missing frontmatter in ${file}`)
      const data = {}
      for (const line of m[1].split('\n')) {
        const kv = line.match(/^(\w+):\s*(.*)$/)
        if (kv) data[kv[1]] = kv[2].replace(/^['"]|['"]$/g, '')
      }
      const slug = data.slug || file.replace(/\.md$/, '')
      const tags = (data.tags || '').replace(/^\[|\]$/g, '').split(',').map((t) => t.trim()).filter(Boolean)
      for (const key of ['title', 'description', 'date']) {
        if (!data[key]) throw new Error(`${file}: missing "${key}"`)
      }
      return { ...data, slug, tags, url: `${SITE_URL}/blog/${slug}/` }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

const posts = readPosts()
const latest = posts.length ? posts[0].updated || posts[0].date : '2026-11-24'
const iso = (d) => `${d}T09:00:00+01:00`

// sitemap.xml
const urls = [
  ...STATIC_PAGES.map((p) => ({ ...p, loc: `${SITE_URL}${p.path}`, lastmod: p.lastmod || latest })),
  ...posts.map((p) => ({ loc: p.url, lastmod: p.updated || p.date, changefreq: 'yearly', priority: '0.7' })),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

// robots.txt
const robots = `# https://www.robotstxt.org/
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

// RSS 2.0
const rfc822 = (d) => new Date(iso(d)).toUTCString()
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(AUTHOR)} — Blog</title>
    <link>${SITE_URL}/blog/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Practical AI engineering: RAG, evaluation, agents and LLMOps.</description>
    <language>en</language>
    <lastBuildDate>${rfc822(latest)}</lastBuildDate>
${posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${p.url}</link>
      <guid isPermaLink="true">${p.url}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <dc:creator>${esc(AUTHOR)}</dc:creator>
      <description>${esc(p.description)}</description>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`

// Atom
const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>${esc(AUTHOR)} — Blog</title>
  <subtitle>Practical AI engineering: RAG, evaluation, agents and LLMOps.</subtitle>
  <link href="${SITE_URL}/blog/" rel="alternate" type="text/html" />
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml" />
  <id>${SITE_URL}/blog/</id>
  <updated>${iso(latest)}</updated>
  <author><name>${esc(AUTHOR)}</name><uri>${SITE_URL}/</uri></author>
${posts
  .map(
    (p) => `  <entry>
    <title>${esc(p.title)}</title>
    <link href="${p.url}" rel="alternate" type="text/html" />
    <id>${p.url}</id>
    <published>${iso(p.date)}</published>
    <updated>${iso(p.updated || p.date)}</updated>
    <summary>${esc(p.description)}</summary>
${p.tags.map((t) => `    <category term="${esc(t)}" />`).join('\n')}
  </entry>`
  )
  .join('\n')}
</feed>
`

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap)
fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots)
fs.writeFileSync(path.join(PUBLIC_DIR, 'feed.xml'), rss)
fs.writeFileSync(path.join(PUBLIC_DIR, 'atom.xml'), atom)
console.log(`SEO files written: ${urls.length} sitemap URLs, ${posts.length} feed entries`)
