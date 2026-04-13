import SiteShell from '../../components/SiteShell'
import BookCallBooking from '../../components/book-call/BookCallBooking'

export default function CalendarPage() {
  return (
    <SiteShell
      title="Book a call | Slava Saequus"
      description="Schedule a call — pick a date and time (CET)."
      contentClassName="content-booking"
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
