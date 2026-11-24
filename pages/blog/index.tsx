import type { GetStaticProps } from 'next'
import Link from 'next/link'
import SiteShell from '../../components/SiteShell'
import type { PostMeta } from '../../lib/blog'
import { formatDate } from '../../lib/format'
import { PROFILE } from '../../lib/profile'
import { blogSchema, breadcrumbSchema } from '../../lib/schema'

type Props = { posts: PostMeta[] }

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { getAllPostMeta } = await import('../../lib/blog')
  return { props: { posts: getAllPostMeta() } }
}

export default function BlogIndex({ posts }: Props) {
  return (
    <SiteShell
      title="Blog — Practical AI Engineering: RAG, Evals, Agents | Viachaslau Spetsyian"
      description="Hands-on guides on building LLM applications in production: RAG pipelines on Nebius Token Factory, evaluating RAG and LLM apps, and tool-calling agents with guardrails."
      path="/blog/"
      jsonLd={[
        blogSchema(posts),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog/' },
        ]),
      ]}
    >
      <header className="links-page-intro">
        <h1>Blog</h1>
        <p>
          Practical notes on building LLM systems that hold up in production — retrieval, evaluation,
          agents and the LLMOps around them. Subscribe via <a href="/feed.xml">RSS</a> or{' '}
          <a href="/atom.xml">Atom</a>. Shorter thoughts go to my{' '}
          <a href={PROFILE.telegram} target="_blank" rel="noopener noreferrer">
            Telegram channel
          </a>
          .
        </p>
      </header>

      <ol className="post-list" reversed>
        {posts.map((post) => (
          <li key={post.slug} className="post-list-item content-card">
            <article>
              <h2>
                <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
              </h2>
              <p className="post-meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
              </p>
              <p>{post.description}</p>
              {post.tags.length ? (
                <ul className="tag-list" aria-label="Tags">
                  {post.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          </li>
        ))}
      </ol>
    </SiteShell>
  )
}
