import { useState, useRef, lazy, Suspense, Component, type ReactNode } from 'react'
import { storeProducts } from '../data/store'
import type { StoreProduct } from '../data/store'
import './StorePage.css'

// Retry once on failure — handles transient network errors loading the large Three.js chunk
const Model3DViewer = lazy(() => import('./Model3DViewer').catch(() => import('./Model3DViewer')))

class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() { return this.state.err ? this.props.fallback : this.props.children }
}

type Filter = 'all' | 'physical' | 'digital'

const FILTER_LABELS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'physical', label: 'Physical' },
  { value: 'digital', label: 'Digital Downloads' },
]

function handleOrderEmail(product: StoreProduct) {
  const subject = encodeURIComponent(`Product Inquiry: ${product.name}`)
  const body = encodeURIComponent(
    `Hi Avelino,\n\nI'm interested in ordering: ${product.name}\n\nPlease let me know about availability and pricing.\n\nThanks`
  )
  window.open(`mailto:levallcworks@gmail.com?subject=${subject}&body=${body}`)
}

function ProductDrawer({ product, onClose }: { product: StoreProduct; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0)
  const [view, setView] = useState<'3d' | 'photos'>(product.model3d ? '3d' : 'photos')
  const touchStartY = useRef(0)
  const isComingSoon = product.status === 'coming-soon'

  const allImages = [product.image, ...(product.images ?? [])].filter(Boolean) as string[]

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (e.changedTouches[0].clientY - touchStartY.current > 72) onClose()
  }

  return (
    <>
      <div className="sp-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="sp-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sp-drawer__handle" aria-hidden="true" />

        {/* View toggle — only if product has a 3D model */}
        {product.model3d && (
          <div className="sp-view-tabs">
            <button
              className={`sp-view-tab${view === '3d' ? ' sp-view-tab--active' : ''}`}
              onClick={() => setView('3d')}
            >
              ◈ 3D Model
            </button>
            <button
              className={`sp-view-tab${view === 'photos' ? ' sp-view-tab--active' : ''}`}
              onClick={() => setView('photos')}
            >
              Photos
            </button>
          </div>
        )}

        {/* Gallery area */}
        <div className="sp-drawer__gallery">
          {view === '3d' && product.model3d ? (
            <ViewerBoundary fallback={
              <div className="sp-drawer__no-img">
                <span aria-hidden="true">◈</span>
                <span>3D unavailable — tap Photos</span>
              </div>
            }>
              <Suspense fallback={
                <div className="sp-drawer__no-img">
                  <div className="mv-spinner" />
                  <span>Loading 3D model…</span>
                </div>
              }>
                <Model3DViewer parts={product.model3d.parts} color={product.model3d.color} rotationX={product.model3d.rotationX} rotationY={product.model3d.rotationY} rotationZ={product.model3d.rotationZ} />
              </Suspense>
            </ViewerBoundary>
          ) : allImages.length > 0 ? (
            <>
              <img
                key={allImages[imgIdx]}
                src={allImages[imgIdx]}
                alt={product.name}
                className="sp-drawer__img"
              />
              {allImages.length > 1 && (
                <div className="sp-drawer__dots">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      className={`sp-dot${i === imgIdx ? ' sp-dot--active' : ''}`}
                      onClick={() => setImgIdx(i)}
                      aria-label={`Photo ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="sp-drawer__no-img">
              <span aria-hidden="true">{product.type === 'digital' ? '⬡' : '◈'}</span>
              <span>Photo coming soon</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="sp-drawer__body">
          <div className="sp-drawer__meta">
            <span className={`sp-badge sp-badge--${product.type}`}>
              {product.type === 'physical' ? 'Physical' : 'Digital'}
            </span>
            {product.stlStatus && (
              <span className="sp-badge sp-badge--digital">Digital</span>
            )}
            <span className="sp-card__price">{product.price}</span>
          </div>
          <h2 className="sp-drawer__name">{product.name}</h2>
          <p className="sp-drawer__desc">{product.description}</p>
          <div className="sp-card__tags">
            {product.tags.map((t) => <span key={t} className="sp-tag">{t}</span>)}
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="sp-drawer__cta">
          <button
            className="sp-btn sp-btn--primary"
            onClick={() => handleOrderEmail(product)}
            disabled={isComingSoon}
          >
            Request Order
          </button>
          {product.stlStatus && (
            product.stlStatus === 'available' && product.downloadUrl ? (
              <a href={product.downloadUrl} className="sp-btn sp-btn--outline" download>
                Download STL — Free
              </a>
            ) : (
              <button className="sp-btn sp-btn--outline" disabled>
                Download STL — Coming Soon
              </button>
            )
          )}
          <button className="sp-drawer__cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </>
  )
}

function ProductCard({ product, onTap }: { product: StoreProduct; onTap: () => void }) {
  const isComingSoon = product.status === 'coming-soon'

  return (
    <div
      className={`sp-card${isComingSoon ? ' sp-card--soon' : ''}`}
      onClick={onTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onTap()}
      aria-label={`View ${product.name}`}
    >
      <div className="sp-card__image">
        {product.model3d ? (
          <ViewerBoundary fallback={
            product.image
              ? <img src={product.image} alt={product.name} />
              : <div className="sp-card__placeholder"><span className="sp-card__placeholder-icon" aria-hidden="true">◈</span></div>
          }>
            <Suspense fallback={<div className="sp-card__placeholder"><div className="mv-spinner" /></div>}>
              <Model3DViewer mini parts={product.model3d.parts} color={product.model3d.color} rotationX={product.model3d.rotationX} rotationY={product.model3d.rotationY} rotationZ={product.model3d.rotationZ} />
            </Suspense>
          </ViewerBoundary>
        ) : product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="sp-card__placeholder">
            <span className="sp-card__placeholder-icon" aria-hidden="true">
              {product.type === 'digital' ? '⬡' : '◈'}
            </span>
            <span className="sp-card__placeholder-label">Photo coming soon</span>
          </div>
        )}
        {isComingSoon && <div className="sp-card__soon-badge">Coming Soon</div>}
        {!isComingSoon && (
          <div className="sp-card__tap-hint" aria-hidden="true">Tap to view</div>
        )}
      </div>

      <div className="sp-card__body">
        <div className="sp-card__meta">
          <span className={`sp-badge sp-badge--${product.type}`}>
            {product.type === 'physical' ? 'Physical' : 'Digital'}
          </span>
          {product.stlStatus && (
            <span className="sp-badge sp-badge--digital">Digital</span>
          )}
          <span className="sp-card__price">{product.price}</span>
        </div>
        <h3 className="sp-card__name">{product.name}</h3>
        <p className="sp-card__desc">{product.description}</p>
        <div className="sp-card__tags">
          {product.tags.map((t) => <span key={t} className="sp-tag">{t}</span>)}
        </div>
        <div className="sp-card__footer">
          <div className="sp-card__cta-hint">
            View details →
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StorePage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<StoreProduct | null>(null)

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
        <img src="/Photoroom_20250521_195827.jpeg" alt="XYZ" className="sp-logo" />
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
            <ProductCard key={product.id} product={product} onTap={() => setSelected(product)} />
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

      {selected && <ProductDrawer product={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
