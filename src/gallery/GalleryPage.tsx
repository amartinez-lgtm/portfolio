import { useState, useRef, lazy, Suspense, Component, type ReactNode } from 'react'
import { galleryPieces } from '../data/gallery'
import type { GalleryPiece } from '../data/gallery'
import './GalleryPage.css'

// Reuse the store's 3D viewer. Retry once on failure — handles transient
// network errors loading the large Three.js chunk.
const Model3DViewer = lazy(() =>
  import('../store/Model3DViewer').catch(() => import('../store/Model3DViewer'))
)

class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() { return this.state.err ? this.props.fallback : this.props.children }
}

function handleCommissionEmail(piece?: GalleryPiece) {
  const subject = encodeURIComponent(
    piece ? `Commission Inquiry: ${piece.title}` : 'Commission Inquiry — Sculpture'
  )
  const body = encodeURIComponent(
    `Hi Avelino,\n\nI'm interested in commissioning a piece${piece ? ` in the spirit of "${piece.title}"` : ''}.\n\nHere's what I have in mind:\n\n`
  )
  window.open(`mailto:levallcworks@gmail.com?subject=${subject}&body=${body}`)
}

function hasModel(piece: GalleryPiece): boolean {
  return piece.status === 'available' && !!piece.model3d
}

function PieceMedia({ piece, mini }: { piece: GalleryPiece; mini: boolean }) {
  const allImages = [piece.image, ...(piece.images ?? [])].filter(Boolean) as string[]

  if (hasModel(piece) && piece.model3d) {
    return (
      <ViewerBoundary fallback={
        allImages[0]
          ? <img src={allImages[0]} alt={piece.title} className="gl-media__img" />
          : <div className="gl-media__placeholder"><span aria-hidden="true">◈</span></div>
      }>
        <Suspense fallback={<div className="gl-media__placeholder"><div className="mv-spinner" /></div>}>
          <Model3DViewer
            mini={mini}
            parts={piece.model3d.parts}
            color={piece.model3d.color}
            rotationX={piece.model3d.rotationX}
            rotationY={piece.model3d.rotationY}
            rotationZ={piece.model3d.rotationZ}
          />
        </Suspense>
      </ViewerBoundary>
    )
  }

  if (allImages.length > 0) {
    return <img src={allImages[0]} alt={piece.title} className="gl-media__img" />
  }

  return (
    <div className="gl-media__placeholder">
      <span className="gl-media__placeholder-icon" aria-hidden="true">◈</span>
      <span className="gl-media__placeholder-label">Coming soon</span>
    </div>
  )
}

function PieceLightbox({ piece, onClose }: { piece: GalleryPiece; onClose: () => void }) {
  const touchStartY = useRef(0)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (e.changedTouches[0].clientY - touchStartY.current > 72) onClose()
  }

  return (
    <>
      <div className="gl-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="gl-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={piece.title}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="gl-lightbox__handle" aria-hidden="true" />
        <button className="gl-lightbox__close" onClick={onClose} aria-label="Close">×</button>

        <div className="gl-lightbox__media">
          <PieceMedia piece={piece} mini={false} />
        </div>

        <div className="gl-lightbox__body">
          <p className="gl-piece__eyebrow">
            {piece.medium}{piece.medium && piece.year ? ' · ' : ''}{piece.year}
          </p>
          <h2 className="gl-lightbox__title">{piece.title}</h2>
          <p className="gl-lightbox__story">{piece.story}</p>
          <div className="gl-piece__tags">
            {piece.tags.map((t) => <span key={t} className="gl-tag">{t}</span>)}
          </div>
          <button className="gl-btn gl-btn--outline" onClick={() => handleCommissionEmail(piece)}>
            Commission a piece
          </button>
        </div>
      </div>
    </>
  )
}

