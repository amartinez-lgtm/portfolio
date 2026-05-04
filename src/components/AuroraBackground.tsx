/**
 * AuroraBackground
 *
 * Full-viewport background of layered inclined orbital ellipses. Six dots
 * travel their orbits via a JS animation loop. While the user touches or
 * moves the cursor, each dot is pulled toward the pointer — as if their
 * finger is a massive body warping local gravity. Releasing lets the dots
 * spring back to their natural paths.
 *
 * @example
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

import { useEffect, useRef } from 'react'
import './AuroraBackground.css'

interface AuroraBackgroundProps {
  intensity?: 'subtle' | 'normal'
  showGrid?: boolean
  showGrain?: boolean
}

const D = Math.PI / 180

// Deterministic pseudo-random [0,1] from a seed — stable across renders
const pr = (s: number) => { const x = Math.sin(s) * 43758.5453; return x - Math.floor(x) }

interface StarDef { x: number; y: number; r: number; o: number; twinkle: boolean; delay: number; dur: number }
const STARS: StarDef[] = Array.from({ length: 90 }, (_, i) => {
  const r = pr(i * 7.3 + 3) * 1.1 + 0.3
  return {
    x:       pr(i * 7.3 + 1) * 1440,
    y:       pr(i * 7.3 + 2) * 900,
    r,
    o:       pr(i * 7.3 + 4) * 0.45 + 0.25,
    twinkle: r > 0.95,
    delay:   pr(i * 7.3 + 5) * 9,
    dur:     pr(i * 7.3 + 6) * 5 + 4,
  }
})

interface OrbitDef {
  cx: number; cy: number
  rx: number; ry: number
  tilt: number   // radians
  period: number // seconds for one full orbit
  phase: number  // starting angle in radians
  r: number      // dot radius in SVG units
  color: string
}

const ORBITS: OrbitDef[] = [
  // Grand outer ring — 2 dots, opposite sides
  { cx: 720, cy: 450, rx: 680, ry: 300, tilt: -15 * D, period: 42, phase: 0,              r: 5,   color: 'amber' },
  { cx: 720, cy: 450, rx: 680, ry: 300, tilt: -15 * D, period: 45, phase: Math.PI,        r: 3.5, color: 'gold'  },
  // Mid ring — 2 dots, offset
  { cx: 720, cy: 450, rx: 500, ry: 210, tilt: 11 * D,  period: 31, phase: 0,              r: 4,   color: 'blue'  },
  { cx: 720, cy: 450, rx: 500, ry: 210, tilt: 11 * D,  period: 34, phase: Math.PI * 0.65, r: 3,   color: 'amber' },
  // Inner ring
  { cx: 720, cy: 450, rx: 335, ry: 148, tilt: 26 * D,  period: 24, phase: 0,              r: 4,   color: 'gold'  },
  // Between mid and outer
  { cx: 720, cy: 450, rx: 590, ry: 255, tilt: -3 * D,  period: 37, phase: 2.4,            r: 3.5, color: 'blue'  },
]

// Parametric position on a tilted ellipse
function orbitPoint(def: OrbitDef, t: number) {
  const cosT = Math.cos(t), sinT = Math.sin(t)
  const cosA = Math.cos(def.tilt), sinA = Math.sin(def.tilt)
  return {
    x: def.cx + def.rx * cosT * cosA - def.ry * sinT * sinA,
    y: def.cy + def.rx * cosT * sinA + def.ry * sinT * cosA,
  }
}

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function AuroraBackground({
  intensity = 'normal',
  showGrid = true,
  showGrain = true,
}: AuroraBackgroundProps) {
  const svgRef  = useRef<SVGSVGElement>(null)
  const dotRefs = useRef<(SVGCircleElement | null)[]>(new Array(ORBITS.length).fill(null))

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    // Per-dot mutable animation state — no React re-renders
    const state = ORBITS.map(def => ({
      t:  def.phase,
      gx: 0, // gravity offset x
      gy: 0, // gravity offset y
    }))

    // Raw pointer target (updated instantly) and smoothed position (lerped)
    let rawPx = 720, rawPy = 450
    let px     = 720, py    = 450
    // Gravity strength 0→1, ramps slowly so there's no sudden jump
    let gravityStrength = 0
    let pointerActive   = false
    let lastTime = performance.now()
    let raf: number
    let fadeTimer: ReturnType<typeof setTimeout>

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      // Smooth the pointer position so dots don't snap when finger jumps
      px += (rawPx - px) * Math.min(6 * dt, 1)
      py += (rawPy - py) * Math.min(6 * dt, 1)

      // Ramp strength up when active, fade out slowly when released
      const targetStrength = pointerActive ? 1 : 0
      gravityStrength += (targetStrength - gravityStrength) * Math.min(1.8 * dt, 1)

      ORBITS.forEach((def, i) => {
        const s  = state[i]
        const el = dotRefs.current[i]
        if (!el) return

        s.t += (2 * Math.PI / def.period) * dt

        const base = orbitPoint(def, s.t)

        // Gravity: gentle pull scaled by strength, soft distance falloff
        const dx   = px - base.x
        const dy   = py - base.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const pull = 65 * gravityStrength * (350 / (dist + 350))
        const tx   = (dx / (dist + 1)) * pull
        const ty   = (dy / (dist + 1)) * pull

        // Slow drift toward/away from target — feels orbital, not springy
        s.gx += (tx - s.gx) * Math.min(1.8 * dt, 1)
        s.gy += (ty - s.gy) * Math.min(1.8 * dt, 1)

        el.setAttribute('cx', String(base.x + s.gx))
        el.setAttribute('cy', String(base.y + s.gy))
      })

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)

    // Convert screen coords → SVG viewBox coords
    const toSVG = (clientX: number, clientY: number) => {
      const ctm = svg.getScreenCTM()
      if (!ctm) return { x: 720, y: 450 }
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      const p = pt.matrixTransform(ctm.inverse())
      return { x: p.x, y: p.y }
    }

    const onMove = (e: PointerEvent) => {
      const p  = toSVG(e.clientX, e.clientY)
      rawPx = p.x; rawPy = p.y
      pointerActive = true
      clearTimeout(fadeTimer)
      // Give an 800 ms grace period before fading so brief pauses don't cut off
      fadeTimer = setTimeout(() => { pointerActive = false }, 800)
    }

    const onLeave = () => {
      clearTimeout(fadeTimer)
      pointerActive = false
    }

    document.addEventListener('pointermove', onMove,  { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fadeTimer)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className={`aurora aurora--${intensity}`} aria-hidden="true">

      <svg
        ref={svgRef}
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
          <filter id="ao-mw-blur" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="70"/>
          </filter>
        </defs>

        {/* ── Star field ── */}
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x} cy={s.y} r={s.r}
            fill="white"
            opacity={s.o}
            className={s.twinkle ? 'aurora__star--twinkle' : undefined}
            style={s.twinkle ? {
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            } as React.CSSProperties : undefined}
          />
        ))}

        {/* ── Milky Way band ── */}
        <g transform="rotate(-28 720 450)">
          <ellipse cx="720" cy="450" rx="860" ry="170"
            fill="rgba(180, 210, 255, 0.07)" filter="url(#ao-mw-blur)"/>
          <ellipse cx="740" cy="420" rx="540" ry="90"
            fill="rgba(210, 230, 255, 0.05)" filter="url(#ao-mw-blur)"/>
        </g>

        {/* ── Visual rings ── */}
        <g transform="rotate(-15 720 450)">
          <ellipse cx="720" cy="450" rx="680" ry="300" className="aurora__ring"/>
        </g>
        <g transform="rotate(11 720 450)">
          <ellipse cx="720" cy="450" rx="500" ry="210" className="aurora__ring"/>
        </g>
        <g transform="rotate(26 720 450)">
          <ellipse cx="720" cy="450" rx="335" ry="148" className="aurora__ring aurora__ring--accent"/>
        </g>
        <g transform="rotate(-3 720 450)">
          <ellipse cx="720" cy="450" rx="590" ry="255" className="aurora__ring"/>
        </g>
        <g transform="rotate(-7 720 450)">
          <ellipse cx="720" cy="450" rx="930" ry="418" className="aurora__ring aurora__ring--far"/>
        </g>
        <g transform="rotate(-22 340 180)">
          <ellipse cx="340" cy="180" rx="210" ry="90" className="aurora__ring aurora__ring--sm"/>
        </g>
        <g transform="rotate(17 1100 710)">
          <ellipse cx="1100" cy="710" rx="240" ry="104" className="aurora__ring aurora__ring--sm"/>
        </g>

        {/* ── Animated dots — positioned by JS RAF loop ── */}
        {!prefersReduced && ORBITS.map((def, i) => {
          const init = orbitPoint(def, def.phase)
          return (
            <circle
              key={i}
              ref={el => { dotRefs.current[i] = el }}
              cx={init.x}
              cy={init.y}
              r={def.r}
              className={`aurora__dot aurora__dot--${def.color}`}
              filter="url(#ao-glow)"
            />
          )
        })}
      </svg>

      {showGrid && <div className="aurora__grid"/>}

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
