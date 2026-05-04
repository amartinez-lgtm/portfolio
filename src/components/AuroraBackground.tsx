/**
 * AuroraBackground
 *
 * Full-viewport background of layered inclined orbital ellipses — a nod
 * to aerospace. Three animated dots traverse their orbits at different speeds.
 * Grain texture and optional grid overlay add depth.
 *
 * @example
 * // Drop as the first child in App.tsx — z-index handles layering.
 * //
 * import AuroraBackground from './components/AuroraBackground'
 *
 * export default function App() {
 *   return (
 *     <>
 *       <AuroraBackground />
 *       <Nav />
 *       <main>...</main>
 *     </>
 *   )
 * }
 *
 * @prop intensity  'subtle' | 'normal' — halves ring/dot opacity. Default 'normal'.
 * @prop showGrid   Render faint 64px grid overlay. Default true.
 * @prop showGrain  Render SVG fractal-noise grain. Default true.
 */

import './AuroraBackground.css'

interface AuroraBackgroundProps {
  intensity?: 'subtle' | 'normal'
  showGrid?: boolean
  showGrain?: boolean
}

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Orbit path helper: full ellipse as two arcs (axis-aligned, in local space)
// Groups apply rotation transforms so the path stays simple here.
const ellipsePath = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx + rx},${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${cx + rx},${cy}`

export default function AuroraBackground({
  intensity = 'normal',
  showGrid = true,
  showGrain = true,
}: AuroraBackgroundProps) {
  return (
    <div className={`aurora aurora--${intensity}`} aria-hidden="true">

      {/* ── Orbital system ── */}
      <svg
        className="aurora__orbital"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <filter id="ao-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grand outer ring — tilt −15° */}
        <g transform="rotate(-15 720 450)">
          <path
            id="ao-r1"
            d={ellipsePath(720, 450, 680, 300)}
            className="aurora__ring"
          />
          {!reducedMotion && (
            <circle r="5" className="aurora__dot aurora__dot--amber" filter="url(#ao-glow)">
              <animateMotion dur="42s" repeatCount="indefinite" rotate="0">
                <mpath href="#ao-r1"/>
              </animateMotion>
            </circle>
          )}
        </g>

        {/* Mid ring — tilt +11° */}
        <g transform="rotate(11 720 450)">
          <path
            id="ao-r2"
            d={ellipsePath(720, 450, 500, 210)}
            className="aurora__ring"
          />
          {!reducedMotion && (
            <circle r="4" className="aurora__dot aurora__dot--blue" filter="url(#ao-glow)">
              <animateMotion dur="31s" repeatCount="indefinite" rotate="0">
                <mpath href="#ao-r2"/>
              </animateMotion>
            </circle>
          )}
        </g>

        {/* Inner accent ring — tilt +26° */}
        <g transform="rotate(26 720 450)">
          <path
            id="ao-r3"
            d={ellipsePath(720, 450, 335, 148)}
            className="aurora__ring aurora__ring--accent"
          />
          {!reducedMotion && (
            <circle r="4" className="aurora__dot aurora__dot--gold" filter="url(#ao-glow)">
              <animateMotion dur="24s" repeatCount="indefinite" rotate="0">
                <mpath href="#ao-r3"/>
              </animateMotion>
            </circle>
          )}
        </g>

        {/* Far outer visual ring — tilt −7° (no dot) */}
        <g transform="rotate(-7 720 450)">
          <ellipse cx="720" cy="450" rx="930" ry="418" className="aurora__ring aurora__ring--far"/>
        </g>

        {/* Small off-center ring, upper-left (no dot) */}
        <g transform="rotate(-22 340 180)">
          <ellipse cx="340" cy="180" rx="210" ry="90" className="aurora__ring aurora__ring--sm"/>
        </g>

        {/* Small off-center ring, lower-right (no dot) */}
        <g transform="rotate(17 1100 710)">
          <ellipse cx="1100" cy="710" rx="240" ry="104" className="aurora__ring aurora__ring--sm"/>
        </g>
      </svg>

      {/* ── Grid overlay ── */}
      {showGrid && <div className="aurora__grid"/>}

      {/* ── Grain texture ── */}
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
              <feColorMatrix type="saturate" values="0"/>
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#aurora-noise)"/>
        </svg>
      )}

    </div>
  )
}
