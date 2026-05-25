import { useEffect, useState } from 'react'
import './TokenPage.css'

/* EDIT: Skills shown in the achievement unlock card */
const ACHIEVEMENT_SKILLS = [
  '3D Scanning', 'CAD Design', '3D Printing', 'AI Prototyping',
  'Product Development', 'Quality Systems',
]

/* EDIT: Tech/tools shown in the "Built With" section */
const BUILT_WITH_SKILLS = [
  '3D Scanning', 'Blender', 'Onshape', '3D Printing',
  'NFC', 'AI Prototyping', 'CAD', 'Product Design',
]

export default function TokenPage() {
  const [unlocked, setUnlocked] = useState(false)

  // Short delay so the page renders first, then the card flies in
  useEffect(() => {
    const t = setTimeout(() => setUnlocked(true), 350)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="token-page">

      {/* Subtle CRT scanline texture overlay */}
      <div className="token-scanlines" aria-hidden="true" />

      {/* ── STATUS BAR ──────────────────────────────────────────────────── */}
      {/* EDIT: Change the status bar text here */}
      <header className="token-status-bar">
        <span className="token-status-bar__dot" aria-hidden="true" />
        <span className="token-status-bar__text">NFC Token Verified</span>
        <span className="token-status-bar__signal" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </header>

      <main className="token-main">

        {/* ── HEADLINE ────────────────────────────────────────────────────── */}
        {/* EDIT: Main headline and subhead copy */}
        <section className="token-headline-section">
          <p className="token-eyebrow">Achievement Unlocked</p>
          <h1 className="token-headline">
            You found Avelino's<br />smart portfolio token.
          </h1>
        </section>

        {/* ── TOKEN VISUAL ────────────────────────────────────────────────── */}
        {/* Floating coin with RGB border and spinning orbital rings */}
        <section className="token-visual-section" aria-hidden="true">
          <div className="token-visual">
            <div className="token-visual__ring" />
            <div className="token-visual__body">
              <div className="token-visual__face">
                <div className="token-visual__face-ring token-visual__face-ring--1" />
                <div className="token-visual__face-ring token-visual__face-ring--2" />
                <div className="token-visual__face-ring token-visual__face-ring--3" />
                {/* Low-poly face SVG — evokes the 3D-scanned face on the physical token */}
                <svg
                  className="token-face-svg"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Low-poly face portrait"
                >
                  {/* Hair / forehead */}
                  <polygon points="28,32 50,18 72,32 67,44 33,44" fill="#1e293b" />
                  <polygon points="16,48 28,32 33,48" fill="#0f172a" />
                  <polygon points="72,32 84,48 67,48" fill="#0f172a" />
                  {/* Face center */}
                  <polygon points="33,44 67,44 70,68 30,68" fill="#334155" />
                  {/* Left cheek */}
                  <polygon points="16,48 33,44 30,68 18,64" fill="#1e293b" />
                  {/* Right cheek */}
                  <polygon points="84,48 67,44 70,68 82,64" fill="#1e293b" />
                  {/* Left eye */}
                  <polygon points="36,51 46,49 45,57 35,57" fill="#0f172a" />
                  <polygon points="38,52 43,51 42,55 37,55" fill="#94a3b8" />
                  {/* Right eye */}
                  <polygon points="54,49 64,51 65,57 55,57" fill="#0f172a" />
                  <polygon points="57,51 62,51 63,55 58,55" fill="#94a3b8" />
                  {/* Nose */}
                  <polygon points="48,60 52,60 51,66 49,66" fill="#1e293b" />
                  {/* Mouth */}
                  <polygon points="41,72 50,69 59,72 54,77 46,77" fill="#0f172a" />
                  {/* Chin */}
                  <polygon points="30,68 70,68 66,80 34,80" fill="#2d3d50" />
                  <polygon points="34,80 66,80 50,88" fill="#1a2536" />
                  {/* Neck */}
                  <polygon points="43,86 57,86 60,96 40,96" fill="#0f172a" />
                </svg>
                <div className="token-visual__face-center" />
              </div>
            </div>
          </div>
        </section>

        {/* ── ACHIEVEMENT CARD ────────────────────────────────────────────── */}
        {/* EDIT: Achievement name, skills, rarity, and XP */}
        <section
          className={`token-achievement-card${unlocked ? ' token-achievement-card--visible' : ''}`}
          aria-label="Achievement details"
        >
          <div className="token-achievement-card__header">
            <span className="token-achievement-card__icon" aria-hidden="true">🏆</span>
            <div>
              <p className="token-achievement-card__label">Achievement</p>
              <p className="token-achievement-card__title">Met the Maker</p>
            </div>
          </div>

          <div className="token-achievement-card__body">
            <div className="token-achievement-card__skills">
              {ACHIEVEMENT_SKILLS.map((s) => (
                <span key={s} className="token-chip">{s}</span>
              ))}
            </div>

            <div className="token-achievement-card__meta">
              <div className="token-achievement-card__meta-item">
                <span className="token-achievement-card__meta-label">Rarity</span>
                <span className="token-achievement-card__rarity">Legendary</span>
              </div>
              <div className="token-achievement-card__meta-item">
                <span className="token-achievement-card__meta-label">Reward</span>
                <span className="token-achievement-card__xp">XP +1000</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTAs ────────────────────────────────────────────────────────── */}
        {/* EDIT: Button labels and hrefs */}
        <section className="token-ctas">
          <a href="/" className="token-btn token-btn--primary">
            Enter Portfolio
          </a>
          <a href="/#work" className="token-btn token-btn--ghost">
            View Projects
          </a>
          <a href="/#contact" className="token-btn token-btn--ghost">
            Contact Me
          </a>
        </section>

        {/* ── WHAT YOU SCANNED ────────────────────────────────────────────── */}
        {/* EDIT: Explanation copy */}
        <section className="token-info-section">
          <h2 className="token-section-title">What You Scanned</h2>
          <p className="token-body-text">
            This is a custom NFC token — a chip embedded inside a 3D-printed object.
            When you tapped it with your phone, it sent your browser here instantly.
            No app, no QR code, no friction. Just tap and go.
          </p>
        </section>

        {/* ── BUILT WITH ──────────────────────────────────────────────────── */}
        <section className="token-info-section">
          <h2 className="token-section-title">Built With</h2>
          <div className="token-chips-row">
            {BUILT_WITH_SKILLS.map((s) => (
              <span key={s} className="token-chip token-chip--dim">{s}</span>
            ))}
          </div>
        </section>

        {/* ── WHY IT EXISTS ───────────────────────────────────────────────── */}
        {/* EDIT: "Why it exists" paragraph */}
        <section className="token-info-section">
          <h2 className="token-section-title">Why It Exists</h2>
          <p className="token-body-text">
            A portfolio site is passive — you have to find it. A physical token changes
            the dynamic. If you're holding this, we're already in the same room.
            This is how I introduce myself when a URL isn't enough.
          </p>
        </section>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      {/* EDIT: Footer link and name */}
      <footer className="token-footer">
        Avelino Martinez · Leva LLC · <a href="/">portfolio-4n2.pages.dev</a>
      </footer>

    </div>
  )
}
