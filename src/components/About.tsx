import './About.css'

const skills = [
  { category: 'Languages', items: ['TypeScript', 'Python', 'SQL'] },
  { category: 'Frontend', items: ['React', 'Vite', 'CSS'] },
  { category: 'Backend', items: ['Node.js', 'FastAPI', 'Express', 'PostgreSQL', 'Supabase'] },
  { category: 'Infra', items: ['Cloudflare Pages', 'Cloudflare Workers', 'Docker'] },
  { category: 'AI / ML', items: ['OpenAI API', 'GPT-4V', 'Prompt Engineering', 'LLM Evals'] },
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

            <div className="about__avatar-row">
              <img
                src="/avatar_jpg.jpeg"
                alt="Avelino Martinez"
                className="about__avatar"
              />
            </div>

            <div className="about__bio">
              <p>
                I spent a decade on the manufacturing floor before I wrote production code. That sequence matters.
                When I build a QMS, I've lived through the NCR process from both sides. When I build an inspection
                tool, I know what a first article package is supposed to look like before I write the parser.
              </p>
              <p>
                At Final Frontier Manufacturing, I run quality — AS9100D compliance, audits, supplier qualification,
                the whole lifecycle. In parallel I've shipped 7 internal tools the team actually uses, across
                roughly 161K lines of TypeScript and Python in about 10 weeks.
              </p>
              <p>
                Leva LLC is my independent studio for 3D scanning, mapping, digital fabrication, and practical
                AI software. Through Leva, I work on projects that connect the physical world to digital systems —
                handheld 3D scanning, LiDAR capture, photogrammetry, Blender mesh cleanup, CAD preparation,
                3D printing, and experimental software tools. It's the umbrella for my outside work: product
                development, scan-to-model workflows, digital assets, mapping experiments, and automation ideas
                built from real-world problems.
              </p>
              <p>
                The goal is simple: use modern tools to capture, clean, build, and improve the physical world
                around us.
              </p>
            </div>

            <div className="about__ai-callout">
              <div className="about__ai-callout-header">
                <span className="about__ai-chip">How I think about problems</span>
              </div>
              <p>
                Every problem gets the same first question: is this a job for <strong>software</strong>,
                {' '}<strong>AI</strong>, or a <strong>human</strong>? Manufacturing quality work is mostly a
                software problem — structured rules, audit trails, deterministic output. When I benchmarked
                GPT-4V for engineering drawing interpretation and it hit 70% accuracy, I scrapped it and built
                a deterministic parser that gets 100%. But when a task is genuinely unstructured — language
                generation, pattern recognition across noisy records, judgment calls — AI earns its place.
                I've built both. I know where the line is.
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
