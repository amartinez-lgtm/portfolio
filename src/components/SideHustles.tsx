import { sideHustles, type SideHustle } from '../data/projects'
import './SideHustles.css'

const statusLabel: Record<SideHustle['status'], string> = {
  active: 'Active',
  'in-progress': 'In progress',
  planned: 'Planned',
}

function HustleCard({ h }: { h: SideHustle }) {
  return (
    <article className={`hustle-card card hustle-card--${h.status}`}>
      <div className="hustle-card__header">
        <span className={`hustle-card__status tag hustle-card__status--${h.status}`}>
          {h.status === 'active' && <span className="hustle-card__dot" />}
          {statusLabel[h.status]}
        </span>
      </div>

      <h3 className="hustle-card__name">{h.name}</h3>
      <p className="hustle-card__tagline">{h.tagline}</p>
      <p className="hustle-card__desc">{h.description}</p>

      <div className="hustle-card__tags">
        {h.tags.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
    </article>
  )
}

export default function SideHustles() {
  const active = sideHustles.filter((h) => h.status === 'active')
  const inProgress = sideHustles.filter((h) => h.status === 'in-progress')
  const planned = sideHustles.filter((h) => h.status === 'planned')

  return (
    <section id="ventures" className="section">
      <div className="container">
        <p className="section-label">Leva LLC</p>
        <h2 className="section-title">Side hustles & ventures</h2>
        <p className="section-desc">
          Beyond the day job — physical products, digital files, mapping services, and a few things still being built.
        </p>

        <div className="hustles__group">
          <h3 className="hustles__group-label">Running now</h3>
          <div className="hustles__grid">
            {active.map((h) => <HustleCard key={h.id} h={h} />)}
          </div>
        </div>

        <div className="hustles__group">
          <h3 className="hustles__group-label">In progress</h3>
          <div className="hustles__grid">
            {inProgress.map((h) => <HustleCard key={h.id} h={h} />)}
          </div>
        </div>

        <div className="hustles__group">
          <h3 className="hustles__group-label">On the roadmap</h3>
          <div className="hustles__grid">
            {planned.map((h) => <HustleCard key={h.id} h={h} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
