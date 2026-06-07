import { useState, useRef, useEffect } from 'react'
import './ChatWidget.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME: Message = {
  role: 'assistant',
  content: "Hey — I'm Avelino. Ask me anything: what I've built, how I think about problems, what it's like running a machine shop and writing software at the same time. I'll give you a straight answer.",
}

const SUGGESTIONS = [
  'Are you available for hire?',
  'What services does Leva offer?',
  'Tell me about your projects',
  'I want to collaborate on something',
]

const ORB_R = 36 // 72px diameter

function pickWaypoint() {
  const mx = 90
  const my = 100
  return {
    x: mx + Math.random() * (window.innerWidth  - mx * 2),
    y: my + Math.random() * (window.innerHeight - my * 2),
  }
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')

  const orbRef      = useRef<HTMLButtonElement>(null)
  const posRef      = useRef({ x: 0, y: 0 })
  const velRef      = useRef({ vx: 0, vy: 0 })
  const waypointRef = useRef({ x: 0, y: 0 })
  const phaseRef    = useRef<'moving' | 'hovering'>('moving')
  const pauseRef    = useRef(0)
  const rafRef      = useRef<number | null>(null)
  const lxRef       = useRef(27)   // specular highlight x% (default top-left)
  const lyRef       = useRef(20)   // specular highlight y%
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  // Init position + first waypoint
  useEffect(() => {
    const x = window.innerWidth  * 0.72
    const y = window.innerHeight * 0.55
    posRef.current = { x, y }
    waypointRef.current = pickWaypoint()
    if (orbRef.current) {
      orbRef.current.style.left = `${x - ORB_R}px`
      orbRef.current.style.top  = `${y - ORB_R}px`
    }
  }, [])

  // Sentient waypoint movement
  useEffect(() => {
    if (isOpen) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const tick = () => {
      const pos = posRef.current
      const vel = velRef.current

      if (phaseRef.current === 'hovering') {
        // Micro-drift while thinking
        vel.vx *= 0.88
        vel.vy *= 0.88
        vel.vx += (Math.random() - 0.5) * 0.05
        vel.vy += (Math.random() - 0.5) * 0.05
        pauseRef.current--
        if (pauseRef.current <= 0) {
          phaseRef.current = 'moving'
          waypointRef.current = pickWaypoint()
        }
      } else {
        const wp  = waypointRef.current
        const dx  = wp.x - pos.x
        const dy  = wp.y - pos.y
        const dist = Math.hypot(dx, dy)

        if (dist < 36) {
          phaseRef.current = 'hovering'
          pauseRef.current = 60 + Math.floor(Math.random() * 100) // 1–2.7 s at 60fps
        } else {
          const topSpeed = Math.min(2.2, dist / 42)
          vel.vx += ((dx / dist) * topSpeed - vel.vx) * 0.06
          vel.vy += ((dy / dist) * topSpeed - vel.vy) * 0.06
        }
      }

      pos.x += vel.vx
      pos.y += vel.vy

      // Soft boundary
      const PAD = 70
      if (pos.x < PAD)                       { pos.x = PAD;                           vel.vx =  Math.abs(vel.vx) }
      if (pos.x > window.innerWidth  - PAD)  { pos.x = window.innerWidth  - PAD;      vel.vx = -Math.abs(vel.vx) }
      if (pos.y < PAD + 20)                  { pos.y = PAD + 20;                      vel.vy =  Math.abs(vel.vy) }
      if (pos.y > window.innerHeight - PAD)  { pos.y = window.innerHeight - PAD;      vel.vy = -Math.abs(vel.vy) }

      // Shift specular highlight opposite to travel direction — makes it look like
      // a real sphere rotating through space rather than a flat disc tilting.
      const spd = Math.hypot(vel.vx, vel.vy)
      const nx = spd > 0.15 ? vel.vx / spd : 0
      const ny = spd > 0.15 ? vel.vy / spd : 0
      lxRef.current += (27 - nx * 17 - lxRef.current) * 0.07
      lyRef.current += (20 - ny * 13 - lyRef.current) * 0.07

      if (orbRef.current) {
        orbRef.current.style.left = `${pos.x - ORB_R}px`
        orbRef.current.style.top  = `${pos.y - ORB_R}px`
        orbRef.current.style.setProperty('--lx', `${lxRef.current.toFixed(1)}%`)
        orbRef.current.style.setProperty('--ly', `${lyRef.current.toFixed(1)}%`)
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
        {/* Equatorial band */}
        <span className="orb-band" />
        {/* Eye — gaze container shifts pupil+iris together */}
        <span className="orb-eye">
          <span className="orb-eye-gaze">
            <span className="orb-iris" />
            <span className="orb-pupil" />
          </span>
        </span>
        {/* Label — always visible on touch; hover-only on desktop */}
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
