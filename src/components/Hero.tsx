import './Hero.css'

export default function Hero() {
  return (
    <section className="hero section">
      <div className="container">
        <div className="hero__eyebrow">
          <span className="tag">Manufacturing × AI × Software</span>
        </div>

        <h1 className="hero__headline">
          I connect the physical<br />
          world to digital systems.
        </h1>

        <p className="hero__sub">
          Manufacturing software is written by people who've never touched a part.
          I've spent ten years on the floor — quality systems, supplier audits,
          aerospace certifications — and I know exactly where the gaps are.
          Now I build to fill them.
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
