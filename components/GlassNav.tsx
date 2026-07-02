import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useIsomorphicLayoutEffect } from '../lib/useIsomorphicLayoutEffect'
import { Calendar, Copy, Github, Home, Mail, Menu, X } from 'lucide-react'

const EMAIL_PRIMARY = 'slava@spetsyian.com'
const EMAIL_ALT = 'slavaspetsyian@gmail.com'

const MENU_LINKS = [
  { href: '/links/', label: 'Favorite Links', external: false },
  { href: '/work/', label: 'Work', external: false },
  { href: '/projects/', label: 'Projects', external: false },
  { href: 'https://t.me/spetsyian#', label: 'Blog', external: true },
] as const

/** Internal routes tracked by the sliding indicator (most specific first). */
const NAV_ROUTE_MATCHERS = [
  '/calendar/',
  '/projects/',
  '/work/',
  '/links/',
  '/',
] as const

type TabIndicator = {
  left: number
  top: number
  width: number
  height: number
  visible: boolean
}

function isTabActive(href: string, pathname: string) {
  const tabPath = href.replace(/\/$/, '') || '/'
  const current = pathname.replace(/\/$/, '') || '/'
  if (tabPath === '/') return current === '/'
  return current === tabPath || current.startsWith(`${tabPath}/`)
}

function getActiveNavHref(pathname: string): string | null {
  for (const href of NAV_ROUTE_MATCHERS) {
    if (isTabActive(href, pathname)) return href
  }
  return null
}

