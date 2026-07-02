import dynamic from 'next/dynamic'
import Head from 'next/head'
import type { ReactNode } from 'react'
import GlassFooter from './GlassFooter'
import GlassNav from './GlassNav'
import PageEnter from './PageEnter'

const VideoBackground = dynamic(() => import('./VideoBackground'), {
  ssr: false,
})

type Props = {
  children: ReactNode
  title?: string
  description?: string
  contentClassName?: string
  /** Desktop scroll collapse/unfold animation. Default true. */
  scrollNavCollapse?: boolean
}

const defaultDesc =
  'Slava Saequus — Senior Software Engineer & Team Lead. Working at Serpentaria Capital, building SalesAmplifier. Warsaw, Poland.'

export default function SiteShell({
  children,
  title = 'Slava Saequus',
  description = defaultDesc,
  contentClassName = 'content-narrow',
  scrollNavCollapse = true,
}: Props) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <div className="page-root">
        <VideoBackground />
        <GlassNav scrollNavCollapse={scrollNavCollapse} />
        <main className={`content-layer ${contentClassName}`}>
          <PageEnter>{children}</PageEnter>
        </main>
        <GlassFooter />
      </div>
    </>
  )
}