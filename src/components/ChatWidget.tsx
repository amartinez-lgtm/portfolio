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

const ORB_R = 32

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')

  const orbRef = useRef<HTMLButtonElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const velRef = useRef({ vx: -0.38, vy: -0.28 })
  const rafRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const x = window.innerWidth - 90
    const y = window.innerHeight * 0.62
    posRef.current = { x, y }
    if (orbRef.current) {
      orbRef.current.style.left = `${x - ORB_R}px`
      orbRef.current.style.top = `${y - ORB_R}px`
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const MAX_SPEED = 0.65
    const MIN_SPEED = 0.15

    const tick = () => {
      const pos = posRef.current
      const vel = velRef.current

      pos.x += vel.vx
      pos.y += vel.vy

      const PAD = ORB_R + 16
      if (pos.x < PAD) { pos.x = PAD; vel.vx = Math.abs(vel.vx) }
      if (pos.x > window.innerWidth - PAD) { pos.x = window.innerWidth - PAD; vel.vx = -Math.abs(vel.vx) }
      if (pos.y < PAD + 20) { pos.y = PAD + 20; vel.vy = Math.abs(vel.vy) }
      if (pos.y > window.innerHeight - PAD) { pos.y = window.innerHeight - PAD; vel.vy = -Math.abs(vel.vy) }

      if (Math.random() < 0.007) {
        vel.vx += (Math.random() - 0.5) * 0.26
        vel.vy += (Math.random() - 0.5) * 0.26
        const spd = Math.hypot(vel.vx, vel.vy)
        if (spd > MAX_SPEED) { vel.vx = (vel.vx / spd) * MAX_SPEED; vel.vy = (vel.vy / spd) * MAX_SPEED }
        if (spd < MIN_SPEED) { vel.vx = (vel.vx / spd) * MIN_SPEED; vel.vy = (vel.vy / spd) * MIN_SPEED }
      }

      // Gentle attitude tilt matching direction of travel
      const tilt = Math.max(-14, Math.min(14, vel.vx * 18))

      if (orbRef.current) {
        orbRef.current.style.left = `${pos.x - ORB_R}px`
        orbRef.current.style.top = `${pos.y - ORB_R}px`
        orbRef.current.style.transform = `rotate(${tilt}deg)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleOrbClick = () => {
    if (!isOpen) {
      const tx = window.innerWidth - 36 - ORB_R
      const ty = window.innerHeight - 36 - ORB_R
      posRef.current = { x: tx + ORB_R, y: ty + ORB_R }
      if (orbRef.current) {
        orbRef.current.style.transition = 'left 0.4s cubic-bezier(0.34,1.4,0.64,1), top 0.4s cubic-bezier(0.34,1.4,0.64,1), transform 0.35s'
        orbRef.current.style.left = `${tx}px`
        orbRef.current.style.top = `${ty}px`
        orbRef.current.style.transform = 'rotate(0deg)'
        setTimeout(() => { if (orbRef.current) orbRef.current.style.transition = '' }, 450)
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

      if (!res.ok || !res.body) throw new Error('Request failed')

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
            const event = JSON.parse(data) as { type: string; delta?: { type: string; text: string } }
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              accumulated += event.delta.text
              setStreamingText(accumulated)
            }
          } catch { /* ignore */ }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting. Email me directly — levallcworks@gmail.com." },
      ])
    } finally {
      setStreamingText('')
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendText(input)
    }
  }

  const showSuggestions = messages.length === 1 && !loading

  return (
    <>
      <button
        ref={orbRef}
        className={`chat-orb${isOpen ? ' chat-orb--parked' : ''}`}
        onClick={handleOrbClick}
        aria-label={isOpen ? 'Close AI chat' : 'Chat with AI Avelino'}
        style={{ left: 0, top: 0 }}
      >
        <SatelliteSVG />
        {!isOpen && <span className="chat-orb__label">Talk to AI Avelino</span>}
      </button>

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
                  <button key={s} className="chat-panel__chip" onClick={() => void sendText(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {streamingText && (
              <div className="chat-panel__msg chat-panel__msg--assistant">
                <div className="chat-panel__bubble">
                  {streamingText}<span className="chat-panel__cursor" />
                </div>
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

function SatelliteSVG() {
  return (
    <svg
      viewBox="-52 -62 104 122"
      width="64"
      height="64"
      style={{ overflow: 'visible', display: 'block', margin: 'auto' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="sat-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sat-glow-lg" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="body-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#050e1c" />
          <stop offset="30%" stopColor="#0f2035" />
          <stop offset="70%" stopColor="#0f2035" />
          <stop offset="100%" stopColor="#050e1c" />
        </linearGradient>
        <linearGradient id="panel-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0b2038" />
          <stop offset="100%" stopColor="#071628" />
        </linearGradient>
      </defs>

      {/* ── Solar panel arms ── */}
      <rect x="-30" y="-4" width="16" height="8" rx="1.5"
        fill="#091828" stroke="rgba(56,189,248,0.4)" strokeWidth="0.7" />
      <rect x="14" y="-4" width="16" height="8" rx="1.5"
        fill="#091828" stroke="rgba(56,189,248,0.4)" strokeWidth="0.7" />

      {/* ── Solar panels ── */}
      {/* Left */}
      <rect x="-50" y="-14" width="18" height="28" rx="2"
        fill="url(#panel-g)" stroke="rgba(56,189,248,0.45)" strokeWidth="0.7" />
      <line x1="-50" y1="-7" x2="-32" y2="-7" stroke="rgba(56,189,248,0.22)" strokeWidth="0.5" />
      <line x1="-50" y1="0"  x2="-32" y2="0"  stroke="rgba(56,189,248,0.22)" strokeWidth="0.5" />
      <line x1="-50" y1="7"  x2="-32" y2="7"  stroke="rgba(56,189,248,0.22)" strokeWidth="0.5" />
      <line x1="-44" y1="-14" x2="-44" y2="14" stroke="rgba(56,189,248,0.18)" strokeWidth="0.5" />
      <line x1="-38" y1="-14" x2="-38" y2="14" stroke="rgba(56,189,248,0.18)" strokeWidth="0.5" />

      {/* Right */}
      <rect x="32" y="-14" width="18" height="28" rx="2"
        fill="url(#panel-g)" stroke="rgba(56,189,248,0.45)" strokeWidth="0.7" />
      <line x1="32" y1="-7" x2="50" y2="-7" stroke="rgba(56,189,248,0.22)" strokeWidth="0.5" />
      <line x1="32" y1="0"  x2="50" y2="0"  stroke="rgba(56,189,248,0.22)" strokeWidth="0.5" />
      <line x1="32" y1="7"  x2="50" y2="7"  stroke="rgba(56,189,248,0.22)" strokeWidth="0.5" />
      <line x1="38" y1="-14" x2="38" y2="14" stroke="rgba(56,189,248,0.18)" strokeWidth="0.5" />
      <line x1="44" y1="-14" x2="44" y2="14" stroke="rgba(56,189,248,0.18)" strokeWidth="0.5" />

      {/* ── Main body ── */}
      <rect x="-16" y="-26" width="32" height="52" rx="4"
        fill="url(#body-g)" stroke="rgba(56,189,248,0.5)" strokeWidth="0.9" />

      {/* Body panel seams */}
      <line x1="-16" y1="-10" x2="16" y2="-10" stroke="rgba(56,189,248,0.2)" strokeWidth="0.5" />
      <line x1="-16" y1="10"  x2="16" y2="10"  stroke="rgba(56,189,248,0.2)" strokeWidth="0.5" />

      {/* Edge highlight */}
      <line x1="-15.5" y1="-24" x2="-15.5" y2="24" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" />

      {/* Corner rivets */}
      <circle cx="-12" cy="-22" r="1.6" fill="rgba(56,189,248,0.45)" />
      <circle cx="12"  cy="-22" r="1.6" fill="rgba(56,189,248,0.45)" />
      <circle cx="-12" cy="22"  r="1.6" fill="rgba(56,189,248,0.45)" />
      <circle cx="12"  cy="22"  r="1.6" fill="rgba(56,189,248,0.45)" />

      {/* ── Sensor / eye ── */}
      <circle cx="0" cy="-5" r="11" fill="#060f1e" stroke="rgba(56,189,248,0.55)" strokeWidth="0.8" filter="url(#sat-glow)" />
      <circle cx="0" cy="-5" r="7"  fill="#0c3c5c" />
      <circle cx="0" cy="-5" r="4"  fill="#38bdf8" filter="url(#sat-glow)" className="sat-eye" />
      <circle cx="0" cy="-5" r="1.8" fill="#e0f2fe" />
      <circle cx="-1.8" cy="-7" r="1.1" fill="rgba(255,255,255,0.6)" />

      {/* ── Status LEDs ── */}
      <circle cx="9"  cy="17" r="2.2" fill="#22d3ee" filter="url(#sat-glow)" className="sat-led-a" />
      <circle cx="-9" cy="-17" r="2.2" fill="#f59e0b" filter="url(#sat-glow)" className="sat-led-b" />

      {/* ── Antenna ── */}
      <line x1="0" y1="-26" x2="0" y2="-46" stroke="rgba(56,189,248,0.65)" strokeWidth="1.3" />
      <line x1="-8" y1="-36" x2="8" y2="-36" stroke="rgba(56,189,248,0.4)" strokeWidth="0.9" />
      <circle cx="0" cy="-48" r="3" fill="#38bdf8" filter="url(#sat-glow-lg)" className="sat-antenna" />

      {/* ── Thruster nozzle ── */}
      <rect x="-9" y="26" width="18" height="5" rx="2" fill="#060f1e" stroke="rgba(56,189,248,0.35)" strokeWidth="0.7" />
      <rect x="-6" y="31" width="12" height="3" rx="1" fill="#040b18" stroke="rgba(56,189,248,0.25)" strokeWidth="0.5" />
      <line x1="-4" y1="34" x2="-4" y2="39" stroke="rgba(56,189,248,0.5)"  strokeWidth="1.1" className="sat-thruster" />
      <line x1="0"  y1="34" x2="0"  y2="42" stroke="rgba(56,189,248,0.75)" strokeWidth="1.4" className="sat-thruster" />
      <line x1="4"  y1="34" x2="4"  y2="39" stroke="rgba(56,189,248,0.5)"  strokeWidth="1.1" className="sat-thruster" />
    </svg>
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
