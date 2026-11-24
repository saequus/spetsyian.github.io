import Link from 'next/link'
import SiteShell from '../components/SiteShell'

export default function NotFound() {
  return (
    <SiteShell
      title="Page not found — Viachaslau Spetsyian"
      description="This page does not exist. Go back to the home page or browse the blog."
      path="/404/"
      noindex
    >
      <header className="links-page-intro">
        <h1>Page not found</h1>
        <p>The page you were looking for doesn&apos;t exist or has moved.</p>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/work/">Experience &amp; skills</Link>
          </li>
          <li>
            <Link href="/blog/">Blog</Link>
          </li>
        </ul>
      </header>
    </SiteShell>
  )
}
