import type { AppProps } from 'next/app'
import { Manrope, Syne } from 'next/font/google'
import '../styles/globals.css'
import '../styles/book-call.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${manrope.variable} ${syne.variable} root-font`}>
      <Component {...pageProps} />
    </div>
  )
}
