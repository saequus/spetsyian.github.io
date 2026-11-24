import dynamic from 'next/dynamic'
import Head from 'next/head'
import type { ReactNode } from 'react'
import GlassFooter from './GlassFooter'
import GlassNav from './GlassNav'
import PageEnter from './PageEnter'
import Seo, { type SeoProps } from './Seo'

const VideoBackground = dynamic(() => import('./VideoBackground'), {
  ssr: false,
})

type Props = SeoProps & {
  children: ReactNode
  contentClassName?: string
  /** Desktop scroll collapse/unfold animation. Default true. */
  scrollNavCollapse?: boolean
}

export default function SiteShell({
  children,
  contentClassName = 'content-narrow',
  scrollNavCollapse = true,
  ...seo
}: Props) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <Seo {...seo} />
      <div className="page-root">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <VideoBackground />
        <GlassNav scrollNavCollapse={scrollNavCollapse} />
        <main id="main" className={`content-layer ${contentClassName}`}>
          <PageEnter>{children}</PageEnter>
          <div className="page-footer-spacer" aria-hidden />
        </main>
        <GlassFooter scrollNavCollapse={scrollNavCollapse} />
      </div>
    </>
  )
}
