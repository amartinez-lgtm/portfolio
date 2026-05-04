import './Hero.css'

export default function Hero() {
  return (
    <section className="hero section">
      <div className="container">
        <div className="hero__eyebrow">
          <span className="tag">Manufacturing × Software</span>
        </div>

        <h1 className="hero__headline">
          I build software<br />
          from the shop floor.
        </h1>

        <p className="hero__sub">
          10 years in aerospace manufacturing. Quality manager at an AS9100-certified
          machine shop. Shipped 7 production tools in ~10 weeks.
          I understand the domain before I write the first line.
        </p>

        <div className="hero__diagram" aria-hidden="true">
          <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="hero-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Axis lines */}
            <line x1="5" y1="100" x2="395" y2="100" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.25"/>
            <line x1="200" y1="5" x2="200" y2="195" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.25"/>

            {/* Tick marks — horizontal */}
            {[40, 80, 120, 160, 240, 280, 320, 360].map(x => (
              <line key={x} x1={x} y1="97.5" x2={x} y2="102.5" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.35"/>
            ))}

            {/* Tick marks — vertical */}
            {[20, 60, 140, 180].map(y => (
              <line key={y} x1="197.5" y1={y} x2="202.5" y2={y} stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.35"/>
            ))}

            {/* Orbit ellipse */}
            <ellipse cx="200" cy="100" rx="165" ry="85"
              stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"
              strokeDasharray="2 9"/>

            {/* Planet at left focus (c ≈ 141) */}
            <circle cx="59" cy="100" r="4" fill="currentColor" fillOpacity="0.45"/>
            <circle cx="59" cy="100" r="8" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2"/>

            {/* Traveling dot */}
            <circle className="hero__orbit-dot" r="4.5" fill="var(--accent)" filter="url(#hero-glow)"/>
          </svg>
        </div>

        <div className="hero__actions">
          <a href="#work" className="btn btn-primary">See the work</a>
          <a href="#contact" className="btn btn-ghost">Get in touch</a>
        </div>

        <div className="hero__affiliation">
          <span className="hero__affiliation-label">Quality Manager ·</span>
          <a
            href="https://ffmfg.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hero__affiliation-link"
          >
            Final Frontier Manufacturing
          </a>
          <span className="hero__affiliation-label"> · Founder ·</span>
          <span className="hero__affiliation-link">Leva LLC</span>
        </div>
      </div>
    </section>
  )
}
