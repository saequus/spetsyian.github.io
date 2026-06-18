import { Github, Instagram, Linkedin } from 'lucide-react'

const EMAIL = 'slava@spetsyian.com'

export default function GlassFooter() {
  return (
    <div className="glass-footer-wrap">
      <footer
        className="liquid-glass liquid-glass--tint glass-footer"
        aria-label="Social and contact"
      >
        <div className="glass-footer-start">
          <a
            href="https://www.linkedin.com/in/spetsyian/"
            className="nav-icon-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin className="glass-icon" size={20} strokeWidth={1.75} />
          </a>
          <a
            href="https://www.instagram.com/saequus/"
            className="nav-icon-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <Instagram className="glass-icon" size={20} strokeWidth={1.75} />
          </a>
          <a
            href="https://github.com/saequus"
            className="nav-icon-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <Github className="glass-icon" size={20} strokeWidth={1.75} />
          </a>
        </div>
        <a
          href={`mailto:${EMAIL}`}
          className="glass-footer-email glass-label"
        >
          {EMAIL}
        </a>
      </footer>
    </div>
  )
}
