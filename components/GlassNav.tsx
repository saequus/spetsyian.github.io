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
const TRANSITION_ZONE_PX = 320
const TRANSITION_END = SCROLL_COLLAPSE_THRESHOLD + TRANSITION_ZONE_PX
const DROP_SIZE_PX = 54
const NAV_CHROME_ITEM_COUNT = 9
const NAV_ITEM_STAGGER_S = 0.08
const NAV_UNFOLD_ANIM_MULTIPLIER = 4
const NAV_PHASE_DURATION_MS = 820

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

const NAV_ITEM_INDEX_BY_HREF: Record<string, number> = {
  '/': 0,
  '/links/': 1,
  '/work/': 2,
  '/projects/': 3,
  '/calendar/': 8,
}

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

function getTransitionProgress(scrollY: number, pinned: boolean) {
  if (pinned || scrollY <= SCROLL_COLLAPSE_THRESHOLD) return 0
  if (scrollY >= TRANSITION_END) return 1
  return (scrollY - SCROLL_COLLAPSE_THRESHOLD) / TRANSITION_ZONE_PX
}

function getItemHideThreshold(index: number) {
  return (NAV_CHROME_ITEM_COUNT - index) / NAV_CHROME_ITEM_COUNT
}

function isActiveNavItemRevealed(
  activeHref: string | null,
  transitionProgress: number,
  scrollPinned: boolean
) {
  if (!activeHref || scrollPinned || transitionProgress <= 0) return true
  if (transitionProgress >= 0.5) return false

  const index = NAV_ITEM_INDEX_BY_HREF[activeHref]
  if (index === undefined) return false

  const itemHideProgress = Math.min(1, transitionProgress * 2)
  return itemHideProgress < getItemHideThreshold(index)
}

/** Layout box relative to container — ignores CSS transforms on the target. */
function getTabIndicatorBounds(targetEl: HTMLElement, containerEl: HTMLElement) {
  let left = 0
  let top = 0
  let node: HTMLElement | null = targetEl

  while (node && node !== containerEl) {
    left += node.offsetLeft
    top += node.offsetTop

    const parent = node.offsetParent as HTMLElement | null
    if (!parent || (parent !== containerEl && !containerEl.contains(parent))) {
      const containerRect = containerEl.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()

      return {
        left: targetRect.left - containerRect.left,
        top: targetRect.top - containerRect.top,
        width: targetEl.offsetWidth,
        height: targetEl.offsetHeight,
      }
    }

    node = parent
  }

  return {
    left,
    top,
    width: targetEl.offsetWidth,
    height: targetEl.offsetHeight,
  }
}

type NavScrollMode = 'expanded' | 'transition' | 'drop'

function getNavScrollMode(scrollY: number, pinned: boolean): NavScrollMode {
  if (pinned || scrollY <= SCROLL_COLLAPSE_THRESHOLD) return 'expanded'
  if (scrollY >= TRANSITION_END) return 'drop'
  return 'transition'
}

type GlassNavProps = {
  /** When false, nav stays fully expanded on scroll (desktop). */
  scrollNavCollapse?: boolean
}

