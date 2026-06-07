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

const ORB_R = 32 // orb radius (half of 64px)
const PARK_MARGIN = 32 // distance from viewport edge when parked

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

  // Set initial position once
  useEffect(() => {
    const x = window.innerWidth - 80
    const y = window.innerHeight * 0.62
    posRef.current = { x, y }
    if (orbRef.current) {
      orbRef.current.style.left = `${x - ORB_R}px`
      orbRef.current.style.top = `${y - ORB_R}px`
    }
  }, [])

  // Float animation — runs only when closed
  useEffect(() => {
    if (isOpen) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const MAX_SPEED = 0.7
    const MIN_SPEED = 0.18

    const tick = () => {
      const pos = posRef.current
      const vel = velRef.current

      pos.x += vel.vx
      pos.y += vel.vy

      const PAD = ORB_R + 10
      if (pos.x < PAD) { pos.x = PAD; vel.vx = Math.abs(vel.vx) }
      if (pos.x > window.innerWidth - PAD) { pos.x = window.innerWidth - PAD; vel.vx = -Math.abs(vel.vx) }
      if (pos.y < PAD) { pos.y = PAD; vel.vy = Math.abs(vel.vy) }
      if (pos.y > window.innerHeight - PAD) { pos.y = window.innerHeight - PAD; vel.vy = -Math.abs(vel.vy) }

      // Gentle random course correction
      if (Math.random() < 0.007) {
        vel.vx += (Math.random() - 0.5) * 0.28
        vel.vy += (Math.random() - 0.5) * 0.28
        const spd = Math.hypot(vel.vx, vel.vy)
        if (spd > MAX_SPEED) { vel.vx = (vel.vx / spd) * MAX_SPEED; vel.vy = (vel.vy / spd) * MAX_SPEED }
        if (spd < MIN_SPEED) { vel.vx = (vel.vx / spd) * MIN_SPEED; vel.vy = (vel.vy / spd) * MIN_SPEED }
      }

      if (orbRef.current) {
        orbRef.current.style.left = `${pos.x - ORB_R}px`
        orbRef.current.style.top = `${pos.y - ORB_R}px`
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
      // Fly orb to bottom-right corner, then open panel
      const targetX = window.innerWidth - PARK_MARGIN - ORB_R
      const targetY = window.innerHeight - PARK_MARGIN - ORB_R
      posRef.current = { x: targetX + ORB_R, y: targetY + ORB_R }
      if (orbRef.current) {
        orbRef.current.style.transition = 'left 0.4s cubic-bezier(0.34,1.56,0.64,1), top 0.4s cubic-bezier(0.34,1.56,0.64,1)'
        orbRef.current.style.left = `${targetX}px`
        orbRef.current.style.top = `${targetY}px`
        setTimeout(() => {
          if (orbRef.current) orbRef.current.style.transition = ''
        }, 420)
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
      {/* Floating orb */}
      <button
        ref={orbRef}
        className={`chat-orb${isOpen ? ' chat-orb--parked' : ''}`}
        onClick={handleOrbClick}
        aria-label={isOpen ? 'Close AI chat' : 'Chat with AI Avelino'}
        style={{ left: 0, top: 0 }}
      >
        <span className="chat-orb__shine" />
        <span className="chat-orb__eye" />
        <span className="chat-orb__ring" />
        {!isOpen && <span className="chat-orb__label">Talk to AI Avelino</span>}
      </button>

      {/* Chat panel */}
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
