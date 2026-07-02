import { useRouter } from 'next/router'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Github, Instagram, Linkedin, PanelBottom } from 'lucide-react'
import {
  CHROME_EXPAND_THRESHOLD,
  CHROME_UNFOLD_ANIM_MULTIPLIER,
  DROP_SIZE_PX,
  getChromeItemTransitionClass,
  getChromeTransitionDerived,
  getChromeTransitionProgress,
} from '../lib/glassChromeTransition'

const EMAIL = 'slava@spetsyian.com'
const FOOTER_CHROME_ITEM_COUNT = 4
const FOOTER_ITEM_STAGGER_S = 0.065
const FOOTER_REVEAL_MS = 2400

function footerChromeItemStyle(index: number): CSSProperties {
  const expandDelay = index * FOOTER_ITEM_STAGGER_S

  return {
    ['--nav-expand-delay' as string]: `${expandDelay}s`,
  } as CSSProperties
}

type GlassFooterProps = {
  /** When false, footer stays fully expanded on scroll (desktop). */
  scrollNavCollapse?: boolean
}

function getDistanceFromBottom(scrollY: number) {
  if (typeof document === 'undefined') return Number.POSITIVE_INFINITY

  const doc = document.documentElement
  const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight)
  return Math.max(0, maxScroll - scrollY)
}