export default function GlassNav({ scrollNavCollapse = true }: GlassNavProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [drawerCopied, setDrawerCopied] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const navChromeRef = useRef<HTMLDivElement>(null)
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
  const navAnimPhaseRef = useRef<'open' | 'transition' | 'drop'>('open')
  const [navAnimPhase, setNavAnimPhase] = useState<'open' | 'transition' | 'drop'>('open')
  const [indicatorCanAnimate, setIndicatorCanAnimate] = useState(false)
  const [navShellHeightPx, setNavShellHeightPx] = useState(DROP_SIZE_PX)
  const [tabIndicator, setTabIndicator] = useState<TabIndicator>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    visible: false,
  })

  const showPopover = open || hovering
  const activeNavHref = getActiveNavHref(router.pathname)
  const collapseActive = scrollNavCollapse && desktopNav
  const navScrollMode = collapseActive
    ? getNavScrollMode(scrollY, scrollPinned)
    : 'expanded'
  const transitionProgress = collapseActive
    ? getTransitionProgress(scrollY, scrollPinned)
    : 0
  const itemHideProgress = Math.min(1, transitionProgress * 2)
  const shellCollapseProgress = Math.max(0, transitionProgress * 2 - 1)
  const shellExpandProgress = 1 - shellCollapseProgress
  const linkRevealProgress = Math.max(0, 1 - transitionProgress * 2)
  const isShellDrop = transitionProgress >= 1 && !scrollPinned
  const isNavTransitioning =
    transitionProgress > 0 && transitionProgress < 1 && !scrollPinned
  const isShellMorphing =
    transitionProgress > 0.5 && transitionProgress < 1 && !scrollPinned
  const isNavExpandedShell =
    !isShellDrop &&
    !isShellMorphing &&
    (transitionProgress === 0 || scrollPinned || transitionProgress <= 0.5)
  const isClickRevealingItems = revealLinks && !isShellDrop && !scrollPinned
  const isActiveItemRevealed = isActiveNavItemRevealed(
    activeNavHref,
    transitionProgress,
    scrollPinned
  )
  const showTabIndicator =
    tabIndicator.visible && !isShellDrop && isActiveItemRevealed

  const getTransitionItemClass = useCallback(
    (index: number) => {
      if (!collapseActive || scrollPinned) return ''
      if (transitionProgress <= 0) return ''
      if (transitionProgress >= 1) return 'is-nav-item-unfold-hidden'

      const hideThreshold = getItemHideThreshold(index)

      if (itemHideProgress < hideThreshold) {
        if (transitionProgress < 0.5) return ''
        return linkRevealProgress >= index / NAV_CHROME_ITEM_COUNT
          ? 'is-nav-item-unfold-revealed'
          : 'is-nav-item-unfold-hidden'
      }

      return 'is-nav-item-unfold-hidden'
    },
    [
      collapseActive,
      scrollPinned,
      transitionProgress,
      itemHideProgress,
      linkRevealProgress,
    ]
  )

  const shellMetricsStyle = useMemo(() => {
    if (!desktopNav) return undefined

    return {
      ['--nav-shell-height' as string]: `${navShellHeightPx}px`,
      ['--nav-unfold-anim-multiplier' as string]: String(NAV_UNFOLD_ANIM_MULTIPLIER),
    } as CSSProperties
  }, [desktopNav, navShellHeightPx])

  const navWrapStyle = useMemo(() => {
    if (!desktopNav) return shellMetricsStyle

    if (!isShellMorphing) return shellMetricsStyle

    if (typeof window === 'undefined') return shellMetricsStyle

    const viewport = window.innerWidth
    const expandedWidth = viewport * 0.5
    const expandedLeft = (viewport - expandedWidth) / 2
    const dropLeft = Math.max(
      40,
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--layout-inset')
      ) || 40
    )
    const dropSize = navShellHeightPx
    const width = dropSize + (expandedWidth - dropSize) * shellExpandProgress
    const left = dropLeft + (expandedLeft - dropLeft) * shellExpandProgress
    const radius = dropSize / 2 + (9999 - dropSize / 2) * shellExpandProgress

    return {
      ...shellMetricsStyle,
      ['--nav-unfold-progress' as string]: String(shellExpandProgress),
      ['--nav-link-progress' as string]: String(linkRevealProgress),
      ['--nav-transition-progress' as string]: String(transitionProgress),
      ['--nav-unfold-width' as string]: `${width}px`,
      ['--nav-unfold-left' as string]: `${left}px`,
      ['--nav-unfold-radius' as string]: `${radius}px`,
    } as CSSProperties
  }, [
    desktopNav,
    isShellMorphing,
    shellExpandProgress,
    linkRevealProgress,
    transitionProgress,
    navShellHeightPx,
    shellMetricsStyle,
  ])

  const navStyle = useMemo(() => {
    if (!desktopNav) return undefined

    const base = {
      ...shellMetricsStyle,
      ['--nav-item-count' as string]: String(NAV_CHROME_ITEM_COUNT),
      ['--nav-transition-progress' as string]: String(transitionProgress),
    } as CSSProperties

    if (isShellMorphing) {
      return {
        ...base,
        ['--nav-unfold-progress' as string]: String(shellExpandProgress),
        ['--nav-link-progress' as string]: String(linkRevealProgress),
      } as CSSProperties
    }

    if (navScrollMode === 'expanded' || scrollPinned) {
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
  }, [
    desktopNav,
    isShellMorphing,
    navScrollMode,
    scrollPinned,
    shellExpandProgress,
    linkRevealProgress,
    transitionProgress,
    shellMetricsStyle,
  ])

  const setNavItemRef = useCallback(
    (href: string) => (el: HTMLElement | null) => {
      if (el) navItemRefs.current.set(href, el)
      else navItemRefs.current.delete(href)
    },
    []
  )

  const updateTabIndicator = useCallback(() => {
    const chromeEl = navChromeRef.current
    if (!chromeEl) return

    const activeHref = getActiveNavHref(router.pathname)
    if (!activeHref) {
      setTabIndicator((prev) => ({ ...prev, visible: false }))
      return
    }

    const targetEl = navItemRefs.current.get(activeHref)
    if (!targetEl) return

    if (
      !isActiveNavItemRevealed(activeHref, transitionProgress, scrollPinned)
    ) {
      setTabIndicator((prev) => ({ ...prev, visible: false }))
      return
    }

    const bounds = getTabIndicatorBounds(targetEl, chromeEl)

    setTabIndicator({
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
      visible: true,
    })
  }, [router.pathname, transitionProgress, scrollPinned])

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
    const navEl = navRef.current
    if (!navEl || !desktopNav) return

    const measure = () => {
      if (navAnimPhaseRef.current === 'drop') return
      const height = Math.round(navEl.getBoundingClientRect().height)
      if (height > 0) {
        setNavShellHeightPx((prev) => (prev === height ? prev : height))
      }
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(navEl)
    return () => observer.disconnect()
  }, [desktopNav, router.pathname, navAnimPhase])

  useEffect(() => {
    if (!collapseActive) {
      setNavAnimPhase('open')
      navAnimPhaseRef.current = 'open'
      return
    }

    const progress = getTransitionProgress(scrollY, scrollPinned)
    const phase =
      progress <= 0 ? 'open' : progress >= 1 ? 'drop' : 'transition'

    setNavAnimPhase(phase)
    navAnimPhaseRef.current = phase
  }, [scrollY, scrollPinned, collapseActive])

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

      if (scrollNavCollapse && y > SCROLL_COLLAPSE_THRESHOLD) {
        setScrollPinned(false)
      }

      if (scrollNavCollapse) {
        const mode = getNavScrollMode(y, false)
        if (mode === 'drop') {
          setOpen(false)
          setHovering(false)
        }
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [desktopNav, scrollNavCollapse])

  useIsomorphicLayoutEffect(() => {
    updateTabIndicator()

    if (skipIndicatorTransitionRef.current) {
      skipIndicatorTransitionRef.current = false
      requestAnimationFrame(() => {
        setIndicatorCanAnimate(true)
      })
    }
  }, [
    updateTabIndicator,
    navScrollMode,
    navAnimPhase,
    isShellDrop,
    scrollY,
    transitionProgress,
    itemHideProgress,
    linkRevealProgress,
    isShellMorphing,
  ])

  useEffect(() => {
    if (navAnimPhase !== 'open') return

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateTabIndicator()
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [navAnimPhase, updateTabIndicator])

  useEffect(() => {
    const chromeEl = navChromeRef.current
    if (!chromeEl || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => {
      updateTabIndicator()
    })
    observer.observe(chromeEl)

    return () => observer.disconnect()
  }, [updateTabIndicator, desktopNav])

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
    }
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const expandFromDrop = useCallback(() => {
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
    desktopNav && isShellMorphing ? 'is-nav-unfolding' : '',
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
    desktopNav && isNavTransitioning && !isShellMorphing ? 'is-nav-transitioning' : '',
    desktopNav && isShellMorphing ? 'is-nav-unfolding' : '',
    desktopNav && isNavExpandedShell ? 'is-nav-expanded' : '',
    desktopNav && isClickRevealingItems ? 'is-nav-reveal-items' : '',
    desktopNav && isClickRevealingItems ? 'is-nav-reveal-after-shell' : '',
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

        <div ref={navChromeRef} className="glass-nav-chrome" aria-hidden={isShellDrop}>
          <span
            className={`glass-nav-tab-indicator${indicatorCanAnimate && !isShellDrop && isActiveItemRevealed ? '' : ' is-instant'}`}
            aria-hidden
            style={{
              left: tabIndicator.left,
              top: tabIndicator.top,
              width: showTabIndicator ? tabIndicator.width : 0,
              height: showTabIndicator ? tabIndicator.height : 0,
              opacity: showTabIndicator ? 1 : 0,
            }}
          />
          <div className="glass-nav-cluster glass-nav-cluster--start">
            <Link
              href="/"
              className={`nav-icon-link nav-chrome-item${activeNavHref === '/' ? ' is-active' : ''}${getTransitionItemClass(0) ? ` ${getTransitionItemClass(0)}` : ''}`}
              style={navChromeItemStyle(0)}
              aria-label="Home"
              ref={setNavItemRef('/')}
            >
              <Home className="glass-icon" size={20} strokeWidth={1.75} />
            </Link>
            <div className="glass-nav-desktop-inline glass-nav-tabs">
              {MENU_LINKS.map((item, index) => {
                const active = !item.external && activeNavHref === item.href
                const className = `nav-text glass-label nav-chrome-item${active ? ' is-active' : ''}${getTransitionItemClass(index + 1) ? ` ${getTransitionItemClass(index + 1)}` : ''}`
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
                className={`nav-divider nav-chrome-item${getTransitionItemClass(5) ? ` ${getTransitionItemClass(5)}` : ''}`}
                style={navChromeItemStyle(5)}
                aria-hidden
              />
            </div>
          </div>

          <div className="glass-nav-cluster glass-nav-cluster--end">
            <a
              href="https://github.com/saequus"
              className={`nav-icon-link nav-chrome-item${getTransitionItemClass(6) ? ` ${getTransitionItemClass(6)}` : ''}`}
              style={navChromeItemStyle(6)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="glass-icon" size={20} strokeWidth={1.75} />
            </a>

            <div
              ref={anchorRef}
              className={`email-pop-anchor nav-chrome-item${showPopover ? ' is-active' : ''}${getTransitionItemClass(7) ? ` ${getTransitionItemClass(7)}` : ''}`}
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
              className={`nav-icon-link nav-chrome-item${activeNavHref === '/calendar/' ? ' is-active' : ''}${getTransitionItemClass(8) ? ` ${getTransitionItemClass(8)}` : ''}`}
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
