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
        <span className="sp-header__brand">Leva LLC</span>
      </header>

      <main className="sp-main">
        <div className="sp-hero">
          <p className="sp-eyebrow">Leva LLC Store</p>
          <h1 className="sp-headline">3D-Printed Objects,<br />Built In-House</h1>
          <p className="sp-sub">
            Made-to-order physical products and free STL downloads.
            Every item designed and printed by Avelino Martinez.
          </p>
          <div className="sp-stats">
            <span><strong>{availableCount}</strong> available now</span>
            <span className="sp-stats__sep" aria-hidden="true">·</span>
            <span>Free STL files dropping soon</span>
            <span className="sp-stats__sep" aria-hidden="true">·</span>
            <span>Custom orders welcome</span>
          </div>
        </div>

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
              Have a design in mind? I do custom 3D printing, scanning, and fabrication through Leva LLC.
            </p>
            <a
              href="mailto:levallcworks@gmail.com?subject=Custom%20Order%20Inquiry"
              className="sp-btn sp-btn--primary"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </main>

      <footer className="sp-footer">
        <span>© {new Date().getFullYear()} Leva LLC · Avelino Martinez</span>
        <a href="/">portfolio-4n2.pages.dev</a>
      </footer>

    </div>
  )
}
