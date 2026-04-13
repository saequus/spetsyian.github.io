import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  BOOKING_API_SECRET,
  SLOT_LABELS,
  bookCall,
  fetchAvailability,
  startOfLocalDay,
  toLocalDateString,
  isSameLocalDay,
  type SlotLabel,
} from '../../lib/booking-api'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function monthMatrix(year: number, monthIndex: number): (number | null)[][] {
  const first = new Date(year, monthIndex, 1)
  const startingDay = first.getDay()
  const lead = startingDay === 0 ? 6 : startingDay - 1
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  const rows: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }
  while (rows.length > 0 && rows[rows.length - 1].every((c) => c === null)) {
    rows.pop()
  }
  return rows
}

function isPastDay(year: number, monthIndex: number, day: number): boolean {
  const t = startOfLocalDay(new Date())
  const cell = new Date(year, monthIndex, day)
  return startOfLocalDay(cell).getTime() < t.getTime()
}

function isTodayDay(year: number, monthIndex: number, day: number): boolean {
  return isSameLocalDay(new Date(), new Date(year, monthIndex, day))
}

function simpleEmailOk(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

export default function BookCallBooking() {
  const today = useMemo(() => startOfLocalDay(new Date()), [])
  const [view, setView] = useState(() => ({
    y: today.getFullYear(),
    m: today.getMonth(),
  }))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<SlotLabel | null>(null)

  const [available, setAvailable] = useState<Set<string>>(() => new Set())
  const [availMode, setAvailMode] = useState<'idle' | 'api' | 'fallback'>(
    'idle'
  )
  const [availLoading, setAvailLoading] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [rateInfo, setRateInfo] = useState<string | null>(null)
  const [fallbackNote, setFallbackNote] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [comments, setComments] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    date: string
    time: string
    email: string
  } | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const loadAvailability = useCallback(async (d: Date) => {
    const dateStr = toLocalDateString(d)
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setAvailLoading(true)
    setAuthError(false)
    setRateInfo(null)
    setFallbackNote(false)

    let result: Awaited<ReturnType<typeof fetchAvailability>>
    try {
      result = await fetchAvailability(dateStr, ac.signal)
    } catch {
      if (ac.signal.aborted) return
      setAvailLoading(false)
      setAvailable(new Set(SLOT_LABELS))
      setAvailMode('fallback')
      setFallbackNote(true)
      return
    }
    if (ac.signal.aborted) return

    setAvailLoading(false)

    if (!result.ok) {
      if (result.code === 401) {
        setAuthError(true)
        setAvailable(new Set())
        setAvailMode('idle')
        return
      }
      if (result.code === 429) {
        const wait = result.retryAfter
        setRateInfo(
          wait
            ? `Too many requests. Retry in about ${wait}s.`
            : 'Too many requests. Please wait a minute and try again.'
        )
        setAvailable(new Set(SLOT_LABELS))
        setAvailMode('fallback')
        setFallbackNote(true)
        return
      }
      setAvailable(new Set(SLOT_LABELS))
      setAvailMode('fallback')
      setFallbackNote(true)
      return
    }

    setAvailMode(result.mode)
    if (result.mode === 'fallback') {
      setFallbackNote(true)
    }
    setAvailable(result.slots)
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    void loadAvailability(selectedDate)
  }, [selectedDate, loadAvailability])

  useEffect(() => {
    if (!selectedTime || !selectedDate) return
    const dateStr = toLocalDateString(selectedDate)
    if (availMode === 'idle' && !availLoading) return
    if (availMode === 'api' && !available.has(selectedTime)) {
      setSelectedTime(null)
    }
  }, [available, selectedTime, selectedDate, availMode, availLoading])

  const matrix = useMemo(
    () => monthMatrix(view.y, view.m),
    [view.y, view.m]
  )

  const canGoPrevMonth = useMemo(() => {
    const first = new Date(view.y, view.m, 1)
    return first > new Date(today.getFullYear(), today.getMonth(), 1)
  }, [view.y, view.m, today])

  const selectDay = (day: number) => {
    const d = new Date(view.y, view.m, day)
    if (isPastDay(view.y, view.m, day)) return
    setSelectedTime(null)
    setSelectedDate(d)
  }

  const slotEnabled = (slot: SlotLabel): boolean => {
    if (authError) return false
    if (availLoading) return false
    if (availMode === 'fallback') return true
    if (availMode === 'api') return available.has(slot)
    return false
  }

  const formValid =
    selectedDate &&
    selectedTime &&
    name.trim().length > 0 &&
    simpleEmailOk(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formValid || !selectedDate || !selectedTime) return
    setSubmitting(true)
    setSubmitError(null)
    const res = await bookCall({
      date: toLocalDateString(selectedDate),
      time: selectedTime,
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || null,
      comments: comments.trim() || null,
      lang: 'en',
    })
    setSubmitting(false)
    if (res.ok) {
      setSuccess({
        date: toLocalDateString(selectedDate),
        time: selectedTime,
        email: email.trim(),
      })
      return
    }
    if (res.code === 401) {
      setSubmitError(
        'Booking API rejected the request (401). Check NEXT_PUBLIC_BOOKING_API_SECRET if production requires it.'
      )
      return
    }
    if (res.code === 429) {
      setSubmitError(
        res.retryAfter
          ? `Rate limited. Retry in about ${res.retryAfter}s.`
          : 'Rate limited. Please wait and try again.'
      )
      return
    }
    setSubmitError('Submission failed. Please try again later.')
  }

  if (success) {
    return (
      <div className="book-call-page">
        <div className="liquid-glass liquid-glass--tint glass-block book-call-panel book-call-panel--enter">
          <div className="book-call-success">
            <h2>You&apos;re booked</h2>
            <p>
              <strong>{success.date}</strong> at{' '}
              <strong>{success.time} CET</strong>.
              <br />
              We&apos;ll use <strong>{success.email}</strong> for confirmation.
            </p>
            <Link href="/" className="book-call-link-btn">
              Back home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="book-call-page book-call-layout">
      <section
        className="liquid-glass liquid-glass--tint glass-block book-call-panel book-call-panel--enter"
        aria-label="Choose date"
      >
        <h2>Date</h2>
        {authError ? (
          <div className="book-call-alert book-call-alert--error">
            API returned 401 — missing or invalid{' '}
            <code>X-Booking-Api-Secret</code>. Set{' '}
            <code>NEXT_PUBLIC_BOOKING_API_SECRET</code> for this deployment (or
            ask the operator if the server requires it).
          </div>
        ) : null}
        {rateInfo ? (
          <div className="book-call-alert book-call-alert--warn">{rateInfo}</div>
        ) : null}
        {fallbackNote && !authError ? (
          <div className="book-call-alert book-call-alert--info">
            Availability could not be loaded; all slots are shown — the server is
            still authoritative when you book.
          </div>
        ) : null}
        <div className="book-call-cal-nav">
          <button
            type="button"
            className="book-call-icon-btn"
            aria-label="Previous month"
            disabled={!canGoPrevMonth}
            onClick={() =>
              setView((v) => {
                const nm = v.m - 1
                if (nm < 0) return { y: v.y - 1, m: 11 }
                return { y: v.y, m: nm }
              })
            }
          >
            <ChevronLeft size={22} strokeWidth={1.75} />
          </button>
          <h3>
            {new Date(view.y, view.m, 1).toLocaleString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <button
            type="button"
            className="book-call-icon-btn"
            aria-label="Next month"
            onClick={() =>
              setView((v) => {
                const nm = v.m + 1
                if (nm > 11) return { y: v.y + 1, m: 0 }
                return { y: v.y, m: nm }
              })
            }
          >
            <ChevronRight size={22} strokeWidth={1.75} />
          </button>
        </div>
        <div className="book-call-weekdays">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="book-call-day-grid" role="grid" aria-label="Calendar">
          {matrix.map((row, ri) => (
            <div key={ri} role="row" style={{ display: 'contents' }}>
              {row.map((day, ci) => {
                if (day === null) {
                  return (
                    <span
                      key={`e-${ri}-${ci}`}
                      className="book-call-day book-call-day--muted"
                      aria-hidden
                    />
                  )
                }
                const past = isPastDay(view.y, view.m, day)
                const sel =
                  selectedDate &&
                  isSameLocalDay(selectedDate, new Date(view.y, view.m, day))
                const tday = isTodayDay(view.y, view.m, day)
                return (
                  <button
                    key={day}
                    type="button"
                    role="gridcell"
                    className={`book-call-day${sel ? ' book-call-day--selected' : ''}${tday ? ' book-call-day--today' : ''}`}
                    disabled={past}
                    onClick={() => selectDay(day)}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </section>

      <section
        className="liquid-glass liquid-glass--tint glass-block book-call-panel book-call-panel--enter"
        aria-label="Choose time"
      >
        <h2>Time (CET)</h2>
        {availLoading ? (
          <p className="book-call-loading">Loading availability…</p>
        ) : null}
        {!selectedDate ? (
          <p className="book-call-loading">Select a date first.</p>
        ) : null}
        <div className="book-call-slots" role="group" aria-label="Time slots">
          {SLOT_LABELS.map((slot) => {
            const en = slotEnabled(slot)
            const apiEmpty =
              availMode === 'api' &&
              !availLoading &&
              !authError &&
              available.size === 0
            const disabled =
              !selectedDate || authError || availLoading || apiEmpty || !en
            const sel = selectedTime === slot
            return (
              <button
                key={slot}
                type="button"
                className={`book-call-slot${sel ? ' book-call-slot--selected' : ''}`}
                disabled={disabled}
                onClick={() => setSelectedTime(slot)}
              >
                {slot}
              </button>
            )
          })}
        </div>
        <p className="book-call-slots-note">
          Each slot is up to one hour. Times are shown in{' '}
          <strong>CET</strong> (Central European Time).
        </p>
      </section>

      <section
        className="liquid-glass liquid-glass--tint glass-block book-call-panel book-call-panel--enter"
        aria-label="Your details"
      >
        <h2>Details</h2>
        <form className="book-call-form" onSubmit={handleSubmit}>
          <label htmlFor="bc-name" className="req">
            Name
          </label>
          <input
            id="bc-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="bc-email" className="req">
            Email
          </label>
          <input
            id="bc-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="bc-company">Company</label>
          <input
            id="bc-company"
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <label htmlFor="bc-comments">Comments</label>
          <textarea
            id="bc-comments"
            name="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
          <div className="book-call-summary" aria-live="polite">
            {selectedDate && selectedTime ? (
              <>
                <strong>Selected:</strong>{' '}
                {toLocalDateString(selectedDate)} at {selectedTime} CET
              </>
            ) : (
              <>Select a date and time to continue.</>
            )}
          </div>
          {submitError ? (
            <div className="book-call-alert book-call-alert--error">
              {submitError}
            </div>
          ) : null}
          {!BOOKING_API_SECRET ? (
            <div className="book-call-alert book-call-alert--info">
              Tip: if the API returns 401 in production, set{' '}
              <code>NEXT_PUBLIC_BOOKING_API_SECRET</code> before build.
            </div>
          ) : null}
          <button
            type="submit"
            className="book-call-submit"
            disabled={!formValid || submitting || authError}
          >
            {submitting ? 'Booking…' : 'Book call'}
          </button>
        </form>
      </section>
    </div>
  )
}
