import SiteShell from '../components/SiteShell'
import { IDENTITY, PROFILE, SERPENTARIA } from '../lib/profile'

const salesAmplifier = SERPENTARIA.ventures[0]

export default function Home() {
  return (
    <SiteShell title="Slava Saequus">
      <div className="home-page">
        <section>
          <h1>{PROFILE.name}</h1>
          <p>
            {PROFILE.title} working at{' '}
            <a href={SERPENTARIA.href} target="_blank" rel="noopener noreferrer">
              Serpentaria Capital
            </a>
            , building{' '}
            <a
              href={salesAmplifier.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {salesAmplifier.name}
            </a>
            . Previously at{' '}
            <a
              href="https://il.linkedin.com/company/razor-technologies-inc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Razor Labs
            </a>
            . {PROFILE.tagline} I enjoy {PROFILE.interests.join(', ')}.
          </p>
        </section>

        <section>
          <h2>Now</h2>
          <p>
            Leading platform engineering in {PROFILE.location}. See{' '}
            <a href="/work/">work</a> and <a href="/projects/">projects</a> for
            more detail.
          </p>
        </section>

        <section>
          <h2>Identity</h2>
          {IDENTITY.map((item) => (
            <p key={item.label}>
              <strong>{item.label}:</strong> {item.value}
            </p>
          ))}
        </section>

        <section>
          <h2>Friendcatcher</h2>
          <p>
            Check out my <a href="/links/">favorite links</a> and{' '}
            <a
              href="https://t.me/spetsyian#"
              target="_blank"
              rel="noopener noreferrer"
            >
              blog
            </a>{' '}
            — if any of these resonate, we&apos;d get along.
          </p>
          <p>
            Don&apos;t hesitate to{' '}
            <a href={PROFILE.x} target="_blank" rel="noopener noreferrer">
              shoot me a DM
            </a>{' '}
            or connect on{' '}
            <a href={PROFILE.linkedIn} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            .
          </p>
        </section>
        <div className="home-page-spacer" aria-hidden />
      </div>
    </SiteShell>
  )
}