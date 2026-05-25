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

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="tp-hero">

        {/* EDIT: Status pill text */}
        <div className="tp-status-pill">
          <span className="tp-status-dot" />
          NFC Token Verified
        </div>

        {/* Floating token coin */}
        <div className="tp-coin-outer" aria-hidden="true">
          <div className="tp-coin-ring" />
          <div className="tp-coin-body">
            <svg
              className="tp-face"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Hair / forehead */}
              <polygon points="30,26 50,16 70,26 68,40 32,40" fill="#1e293b" />
              <polygon points="18,44 30,26 32,40 20,56" fill="#0f172a" />
              <polygon points="82,44 70,26 68,40 80,56" fill="#0f172a" />
              {/* Face upper */}
              <polygon points="32,40 68,40 70,58 30,58" fill="#334155" />
              {/* Face lower */}
              <polygon points="30,58 70,58 65,76 35,76" fill="#2d4060" />
              {/* Cheeks */}
              <polygon points="20,56 32,40 30,58 18,64" fill="#1e2d3d" />
              <polygon points="80,56 68,40 70,58 82,64" fill="#1a2836" />
              {/* Left eye */}
              <polygon points="34,44 46,42 45,51 33,51" fill="#0a1020" />
              <polygon points="36,45 43,44 42,49 35,49" fill="#7dd3fc" />
              <polygon points="37,46 40,45 40,48 37,48" fill="#f1f5f9" />
              {/* Right eye */}
              <polygon points="54,42 66,44 67,51 55,51" fill="#0a1020" />
              <polygon points="57,44 64,45 65,49 58,49" fill="#7dd3fc" />
              <polygon points="60,46 63,45 63,48 60,48" fill="#f1f5f9" />
              {/* Nose */}
              <polygon points="47,55 53,55 52,63 48,63" fill="#1a2536" />
              {/* Mouth */}
              <polygon points="38,68 50,64 62,68 56,73 44,73" fill="#0a1020" />
              <polygon points="42,68 50,66 58,68 50,69" fill="#94a3b8" opacity="0.4" />
              {/* Chin */}
              <polygon points="35,76 65,76 60,85 40,85" fill="#243448" />
              <polygon points="40,85 60,85 50,91" fill="#1a2838" />
              {/* Neck */}
              <polygon points="44,89 56,89 58,99 42,99" fill="#0f172a" />
            </svg>
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
