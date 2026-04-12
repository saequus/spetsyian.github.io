import SiteShell from '../components/SiteShell'

export default function Home() {
  return (
    <SiteShell title="Slava Saequus">
      <article className="liquid-glass liquid-glass--tint glass-block">
        <h1>Slava Saequus</h1>
        <p>
          Currently building stuff at{' '}
          <a
            href="https://www.serpentaria.eu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Serpentaria Capital
          </a>
          . I enjoy engineering, financial markets, and somatic work.
        </p>
      </article>

      <article className="liquid-glass liquid-glass--tint glass-block">
        <h2>Now</h2>
        <p>Tinkering here and there in Warsaw, Poland.</p>
      </article>

      <article className="liquid-glass liquid-glass--tint glass-block">
        <h2>Friendcatcher</h2>
        <p>
          Check out my <a href="/links/">favorite links</a> and{' '}
          <a href="https://t.me/spetsyian#" target="_blank" rel="noopener noreferrer">
            blog
          </a>{' '}
          — if any of these resonate, we&apos;d get along.
        </p>
        <p>
          Don&apos;t hesitate to{' '}
          <a
            href="https://x.com/slava_saequus"
            target="_blank"
            rel="noopener noreferrer"
          >
            shoot me a DM
          </a>
          .
        </p>
      </article>
    </SiteShell>
  )
}
