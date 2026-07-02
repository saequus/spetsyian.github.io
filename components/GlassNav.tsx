import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useIsomorphicLayoutEffect } from '../lib/useIsomorphicLayoutEffect'
import { Calendar, Copy, Github, Home, Mail, Menu, X } from 'lucide-react'

const SCROLL_COLLAPSE_THRESHOLD = 8
const UNFOLD_ZONE_PX = 80
const DROP_SIZE_PX = 54
const NAV_CHROME_ITEM_COUNT = 9
const NAV_ITEM_STAGGER_S = 0.08
const NAV_PHASE_DURATION_MS = 820
const NAV_ITEMS_COLLAPSE_MS =
  (NAV_CHROME_ITEM_COUNT - 1) * NAV_ITEM_STAGGER_S * 1000 + NAV_PHASE_DURATION_MS

function navChromeItemStyle(index: number): CSSProperties {
  const collapseDelay = (NAV_CHROME_ITEM_COUNT - 1 - index) * NAV_ITEM_STAGGER_S
  const expandDelay = index * NAV_ITEM_STAGGER_S

  return {
    ['--nav-collapse-delay' as string]: `${collapseDelay}s`,
    ['--nav-expand-delay' as string]: `${expandDelay}s`,
    ['--nav-item-ratio' as string]: String(index / NAV_CHROME_ITEM_COUNT),
  } as CSSProperties
}

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

type NavScrollMode = 'expanded' | 'drop' | 'unfolding'

