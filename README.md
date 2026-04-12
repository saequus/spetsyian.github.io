# spetsyian.github.io

Personal site for **Slava Saequus**, built with [Next.js](https://nextjs.org/) and exported as static HTML for [GitHub Pages](https://pages.github.com/).

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
| `npm run build` | Production build; static files are written to `out/` |
| `npm run typecheck` | TypeScript check only |

To preview the **static** build locally (what GitHub Pages serves), run `npm run build`, then:

```bash
npx serve@latest out
```

Open the URL it prints (usually [http://localhost:3000](http://localhost:3000)).

For GitHub Pages, publish the contents of `out/` after a successful `npm run build` (same flow as your existing deployment).
