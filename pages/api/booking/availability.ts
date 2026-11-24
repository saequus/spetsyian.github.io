import type { NextApiRequest, NextApiResponse } from 'next'
import { UPSTREAM_BASE, fail, relay, upstreamHeaders } from '../../../lib/server/booking-upstream'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return fail(res, 405, 'method_not_allowed')
  }
  const date = String(req.query.date ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(res, 400, 'invalid_date')

  try {
    const upstream = await fetch(
      `${UPSTREAM_BASE}/api/availability?date=${encodeURIComponent(date)}`,
      { headers: upstreamHeaders(), signal: AbortSignal.timeout(10_000) }
    )
    return relay(upstream, res)
  } catch (e) {
    console.error('booking availability proxy failed', e)
    return fail(res, 503, 'upstream_unreachable')
  }
}
