import { useState, useRef, useEffect } from 'react'
import './ChatWidget.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME: Message = {
  role: 'assistant',
  content: "Hey — I'm Avelino. I spent a decade on the manufacturing floor and now I build the software that doesn't exist yet. What do you want to know?",
}

const SUGGESTIONS = [
  'Are you available for hire?',
  'What services does Leva offer?',
  'Tell me about your projects',
  'I want to collaborate on something',
]

const ORB_R  = 36  // 72px diameter
const ORB_SZ = 72  // canvas logical size

function pickWaypoint() {
  const mx = 90, my = 100
  return {
    x: mx + Math.random() * (window.innerWidth  - mx * 2),
    y: my + Math.random() * (window.innerHeight - my * 2),
  }
}

function pickLookTarget() {
  const MAX = 0.65  // ~37° max deviation — exaggerated, readable looks
  return {
    theta: (Math.random() - 0.5) * 2 * MAX,
    phi:   (Math.random() - 0.5) * MAX * 0.75,
  }
}

// Draw the orb onto a canvas using 3D projection for the eye socket.
// lx/ly: specular highlight position in logical % (0–100).
// theta: horizontal look angle (rad), phi: vertical look angle (rad).
function drawOrb(
  ctx: CanvasRenderingContext2D,
  lx: number, ly: number,
  theta: number, phi: number,
) {
  const S = ORB_SZ
  const cx = S / 2, cy = S / 2
  const R = S / 2 - 0.5

  ctx.clearRect(0, 0, S, S)

  // ── Sphere body (clipped to circle) ──
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.clip()

  // Dark ambient base
  const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
  base.addColorStop(0,   '#0a1e34')
  base.addColorStop(0.6, '#04101e')
  base.addColorStop(1,   '#010810')
  ctx.fillStyle = base; ctx.fillRect(0, 0, S, S)

  // Diffuse blue hemisphere
  const diff = ctx.createRadialGradient(cx * 0.8, cy * 0.8, 0, cx, cy, R)
  diff.addColorStop(0,    'rgba(56,189,248,0.65)')
  diff.addColorStop(0.44, 'rgba(14,116,144,0.50)')
  diff.addColorStop(0.70, 'transparent')
  ctx.fillStyle = diff; ctx.fillRect(0, 0, S, S)

  // Specular highlight (position driven by movement velocity)
  const sx = (lx / 100) * S, sy = (ly / 100) * S
  const spec = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 0.22)
  spec.addColorStop(0,    'rgba(255,255,255,0.96)')
  spec.addColorStop(0.28, 'rgba(255,255,255,0.45)')
  spec.addColorStop(1,    'transparent')
  ctx.fillStyle = spec; ctx.fillRect(0, 0, S, S)

  // Secondary sheen (follows specular)
  const shn = ctx.createRadialGradient(sx + 5, sy + 6, 0, sx + 5, sy + 6, R * 0.38)
  shn.addColorStop(0,  'rgba(147,219,253,0.38)')
  shn.addColorStop(1,  'transparent')
  ctx.fillStyle = shn; ctx.fillRect(0, 0, S, S)

  // Rim light (opposite side)
  const rx = S * 1.03 - sx, ry = S * 1.03 - sy
  const rim = ctx.createRadialGradient(rx, ry, 0, rx, ry, R * 0.38)
  rim.addColorStop(0,  'rgba(56,189,248,0.28)')
  rim.addColorStop(1,  'transparent')
  ctx.fillStyle = rim; ctx.fillRect(0, 0, S, S)

  // Shadow deepening (opposite hemisphere)
  const shd = ctx.createRadialGradient(cx * 1.24, cy * 1.24, 0, cx * 1.24, cy * 1.24, R * 0.52)
  shd.addColorStop(0,  'rgba(0,0,0,0.50)')
  shd.addColorStop(1,  'transparent')
  ctx.fillStyle = shd; ctx.fillRect(0, 0, S, S)

  // Equatorial seam
  ctx.strokeStyle = 'rgba(56,189,248,0.2)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(4, cy); ctx.lineTo(S - 4, cy)
  ctx.stroke()

  ctx.restore()  // end sphere clip

  // ── Eye socket — 3D→2D projection ──
  // The eye sits at the front of the sphere. As the orb "looks" in direction
  // (theta, phi), the socket slides across the surface and foreshortens.
  // Front pole = (0, 0, 1) in camera space.
  //   3D:  ex = sin(θ),  ey = -sin(φ),  ez = cos(θ)·cos(φ)
  //   2D:  screen_x = cx + ex*R*0.52,  screen_y = cy + ey*R*0.52
  //   Width scales by cos(θ)·cos(φ), height by cos(φ).
  const cosT = Math.cos(theta), sinT = Math.sin(theta)
  const cosP = Math.cos(phi),   sinP = Math.sin(phi)
  const ez3 = cosT * cosP  // depth — 1 = facing camera, 0 = at edge

  if (ez3 > 0.08) {
    const esx = cx + sinT * R * 0.52
    const esy = cy - sinP * R * 0.52 - R * 0.05  // slight upward bias

    const sockR = 13
    const sockW = sockR * Math.abs(cosT) * cosP  // horizontal foreshortening
    const sockH = sockR * cosP                   // vertical foreshortening

    if (sockW > 0.5 && sockH > 0.5) {
      ctx.save()
      ctx.translate(esx, esy)

      // Socket fill (concave pit)
      ctx.beginPath()
      ctx.ellipse(0, 0, sockW, sockH, 0, 0, Math.PI * 2)
      const pit = ctx.createRadialGradient(0, sockH * 0.2, 0, 0, 0, Math.max(sockW, sockH))
      pit.addColorStop(0,   '#0d2d48')
      pit.addColorStop(0.7, '#051422')
      pit.addColorStop(1,   '#020a15')
      ctx.fillStyle = pit
      ctx.fill()

      // Socket rim
      ctx.strokeStyle = 'rgba(56,189,248,0.55)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Inner shadow (inset depth illusion)
      ctx.beginPath()
      ctx.ellipse(0, 0, sockW, sockH, 0, 0, Math.PI * 2)
      const insh = ctx.createRadialGradient(0, -sockH * 0.25, 0, 0, 0, Math.max(sockW, sockH))
      insh.addColorStop(0,   'transparent')
      insh.addColorStop(0.5, 'rgba(0,0,0,0.30)')
      insh.addColorStop(1,   'rgba(0,0,0,0.85)')
      ctx.fillStyle = insh
      ctx.fill()

      // Iris ring (dashed, foreshortened)
      const irisW = Math.max(sockW * 0.74, 0.1)
      const irisH = Math.max(sockH * 0.74, 0.1)
      ctx.beginPath()
      ctx.ellipse(0, 0, irisW, irisH, 0, 0, Math.PI * 2)
      ctx.setLineDash([1.5, 2])
      ctx.strokeStyle = 'rgba(56,189,248,0.70)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.setLineDash([])

      // Pupil — always a circle (the central emitter, not foreshortened)
      const pR = Math.min(sockW, sockH) * 0.36
      if (pR > 0.4) {
        const pupG = ctx.createRadialGradient(0, 0, 0, 0, 0, pR)
        pupG.addColorStop(0,    '#ffffff')
        pupG.addColorStop(0.45, 'rgba(147,219,253,0.95)')
        pupG.addColorStop(1,    'rgba(56,189,248,0.70)')
        ctx.beginPath()
        ctx.arc(0, 0, pR, 0, Math.PI * 2)
        ctx.fillStyle = pupG
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      }

      ctx.restore()
    }
  }
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')

  const orbRef        = useRef<HTMLButtonElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const posRef        = useRef({ x: 0, y: 0 })
  const velRef        = useRef({ vx: 0, vy: 0 })
  const waypointRef   = useRef({ x: 0, y: 0 })
  const phaseRef      = useRef<'moving' | 'hovering'>('moving')
  const pauseRef      = useRef(0)
  const rafRef        = useRef<number | null>(null)
  const lxRef         = useRef(27)  // specular x %
  const lyRef         = useRef(20)  // specular y %
  const lookRef       = useRef({ theta: 0, phi: 0 })
  const lookTargetRef = useRef(pickLookTarget())
  const lookPauseRef  = useRef(60)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  // Init: position, canvas DPR scaling, first waypoint
  useEffect(() => {
    const x = window.innerWidth  * 0.72
    const y = window.innerHeight * 0.55
    posRef.current = { x, y }
    waypointRef.current = pickWaypoint()
    if (orbRef.current) {
      orbRef.current.style.left = `${x - ORB_R}px`
      orbRef.current.style.top  = `${y - ORB_R}px`
    }
    // Scale canvas for HiDPI
    const canvas = canvasRef.current
    if (canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width  = ORB_SZ * dpr
      canvas.height = ORB_SZ * dpr
      canvas.style.width  = `${ORB_SZ}px`
      canvas.style.height = `${ORB_SZ}px`
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
        drawOrb(ctx, lxRef.current, lyRef.current, 0, 0)
      }
    }
  }, [])

  // Sentient movement + specular + saccade + canvas render
  useEffect(() => {
    if (isOpen) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const tick = () => {
      const pos = posRef.current
      const vel = velRef.current

      // ── Position physics ──
      if (phaseRef.current === 'hovering') {
        vel.vx *= 0.88; vel.vy *= 0.88
        vel.vx += (Math.random() - 0.5) * 0.05
        vel.vy += (Math.random() - 0.5) * 0.05
        if (--pauseRef.current <= 0) {
          phaseRef.current = 'moving'
          waypointRef.current = pickWaypoint()
        }
      } else {
        const wp = waypointRef.current
        const dx = wp.x - pos.x, dy = wp.y - pos.y
        const dist = Math.hypot(dx, dy)
        if (dist < 36) {
          phaseRef.current = 'hovering'
          pauseRef.current = 60 + Math.floor(Math.random() * 100)
        } else {
          const topSpeed = Math.min(2.2, dist / 42)
          vel.vx += ((dx / dist) * topSpeed - vel.vx) * 0.06
          vel.vy += ((dy / dist) * topSpeed - vel.vy) * 0.06
        }
      }

      pos.x += vel.vx; pos.y += vel.vy

      const PAD = 70
      if (pos.x < PAD)                      { pos.x = PAD;                      vel.vx =  Math.abs(vel.vx) }
      if (pos.x > window.innerWidth  - PAD) { pos.x = window.innerWidth  - PAD; vel.vx = -Math.abs(vel.vx) }
      if (pos.y < PAD + 20)                 { pos.y = PAD + 20;                 vel.vy =  Math.abs(vel.vy) }
      if (pos.y > window.innerHeight - PAD) { pos.y = window.innerHeight - PAD; vel.vy = -Math.abs(vel.vy) }

      if (orbRef.current) {
        orbRef.current.style.left = `${pos.x - ORB_R}px`
        orbRef.current.style.top  = `${pos.y - ORB_R}px`
      }

      // ── Specular highlight (opposite to travel = sphere rotating) ──
      const spd = Math.hypot(vel.vx, vel.vy)
      const nx = spd > 0.15 ? vel.vx / spd : 0
      const ny = spd > 0.15 ? vel.vy / spd : 0
      lxRef.current += (27 - nx * 17 - lxRef.current) * 0.07
      lyRef.current += (20 - ny * 13 - lyRef.current) * 0.07

      // ── Saccadic gaze ──
      const look   = lookRef.current
      const target = lookTargetRef.current
      if (lookPauseRef.current > 0) {
        lookPauseRef.current--
      } else {
        // Fast saccade dart
        look.theta += (target.theta - look.theta) * 0.22
        look.phi   += (target.phi   - look.phi)   * 0.22
        // Settled? hold, then pick next target
        if (Math.abs(target.theta - look.theta) < 0.012 && Math.abs(target.phi - look.phi) < 0.012) {
          lookPauseRef.current = 90 + Math.floor(Math.random() * 110)  // 1.5–3.3 s hold
          lookTargetRef.current = pickLookTarget()
        }
      }

      // ── Render canvas ──
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) drawOrb(ctx, lxRef.current, lyRef.current, look.theta, look.phi)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isOpen])

  useEffect(() => { if (isOpen) inputRef.current?.focus() }, [isOpen])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleOrbClick = () => {
    if (!isOpen) {
      const tx = window.innerWidth  - 40 - ORB_R
      const ty = window.innerHeight - 40 - ORB_R
      posRef.current = { x: tx + ORB_R, y: ty + ORB_R }
      if (orbRef.current) {
        orbRef.current.style.transition = 'left 0.45s cubic-bezier(0.34,1.4,0.64,1), top 0.45s cubic-bezier(0.34,1.4,0.64,1)'
        orbRef.current.style.left = `${tx}px`
        orbRef.current.style.top  = `${ty}px`
        setTimeout(() => { if (orbRef.current) orbRef.current.style.transition = '' }, 500)
      }
    }
    setIsOpen(v => !v)
  }

  const sendText = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreamingText('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      if (!res.ok || !res.body) throw new Error()
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (!data || data === '[DONE]') continue
          try {
            const ev = JSON.parse(data) as { type: string; delta?: { type: string; text: string } }
            if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
              accumulated += ev.delta.text
              setStreamingText(accumulated)
            }
          } catch { /* ignore */ }
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Email me directly — levallcworks@gmail.com.",
      }])
    } finally {
      setStreamingText('')
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendText(input) }
  }

  const showSuggestions = messages.length === 1 && !loading

  return (
    <>
      {/* ── Floating orb ── */}
      <button
        ref={orbRef}
        className={`chat-orb${isOpen ? ' chat-orb--parked' : ''}`}
        onClick={handleOrbClick}
        aria-label={isOpen ? 'Close AI chat' : 'Chat with AI Avelino'}
        style={{ left: 0, top: 0 }}
      >
        <canvas ref={canvasRef} className="orb-canvas" aria-hidden="true" />
        {!isOpen && <span className="chat-orb__label">Talk to AI Avelino</span>}
      </button>

      {/* ── Chat panel ── */}
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-panel__header">
            <div className="chat-panel__avatar">
              <span className="chat-panel__avatar-eye" />
            </div>
            <div className="chat-panel__title">
              <div className="chat-panel__name">AI Avelino</div>
              <div className="chat-panel__status">
                <span className="chat-panel__dot" />
                {loading ? 'thinking…' : 'online'}
              </div>
            </div>
            <a className="chat-panel__email" href="mailto:levallcworks@gmail.com">
              <MailIcon /> Email me
            </a>
            <button className="chat-panel__close" onClick={() => setIsOpen(false)} aria-label="Close">
              <XIcon />
            </button>
          </div>

          <div className="chat-panel__messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-panel__msg chat-panel__msg--${msg.role}`}>
                <div className="chat-panel__bubble">{msg.content}</div>
              </div>
            ))}
            {showSuggestions && (
              <div className="chat-panel__suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="chat-panel__chip" onClick={() => void sendText(s)}>{s}</button>
                ))}
              </div>
            )}
            {streamingText && (
              <div className="chat-panel__msg chat-panel__msg--assistant">
                <div className="chat-panel__bubble">{streamingText}<span className="chat-panel__cursor" /></div>
              </div>
            )}
            {loading && !streamingText && (
              <div className="chat-panel__msg chat-panel__msg--assistant">
                <div className="chat-panel__bubble chat-panel__bubble--typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-panel__input-row">
            <input
              ref={inputRef}
              className="chat-panel__input"
              type="text"
              placeholder="Ask anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="chat-panel__send"
              onClick={() => void sendText(input)}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function MailIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
