# Guilty Spark Orb — Portable AI Chat Widget

A self-contained, floating AI chat orb for React apps. A canvas-drawn sphere
(inspired by Halo's 343 Guilty Spark) drifts around the screen with sentient
movement and a 3D-projected eye that saccades and gazes around. Click it and it
springs to the corner and opens a streaming chat panel backed by the Anthropic
Messages API.

This is a **faithful copy** of the widget from the portfolio project — every bit
of the hard-won iteration (specular physics, 3D eye projection, depth waypoints,
mobile keyboard handling, SSE streaming) is intact. The README below tells you
exactly which knobs to turn to repurpose it.

---

## What's in this folder

| File | Where it goes in the new project | What it is |
|---|---|---|
| `ChatWidget.tsx` | `src/components/ChatWidget.tsx` | The orb + chat panel. Zero deps beyond React. |
| `ChatWidget.css` | `src/components/ChatWidget.css` | All styling. Imported by the `.tsx`. |
| `chat.ts` | `functions/api/chat.ts` | Cloudflare Pages Function — proxies Anthropic, holds the system prompt + API key. |

## Requirements

- **React 18+** (uses `useState` / `useRef` / `useEffect` only — no other libs)
- A bundler that supports `import './ChatWidget.css'` (Vite, CRA, Next, etc.)
- **Cloudflare Pages** for the backend (the `functions/` directory convention).
  The frontend only needs *some* POST endpoint at `/api/chat` that streams
  Anthropic SSE — see "Using a different backend" if you're not on Cloudflare.

---

## Setup (Cloudflare Pages — same as the source project)

### 1. Drop in the files
```
src/components/ChatWidget.tsx
src/components/ChatWidget.css
functions/api/chat.ts
```

### 2. Mount the widget
Render it once, near the root of your app (after your main content is fine):
```tsx
import ChatWidget from './components/ChatWidget'

export default function App() {
  return (
    <>
      {/* ...your app... */}
      <ChatWidget />
    </>
  )
}
```

### 3. Set the API key (never commit it)
In the Cloudflare Pages dashboard → your project → **Settings → Environment
variables → Secrets**, add:
```
ANTHROPIC_API_KEY = sk-ant-...
```
The Function reads it via `env.ANTHROPIC_API_KEY`. It is never in the code.

For **local dev** against `wrangler pages dev`, put it in a `.dev.vars` file at
the project root (git-ignored):
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Deploy
Push to the branch Cloudflare Pages watches. The orb appears; clicking it opens
the chat; messages stream token-by-token.

---

## Customization points

Everything brand-specific lives in a few obvious places. Find-and-replace these.

### A. The AI's persona — `chat.ts`
The entire personality is the `SYSTEM_PROMPT` constant at the top of `chat.ts`.
Rewrite it for the new project. This is the single most important edit — it
defines who/what the assistant is and how it behaves.

### B. The model — `chat.ts`
```ts
model: 'claude-haiku-4-5-20251001',   // swap for any current Claude model id
max_tokens: 1024,                     // raise for longer answers
```
Haiku is fast + cheap, ideal for a chat widget. Bump to a Sonnet/Opus id if you
want more depth. `anthropic-version` header stays `2023-06-01`.

### C. Welcome message + suggestion chips — `ChatWidget.tsx` (top of file)
```ts
const WELCOME = { role: 'assistant', content: "hey 👋 I'm Avelino ..." }
const SUGGESTIONS = [ 'Are you available for hire?', ... ]
```
The chips show only on the first message, then disappear.

### D. Contact / fallback email — `ChatWidget.tsx`
Two spots reference `levallcworks@gmail.com`:
- the `chat-panel__email` header link (`mailto:`)
- the network-error fallback message in the `catch` block of `sendText`

Also the header label text **"AI Avelino"** in the chat panel JSX.

### E. Accent color (the sky-blue) — both files
The brand color is hardcoded as `#38bdf8` / `rgba(56,189,248,...)` (and tints
like `#0c4a6e`, `#7dd3fc`, `#22d3ee`). It appears in:
- **`ChatWidget.css`** — glows, borders, bubbles, send button, etc.
- **`ChatWidget.tsx`** `drawOrb()` — the canvas gradient color stops that paint
  the sphere body, eye socket, and iris.

To recolor: find-replace `56,189,248` and `38bdf8` first (that's 90% of it),
then adjust the few supporting tints to taste. If you want it themeable, lift
these into a CSS custom property + a single JS constant.

### F. Font — `ChatWidget.css`
The CSS references `var(--font-sans)`. If the new project doesn't define that
custom property, either define it on `:root` or replace with a literal stack,
e.g. `font-family: system-ui, -apple-system, sans-serif;`. (Without it the
browser just falls back to default sans — no breakage, just not your font.)

---

## How it works (so you can safely modify it)

- **One canvas, redrawn each frame.** `drawOrb()` paints the whole sphere + eye
  in logical 72px coordinates; the canvas is DPR-scaled once at mount for HiDPI.
  Redraws are throttled to ~30fps (`frameCount % 2`).
- **Movement** is waypoint physics: pick a destination → accelerate → hover →
  pick the next. Soft boundary bounce keeps it on-screen.
- **Depth (`z`)** waypoints make it weave in front of / behind page text every
  5th pick — that's what sets `transform: scale()` and `z-index` live.
- **Specular highlight** is computed opposite to travel direction, so the orb
  reads as a real sphere rotating through space, not a flat tilting disc.
- **The eye** is a true 3D→2D projection: the socket slides across the sphere
  surface and foreshortens (`cos θ`, `cos φ`) as it gazes off-axis. **Saccades**
  dart fast to a random target within ~37°, hold, then pick the next.
- **Streaming** uses `fetch` → `ReadableStream` reader → line-by-line SSE parse,
  accumulating `content_block_delta` / `text_delta` events. A blinking cursor
  shows while in-flight.
- **Mobile**: the panel becomes a bottom sheet sized with `dvh` so it tracks the
  iOS keyboard; the input is `16px` to stop iOS auto-zoom on focus.

The `chat.ts` Function is a thin streaming passthrough: it injects the system
prompt + API key server-side and pipes Anthropic's SSE body straight back to the
browser, so the key never reaches the client and you keep full streaming.

---

## Using a different backend (not Cloudflare)

The frontend only assumes a `POST /api/chat` that accepts
`{ messages: {role, content}[] }` and responds with Anthropic-style SSE
(`text/event-stream`). To port `chat.ts` to, say, Node/Express or another
serverless platform, keep the exact same logic:

1. Read `ANTHROPIC_API_KEY` from that platform's env.
2. `fetch('https://api.anthropic.com/v1/messages', { ... stream: true ... })`
   with the `x-api-key` and `anthropic-version: 2023-06-01` headers.
3. Pipe the upstream response body straight back with
   `content-type: text/event-stream`.

No frontend changes needed as long as the path stays `/api/chat` (or update the
`fetch('/api/chat', ...)` URL in `sendText` inside `ChatWidget.tsx`).
