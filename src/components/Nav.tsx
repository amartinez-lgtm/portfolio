import { useState, useEffect } from 'react'
import './Nav.css'

const links = [
  { label: 'Work', href: '#work' },
  { label: 'Ventures', href: '#ventures' },
  { label: 'Stories', href: '#stories' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="nav__inner container">
        <a href="#" className="nav__logo">
          <span className="nav__logo-mark">AM</span>
        </a>

        <ul className={`nav__links${menuOpen ? ' nav__links--open' : ''}`}>
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="nav__link"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="nav__burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
