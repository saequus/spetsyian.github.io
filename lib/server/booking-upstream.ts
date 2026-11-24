import type { NextApiResponse } from 'next'

/**
 * Server-only helpers for the booking proxy (used by pages/api/booking/*).
 * The secret is read from a non-public env var and never reaches the browser.
 */
export const UPSTREAM_BASE =
  process.env.BOOKING_API_BASE ||
  process.env.NEXT_PUBLIC_SERPENTARIA_API_BASE ||
  'https://serpentaria-api.up.railway.app'

export function upstreamHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json', ...extra }
  const secret = process.env.BOOKING_API_SECRET
  if (secret) headers['X-Booking-Api-Secret'] = secret
  return headers
}

/** Copy status, Retry-After and JSON body from the upstream response. */
export async function relay(upstream: Response, res: NextApiResponse): Promise<void> {
  const retryAfter = upstream.headers.get('Retry-After')
  if (retryAfter) res.setHeader('Retry-After', retryAfter)
  res.setHeader('Cache-Control', 'no-store')
  // Don't leak upstream auth details to the browser.
  if (upstream.status === 401 || upstream.status === 403) {
    console.error(`booking upstream returned ${upstream.status}; check BOOKING_API_SECRET`)
    res.status(401).json({ error: 'booking_unavailable' })
    return
  }
  const text = await upstream.text()
  let body: unknown = {}
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    body = { error: 'invalid_upstream_response' }
  }
  res.status(upstream.status).json(body)
}

export function fail(res: NextApiResponse, status: number, error: string): void {
  res.setHeader('Cache-Control', 'no-store')
  res.status(status).json({ error })
}