export default function GlassFooter({
  scrollNavCollapse = true,
}: GlassFooterProps) {
  const router = useRouter()
  const footerRef = useRef<HTMLElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [scrollPinned, setScrollPinned] = useState(false)
  const [revealLinks, setRevealLinks] = useState(false)
  const [desktopFooter, setDesktopFooter] = useState(false)
  const [footerShellHeightPx, setFooterShellHeightPx] = useState(DROP_SIZE_PX)
  const [maxScrollY, setMaxScrollY] = useState(0)
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const collapseActive = scrollNavCollapse && desktopFooter
  const distanceFromBottom = useMemo(() => {
    if (!collapseActive) return 0
    return getDistanceFromBottom(scrollY)
  }, [collapseActive, scrollY])

  const transitionProgress = collapseActive
    ? getChromeTransitionProgress(distanceFromBottom, scrollPinned)
    : 0
  const { shellExpandProgress, linkRevealProgress } =
    getChromeTransitionDerived(transitionProgress)
  const isShellDrop = transitionProgress >= 1 && !scrollPinned
  const isFooterTransitioning =
    transitionProgress > 0 && transitionProgress < 1 && !scrollPinned
  const isShellMorphing =
    transitionProgress > 0.5 && transitionProgress < 1 && !scrollPinned
  const isFooterExpandedShell =
    !isShellDrop &&
    !isShellMorphing &&
    (transitionProgress === 0 || scrollPinned || transitionProgress <= 0.5)
  const isClickRevealingItems = revealLinks && !isShellDrop && !scrollPinned

  const getFooterItemClass = useCallback(
    (index: number) => {
      if (!collapseActive || scrollPinned) return ''
      return getChromeItemTransitionClass(
        index,
        FOOTER_CHROME_ITEM_COUNT,
        transitionProgress,
        collapseActive
      )
    },
    [collapseActive, scrollPinned, transitionProgress]
  )

  const shellMetricsStyle = useMemo(() => {
    if (!desktopFooter) return undefined

    return {
      ['--footer-shell-height' as string]: `${footerShellHeightPx}px`,
      ['--nav-unfold-anim-multiplier' as string]: String(CHROME_UNFOLD_ANIM_MULTIPLIER),
    } as CSSProperties
  }, [desktopFooter, footerShellHeightPx])

  const footerWrapStyle = useMemo(() => {
    if (!desktopFooter) return shellMetricsStyle
    if (!isShellMorphing) return shellMetricsStyle
    if (typeof window === 'undefined') return shellMetricsStyle

    const viewport = window.innerWidth
    const expandedWidth = viewport * 0.5
    const expandedLeft = (viewport - expandedWidth) / 2
    const dropInset = Math.max(
      0,
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--chrome-drop-inset-right'
        )
      ) || 0
    )
    const dropSize = footerShellHeightPx
    const dropLeft = viewport - dropSize - dropInset
    const width = dropSize + (expandedWidth - dropSize) * shellExpandProgress
    const left = dropLeft + (expandedLeft - dropLeft) * shellExpandProgress
    const radius = dropSize / 2 + (9999 - dropSize / 2) * shellExpandProgress

    return {
      ...shellMetricsStyle,
      ['--footer-unfold-progress' as string]: String(shellExpandProgress),
      ['--footer-link-progress' as string]: String(linkRevealProgress),
      ['--footer-transition-progress' as string]: String(transitionProgress),
      ['--footer-unfold-width' as string]: `${width}px`,
      ['--footer-unfold-left' as string]: `${left}px`,
      ['--footer-unfold-radius' as string]: `${radius}px`,
    } as CSSProperties
  }, [
    desktopFooter,
    isShellMorphing,
    shellExpandProgress,
    linkRevealProgress,
    transitionProgress,
    footerShellHeightPx,
    shellMetricsStyle,
  ])

  const footerStyle = useMemo(() => {
    if (!desktopFooter) return shellMetricsStyle

    const base = {
      ...shellMetricsStyle,
      ['--footer-transition-progress' as string]: String(transitionProgress),
    } as CSSProperties

    if (isShellMorphing) {
      return {
        ...base,
        ['--footer-unfold-progress' as string]: String(shellExpandProgress),
        ['--footer-link-progress' as string]: String(linkRevealProgress),
      } as CSSProperties
    }

    if (transitionProgress === 0) {
      return {
        ...base,
        ['--footer-unfold-progress' as string]: '1',
        ['--footer-link-progress' as string]: '1',
      } as CSSProperties
    }

    return {
      ...base,
      ['--footer-unfold-progress' as string]: '0',
      ['--footer-link-progress' as string]: '0',
    } as CSSProperties
  }, [
    desktopFooter,
    isShellMorphing,
    shellExpandProgress,
    linkRevealProgress,
    transitionProgress,
    shellMetricsStyle,
  ])

  const expandFromDrop = useCallback(() => {
    setScrollPinned(true)
    setRevealLinks(true)
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current)
    }
    revealTimerRef.current = setTimeout(() => {
      setRevealLinks(false)
      revealTimerRef.current = null
    }, FOOTER_REVEAL_MS)
  }, [])

  useEffect(() => {
    setScrollPinned(false)
    setRevealLinks(false)
  }, [router.pathname])

  useEffect(() => {
    if (isShellDrop) {
      setRevealLinks(false)
    }
  }, [isShellDrop])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setDesktopFooter(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!desktopFooter) {
      setScrollPinned(false)
    }
  }, [desktopFooter])

  useEffect(() => {
    const syncScroll = () => {
      const y = window.scrollY
      setScrollY(y)
      const doc = document.documentElement
      setMaxScrollY(Math.max(0, doc.scrollHeight - window.innerHeight))

      if (
        scrollNavCollapse &&
        getDistanceFromBottom(y) > CHROME_EXPAND_THRESHOLD
      ) {
        setScrollPinned(false)
      }
    }

    syncScroll()
    window.addEventListener('scroll', syncScroll, { passive: true })
    window.addEventListener('resize', syncScroll)
    return () => {
      window.removeEventListener('scroll', syncScroll)
      window.removeEventListener('resize', syncScroll)
    }
  }, [scrollNavCollapse])

  useEffect(() => {
    const footerEl = footerRef.current
    if (!footerEl || !desktopFooter || !collapseActive) return

    const measure = () => {
      if (isShellDrop || isShellMorphing || isFooterTransitioning) return
      if (transitionProgress > 0 && !scrollPinned) return

      const height = Math.round(footerEl.getBoundingClientRect().height)
      if (height > 0 && height <= 120) {
        setFooterShellHeightPx((prev) => (prev === height ? prev : height))
      }
    }

    const frame = requestAnimationFrame(measure)
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(measure)
    })
    observer.observe(footerEl)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [
    desktopFooter,
    collapseActive,
    isShellDrop,
    isShellMorphing,
    isFooterTransitioning,
    transitionProgress,
    scrollPinned,
  ])

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current)
      }
    }
  }, [])

  const footerWrapClassName = [
    'glass-footer-wrap',
    desktopFooter && isShellDrop ? 'is-footer-drop' : '',
    desktopFooter && isShellMorphing ? 'is-footer-unfolding' : '',
    desktopFooter && isFooterExpandedShell ? 'is-footer-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const footerClassName = [
    'liquid-glass',
    'liquid-glass--tint',
    'glass-footer',
    desktopFooter && isShellDrop ? 'is-footer-drop' : '',
    desktopFooter && isFooterTransitioning && !isShellMorphing
      ? 'is-footer-transitioning'
      : '',
    desktopFooter && isShellMorphing ? 'is-footer-unfolding' : '',
    desktopFooter && isFooterExpandedShell ? 'is-footer-expanded' : '',
    desktopFooter && isClickRevealingItems ? 'is-footer-reveal-items' : '',
    desktopFooter && isClickRevealingItems ? 'is-footer-reveal-after-shell' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const shortPageExpanded = collapseActive && maxScrollY < 8

  return (
    <div className={footerWrapClassName} style={footerWrapStyle}>
      <footer
        ref={footerRef}
        className={footerClassName}
        style={footerStyle}
        aria-label="Social and contact"
      >
        <button
          type="button"
          className="glass-footer-drop-face"
          aria-label="Open footer"
          aria-hidden={!isShellDrop && !shortPageExpanded}
          tabIndex={isShellDrop ? 0 : -1}
          onClick={expandFromDrop}
        >
          <PanelBottom
            className="glass-icon glass-footer-drop-icon"
            size={22}
            strokeWidth={1.75}
          />
        </button>

        <div
          className="glass-footer-chrome"
          aria-hidden={isShellDrop && !shortPageExpanded}
        >
          <div className="glass-footer-start">
            <a
              href="https://www.linkedin.com/in/spetsyian/"
              className={`nav-icon-link footer-chrome-item${getFooterItemClass(0) ? ` ${getFooterItemClass(0)}` : ''}`}
              style={footerChromeItemStyle(0)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className="glass-icon" size={20} strokeWidth={1.75} />
            </a>
            <a
              href="https://www.instagram.com/saequus/"
              className={`nav-icon-link footer-chrome-item${getFooterItemClass(1) ? ` ${getFooterItemClass(1)}` : ''}`}
              style={footerChromeItemStyle(1)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram className="glass-icon" size={20} strokeWidth={1.75} />
            </a>
            <a
              href="https://github.com/saequus"
              className={`nav-icon-link footer-chrome-item${getFooterItemClass(2) ? ` ${getFooterItemClass(2)}` : ''}`}
              style={footerChromeItemStyle(2)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="glass-icon" size={20} strokeWidth={1.75} />
            </a>
          </div>
          <a
            href={`mailto:${EMAIL}`}
            className={`glass-footer-email glass-label footer-chrome-item${getFooterItemClass(3) ? ` ${getFooterItemClass(3)}` : ''}`}
            style={footerChromeItemStyle(3)}
          >
            {EMAIL}
          </a>
        </div>
      </footer>
    </div>
  )
}