import Head from 'next/head'
import type { ReactNode } from 'react'
import GlassFooter from './GlassFooter'
import GlassNav from './GlassNav'
import VideoBackground from './VideoBackground'

type Props = {
  children: ReactNode
  title?: string
  description?: string
  contentClassName?: string
}

const defaultDesc =
  'Slava Saequus — engineering, markets, and somatic work. Warsaw, Poland.'

export default function SiteShell({
  children,
  title = 'Slava Saequus',
  description = defaultDesc,
  contentClassName = 'content-narrow',
}: Props) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="page-root">
        <VideoBackground />
        <GlassNav />
        <main className={`content-layer ${contentClassName}`}>{children}</main>
        <GlassFooter />
      </div>
    </>
  )
}
