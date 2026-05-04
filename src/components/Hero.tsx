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
