import SiteShell from '../../components/SiteShell'
import { PROFILE } from '../../lib/profile'

export default function LinksPage() {
  return (
    <SiteShell
      title="Favorite Links | Slava Saequus"
      description="Resources that have shaped my worldview and aspirations."
      contentClassName="content-wide"
    >
      <header className="links-page-intro">
        <h1>Favorite Links</h1>
        <p className="meta">Last updated: June 2026</p>
        <p>
          Here&apos;s a collection of resources that have shaped my worldview and
          aspirations—if they resonate with you, we&apos;ll likely get along!
        </p>
      </header>

      <article className="liquid-glass liquid-glass--tint glass-block thinker-block">
        <h2>
          <span aria-hidden>{'\u{1F914}'}</span> Thinkers
        </h2>
        <h3>
          <a href="https://nav.al/" target="_blank" rel="noopener noreferrer">
            Naval Ravikant
          </a>
        </h3>
        <p>
          Naval completely changed the way I look at happiness and how I&apos;d
          approach my career. So grounded and authentic.
        </p>
        <p>
          <strong>Check out:</strong>
        </p>
        <ul className="check-list">
          <li>
            <span aria-hidden>{'\u{1F426}'}</span>{' '}
            <a
              href="https://x.com/naval/status/1002103360646823936"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to Get Rich (without getting lucky)
            </a>
          </li>
          <li>
            <span aria-hidden>{'\u{1F399}\u{FE0F}'}</span>{' '}
            <a
              href="https://www.youtube.com/watch?v=3amLsamhtCg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Happiness: a skill that can be cultivated
            </a>
          </li>
          <li>
            <span aria-hidden>{'\u{1F4D6}'}</span>{' '}
            <a
              href="https://www.navalmanack.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Almanack of Naval Ravikant: A Guide to Wealth and Happiness
            </a>
          </li>
        </ul>
      </article>

      <article className="liquid-glass liquid-glass--tint glass-block thinker-block">
        <h2>
          <span aria-hidden>{'\u{1F4BC}'}</span> Professional
        </h2>
        <ul className="check-list">
          <li>
            <a href={PROFILE.linkedIn} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href={PROFILE.x} target="_blank" rel="noopener noreferrer">
              X / Twitter
            </a>
          </li>
        </ul>
      </article>
    </SiteShell>
  )
}