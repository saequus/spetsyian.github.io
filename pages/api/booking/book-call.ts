import type { NextApiRequest, NextApiResponse } from 'next'
import { UPSTREAM_BASE, fail, relay, upstreamHeaders } from '../../../lib/server/booking-upstream'

export const config = { api: { bodyParser: { sizeLimit: '16kb' } } }

const str = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return fail(res, 405, 'method_not_allowed')
  }
  const b = (req.body ?? {}) as Record<string, unknown>
  const valid =
    typeof b.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.date) &&
    typeof b.time === 'string' && /^\d{2}:\d{2}$/.test(b.time) &&
    str(b.name, 200) &&
    typeof b.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) && b.email.length <= 254 &&
    (b.company == null || (typeof b.company === 'string' && b.company.length <= 200)) &&
    (b.comments == null || (typeof b.comments === 'string' && b.comments.length <= 4000)) &&
    (b.lang == null || (typeof b.lang === 'string' && b.lang.length <= 10))
  if (!valid) return fail(res, 400, 'invalid_payload')

  const payload = {
    date: b.date,
    time: b.time,
    name: b.name,
    email: b.email,
    company: b.company ?? null,
    comments: b.comments ?? null,
    lang: b.lang ?? 'en',
  }

  try {
    const upstream = await fetch(`${UPSTREAM_BASE}/api/book-call`, {
      method: 'POST',
      headers: upstreamHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    })
    return relay(upstream, res)
  } catch (e) {
    console.error('booking proxy failed', e)
    return fail(res, 503, 'upstream_unreachable')
  }
}
