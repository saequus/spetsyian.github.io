import type { GetStaticProps } from 'next'
import { Briefcase, CalendarDays, FileText, Github, Linkedin } from 'lucide-react'
import Link from 'next/link'
import SiteShell from '../components/SiteShell'
import type { PostMeta } from '../lib/blog'
import { formatDate } from '../lib/format'
import { FOCUS_AREAS, HIGHLIGHTS, PROFILE, SERPENTARIA } from '../lib/profile'
import { personSchema, profilePageSchema, websiteSchema } from '../lib/schema'

type Props = { posts: PostMeta[] }

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { getAllPostMeta } = await import('../lib/blog')
  return { props: { posts: getAllPostMeta().slice(0, 3) } }
}

export default function Home({ posts }: Props) {
  return (
    <SiteShell
      title="Viachaslau Spetsyian — AI Engineer (LLMs, RAG, Agents) in Warsaw"
      description="Viachaslau (Slava) Spetsyian — Senior Software & AI Engineer in Warsaw. I build LLM agents, RAG pipelines, evals and LLMOps on production Python backends."
      path="/"
      ogType="profile"
      image="/assets/img/og/default.jpg"
      imageAlt="Viachaslau Spetsyian — AI Engineer"
      jsonLd={[personSchema(), websiteSchema(), profilePageSchema()]}
    >
      <div className="home-page">
        <section className="hero-glass hero-split" aria-labelledby="hero-title">
          <div className="hero-mark">
            <picture>
              <source srcSet="/assets/img/session-ava-2025-560.webp" type="image/webp" />
              <img
                className="hero-avatar"
                src="/assets/img/session-ava-2025-560.jpg"
                alt="Portrait of Viachaslau Spetsyian"
                width={220}
                height={220}
                decoding="async"
                fetchPriority="high"
              />
            </picture>
          </div>
          <div className="hero-text">
            <p className="hero-eyebrow">Senior Software &amp; AI Engineer · {PROFILE.location}</p>
            <h1 id="hero-title">
              {PROFILE.name}
              <span className="hero-aka"> (Slava)</span>
            </h1>
            <p className="hero-subtitle">{PROFILE.headline}</p>
            <p className="hero-meta">
              Founder of{' '}
              <a href={SERPENTARIA.href} target="_blank" rel="noopener noreferrer">
                Serpentaria Capital
              </a>{' '}
              · ex-Razor Labs, ZAGENO
            </p>
            <ul className="hero-actions" aria-label="Profiles and contact">
              <li>
                <a className="hero-btn hero-btn--primary" href={PROFILE.linkedIn} target="_blank" rel="noopener noreferrer">
                  <Linkedin size={16} strokeWidth={1.9} aria-hidden /> LinkedIn
                </a>
              </li>
              <li>
                <a className="hero-btn" href={PROFILE.github} target="_blank" rel="noopener noreferrer">
                  <Github size={16} strokeWidth={1.9} aria-hidden /> GitHub
                </a>
              </li>
              <li>
                <a className="hero-btn" href={PROFILE.cv} target="_blank" rel="noopener">
                  <FileText size={16} strokeWidth={1.9} aria-hidden /> CV
                </a>
              </li>
              <li>
                <Link className="hero-btn" href="/work/">
                  <Briefcase size={16} strokeWidth={1.9} aria-hidden /> Experience
                </Link>
              </li>
              <li>
                <Link className="hero-btn" href="/calendar/">
                  <CalendarDays size={16} strokeWidth={1.9} aria-hidden /> Book a call
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="glass-statement" aria-label="Summary">
          <p>{PROFILE.tagline}</p>
        </section>

        <section aria-labelledby="about-title">
          <h2 id="about-title">About</h2>
          <p>{PROFILE.about}</p>
        </section>

        <section aria-labelledby="focus-title">
          <h2 id="focus-title">What I work on</h2>
          <div className="focus-grid">
            {FOCUS_AREAS.map((area) => (
              <article key={area.title} className="focus-card">
                <h3>{area.title}</h3>
                <p>{area.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="highlights-title">
          <h2 id="highlights-title">Highlights</h2>
          <ul className="highlight-list">
            {HIGHLIGHTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="now-title">
          <h2 id="now-title">Now</h2>
          <p>
            Building LLM agents and RAG pipelines for finance and research use cases at{' '}
            <a href={SERPENTARIA.href} target="_blank" rel="noopener noreferrer">
              Serpentaria Capital
            </a>{' '}
            — LangGraph, MCP, pgvector, Langfuse and FastAPI, with tool calling, structured outputs,
            automated evals and tracing. Before that I spent over two years at Razor Labs leading a
            team that shipped ML-powered product features and owned model serving and monitoring.
          </p>
          <p>
            See my <Link href="/work/">full experience and skills</Link> and selected{' '}
            <Link href="/projects/">projects</Link>.
          </p>
        </section>

        {posts.length ? (
          <section aria-labelledby="writing-title">
            <h2 id="writing-title">Latest writing</h2>
            <ul className="post-list post-list--compact">
              {posts.map((post) => (
                <li key={post.slug} className="post-list-item">
                  <h3>
                    <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
                  </h3>
                  <p className="post-meta">
                    <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
                  </p>
                  <p>{post.description}</p>
                </li>
              ))}
            </ul>
            <p>
              <Link href="/blog/">All posts →</Link>
            </p>
          </section>
        ) : null}

        <section aria-labelledby="contact-title">
          <h2 id="contact-title">Get in touch</h2>
          <p>
            Open to conversations about AI engineering roles and LLM projects. Things that shaped my
            thinking live in <Link href="/links/">favorite links</Link>.
          </p>
          <p className="final-cta">
            Email <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>, connect on{' '}
            <a href={PROFILE.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn</a>, see code on{' '}
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>, or reach me on{' '}
            <a href={PROFILE.x} target="_blank" rel="noopener noreferrer">X</a>.
          </p>
        </section>
      </div>
    </SiteShell>
  )
}