function PieceCard({ piece, blurred, onOpen }: { piece: GalleryPiece; blurred: boolean; onOpen: () => void }) {
  const live = hasModel(piece) || !!piece.image || (piece.images?.length ?? 0) > 0
  return (
    <figure className="gl-piece">
      <div
        className={`gl-media${live ? ' gl-media--live' : ''}`}
        onClick={live ? onOpen : undefined}
        role={live ? 'button' : undefined}
        tabIndex={live ? 0 : undefined}
        onKeyDown={(e) => { if (live && e.key === 'Enter') onOpen() }}
        aria-label={live ? `View ${piece.title}` : undefined}
      >
        <PieceMedia piece={piece} mini />
        {blurred && (
          <div className="gl-age-veil">
            <span className="gl-age-veil__badge">18+</span>
            <span className="gl-age-veil__text">Contains artistic nudity.<br />Tap to confirm you're 18 or older.</span>
          </div>
        )}
        {live && !blurred && <div className="gl-media__hint" aria-hidden="true">View</div>}
      </div>
      <figcaption className="gl-piece__caption">
        <p className="gl-piece__eyebrow">
          {piece.medium}{piece.medium && piece.year ? ' · ' : ''}{piece.year}
        </p>
        <h3 className="gl-piece__title">{piece.title}</h3>
        <p className="gl-piece__story">{piece.story}</p>
        <div className="gl-piece__tags">
          {piece.tags.map((t) => <span key={t} className="gl-tag">{t}</span>)}
        </div>
      </figcaption>
    </figure>
  )
}

function AgeGate({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <div className="gl-overlay" onClick={onCancel} aria-hidden="true" />
      <div className="gl-agegate" role="dialog" aria-modal="true" aria-label="Age confirmation">
        <span className="gl-agegate__badge">18+</span>
        <h2 className="gl-agegate__title">Age-restricted work</h2>
        <p className="gl-agegate__text">
          This piece is a figure study that contains artistic nudity.
          Please confirm you are 18 years of age or older to view it.
        </p>
        <button className="gl-btn gl-btn--primary" onClick={onConfirm}>I am 18 or older</button>
        <button className="gl-btn gl-btn--ghost" onClick={onCancel}>Go back</button>
      </div>
    </>
  )
}

export default function GalleryPage() {
  const [selected, setSelected] = useState<GalleryPiece | null>(null)
  const [adultConfirmed, setAdultConfirmed] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState<GalleryPiece | null>(null)

  function openPiece(piece: GalleryPiece) {
    if (piece.nsfw && !adultConfirmed) setPendingConfirm(piece)
    else setSelected(piece)
  }

  function confirmAdult() {
    setAdultConfirmed(true)
    setSelected(pendingConfirm)
    setPendingConfirm(null)
  }

  return (
    <div className="gl">
      <header className="gl-header">
        <a href="/store" className="gl-back">
          <svg viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 1 1 7 7 13" />
          </svg>
          Store
        </a>
        <a href="/" className="gl-header__link">Portfolio →</a>
      </header>

      <section className="gl-hero">
        <div className="gl-hero__inner">
          <p className="gl-eyebrow">Sculpture · Leva LLC</p>
          <h1 className="gl-headline">The Gallery</h1>
          <p className="gl-sub">
            Work off the shelf — portrait busts, figurative studies, and pieces made
            to tell a story rather than fill a need. Modeled, printed, and finished by hand.
          </p>
        </div>
      </section>

      <main className="gl-main">
        <div className="gl-grid">
          {galleryPieces.map((piece) => (
            <PieceCard
              key={piece.id}
              piece={piece}
              blurred={!!piece.nsfw && !adultConfirmed}
              onOpen={() => openPiece(piece)}
            />
          ))}
        </div>

        <div className="gl-commission">
          <p className="gl-commission__title">Want a piece of your own?</p>
          <p className="gl-commission__body">
            Portrait busts from a scan or photos, custom figures, one-off sculptural work —
            commissions are open. Each piece is handled personally by Avelino Martinez.
          </p>
          <button className="gl-btn gl-btn--primary" onClick={() => handleCommissionEmail()}>
            Start a commission
          </button>
        </div>
      </main>

      <footer className="gl-footer">
        <span>The Gallery · Leva LLC · Avelino Martinez</span>
        <span>levallc.com</span>
      </footer>

      {selected && <PieceLightbox piece={selected} onClose={() => setSelected(null)} />}
      {pendingConfirm && <AgeGate onConfirm={confirmAdult} onCancel={() => setPendingConfirm(null)} />}
    </div>
  )
}