function getNavScrollMode(
  scrollY: number,
  scrollingDown: boolean,
  pinned: boolean
): NavScrollMode {
  if (pinned || scrollY <= SCROLL_COLLAPSE_THRESHOLD) return 'expanded'
  if (!scrollingDown && scrollY < UNFOLD_ZONE_PX) return 'unfolding'
  return 'drop'
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
  const navWrapRef = useRef<HTMLDivElement>(null)
  const navItemRefs = useRef<Map<string, HTMLElement>>(new Map())
  const drawerCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipIndicatorTransitionRef = useRef(true)
  const lastScrollYRef = useRef(0)
  const [scrollY, setScrollY] = useState(0)
  const [scrollingDown, setScrollingDown] = useState(false)
  const [scrollPinned, setScrollPinned] = useState(false)
  const [revealLinks, setRevealLinks] = useState(false)
  const [desktopNav, setDesktopNav] = useState(false)
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navAnimPhaseRef = useRef<'open' | 'hiding-items' | 'drop'>('open')
  const [navAnimPhase, setNavAnimPhase] = useState<'open' | 'hiding-items' | 'drop'>('open')
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
  const navScrollMode = desktopNav
    ? getNavScrollMode(scrollY, scrollingDown, scrollPinned)
    : 'expanded'
  const isHidingItems = navAnimPhase === 'hiding-items'
  const isShellDrop = navAnimPhase === 'drop'
  const isNavUnfolding = navScrollMode === 'unfolding' && !isShellDrop && !isHidingItems
  const isNavExpandedShell =
    !isShellDrop &&
    (navScrollMode === 'expanded' || scrollPinned || isHidingItems || isNavUnfolding)
  const unfoldProgress = isNavUnfolding
    ? Math.max(0, Math.min(1, 1 - scrollY / UNFOLD_ZONE_PX))
    : navScrollMode === 'expanded'
      ? 1
      : 0
  const shellProgress = Math.min(1, unfoldProgress * 2)
  const linkProgress = Math.max(0, unfoldProgress * 2 - 1)
  const isRevealingItems =
    (isNavUnfolding && linkProgress > 0) || (revealLinks && !isShellDrop && !isHidingItems)

  const navWrapStyle = useMemo(() => {
    if (!desktopNav || navScrollMode !== 'unfolding') return undefined

    if (typeof window === 'undefined') return undefined

    const viewport = window.innerWidth
    const expandedWidth = viewport * 0.5
    const expandedLeft = (viewport - expandedWidth) / 2
    const dropLeft = Math.max(
      40,
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--layout-inset')
      ) || 40
    )

    const width = DROP_SIZE_PX + (expandedWidth - DROP_SIZE_PX) * shellProgress
    const left = dropLeft + (expandedLeft - dropLeft) * shellProgress

    return {
      ['--nav-unfold-progress' as string]: String(shellProgress),
      ['--nav-link-progress' as string]: String(linkProgress),
      ['--nav-unfold-width' as string]: `${width}px`,
      ['--nav-unfold-left' as string]: `${left}px`,
      ['--nav-unfold-radius' as string]: `${26 + (9999 - 26) * shellProgress}px`,
    } as CSSProperties
  }, [desktopNav, navScrollMode, shellProgress, linkProgress])

  const navStyle = useMemo(() => {
    if (!desktopNav) return undefined

    const base = {
      ['--nav-item-count' as string]: String(NAV_CHROME_ITEM_COUNT),
    } as CSSProperties

    if (navScrollMode === 'unfolding') {
      return {
        ...base,
        ['--nav-unfold-progress' as string]: String(shellProgress),
        ['--nav-link-progress' as string]: String(linkProgress),
      } as CSSProperties
    }

    if (navScrollMode === 'expanded') {
      return {
        ...base,
        ['--nav-unfold-progress' as string]: '1',
        ['--nav-link-progress' as string]: '1',
      } as CSSProperties
    }

    return {
      ...base,
      ['--nav-unfold-progress' as string]: '0',
      ['--nav-link-progress' as string]: '0',
    } as CSSProperties
  }, [desktopNav, navScrollMode, shellProgress, linkProgress])

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
    setScrollPinned(false)
    setRevealLinks(false)
    setNavAnimPhase('open')
    navAnimPhaseRef.current = 'open'
  }, [router.pathname])

  useEffect(() => {
    navAnimPhaseRef.current = navAnimPhase
  }, [navAnimPhase])

  useEffect(() => {
    if (isShellDrop) {
      setRevealLinks(false)
    }
  }, [isShellDrop])

  useEffect(() => {
    if (!desktopNav) {
      if (navAnimTimerRef.current) {
        clearTimeout(navAnimTimerRef.current)
        navAnimTimerRef.current = null
      }
      setNavAnimPhase('open')
      navAnimPhaseRef.current = 'open'
      return
    }

    const target = getNavScrollMode(scrollY, scrollingDown, scrollPinned)

    if (target === 'drop' && !scrollPinned) {
      if (navAnimPhaseRef.current === 'open') {
        if (navAnimTimerRef.current) {
          clearTimeout(navAnimTimerRef.current)
        }

        requestAnimationFrame(() => {
          setNavAnimPhase('hiding-items')
          navAnimPhaseRef.current = 'hiding-items'

          navAnimTimerRef.current = setTimeout(() => {
            setNavAnimPhase('drop')
            navAnimPhaseRef.current = 'drop'
            navAnimTimerRef.current = null
          }, NAV_ITEMS_COLLAPSE_MS)
        })
      }
      return
    }

    if (navAnimTimerRef.current) {
      clearTimeout(navAnimTimerRef.current)
      navAnimTimerRef.current = null
    }

    if (navAnimPhaseRef.current !== 'open') {
      setNavAnimPhase('open')
      navAnimPhaseRef.current = 'open'
    }
  }, [scrollY, scrollingDown, scrollPinned, desktopNav])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setDesktopNav(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!desktopNav) {
      setScrollPinned(false)
      return
    }

    const onScroll = () => {
      const y = window.scrollY
      const down = y > lastScrollYRef.current
      setScrollingDown(down)
      setScrollY(y)
      lastScrollYRef.current = y

      if (y > SCROLL_COLLAPSE_THRESHOLD) {
        setScrollPinned(false)
      }

      const mode = getNavScrollMode(y, down, false)
      if (mode === 'drop') {
        setOpen(false)
        setHovering(false)
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [desktopNav])

  useIsomorphicLayoutEffect(() => {
    updateTabIndicator()

    if (skipIndicatorTransitionRef.current) {
      skipIndicatorTransitionRef.current = false
      requestAnimationFrame(() => {
        setIndicatorCanAnimate(true)
      })
    }
  }, [updateTabIndicator, navScrollMode])

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
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current)
      }
      if (navAnimTimerRef.current) {
        clearTimeout(navAnimTimerRef.current)
      }
    }
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const expandFromDrop = useCallback(() => {
    if (navAnimTimerRef.current) {
      clearTimeout(navAnimTimerRef.current)
      navAnimTimerRef.current = null
    }
    setNavAnimPhase('open')
    navAnimPhaseRef.current = 'open'
    setScrollPinned(true)
    setRevealLinks(true)
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current)
    }
    revealTimerRef.current = setTimeout(() => {
      setRevealLinks(false)
      revealTimerRef.current = null
    }, 2400)
  }, [])

  const navWrapClassName = [
    'glass-nav-wrap',
    desktopNav && isShellDrop ? 'is-nav-drop' : '',
    desktopNav && isNavUnfolding ? 'is-nav-unfolding' : '',
    desktopNav && isNavExpandedShell ? 'is-nav-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const navClassName = [
    'liquid-glass',
    'liquid-glass--tint',
    'glass-nav',
    'glass-nav--desktop',
    desktopNav && isShellDrop ? 'is-nav-drop' : '',
    desktopNav && isHidingItems ? 'is-nav-collapsing' : '',
    desktopNav && isNavUnfolding ? 'is-nav-unfolding' : '',
    desktopNav && isNavExpandedShell ? 'is-nav-expanded' : '',
    desktopNav && isRevealingItems ? 'is-nav-reveal-items' : '',
    desktopNav && revealLinks && !isNavUnfolding ? 'is-nav-reveal-after-shell' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={navWrapRef} className={navWrapClassName} style={navWrapStyle}>
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

      <nav ref={navRef} className={navClassName} style={navStyle} aria-label="Primary">
        <button
          type="button"
          className="glass-nav-drop-face"
          aria-label="Open navigation"
          aria-hidden={!isShellDrop}
          tabIndex={isShellDrop ? 0 : -1}
          onClick={expandFromDrop}
        >
          <Menu className="glass-icon glass-nav-drop-icon" size={22} strokeWidth={1.75} />
        </button>

        <div className="glass-nav-chrome" aria-hidden={isShellDrop}>
          <span
            className={`glass-nav-tab-indicator${indicatorCanAnimate && !isShellDrop && !isHidingItems ? '' : ' is-instant'}`}
            aria-hidden
            style={{
              transform: `translate(${tabIndicator.left}px, ${tabIndicator.top}px)`,
              width: tabIndicator.visible && !isShellDrop && !isHidingItems ? tabIndicator.width : 0,
              height: tabIndicator.visible && !isShellDrop && !isHidingItems ? tabIndicator.height : 0,
              opacity: tabIndicator.visible && !isShellDrop && !isHidingItems ? 1 : 0,
            }}
          />
          <div className="glass-nav-cluster glass-nav-cluster--start">
            <Link
              href="/"
              className={`nav-icon-link nav-chrome-item${activeNavHref === '/' ? ' is-active' : ''}`}
              style={navChromeItemStyle(0)}
              aria-label="Home"
              ref={setNavItemRef('/')}
            >
              <Home className="glass-icon" size={20} strokeWidth={1.75} />
            </Link>
            <div className="glass-nav-desktop-inline glass-nav-tabs">
              {MENU_LINKS.map((item, index) => {
                const active = !item.external && activeNavHref === item.href
                const className = `nav-text glass-label nav-chrome-item${active ? ' is-active' : ''}`
                const style = navChromeItemStyle(index + 1)

                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={className}
                      style={style}
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
                    style={style}
                    ref={setNavItemRef(item.href)}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <span
                className="nav-divider nav-chrome-item"
                style={navChromeItemStyle(5)}
                aria-hidden
              />
            </div>
          </div>

          <div className="glass-nav-cluster glass-nav-cluster--end">
            <a
              href="https://github.com/saequus"
              className="nav-icon-link nav-chrome-item"
              style={navChromeItemStyle(6)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="glass-icon" size={20} strokeWidth={1.75} />
            </a>

            <div
              ref={anchorRef}
              className={`email-pop-anchor nav-chrome-item${showPopover ? ' is-active' : ''}`}
              style={navChromeItemStyle(7)}
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
              className={`nav-icon-link nav-chrome-item${activeNavHref === '/calendar/' ? ' is-active' : ''}`}
              style={navChromeItemStyle(8)}
              aria-label="Calendar"
              ref={setNavItemRef('/calendar/')}
            >
              <Calendar className="glass-icon" size={20} strokeWidth={1.75} />
            </Link>

            <button
              type="button"
              className="nav-icon-btn glass-nav-burger nav-chrome-item"
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
