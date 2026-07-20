import { useState, useEffect } from 'react'
import './Nav.css'

// In-page section anchors
const sections: { label: string; href: string }[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Ventures', href: '#ventures' },
  { label: 'Stories', href: '#stories' },
  { label: 'Contact', href: '#contact' },
]

// Separate destinations (their own pages) — grouped after a divider
const pages: { label: string; href: string; cta?: boolean }[] = [
  { label: 'Gallery', href: '/gallery' },
  { label: 'Store', href: '/store', cta: true },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 24)
      setMenuOpen(false) // close the mobile menu on scroll
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Active-section highlighting — mark the nav link for whichever section
  // is centered in the viewport as you scroll.
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`)
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="nav__inner container">
        <a href="#" className="nav__logo" onClick={() => setMenuOpen(false)}>
          <span className="nav__logo-mark">AM</span>
        </a>

        <ul className={`nav__links${menuOpen ? ' nav__links--open' : ''}`}>
          {sections.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`nav__link${active === l.href ? ' nav__link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}

          <li className="nav__sep" aria-hidden="true" />

          {pages.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={l.cta ? 'nav__cta' : 'nav__link nav__link--accent'}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          className={`nav__burger${menuOpen ? ' nav__burger--open' : ''}`}
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
