import { projects, type Project } from '../data/projects'
import './Work.css'

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="project-card card">
      <div className="project-card__header">
        <div className="project-card__meta">
          <span className="tag project-card__loc">{p.loc}</span>
          {p.highlight && (
            <span className="tag project-card__badge">
              {p.highlight === 'ai-wrong-tool' ? '⚡ Engineering call' : '🚀 Shipped in 1 day'}
            </span>
          )}
        </div>
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card__link"
            aria-label={`Visit ${p.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        )}
      </div>

      <h3 className="project-card__name">{p.name}</h3>
      <p className="project-card__tagline">{p.tagline}</p>
      <p className="project-card__desc">{p.description}</p>

      <div className="project-card__tags">
        {p.tags.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
    </article>
  )
}

export default function Work() {
  return (
    <section id="work" className="section">
      <div className="container">
        <p className="section-label">Professional work</p>
        <h2 className="section-title">Things I've shipped</h2>
        <p className="section-desc">
          Production software built for a real aerospace shop — tools that sit on top of actual manufacturing workflows, not demo data.
        </p>

        <div className="work__grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
