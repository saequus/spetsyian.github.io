import SiteShell from '../components/SiteShell'
import { IDENTITY, PROFILE, SERPENTARIA } from '../lib/profile'

const salesAmplifier = SERPENTARIA.ventures[0]

export default function Home() {
  return (
    <SiteShell title="Slava Saequus">
      <div className="home-page">
        {/* Premium Hero Glass Plaque — inspired by aurō + SF refs */}
        <section className="hero-glass">
          <div className="hero-mark" aria-hidden>
            <img
              className="hero-avatar"
              src="/assets/img/session-ava-2025.jpg"
              alt=""
              width={260}
              height={313}
              decoding="async"
            />
          </div>
          <h1>{PROFILE.name}</h1>
          <p className="hero-subtitle">
            {PROFILE.title}
          </p>
          <p className="hero-meta">
            Building projects at{' '}
            <a href={SERPENTARIA.href} target="_blank" rel="noopener noreferrer">
              Serpentaria Capital
            </a>
            :{' '}
            <a href={salesAmplifier.href} target="_blank" rel="noopener noreferrer">
              SalesAmplifier
            </a>
            · {PROFILE.location}
          </p>
        </section>

        <section className="glass-statement">
          <p>
            {PROFILE.tagline} I work across engineering, financial markets, and somatic practices.
          </p>
        </section>

        <section>
          <h2>Now</h2>
          <p>
            Leading platform engineering. Currently shaping{' '}
            <a href={salesAmplifier.href} target="_blank" rel="noopener noreferrer">
              {salesAmplifier.name}
            </a>{' '}
            and building at{' '}
            <a href={SERPENTARIA.href} target="_blank" rel="noopener noreferrer">
              Serpentaria Capital
            </a>
            . Previously at{' '}
            <a
              href="https://il.linkedin.com/company/razor-technologies-inc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Razor Labs
            </a>
            .
          </p>
          <p>
            See <a href="/work/">full work</a> and <a href="/projects/">projects</a>.
          </p>
        </section>

        <section className="identity">
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
            A few things that matter to me live in <a href="/links/">favorite links</a> and on my{' '}
            <a href="https://t.me/spetsyian#" target="_blank" rel="noopener noreferrer">
              blog
            </a>
            . If any of it resonates, we’ll probably get along.
          </p>
          <p className="final-cta">
            Reach me on{' '}
            <a href={PROFILE.x} target="_blank" rel="noopener noreferrer">X</a>{' '}
            or <a href={PROFILE.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn</a>.
          </p>
        </section>
      </div>
    </SiteShell>
  )
}