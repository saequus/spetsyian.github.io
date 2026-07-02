import dynamic from 'next/dynamic'
import SiteShell from '../../components/SiteShell'

const BookCallBooking = dynamic(
  () => import('../../components/book-call/BookCallBooking'),
  {
    loading: () => (
      <p className="book-call-loading" role="status">
        Loading calendar…
      </p>
    ),
    ssr: false,
  }
)

export default function CalendarPage() {
  return (
    <SiteShell
      title="Book a call | Slava Saequus"
      description="Schedule a call — pick a date and time (CET)."
      contentClassName="content-booking"
      scrollNavCollapse={false}
    >
      <header className="calendar-page-intro">
        <h1>Book a call</h1>
        <p className="calendar-page-lead">
          Choose an open slot. Availability updates when you pick a date.
        </p>
      </header>
      <BookCallBooking />
    </SiteShell>
  )
}