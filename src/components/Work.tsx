import { useState } from 'react'
import { projects, type Project } from '../data/projects'
import './Work.css'

function ProjectRow({ p, index }: { p: Project; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <article className={`project-row${open ? ' project-row--open' : ''}`}>
      <button
        className="project-row__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="project-row__index" aria-hidden>
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="project-row__title-group">
          <span className="project-row__name">{p.name}</span>
          <span className="project-row__tagline">{p.tagline}</span>
        </span>

        <span className="project-row__badges">
          {p.aiNote && (
            <span className="project-row__ai-chip" aria-label="Uses or evaluates AI">
              AI
            </span>
          )}
          {p.highlight && (
            <span className="project-row__highlight-chip">
              {p.highlight === 'ai-wrong-tool' ? 'Engineering call' : 'Shipped in 1 day'}
            </span>
          )}
          <span className="project-row__loc">{p.loc}</span>
        </span>

        <span className="project-row__chevron" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      <div className="project-row__body" role="region">
        <div className="project-row__body-inner">
          {p.aiNote && (
            <div className="project-row__ai-note">
              <span className="project-row__ai-note-label">AI</span>
              <p>{p.aiNote}</p>
            </div>
          )}
          <p className="project-row__desc">{p.description}</p>
          <div className="project-row__footer">
            <div className="project-row__tags">
              {p.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-row__visit"
                onClick={(e) => e.stopPropagation()}
              >
                Visit
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            )}
          </div>
        </div>
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

        <div className="work__list">
          {projects.map((p, i) => (
            <ProjectRow key={p.id} p={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
