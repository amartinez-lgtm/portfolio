import { useCallback, useRef, useState } from 'react'
import './PhotoGallery.css'

interface Props {
  photos: string[]
  /** Describes the subject; the photo number is appended per slide. */
  alt: string
}

/**
 * Swipeable photo strip shared by the store drawer, the wholesale quote, and
 * anywhere else product photos appear. One implementation so the behaviour
 * cannot drift between pages: native scroll-snap swipe, arrows, a counter,
 * arrow-key support, and dots with full-size tap targets.
 */
export default function PhotoGallery({ photos, alt }: Props) {
  const [idx, setIdx] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((i: number) => {
    const el = trackRef.current
    const clamped = Math.max(0, Math.min(photos.length - 1, i))
    setIdx(clamped)
    if (el) el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
  }, [photos.length])

  /* Keep the dots and counter in step with a finger swipe. */
  const handleScroll = useCallback(() => {
    const el = trackRef.current
    if (!el || el.clientWidth === 0) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    setIdx((prev) => (i !== prev && i >= 0 && i < photos.length ? i : prev))
  }, [photos.length])

  if (photos.length === 0) return null

  const many = photos.length > 1

  return (
    <div className="pg">
      <div
        className="pg__track"
        ref={trackRef}
        onScroll={handleScroll}
        tabIndex={0}
        role="group"
        aria-label={`${alt} photos`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); goTo(idx + 1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(idx - 1) }
        }}
      >
        {photos.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${alt} — photo ${i + 1} of ${photos.length}`}
            className="pg__img"
            draggable={false}
          />
        ))}
      </div>

      {many && (
        <>
          <button
            type="button"
            className="pg__arrow pg__arrow--prev"
            aria-label="Previous photo"
            disabled={idx === 0}
            onClick={() => goTo(idx - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="pg__arrow pg__arrow--next"
            aria-label="Next photo"
            disabled={idx === photos.length - 1}
            onClick={() => goTo(idx + 1)}
          >
            ›
          </button>
          <p className="pg__counter" aria-live="polite">{idx + 1} / {photos.length}</p>
          <div className="pg__dots" role="group" aria-label="Choose photo">
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`pg__dot${i === idx ? ' pg__dot--active' : ''}`}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === idx}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
