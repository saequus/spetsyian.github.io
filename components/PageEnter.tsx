import { useRouter } from 'next/router'
import { useEffect, useRef, type ReactNode } from 'react'
import { useIsomorphicLayoutEffect } from '../lib/useIsomorphicLayoutEffect'

const STAGGER_MS = 120
const BASE_DELAY_MS = 80

const ENTER_SELECTOR = [
  ':scope > header',
  ':scope > section',
  ':scope > article',
  ':scope .home-page > section',
  ':scope .work-timeline > article',
  ':scope .project-grid > *',
].join(', ')

function applyEnterAnimations(root: HTMLElement, reset = false) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) {
    root.querySelectorAll('.page-enter-item').forEach((el) => {
      el.classList.remove('page-enter-item')
    })
    return
  }

  if (reset) {
    root.querySelectorAll('.page-enter-item').forEach((el) => {
      el.classList.remove('page-enter-item')
    })
  }

  const nodes = Array.from(root.querySelectorAll(ENTER_SELECTOR))
  const filtered = nodes.filter((el) => {
    if (el.classList.contains('home-page-spacer')) return false
    if (el.classList.contains('home-page')) return false
    if (el.classList.contains('book-call-panel')) return false
    if (el.getAttribute('aria-hidden') === 'true') return false
    return !nodes.some((other) => other !== el && other.contains(el))
  })

  let index = root.querySelectorAll('.page-enter-item').length

  filtered.forEach((el) => {
    if (el.classList.contains('page-enter-item')) return

    const htmlEl = el as HTMLElement
    htmlEl.style.setProperty('--enter-delay', `${BASE_DELAY_MS + index * STAGGER_MS}ms`)
    htmlEl.classList.add('page-enter-item')
    index += 1
  })
}

type Props = {
  children: ReactNode
}

export default function PageEnter({ children }: Props) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    applyEnterAnimations(root, true)
  }, [router.asPath])

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const observer = new MutationObserver(() => {
      applyEnterAnimations(root, false)
    })

    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [router.asPath])

  return (
    <div ref={ref} key={router.asPath} className="page-enter">
      {children}
    </div>
  )
}