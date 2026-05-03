import './About.css'

const skills = [
  { category: 'Languages', items: ['TypeScript', 'Python', 'SQL'] },
  { category: 'Frontend', items: ['React', 'Vite', 'CSS'] },
  { category: 'Backend', items: ['Node.js', 'FastAPI', 'Express', 'PostgreSQL', 'Supabase'] },
  { category: 'Infra', items: ['Cloudflare Pages', 'Cloudflare Workers', 'Docker'] },
  { category: 'Manufacturing', items: ['AS9100D', 'AS9102', 'FAI', 'NCR/CAR', 'ERP'] },
  { category: 'Tools', items: ['Pix4D', 'Drone2Map', 'trimesh', 'Electron', 'Shopify'] },
]

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <div className="about__layout">
          <div className="about__left">
            <p className="section-label">About</p>
            <h2 className="section-title">Manufacturing domain expert who builds software</h2>

            <div className="about__bio">
              <p>
                I spent a decade on the manufacturing floor before I wrote production code. That sequence matters.
                When I build a QMS, I've lived through the NCR process from both sides. When I build an inspection tool,
                I know what a first article package is supposed to look like before I write the parser.
              </p>
              <p>
                At Final Frontier Manufacturing, I run quality — AS9100D compliance, audits, supplier qualification,
                the whole lifecycle. In parallel I've shipped 7 internal tools that the team actually uses, across
                roughly 161K lines of TypeScript and Python in about 10 weeks.
              </p>
              <p>
                Outside work I run Leva LLC, which is an umbrella for everything else: 3D printing physical products,
                selling digital files, doing LiDAR mapping jobs, and building whatever seems interesting. A golf iron
                manufacturing project is currently on the workbench. So is a hydroponic garden.
              </p>
              <p>
                I'm most useful when the problem requires both domain depth and technical execution — and when the
                stakes are high enough that "close enough" isn't acceptable.
              </p>
            </div>
          </div>

          <div className="about__right">
            <div className="about__skills">
              <h3 className="about__skills-title">Stack & tools</h3>
              {skills.map((s) => (
                <div key={s.category} className="about__skill-row">
                  <span className="about__skill-category">{s.category}</span>
                  <div className="about__skill-items">
                    {s.items.map((item) => (
                      <span key={item} className="tag">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
