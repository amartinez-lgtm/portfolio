import { useState } from 'react'
import './About.css'

const skills = [
  { category: 'Languages',    items: ['TypeScript', 'Python', 'SQL'] },
  { category: 'Frontend',     items: ['React', 'Vite', 'CSS'] },
  { category: 'Backend',      items: ['Node.js', 'FastAPI', 'Express', 'PostgreSQL', 'Supabase'] },
  { category: 'Infra',        items: ['Cloudflare Pages', 'Cloudflare Workers', 'Docker'] },
  { category: 'AI / ML',      items: ['OpenAI API', 'GPT-4V', 'Prompt Engineering', 'LLM Evals'] },
  { category: 'Manufacturing', items: ['AS9100D', 'AS9102', 'FAI', 'NCR/CAR', 'ERP'] },
  { category: 'Tools',        items: ['Pix4D', 'Drone2Map', 'trimesh', 'Electron', 'Shopify'] },
]

export default function About() {
  const [photoVisible, setPhotoVisible] = useState(false)

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="about__layout">
          <div className="about__left">
            <p className="section-label">About</p>

            {/* Drop avatar.jpg into /public to activate this */}
            <div className={`about__photo-wrap${photoVisible ? ' about__photo-wrap--visible' : ''}`}>
              <img
                src="/avatar.jpg"
                alt="Avelino Martinez"
                className="about__photo"
                onLoad={() => setPhotoVisible(true)}
                onError={() => setPhotoVisible(false)}
              />
            </div>

            <h2 className="section-title">Manufacturing domain expert who builds software</h2>

            <div className="about__bio">
              <p>
                I spent a decade on the manufacturing floor before I wrote production code. That sequence matters.
                When I build a QMS, I've lived through the NCR process from both sides. When I build an inspection
                tool, I know what a first article package is supposed to look like before I write the parser.
              </p>
              <p>
                I build AI-powered quality systems for aerospace manufacturing — tools that read purchase orders,
                extract contractual quality clauses, parse engineering drawings, and automate compliance work that
                used to take engineers days. 161K lines across 7 internal tools, all running in production inside
                an AS9100-certified machine shop, shipped in about 10 weeks.
              </p>
              <p>
                Leva LLC is my independent studio for 3D scanning, mapping, digital fabrication, and practical
                AI software. Handheld LiDAR capture, drone photogrammetry, Blender mesh cleanup, CAD preparation,
                3D printing, and experimental software tools built from real-world problems — all under one roof.
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
                a deterministic parser that gets 100%. But when a task is genuinely unstructured — reading
                free-text contract clauses, surfacing patterns across noisy records, generating compliance
                summaries — AI earns its place. I've built both. I know where the line is.
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
