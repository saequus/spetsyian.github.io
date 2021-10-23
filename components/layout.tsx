import Alert from './alert'
import Footer from './footer'
import Meta from './meta'

type Props = {
  preview?: boolean
  children: React.ReactNode
  lang: string
}

const Layout = ({ preview, children, lang }: Props) => {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        <div className='mb-8'></div>
        <main>{children}</main>
      </div>
      <Footer lang={lang} />
    </>
  )
}

export default Layout
