import fs from 'fs'
import path from 'path'
import { countWords, renderMarkdown, type Heading } from './markdown'

/** Server-only helpers (fs). Import only from getStaticProps / getStaticPaths. */

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export type PostMeta = {
  slug: string
  title: string
  seoTitle: string
  description: string
  date: string // YYYY-MM-DD
  updated?: string
  tags: string[]
  readingMinutes: number
  wordCount: number
}

export type Post = PostMeta & { html: string; headings: Heading[] }

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) throw new Error('Missing frontmatter')
  const data: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) data[kv[1]] = kv[2].replace(/^['"]|['"]$/g, '')
  }
  return { data, body: m[2] }
}

function readPost(file: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
  const { data, body } = parseFrontmatter(raw)
  const slug = data.slug || file.replace(/\.md$/, '')
  const tags = (data.tags || '')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  const wordCount = countWords(body)
  const { html, headings } = renderMarkdown(body)
  return {
    slug,
    title: data.title,
    seoTitle: data.seoTitle || data.title,
    description: data.description,
    date: data.date,
    ...(data.updated ? { updated: data.updated } : {}),
    tags,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / 220)),
    html,
    headings,
  }
}

export function getAllPosts(): Post[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map(readPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getAllPostMeta(): PostMeta[] {
  return getAllPosts().map(({ html: _h, headings: _hd, ...meta }) => meta)
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug)
}
