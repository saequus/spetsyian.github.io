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
      title="Book a call — Viachaslau Spetsyian"
      description="Book a call with Viachaslau (Slava) Spetsyian, AI Engineer in Warsaw. Pick an open date and time (CET)."
      path="/calendar/"
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
      <noscript>
        <p>
          The booking calendar needs JavaScript. You can also reach me on{' '}
          <a href="https://www.linkedin.com/in/spetsyian/">LinkedIn</a> or by email at{' '}
          <a href="mailto:slava@spetsyian.com">slava@spetsyian.com</a>.
        </p>
      </noscript>
    </SiteShell>
  )
}