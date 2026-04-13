import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, Copy, Github, Home, Mail } from 'lucide-react'

const EMAIL_PRIMARY = 'slava@spetsyian.com'
const EMAIL_ALT = 'slavaspetsyian@gmail.com'

export default function GlassNav() {
  const [open, setOpen] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [copied, setCopied] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  const showPopover = open || hovering

  const copyEmail = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

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

  return (
    <div className="glass-nav-wrap">
      <nav
        className="liquid-glass liquid-glass--tint glass-nav"
        aria-label="Primary"
      >
        <div className="glass-nav-atmosphere" aria-hidden>
          <span className="glass-nav-cloud glass-nav-cloud--a" />
          <span className="glass-nav-cloud glass-nav-cloud--b" />
          <span className="glass-nav-cloud glass-nav-cloud--c" />
          <span className="glass-nav-cloud glass-nav-cloud--d" />
          <span className="glass-nav-cloud glass-nav-cloud--e" />
          <span className="glass-nav-cloud glass-nav-cloud--f" />
          <span className="glass-nav-radiance" />
          <span className="glass-nav-mist" />
        </div>
        <Link href="/" className="nav-icon-link" aria-label="Home">
          <Home className="glass-icon" size={20} strokeWidth={1.75} />
        </Link>

        <Link href="/links/" className="nav-text glass-label">
          Favorite Links
        </Link>
        <Link href="/work/" className="nav-text glass-label">
          Work
        </Link>
        <Link href="/projects/" className="nav-text glass-label">
          Projects
        </Link>
        <a
          href="https://t.me/spetsyian#"
          className="nav-text glass-label"
          target="_blank"
          rel="noopener noreferrer"
        >
          Blog
        </a>

        <span className="nav-divider" aria-hidden />

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
            className="nav-icon-btn nav-icon-btn--email"
            aria-expanded={showPopover}
            aria-haspopup="dialog"
            aria-label="Email"
            onClick={(e) => {
              e.stopPropagation()
              setOpen((v) => !v)
            }}
          >
            <span className="nav-email-orbit-wrap" aria-hidden>
              <span className="orbit-spinner">
                <span className="orbit" />
                <span className="orbit" />
                <span className="orbit" />
              </span>
            </span>
            <Mail className="glass-icon" size={20} strokeWidth={1.75} />
          </button>
          {showPopover ? (
            <div
              className="email-popover"
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

        <Link href="/calendar/" className="nav-icon-link" aria-label="Calendar">
          <Calendar className="glass-icon" size={20} strokeWidth={1.75} />
        </Link>
      </nav>
    </div>
  )
}
