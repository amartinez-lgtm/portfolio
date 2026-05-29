import { useState } from 'react'
import { storeProducts } from '../data/store'
import type { StoreProduct } from '../data/store'
import './StorePage.css'

type Filter = 'all' | 'physical' | 'digital'

const FILTER_LABELS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'physical', label: 'Physical' },
  { value: 'digital', label: 'Digital Downloads' },
]

function ProductCard({ product }: { product: StoreProduct }) {
  const isComingSoon = product.status === 'coming-soon'

  function handleOrder() {
    const subject = encodeURIComponent(`Product Inquiry: ${product.name}`)
    const body = encodeURIComponent(
      `Hi Avelino,\n\nI'm interested in ordering: ${product.name}\n\nPlease let me know about availability and pricing.\n\nThanks`
    )
    window.open(`mailto:levallcworks@gmail.com?subject=${subject}&body=${body}`)
  }

  return (
    <div className={`sp-card${isComingSoon ? ' sp-card--soon' : ''}`}>
      <div className="sp-card__image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="sp-card__placeholder">
            <span className="sp-card__placeholder-icon" aria-hidden="true">
              {product.type === 'digital' ? '⬡' : '◈'}
            </span>
            <span className="sp-card__placeholder-label">Photo coming soon</span>
          </div>
        )}
        {isComingSoon && (
          <div className="sp-card__soon-badge">Coming Soon</div>
        )}
      </div>

      <div className="sp-card__body">
        <div className="sp-card__meta">
          <span className={`sp-badge sp-badge--${product.type}`}>
            {product.type === 'physical' ? 'Physical' : 'Digital'}
          </span>
          <span className="sp-card__price">{product.price}</span>
        </div>

        <h3 className="sp-card__name">{product.name}</h3>
        <p className="sp-card__desc">{product.description}</p>

        <div className="sp-card__tags">
          {product.tags.map((t) => (
            <span key={t} className="sp-tag">{t}</span>
          ))}
        </div>

        <div className="sp-card__footer">
          {product.type === 'digital' ? (
            isComingSoon || !product.downloadUrl ? (
              <button className="sp-btn sp-btn--ghost" disabled>
                Download STL
              </button>
            ) : (
              <a href={product.downloadUrl} className="sp-btn sp-btn--primary" download>
                Download STL
              </a>
            )
          ) : (
            <button
              className="sp-btn sp-btn--primary"
              onClick={handleOrder}
              disabled={isComingSoon}
            >
              Request Order
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StorePage() {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = storeProducts.filter(
    (p) => filter === 'all' || p.type === filter
  )

  const availableCount = storeProducts.filter((p) => p.status === 'available').length

  return (
    <div className="sp">

      <header className="sp-header">
        <a href="/" className="sp-back">
          <svg viewBox="0 0 8 14" fill="none" aria-hidden="true">
            <path d="M7 1L1 7l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Portfolio
        </a>
        <img src="/Photoroom_20250521_201123.jpeg" alt="XYZ" className="sp-logo" />
      </header>

      <section className="sp-hero">
        <div className="sp-hero__inner">
          <p className="sp-eyebrow">by Leva LLC</p>
          <h1 className="sp-headline">3D Prints for<br />Everyday Living</h1>
          <p className="sp-sub">
            Made-to-order objects designed and printed in-house.
            Built to last, sized for real life.
          </p>
          <div className="sp-stats">
            <span><strong>{availableCount}</strong> available now</span>
            <span className="sp-stats__sep" aria-hidden="true">·</span>
            <span>Free STL files dropping soon</span>
            <span className="sp-stats__sep" aria-hidden="true">·</span>
            <span>Custom orders welcome</span>
          </div>
        </div>
      </section>

      <div className="sp-banner">
        <img src="/XYZ.png" alt="XYZ — 3D Prints for Everyday Living" />
      </div>

      <main className="sp-main">

        <div className="sp-filters">
          {FILTER_LABELS.map(({ value, label }) => (
            <button
              key={value}
              className={`sp-filter-btn${filter === value ? ' sp-filter-btn--active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="sp-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="sp-custom-cta">
          <div className="sp-custom-cta__inner">
            <p className="sp-custom-cta__title">Need something custom?</p>
            <p className="sp-custom-cta__body">
              Have a design in mind? XYZ does custom 3D printing, scanning, and fabrication.
              Every order is handled personally by Avelino Martinez.
            </p>
            <a
              href="mailto:levallcworks@gmail.com?subject=Custom%20Order%20Inquiry%20%E2%80%94%20XYZ"
              className="sp-btn sp-btn--primary"
            >
              Get in Touch
            </a>
          </div>
        </div>

      </main>

      <footer className="sp-footer">
        <span>XYZ · Leva LLC · Avelino Martinez</span>
        <a href="/">portfolio-4n2.pages.dev</a>
      </footer>

    </div>
  )
}
