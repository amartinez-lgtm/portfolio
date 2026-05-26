import { useEffect, useState } from 'react'
import './TokenPage.css'

/* EDIT: Navigation cards — update hrefs and descriptions to match your pages */
const NAV_ITEMS = [
  {
    icon: '👤',
    title: 'About Me',
    sub: 'Quality manager, 10-year aerospace veteran',
    href: '/#about',
  },
  {
    icon: '💻',
    title: 'Projects',
    sub: '6 production tools shipped from the shop floor',
    href: '/#work',
  },
  {
    icon: '⚙️',
    title: 'Services',
    sub: '3D scanning, LiDAR mapping, AI prototyping',
    href: '/#ventures',
  },
  {
    icon: '🛒',
    title: 'Products',
    sub: 'Shop Leva LLC on Shopify',
    href: 'https://leva-llc.myshopify.com', /* EDIT: replace with your real Shopify URL */
  },
  {
    icon: '✉️',
    title: 'Contact',
    sub: "Let's talk — levallcworks@gmail.com",
    href: '/#contact',
  },
]

/* EDIT: Skills shown in the achievement card */
const ACHIEVEMENT_SKILLS = [
  '3D Scanning', 'CAD', '3D Printing', 'AI Prototyping', 'Quality Systems',
]

export default function TokenPage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="tp">

      {/* Cycling color bloom behind everything */}
      <div className="tp-bloom" aria-hidden="true" />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="tp-hero">

        {/* EDIT: Status pill text */}
        <div className="tp-status-pill">
          <span className="tp-status-dot" />
          NFC Token Verified
        </div>

        {/* Floating token coin — avatar photo inside RGB spinning ring */}
        <div className="tp-coin-outer" aria-hidden="true">
          {/* Hue-cycle wrapper rotates all colors through full spectrum */}
          <div className="tp-coin-hue">
            <div className="tp-coin-ring" />
          </div>
          <div className="tp-coin-body">
            {/* EDIT: Replace /avatar_jpg.jpeg with any photo in public/ */}
            <img src="/avatar_jpg.jpeg" alt="Avelino Martinez" className="tp-avatar" />
          </div>
        </div>

        {/* EDIT: Main headline and subheadline */}
        <p className="tp-eyebrow">Achievement Unlocked</p>
        <h1 className="tp-headline">You found Avelino's<br />portfolio token.</h1>
        <p className="tp-sub">
          This 3D-printed NFC object was built as a physical gateway into my work.
        </p>

      </section>

      {/* ── ACHIEVEMENT CARD ──────────────────────────────────────────── */}
      <section className="tp-section">
        <div className={`tp-card tp-achievement${visible ? ' tp-in' : ''}`}>
          <div className="tp-achievement-top">
            <span className="tp-trophy" aria-hidden="true">🏆</span>
            <div>
              <p className="tp-micro">Achievement</p>
              {/* EDIT: Achievement name */}
              <p className="tp-achievement-name">Met the Maker</p>
            </div>
            <span className="tp-rarity">Legendary</span>
          </div>
          <div className="tp-chips">
            {ACHIEVEMENT_SKILLS.map((s) => (
              <span key={s} className="tp-chip">{s}</span>
            ))}
          </div>
          <div className="tp-xp">
            {/* EDIT: XP value */}
            <span className="tp-xp-label">XP</span>
            <span className="tp-xp-value">+1000</span>
          </div>
        </div>
      </section>

      {/* ── NAVIGATION CARDS ──────────────────────────────────────────── */}
      <section className="tp-section">
        {/* EDIT: Section heading */}
        <p className="tp-section-label">Explore My Work</p>
        <div className="tp-nav-list">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.title}
              href={item.href}
              className="tp-nav-card"
              style={{ animationDelay: `${i * 60 + 300}ms` }}
            >
              <span className="tp-nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="tp-nav-text">
                <span className="tp-nav-title">{item.title}</span>
                <span className="tp-nav-sub">{item.sub}</span>
              </span>
              <svg className="tp-chevron" viewBox="0 0 8 14" fill="none">
                <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}
        </div>
      </section>

      {/* ── ABOUT THE TOKEN ───────────────────────────────────────────── */}
      <section className="tp-section tp-about-section">
        <p className="tp-section-label">About This Token</p>

        {/* EDIT: "What you scanned" description */}
        <div className="tp-info-card">
          <p className="tp-info-label">What you scanned</p>
          <p className="tp-info-body">
            An NFC chip embedded inside a 3D-printed object. Tap it with any modern
            phone and your browser opens here instantly — no app, no QR code.
          </p>
        </div>

        {/* EDIT: "Why it exists" description */}
        <div className="tp-info-card">
          <p className="tp-info-label">Why it exists</p>
          <p className="tp-info-body">
            I wanted my business card to be something people actually keep — not paper,
            but a useful object that shows what I build before I even explain it.
          </p>
        </div>

        <div className="tp-built-chips">
          {/* EDIT: "Built with" skills */}
          {['3D Scanning', 'Blender', 'Onshape', '3D Printing', 'NFC', 'CAD'].map((s) => (
            <span key={s} className="tp-built-chip">{s}</span>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="tp-footer">
        {/* EDIT: Footer name and link */}
        <span>Avelino Martinez · Leva LLC</span>
        <a href="/">portfolio-4n2.pages.dev</a>
      </footer>

    </div>
  )
}
