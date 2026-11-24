/**
 * Browser-side booking client. Calls same-origin API routes
 * (pages/api/booking/*), which add the secret server-side from the
 * non-public BOOKING_API_SECRET env var. No secret is bundled here.
 */
const AVAILABILITY_URL = '/api/booking/availability/'
const BOOK_CALL_URL = '/api/booking/book-call/'

export const SLOT_LABELS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
] as const

export type SlotLabel = (typeof SLOT_LABELS)[number]

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return toLocalDateString(a) === toLocalDateString(b)
}

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export type AvailabilityResult =
  | { ok: true; slots: Set<string>; mode: 'api' | 'fallback' }
  | { ok: false; code: 401 | 429 | 503 | 'network'; retryAfter?: number }

export async function fetchAvailability(
  dateStr: string,
  signal?: AbortSignal
): Promise<AvailabilityResult> {
  try {
    const res = await fetch(
      `${AVAILABILITY_URL}?date=${encodeURIComponent(dateStr)}`,
      { signal }
    )

    if (res.status === 401) {
      return { ok: false, code: 401 }
    }
    if (res.status === 429) {
      const ra = res.headers.get('Retry-After')
      return {
        ok: false,
        code: 429,
        retryAfter: ra ? parseInt(ra, 10) : undefined,
      }
    }
    if (res.status === 503) {
      return { ok: false, code: 503 }
    }
    if (!res.ok) {
      return { ok: true, slots: new Set(SLOT_LABELS), mode: 'fallback' }
    }

    const data = (await res.json()) as { available_slots?: string[] }
    const list = Array.isArray(data.available_slots) ? data.available_slots : []
    return { ok: true, slots: new Set(list), mode: 'api' }
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      (e as Error).name === 'AbortError'
    ) {
      throw e
    }
    return { ok: true, slots: new Set(SLOT_LABELS), mode: 'fallback' }
  }
}

export type BookCallPayload = {
  date: string
  time: string
  name: string
  email: string
  company: string | null
  comments: string | null
  lang: string
}

export async function bookCall(
  body: BookCallPayload
): Promise<
  | { ok: true; message?: string }
  | { ok: false; code: number; retryAfter?: number }
> {
  const res = await fetch(BOOK_CALL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (res.status === 429) {
    const ra = res.headers.get('Retry-After')
    return {
      ok: false,
      code: 429,
      retryAfter: ra ? parseInt(ra, 10) : undefined,
    }
  }

  if (!res.ok) {
    return { ok: false, code: res.status }
  }

  let data: { success?: boolean; message?: string }
  try {
    data = (await res.json()) as { success?: boolean; message?: string }
  } catch {
    return { ok: false, code: res.status }
  }
  if (data.success === true) {
    return { ok: true, message: data.message }
  }
  return { ok: false, code: res.status }
}
