/**
 * Tiny build-time Markdown renderer for blog posts.
 *
 * Supports the subset used in content/blog: ATX headings (##–####), paragraphs,
 * fenced code blocks, ordered/unordered lists (one level), blockquotes, tables,
 * horizontal rules, and inline code / bold / italic / links.
 * Runs only inside getStaticProps, so nothing here ships to the browser.
 */

export type Heading = { depth: number; text: string; id: string }

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function renderInline(src: string): string {
  // Pull out inline code first so its content is not formatted.
  const codes: string[] = []
  let s = src.replace(/`([^`]+)`/g, (_, c: string) => {
    codes.push(`<code>${escapeHtml(c)}</code>`)
    return `\u0000${codes.length - 1}\u0000`
  })
  s = escapeHtml(s)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, href: string) => {
    const external = /^https?:\/\//.test(href)
    const rel = external ? ' rel="noopener noreferrer"' : ''
    return `<a href="${href}"${rel}>${text}</a>`
  })
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)])
  return s
}

function stripInline(src: string): string {
  return src.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}

export function renderMarkdown(md: string): { html: string; headings: Heading[] } {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  const headings: Heading[] = []
  const usedIds = new Set<string>()
  let i = 0

  const isBlockStart = (l: string) =>
    /^(#{2,4})\s/.test(l) ||
    /^```/.test(l) ||
    /^\s*[-*]\s+/.test(l) ||
    /^\s*\d+\.\s+/.test(l) ||
    /^>\s?/.test(l) ||
    /^\|/.test(l) ||
    /^---\s*$/.test(l)

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    const fence = line.match(/^```(\w+)?\s*$/)
    if (fence) {
      const lang = fence[1] ?? ''
      const body: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i])
        i++
      }
      i++ // closing fence
      const cls = lang ? ` class="language-${lang}"` : ''
      const label = lang ? ` data-lang="${lang}"` : ''
      out.push(`<pre${label}><code${cls}>${escapeHtml(body.join('\n'))}</code></pre>`)
      continue
    }

    const h = line.match(/^(#{2,4})\s+(.*)$/)
    if (h) {
      const depth = h[1].length
      const text = h[2].trim()
      let id = slugify(stripInline(text)) || `section-${headings.length + 1}`
      while (usedIds.has(id)) id = `${id}-x`
      usedIds.add(id)
      headings.push({ depth, text: stripInline(text), id })
      out.push(`<h${depth} id="${id}">${renderInline(text)}</h${depth}>`)
      i++
      continue
    }

    if (/^---\s*$/.test(line)) {
      out.push('<hr />')
      i++
      continue
    }

    if (/^>\s?/.test(line)) {
      const body: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      out.push(`<blockquote><p>${renderInline(body.join(' '))}</p></blockquote>`)
      continue
    }

    if (/^\|/.test(line)) {
      const rows: string[][] = []
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(
          lines[i]
            .trim()
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((c) => c.trim())
        )
        i++
      }
      const [head, sep, ...body] = rows
      const hasSep = sep && sep.every((c) => /^:?-{2,}:?$/.test(c))
      const bodyRows = hasSep ? body : rows.slice(1)
      out.push(
        '<div class="table-wrap"><table><thead><tr>' +
          head.map((c) => `<th scope="col">${renderInline(c)}</th>`).join('') +
          '</tr></thead><tbody>' +
          bodyRows
            .map((r) => '<tr>' + r.map((c) => `<td>${renderInline(c)}</td>`).join('') + '</tr>')
            .join('') +
          '</tbody></table></div>'
      )
      continue
    }

    const ul = /^\s*[-*]\s+/
    const ol = /^\s*\d+\.\s+/
    if (ul.test(line) || ol.test(line)) {
      const ordered = ol.test(line)
      const re = ordered ? ol : ul
      const items: string[] = []
      while (i < lines.length && (re.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        if (re.test(lines[i])) items.push(lines[i].replace(re, ''))
        else items[items.length - 1] += ` ${lines[i].trim()}`
        i++
      }
      const tag = ordered ? 'ol' : 'ul'
      out.push(`<${tag}>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</${tag}>`)
      continue
    }

    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      para.push(lines[i].trim())
      i++
    }
    out.push(`<p>${renderInline(para.join(' '))}</p>`)
  }

  return { html: out.join('\n'), headings }
}

export function countWords(md: string): number {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}
