import { careerStories } from '../data/projects'
import './CareerStories.css'

export default function CareerStories() {
  return (
    <section id="stories" className="section">
      <div className="container">
        <p className="section-label">Career stories</p>
        <h2 className="section-title">How I think about problems</h2>
        <p className="section-desc">
          A few moments worth telling — the decisions and outcomes that shaped how I work.
        </p>

        <div className="stories__list">
          {careerStories.map((s, i) => (
            <article key={s.id} className="story">
              <div className="story__number">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="story__body">
                <h3 className="story__title">{s.title}</h3>
                <p className="story__hook">{s.hook}</p>
                <p className="story__text">{s.body}</p>
                <div className="story__tags">
                  {s.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
