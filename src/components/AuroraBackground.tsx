/**
 * AuroraBackground
 *
 * Subtle animated gradient background. Renders three blurred gradient blobs,
 * an optional faint grid overlay, and an optional SVG grain texture. Uses
 * position:fixed so it layers behind all page content without requiring any
 * wrapper changes.
 *
 * @example
 * // Drop it as the first child in App.tsx — z-index handles the rest.
 * // Also update the dark-mode body background in index.css to transparent
 * // (or #0a0a0b) so the aurora shows through:
 * //
 * //   @media (prefers-color-scheme: dark) {
 * //     :root { --bg: transparent; }
 * //   }
 * //
 * import AuroraBackground from './components/AuroraBackground'
 *
 * export default function App() {
 *   return (
 *     <>
 *       <AuroraBackground />
 *       <Nav />
 *       <main>...</main>
 *       <Footer />
 *     </>
 *   )
 * }
 *
 * @prop intensity  'subtle' | 'normal' — halves blob opacities when 'subtle'. Default 'normal'.
 * @prop showGrid   Render the faint 64px grid overlay. Default true.
 * @prop showGrain  Render the SVG fractal-noise grain texture. Default true.
 */

import './AuroraBackground.css'

interface AuroraBackgroundProps {
  intensity?: 'subtle' | 'normal'
  showGrid?: boolean
  showGrain?: boolean
}

export default function AuroraBackground({
  intensity = 'normal',
  showGrid = true,
  showGrain = true,
}: AuroraBackgroundProps) {
  return (
    <div
      className={`aurora aurora--${intensity}`}
      aria-hidden="true"
    >
      <div className="aurora__blob aurora__blob--1" />
      <div className="aurora__blob aurora__blob--2" />
      <div className="aurora__blob aurora__blob--3" />

      {showGrid && <div className="aurora__grid" />}

      {showGrain && (
        <svg
          className="aurora__grain"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <filter id="aurora-noise" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#aurora-noise)" />
        </svg>
      )}
    </div>
  )
}
