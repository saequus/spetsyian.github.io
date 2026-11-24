# spetsyian.github.io

Personal site of **Viachaslau (Slava) Spetsyian** — AI Engineer — built with [Next.js](https://nextjs.org/) (Pages Router). Content pages are statically generated; a small server-side API route proxies the booking calendar. Live at https://saequus.com (spetsyian.com redirects there).

## Run locally

You need a current [Node.js](https://nodejs.org/) LTS version (18 or newer is fine).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

The dev server hot-reloads when you edit pages or styles.

## Other commands

| Command | Purpose |
|--------|---------|
| `npm run build` | Production build (regenerates SEO files, then `next build`) |
| `npm run typecheck` | TypeScript check only |

## Deployment

Deployed on Vercel (project `saequus-com`) as a regular Next.js app. `output: 'export'` was removed so that
`pages/api/booking/*` can run server-side: they forward availability/booking requests to the Serpentaria API and add
the `X-Booking-Api-Secret` header from the **server-only** env var `BOOKING_API_SECRET` (optional `BOOKING_API_BASE`
overrides the upstream URL). Never expose this secret via a `NEXT_PUBLIC_*` variable.
## Blog posts

Posts live in `content/blog/*.md` with a small frontmatter block:

```md
---
title: Full article title (used for the H1)
description: 140–160 character summary (meta description, RSS, lede)
seoTitle: Shorter title for <title> (optional, ≤ 60 chars)
date: 2026-06-16
tags: [RAG, LLMOps]
---
```

Markdown is rendered at build time by `lib/markdown.ts` (headings, lists, code fences, tables, links) — no runtime dependency.
Open Graph cards for posts are generated with `python3 scripts/make-og-images.py` (add the slug to `CARDS` first).

## SEO files

`npm run build` first runs `scripts/generate-seo-files.mjs`, which writes `public/sitemap.xml`, `public/robots.txt`,
`public/feed.xml` (RSS) and `public/atom.xml` from the post list. Run `npm run seo` to regenerate them without a full build.
Canonical origin is set in `lib/site.ts` (`SITE_URL`) and in the script — keep both in sync.
Per-page `<title>`, description, canonical, Open Graph/Twitter tags and JSON-LD come from `components/Seo.tsx` via `SiteShell` props.
