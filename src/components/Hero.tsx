import './Hero.css'

export default function Hero() {
  return (
    <section className="hero section">
      <div className="container">
        <div className="hero__eyebrow">
          <span className="tag">Manufacturing × AI × Software</span>
        </div>

        <h1 className="hero__headline">
          I build what the<br />
          physical world<br />
          is missing.
        </h1>

        <p className="hero__sub">
          Quality Manager at an AS9100-certified machine shop.
          A decade on the shop floor showed me exactly where the gaps are —
          in software, in tooling, in process. Now I build to fill them.
        </p>

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
