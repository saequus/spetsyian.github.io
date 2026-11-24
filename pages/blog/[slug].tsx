import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import SiteShell from '../../components/SiteShell'
import type { Post, PostMeta } from '../../lib/blog'
import { formatDate } from '../../lib/format'
import { PROFILE } from '../../lib/profile'
import { blogPostingSchema, breadcrumbSchema } from '../../lib/schema'

type Props = { post: Post; others: PostMeta[] }

export const getStaticPaths: GetStaticPaths = async () => {
  const { getAllPostMeta } = await import('../../lib/blog')
  return {
    paths: getAllPostMeta().map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { getPost, getAllPostMeta } = await import('../../lib/blog')
  const post = getPost(String(params?.slug))
  if (!post) return { notFound: true }
  const others = getAllPostMeta().filter((p) => p.slug !== post.slug)
  return { props: { post, others } }
}

export default function BlogPostPage({ post, others }: Props) {
  const path = `/blog/${post.slug}/`
  const toc = post.headings.filter((h) => h.depth === 2)

  return (
    <SiteShell
      title={`${post.seoTitle} | Viachaslau Spetsyian`}
      description={post.description}
      path={path}
      ogType="article"
      image={`/assets/img/og/${post.slug}.jpg`}
      imageAlt={post.title}
      article={{ publishedTime: post.date, modifiedTime: post.updated, tags: post.tags }}
      jsonLd={[
        blogPostingSchema(post),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog/' },
          { name: post.title, path },
        ]),
      ]}
    >
      <article className="post" aria-labelledby="post-title">
        <header className="post-header">
          <nav aria-label="Breadcrumb" className="breadcrumbs">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/blog/">Blog</Link>
              </li>
            </ol>
          </nav>
          <h1 id="post-title">{post.title}</h1>
          <p className="post-meta">
            By{' '}
            <Link href="/" rel="author">
              {PROFILE.name}
            </Link>{' '}
            · <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
          </p>
          <p className="post-lede">{post.description}</p>
          {toc.length > 2 ? (
            <nav className="post-toc" aria-label="Table of contents">
              <p className="post-toc-title">Contents</p>
              <ol>
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </header>

        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

        <footer className="post-footer">
          <p>
            Written by <Link href="/">{PROFILE.name}</Link>, Senior Software &amp; AI Engineer in
            Warsaw. Questions or corrections? Message me on{' '}
            <a href={PROFILE.linkedIn} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>{' '}
            or email <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>.
          </p>
          {post.tags.length ? (
            <ul className="tag-list" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
        </footer>
      </article>

      {others.length ? (
        <aside className="post-more" aria-labelledby="more-title">
          <h2 id="more-title">More posts</h2>
          <ul className="post-list post-list--compact">
            {others.map((p) => (
              <li key={p.slug} className="post-list-item">
                <h3>
                  <Link href={`/blog/${p.slug}/`}>{p.title}</Link>
                </h3>
                <p className="post-meta">
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                </p>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </SiteShell>
  )
}