export default function GlassNav() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [drawerCopied, setDrawerCopied] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const navItemRefs = useRef<Map<string, HTMLElement>>(new Map())
  const drawerCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipIndicatorTransitionRef = useRef(true)
  const [indicatorCanAnimate, setIndicatorCanAnimate] = useState(false)
  const [tabIndicator, setTabIndicator] = useState<TabIndicator>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    visible: false,
  })

  const showPopover = open || hovering
  const activeNavHref = getActiveNavHref(router.pathname)

  const setNavItemRef = useCallback(
    (href: string) => (el: HTMLElement | null) => {
      if (el) navItemRefs.current.set(href, el)
      else navItemRefs.current.delete(href)
    },
    []
  )

  const updateTabIndicator = useCallback(() => {
    const navEl = navRef.current
    if (!navEl) return

    const activeHref = getActiveNavHref(router.pathname)
    if (!activeHref) {
      setTabIndicator((prev) => ({ ...prev, visible: false }))
      return
    }

    const targetEl = navItemRefs.current.get(activeHref)
    if (!targetEl) return

    const navRect = navEl.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()

    setTabIndicator({
      left: targetRect.left - navRect.left,
      top: targetRect.top - navRect.top,
      width: targetRect.width,
      height: targetRect.height,
      visible: true,
    })
  }, [router.pathname])

  const copyEmail = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  const copyEmailDrawer = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      if (drawerCopyTimerRef.current) {
        clearTimeout(drawerCopyTimerRef.current)
      }
      setDrawerCopied(address)
      drawerCopyTimerRef.current = setTimeout(() => {
        setDrawerCopied(null)
        drawerCopyTimerRef.current = null
      }, 2000)
    } catch {
      setDrawerCopied(null)
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [router.pathname])

  useIsomorphicLayoutEffect(() => {
    updateTabIndicator()

    if (skipIndicatorTransitionRef.current) {
      skipIndicatorTransitionRef.current = false
      requestAnimationFrame(() => {
        setIndicatorCanAnimate(true)
      })
    }
  }, [updateTabIndicator])

  useEffect(() => {
    window.addEventListener('resize', updateTabIndicator)
    return () => window.removeEventListener('resize', updateTabIndicator)
  }, [updateTabIndicator])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const id = window.requestAnimationFrame(() => {
      document.addEventListener('mousedown', onDoc)
    })
    return () => {
      window.cancelAnimationFrame(id)
      document.removeEventListener('mousedown', onDoc)
    }
  }, [open])

  useEffect(() => {
    if (!showPopover) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setHovering(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showPopover])

  useEffect(() => {
    if (!menuOpen) return
    const mq = window.matchMedia('(max-width: 767px)')
    if (!mq.matches) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    return () => {
      if (drawerCopyTimerRef.current) {
        clearTimeout(drawerCopyTimerRef.current)
      }
    }
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <div className="glass-nav-wrap">
      {menuOpen ? (
        <button
          type="button"
          className="glass-nav-backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      ) : null}

      <div className="glass-nav-mobile-floats" aria-label="Mobile navigation">
        <Link
          href="/"
          className="glass-nav-fab glass-nav-fab--home"
          aria-label="Home"
        >
          <Home className="glass-icon" size={20} strokeWidth={1.75} />
        </Link>
        <button
          type="button"
          className="glass-nav-fab glass-nav-fab--menu"
          aria-expanded={menuOpen}
          aria-controls="glass-nav-drawer"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <X className="glass-icon" size={22} strokeWidth={1.75} />
          ) : (
            <Menu className="glass-icon" size={22} strokeWidth={1.75} />
          )}
        </button>
      </div>

      <nav
        ref={navRef}
        className="liquid-glass liquid-glass--tint glass-nav glass-nav--desktop"
        aria-label="Primary"
      >
        <span
          className={`glass-nav-tab-indicator${indicatorCanAnimate ? '' : ' is-instant'}`}
          aria-hidden
          style={{
            transform: `translate(${tabIndicator.left}px, ${tabIndicator.top}px)`,
            width: tabIndicator.visible ? tabIndicator.width : 0,
            height: tabIndicator.visible ? tabIndicator.height : 0,
            opacity: tabIndicator.visible ? 1 : 0,
          }}
        />
        <div className="glass-nav-cluster glass-nav-cluster--start">
          <Link
            href="/"
            className={`nav-icon-link${activeNavHref === '/' ? ' is-active' : ''}`}
            aria-label="Home"
            ref={setNavItemRef('/')}
          >
            <Home className="glass-icon" size={20} strokeWidth={1.75} />
          </Link>
          <div className="glass-nav-desktop-inline glass-nav-tabs">
            {MENU_LINKS.map((item) => {
              const active = !item.external && activeNavHref === item.href
              const className = `nav-text glass-label${active ? ' is-active' : ''}`

              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={className}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.label}
                  </a>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={className}
                  ref={setNavItemRef(item.href)}
                >
                  {item.label}
                </Link>
              )
            })}
            <span className="nav-divider" aria-hidden />
          </div>
        </div>

        <div className="glass-nav-cluster glass-nav-cluster--end">
          <a
            href="https://github.com/saequus"
            className="nav-icon-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <Github className="glass-icon" size={20} strokeWidth={1.75} />
          </a>

          <div
            ref={anchorRef}
            className={`email-pop-anchor${showPopover ? ' is-active' : ''}`}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <button
              type="button"
              className="nav-icon-btn"
              aria-expanded={showPopover}
              aria-haspopup="dialog"
              aria-label="Email"
              onClick={(e) => {
                e.stopPropagation()
                setOpen((v) => !v)
              }}
            >
              <Mail className="glass-icon" size={20} strokeWidth={1.75} />
            </button>
            {showPopover ? (
              <div
                className="email-popover liquid-glass liquid-glass--tint"
                role="dialog"
                aria-label="Email addresses"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
              >
                <div className="email-popover-row">
                  <code>{EMAIL_PRIMARY}</code>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      void copyEmail(EMAIL_PRIMARY)
                    }}
                    aria-label={`Copy ${EMAIL_PRIMARY}`}
                  >
                    <Copy className="glass-icon" size={18} strokeWidth={1.75} />
                  </button>
                </div>
                <div className="email-popover-row">
                  <code>{EMAIL_ALT}</code>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      void copyEmail(EMAIL_ALT)
                    }}
                    aria-label={`Copy ${EMAIL_ALT}`}
                  >
                    <Copy className="glass-icon" size={18} strokeWidth={1.75} />
                  </button>
                </div>
                {copied ? (
                  <div className="copy-toast" role="status" aria-live="polite">
                    Copied to clipboard
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <Link
            href="/calendar/"
            className={`nav-icon-link${activeNavHref === '/calendar/' ? ' is-active' : ''}`}
            aria-label="Calendar"
            ref={setNavItemRef('/calendar/')}
          >
            <Calendar className="glass-icon" size={20} strokeWidth={1.75} />
          </Link>

          <button
            type="button"
            className="nav-icon-btn glass-nav-burger"
            aria-expanded={menuOpen}
            aria-controls="glass-nav-drawer"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="glass-icon" size={22} strokeWidth={1.75} />
            ) : (
              <Menu className="glass-icon" size={22} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </nav>

      <div
        id="glass-nav-drawer"
        className={`glass-nav-drawer${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!menuOpen}
      >
        <ul className="glass-nav-drawer-list">
          {MENU_LINKS.map((item) => {
            const active = !item.external && activeNavHref === item.href
            const className = `glass-nav-drawer-link${active ? ' is-active' : ''}`

            return (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    className={className}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className={className} onClick={closeMenu}>
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
          <li>
            <a
              href="https://github.com/saequus"
              className="glass-nav-drawer-rowlink"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              <Github
                className="glass-icon glass-nav-drawer-icon"
                size={20}
                strokeWidth={1.75}
                aria-hidden
              />
              <span>GitHub</span>
            </a>
          </li>
          <li className="glass-nav-drawer-email-block">
            <div className="glass-nav-drawer-rowlabel">
              <Mail
                className="glass-icon glass-nav-drawer-icon"
                size={20}
                strokeWidth={1.75}
                aria-hidden
              />
              <span>Email</span>
            </div>
            <button
              type="button"
              className="glass-nav-drawer-copyline"
              onClick={() => void copyEmailDrawer(EMAIL_PRIMARY)}
            >
              {EMAIL_PRIMARY}
            </button>
            <button
              type="button"
              className="glass-nav-drawer-copyline"
              onClick={() => void copyEmailDrawer(EMAIL_ALT)}
            >
              {EMAIL_ALT}
            </button>
            {drawerCopied ? (
              <p className="glass-nav-drawer-copy-hint" role="status">
                Copied {drawerCopied}
              </p>
            ) : null}
          </li>
          <li>
            <Link
              href="/calendar/"
              className="glass-nav-drawer-rowlink"
              onClick={closeMenu}
            >
              <Calendar
                className="glass-icon glass-nav-drawer-icon"
                size={20}
                strokeWidth={1.75}
                aria-hidden
              />
              <span>Book a call</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
