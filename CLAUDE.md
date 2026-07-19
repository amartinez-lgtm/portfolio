# CLAUDE.md — AI Context for Portfolio Project

This file gives any AI assistant (Claude, Codex, Cursor, etc.) full context to pick up this project cold.

---

## Who This Is For

**Avelino Martinez** — 10-year aerospace manufacturing veteran who builds software.
- Quality Manager at Final Frontier Manufacturing (FFM), an AS9100-certified machine shop
- Founder of Leva LLC — independent studio for 3D scanning, mapping, digital fabrication, and practical AI software
- Positioning: "manufacturing domain expert who builds software"
- Email: levallcworks@gmail.com
- GitHub: https://github.com/amartinez-lgtm
- LinkedIn: https://www.linkedin.com/in/avelino-martinez-31584b195
- Cloudflare account: Levallcworks@gmail.com (personal account, not a work account)

## What This Project Is

A personal portfolio site. Live at: **https://portfolio-4n2.pages.dev**

Current section order: **Hero → About → Work → Ventures → Stories → Contact**

Note: About was intentionally moved before Work so visitors understand who Avelino is before seeing the projects.

## Tech Stack

- React 18 + TypeScript
- Vite 5 (build tool)
- Plain CSS with CSS custom properties (NO Tailwind, NO CSS-in-JS, NO styled-components)
- No state management library — local state only
- No router — single-page, anchor-link navigation
- Deployed on Cloudflare Pages via GitHub integration (branch: `main`)

## Key Decisions Made

- **No framework CSS** — intentional. Keep it lean. Do not add Tailwind or any CSS framework.
- **No animations library** — CSS transitions only. Keep it fast.
- **No router** — single page with anchor links. Do not add React Router.
- **All content in one file** — `src/data/projects.ts` is the single source of truth for all copy. No CMS.
- **CSS co-located with components** — each `Component.tsx` has a `Component.css` next to it.
- **Always dark** — site is forced dark mode. `color-scheme: dark` is set on `:root`. No light mode toggle.
- **AuroraBackground** — full-viewport animated starfield with orbital dots and gravity interaction. Rendered behind all content via `position: fixed`.

## Design Tokens (src/index.css)

All design tokens are CSS custom properties on `:root` (always dark).

Key vars:
- `--bg`, `--bg-subtle`, `--bg-muted` — background layers (`transparent`, `#0f172a`, `#1e293b`)
- `--text`, `--text-muted`, `--text-subtle` — text hierarchy
- `--accent: #38bdf8` — brand color (sky blue)
- `--accent-dim: #0c4a6e` — accent tint for backgrounds/glows
- `--border: rgba(255,255,255,0.08)` — separator color
- `--font-sans`, `--font-mono` — type stacks
- `--max-w: 1100px` — max content width
- `--section-pad: 96px` — vertical section padding (64px on mobile)

## Content Data (src/data/projects.ts)

Three exported arrays — edit these to update site content:

```typescript
projects: Project[]          // 6 professional projects (with optional aiNote field)
sideHustles: SideHustle[]    // 6 Leva LLC ventures (active/in-progress/planned)
careerStories: CareerStory[] // 3 narrative career stories
```

### Project interface

```typescript
interface Project {
  id: string
  name: string
  tagline: string
  description: string
  loc: string
  tags: string[]
  url?: string
  highlight?: 'ai-wrong-tool' | 'one-day'
  aiNote?: string   // shown as a callout inside the expanded accordion row
}
```

`aiNote` is used for projects where AI was meaningfully used or evaluated. Currently set on:
- **InspectAI** — GPT-4V was benchmarked, replaced with deterministic parser (100% vs 70%)
- **PledgePact** — uses OpenAI for accountability nudges

## Placeholders / Still Needed

| Item | Status |
|---|---|
| Custom domain | Not set up. Do in Cloudflare Pages → Custom Domains. ~$10-15/yr on Cloudflare Registrar. |
| Analytics | Not added. Cloudflare Web Analytics is free and easy. |
| Mobile nav close-on-scroll | Not implemented |
| Active section highlighting in nav | Not implemented |
| Shopify Products URL in token page | Placeholder `https://leva-llc.myshopify.com` — update in `src/token/TokenPage.tsx` `NAV_ITEMS` array |
| Profile photo in About | ✓ Done — `public/avatar_jpg.jpeg` |
| NFC token page | ✓ Done — live at `/token` |
| Session start hook | ✓ Done — auto-runs `npm install` on cloud sessions |

Contact info is now real (no more placeholders):
- Email: `levallcworks@gmail.com` ✓
- LinkedIn: real URL ✓
- GitHub: `amartinez-lgtm` ✓

## Deployment Pipeline

```
git push origin main
  → Cloudflare Pages detects push
  → runs: npm run build
  → serves: dist/
  → live in ~60 seconds at portfolio-4n2.pages.dev
```

**Important:** Always push to `main`. Cloudflare only watches `main`. Feature branches do NOT deploy.

Cloudflare Pages settings:
- Build command: `npm run build`
- Output directory: `dist`
- Env var: `NODE_VERSION=20`
- Account: Levallcworks@gmail.com (Cloudflare)
- GitHub repo: amartinez-lgtm/portfolio

## How to Run Locally

```bash
npm install
npm run dev    # starts at http://localhost:5173
```

Node 20+ required. No other services needed.

## Component Map

| Component | Section ID | What it renders |
|---|---|---|
| `AuroraBackground` | — | Full-viewport starfield with animated orbital dots and gravity interaction |
| `Nav` | — | Fixed top nav, scroll blur, mobile hamburger menu |
| `Hero` | (top) | Headline, "Manufacturing × AI × Software" badge, CTAs |
| `About` | `#about` | Bio, Leva LLC description, AI decision-framework callout, sticky skills panel, circular profile photo |
| `Work` | `#work` | Interactive accordion list of 6 projects from `projects[]` |
| `SideHustles` | `#ventures` | 3 groups (active/in-progress/planned) from `sideHustles[]` |
| `CareerStories` | `#stories` | Numbered story list from `careerStories[]` |
| `Contact` | `#contact` | Inquiry form (mailto fallback) + Email/LinkedIn/GitHub link cards |
| `Footer` | — | Name + copyright + subtle `◈ Token` link to `/token` |

## NFC Token Page (`/token`)

A completely separate React app (Vite multi-page build) for the physical 3D-printed NFC smart business card.

**URL:** `https://portfolio-4n2.pages.dev/token`

**Architecture:**
- Entry: `token/index.html` → `src/token/main.tsx` → `src/token/TokenPage.tsx`
- Styles: `src/token/TokenPage.css` (all classes prefixed `tp-` to avoid collision)
- Separate React root (`#token-root`), imports `src/index.css` for base tokens only
- `vite.config.ts` has two `rollupOptions.input` entries: `main` and `token`
- `public/_redirects` has `/token /token/index.html 200` before the SPA catch-all

**Design:** Pure black background (`#000`), canvas-based RGB hexagon grid radiating outward from coin center (see below), full-spectrum keyboard RGB hue-cycling on the coin ring, floating avatar photo inside spinning conic-gradient ring, iOS-style navigation cards, glassmorphism achievement card.

**Edit content in `src/token/TokenPage.tsx`:**
- `NAV_ITEMS` array — navigation card titles, subtitles, and hrefs (update Shopify URL here)
- `ACHIEVEMENT_SKILLS` array — chips inside the achievement card
- Every section has a `/* EDIT: */` comment above it

**Hex grid background:**
- A `<canvas>` element sits as a sibling BEFORE `<div className="tp">` (NOT inside it) — this is critical. `.tp` has `overflow-x: hidden` which traps `position: fixed` children on mobile WebKit and makes them invisible.
- Canvas is `position: fixed; inset: 0; z-index: 0`. `.tp` is `position: relative; z-index: 1; background: transparent`. Black comes from `html, body { background: #000 }` in `TokenPage.css`.
- Wave origin is measured once at mount via `coinRef.getBoundingClientRect()` and locked as local `cx/cy` vars in the canvas `useEffect` closure — NOT re-read per frame. Re-reading every frame caused hexes to vanish on scroll (coin scrolls off-screen → negative `getBoundingClientRect().top` → all hexes exceed falloff threshold).
- Falloff radius is `4.5 × Math.max(W, H)` so hexes stay visible throughout the entire scrollable page.
- Wave shape: `Math.pow(Math.max(0, Math.sin(...)), 2.5)` — hexes are completely dark except at the wave crest. Speed: `0.028`.
- Coin (`tp-coin-link`) is wrapped in `<a href="/#about">` — tapping navigates to the About section on the main portfolio.

**NFC tag URL to program:** `https://portfolio-4n2.pages.dev/token`

## Work Section — Accordion Behavior

Projects render as a stacked list, not a grid. Each row:
- **Collapsed**: shows index number, project name, tagline, AI chip (if `aiNote` set), highlight chip, LOC count, chevron
- **Expanded**: smooth `grid-template-rows: 0fr → 1fr` animation, accent left border glow, full description, `aiNote` callout box, tags, Visit link
- Mobile: index and badges hidden, tagline wraps, footer stacks vertically

## Contact Form

The form uses a `mailto:` fallback (no backend). On submit it calls `window.open('mailto:levallcworks@gmail.com?subject=...&body=...')` with pre-filled subject and body from the four form fields. Below the form are three link cards: Email, LinkedIn, GitHub.

## Coding Conventions

- TypeScript strict mode on
- No `any` types
- Component files: `PascalCase.tsx`
- CSS files: `PascalCase.css` (co-located with component)
- Data/types: `camelCase.ts`
- CSS class naming: BEM-ish (`component__element--modifier`)
- No comments in code unless the WHY is non-obvious
- Prefer editing existing files over creating new ones
- Do not add features beyond what is asked

## Session History (what has been built)

### Session 1
- Initial portfolio scaffold: Hero, Work, SideHustles, CareerStories, About, Contact, Footer
- AuroraBackground with animated blobs (later replaced)

### Session 2 (mobile-responsive + content polish)
- Replaced aurora blobs with full-viewport orbital starfield system with gravity interaction
- Forced dark mode site-wide
- Updated hero copy and affiliation line
- Added mobile-responsive styles across all components

### Session 3
- Hero badge: "Manufacturing × Software" → "Manufacturing × AI × Software"
- Removed SmartWardrobe AI from Ventures/planned (was never built)
- Added contact inquiry form above link cards (mailto fallback to levallcworks@gmail.com)
- Moved About section before Work in page order; updated nav to match
- Rewrote Work section as interactive accordion (numbered rows, animated chevron, smooth expand, AI chip badges)
- Added `aiNote` field to Project interface; set on InspectAI and PledgePact
- Added "How I think about problems" callout in About (AI vs software vs human framework)
- Added AI/ML to skills panel
- Rewrote Leva LLC bio paragraph to accurately describe the studio (3D scanning, LiDAR, photogrammetry, etc.)
- Rewrote InspectAI description to lead with PPAP/FMEA/control plan automation impact
- Rewrote AutoDataPack description to lead with "hours to 10 minutes" outcome
- Fixed email everywhere to levallcworks@gmail.com
- Fixed contact link hover direction (was translateX, now translateY)

### Session 4
- Added profile photo to About section (`public/avatar_jpg.jpeg`)
- Circular headshot (96px) placed between section title and bio text in `About.tsx` / `About.css`
- Photo uploaded via GitHub UI; pulled into local repo and deployed to main

### Session 5
- Built NFC token landing page at `/token` — completely separate React app via Vite multi-page build
- Token page design: pure black background, full-spectrum keyboard RGB hue-cycling, real avatar photo inside spinning conic-gradient coin ring, iOS-style navigation cards (About / Projects / Services / Products / Contact), glassmorphism achievement card ("Met the Maker", Legendary, XP +1000), animated color bloom background
- Added `◈ Token` link in main site footer
- Fixed `tsconfig.json` — removed deprecated `baseUrl`/`paths` (no `@/` imports exist in codebase)
- Added missing `.eslintrc.cjs` — linter was broken; now passes clean
- Added `public/_redirects` rule for `/token` route
- Added `vite.config.ts` multi-page input for `token/index.html`
- Added SessionStart hook (`.claude/hooks/session-start.sh`) — auto-runs `npm install` on cloud sessions so the project is always ready on any device
- Added `.claude/settings.json` to register the hook

### Session 6
- Added canvas-based RGB hexagon grid background to token page — rings pulse outward from coin center with full-spectrum hue per ring
- Wave shape is `Math.pow(Math.max(0, sin), 2.5)` so hexes are completely dark except when the wave crest passes over them
- Fixed z-index layering: canvas moved outside `.tp` wrapper (mobile WebKit `overflow-x: hidden` was trapping the fixed canvas inside the scroll container and hiding it)
- Fixed hexes disappearing on scroll: wave origin locked at mount via `getBoundingClientRect()` (not re-read per frame); falloff radius set to 4.5× viewport so rings are visible throughout the full scrollable page
- Made coin (`tp-coin-outer`) tappable: wrapped in `<a href="/#about">` with scale hover/press transitions
- `tp` background changed to `transparent`; black page background moved to `html, body` so canvas shows through

### Session 7 (XYZ store buildout + portfolio polish)

**XYZ Store (`/store`):**
- Replaced paper towel dispenser `.3mf` model with Y-up corrected export from Onshape — removed `rotationX` workaround
- Fixed mini card 3D viewer: added `camera.lookAt(0,0,0)` (was missing, model was off-center); halved spin speed from 0.008 to 0.004 rad/frame
- Added calibration mode: append `?calibrate` to store URL to dial in any model's orientation — freeze/rotate buttons + live readout of rotation values; hidden from normal visitors
- Added `rotationY` support to viewer and store data interface
- Added 4 new products with 3D viewers: Soap Dispenser (2-part), Light Switch Pot (5-part), Candle Holder, Book Shelf
- Added Display Stand product
- Removed unpopulated products (NFC Token, Light Switch Cover, Planter Pot S/L, 3 coming-soon STLs) — store now shows only products with live 3D models
- Added Physical + Digital dual badging: all products show both badges; drawer shows "Request Order" + "Download STL — Coming Soon" side by side; STL button auto-unlocks when `downloadUrl` is set
- Fixed Digital Downloads filter tab — now shows products with `stlStatus` set instead of looking for `type: 'digital'`
- Removed "← Portfolio" back link from store header — store is now standalone
- Updated footer: `portfolio-4n2.pages.dev` → `levallc.com`
- Updated hero stat line: "Free STL files dropping soon" → "Free STL files — just ask"
- Converted `animate` and `handleResize` inner function declarations to arrow consts (fixed pre-existing lint errors)

**Portfolio (main site):**
- Hero headline iterated: "I build software from the shop floor" → "I build what the physical world is missing" → "I connect the physical world to digital systems"
- Hero subtext rewritten: leads with "Manufacturing software is written by people who've never touched a part" instead of job title
- SideHustles: updated XYZ 3D printing entry to reference levallc.com/store and mention 35+ model files; removed QR Tool Tracking SaaS from planned
- Added `useEffect` hash scroll handler to `App.tsx` — fixes cross-page anchor navigation from `/token` (section IDs were correct but React mount timing caused browser to miss the scroll target)
- Token page coin now links to `/` (portfolio top) instead of `/#about`
- Token page footer: `portfolio-4n2.pages.dev` → `levallc.com` (plain text, not a link)
- Achievement card upgraded: 12 skills covering full stack (TypeScript, Python, React, FastAPI, PostgreSQL, AS9100D, Quality Systems, CAD, 3D Scanning, LiDAR, 3D Printing, AI Prototyping); added subtitle "Manufacturing expert. Software builder. One person."; XP bumped to +9999

**Store data model additions:**
- `stlStatus?: 'available' | 'coming-soon'` field on `StoreProduct` — controls STL download button state
- `rotationY?: number` added to `model3d` config

**Next session:**
- Build AI chat widget (Claude-powered, Cloudflare Worker backend, floating UI on portfolio)
- Add product photos to store when available from phone
- Set `stlStatus: 'available'` + `downloadUrl` on products when STL files are ready

### Session 8 (AI chat widget — Guilty Spark orb)

**Backend (`functions/api/chat.ts`):**
- Cloudflare Pages Function at `/api/chat` — proxies streaming Anthropic Messages API
- Model: `claude-haiku-4-5-20251001`, `max_tokens: 1024`, SSE streaming passthrough
- System prompt: first-person "digital twin" of Avelino, full background, projects, Leva LLC ventures
- Contact-driving instructions: recognize hiring/collaboration signals, proactively surface `levallcworks@gmail.com`
- `ANTHROPIC_API_KEY` stored as Cloudflare Pages Secret (set in dashboard, never in code)

**Chat widget (`src/components/ChatWidget.tsx` + `ChatWidget.css`):**
- Floating animated orb inspired by Halo's 343 Guilty Spark — drifts around screen with sentient-feeling movement
- Orb is 72px canvas element drawn every frame in a `requestAnimationFrame` loop
- Movement: waypoint-based physics (pick destination → accelerate → hover → pick next), soft boundary bounce
- **3D sphere rendering on canvas**: 6-layer radial gradient stack (specular, sheen, diffuse, rim, shadow, base)
- **JS-driven specular shift**: highlight position computed from velocity direction each frame — moves opposite to travel so the orb looks like a real sphere rotating through space (not a flat disc tilting)
- **3D eye projection**: eye socket position computed from spherical coordinates `(theta, phi)` → projected to 2D screen as foreshortened ellipse (`width *= cos(theta)`, `height *= cos(phi)`). Socket narrows as it rotates toward the edge. Iris ring drawn as ellipse, pupil stays circular.
- **Saccadic gaze**: JS-driven look target system — fast lerp dart (factor 0.22) to random target within ±37°, hold 1.5–3.3s, then next target. Much more convincing than CSS keyframes because the socket actually moves across the sphere surface.
- HiDPI: canvas scaled by `devicePixelRatio` at init, all drawing in logical 72px coordinates
- Energy ping rings: `::before`/`::after` with `animation: energy-ping 3.2s ease-out infinite` (offset 1.6s)
- `orb-breathe` animates `box-shadow` only (glow pulses), no transform conflict with canvas
- On click: orb springs to bottom-right corner with `cubic-bezier(0.34,1.4,0.64,1)` transition, chat panel opens
- Suggestion chips shown on first message, disappear after first send
- SSE streaming parsed in frontend: `ReadableStream` → `getReader()` → line-by-line SSE parse → accumulate `text_delta` events
- Streaming cursor (`chat-panel__cursor`) blinks while response is in-flight

**Mobile fixes:**
- Bottom sheet layout: `left:0; right:0; bottom:0; width:100%; border-radius: 20px 20px 0 0`
- `height: min(480px, 75dvh)` — caps at 480px when keyboard closed, shrinks with dvh when keyboard open
- `dvh` (dynamic viewport height) tracks the visual viewport — automatically accounts for iOS soft keyboard
- `font-size: 16px` on mobile input — prevents iOS Safari auto-zoom on focus (triggered by any input < 16px)

**Welcome message (final):**
"hey 👋 I'm Avelino — I build software, do 3D scanning & LiDAR mapping, run a 3D printing line, and prototype AI tools through Leva LLC. basically if it should exist and doesn't, I'll build it. what's up? 🛠️"

**ChatWidget added to:**
- `src/App.tsx` (main portfolio, after `<Footer />`)
- `src/token/TokenPage.tsx` (NFC token page)

**Next session:**
- Add more products to the store: family busts (grandma, auntie), games/art pieces — not necessarily for sale, just to tell the story and show the work
- Add product photos from phone to existing store products
- Set `stlStatus: 'available'` + `downloadUrl` on products when STL files are ready

### Session 9 (Orb polish, store fixes, perf)

**Orb improvements:**
- Z-depth waypoint system: every 5th waypoint goes behind page text (z -0.25 to -0.60), other 4 stay in front (z 0.35 to 0.90) — replaces old sine oscillation that kept orb too far/small
- Scale range tightened: 0.50x (far/behind words) → 0.88x (close/in front)
- Eye saccades sped up: hold reduced from 0.8–2.0s to 0.2–0.7s; lerp factor 0.28 → 0.42; initial pause 60 → 10 frames
- Hover label removed — orb is now a silent easter egg, no "Talk to AI Avelino" tooltip
- Canvas gradient layers reduced 6 → 3 (base+diffuse merged, spec+sheen merged, shadow+rim merged) for mobile perf
- `ctx.shadowBlur` removed from pupil draw (eliminates extra compositing pass each frame)

**Store fixes:**
- Restored `← Portfolio` back link in store header (was removed in Session 7); now uses relative `/` URL so it works on any domain
- "Made to Order" price text no longer clips on narrow mobile cards — `.sp-card__meta` changed to `flex-wrap: wrap` with `white-space: nowrap` on price
- Store link added to main nav (accent-colored to distinguish from section anchors)
- Store link added to Contact section link cards (alongside Email, LinkedIn, GitHub)

**Performance:**
- SVG glow filter removed from 6 animated aurora dots — eliminates per-dot filter region repaint every frame (biggest perf win)
- Aurora Milky Way blur: stdDeviation 70 → 28 (cheaper to composite on mobile)
- Aurora dot glow: stdDeviation 5 → 3 with tighter filter region
- `feTurbulence` grain SVG delayed 1.2s after mount — removes full-viewport noise computation from critical render path; numOctaves 3 → 2
- Artificial startup delays tried and reverted (they caused delayed-then-laggy feel); real fix was reducing per-frame cost

**Next session:**
- Add product photos from phone to existing store products
- Add more products: family busts (grandma, auntie), games/art pieces
- Set `stlStatus: 'available'` + `downloadUrl` on products when STL files are ready

### Session 10 (The Gallery — art/sculpture page)

**Why:** The family busts (grandma, auntie) and a nude figure study didn't belong in the
store — a nude next to "Paper Towel Dispenser — Made to Order" read wrong. Fix was to change
the *frame*, not censor the piece: in a store it's merchandise, in a gallery it's sculpture.

**The Gallery (`/gallery`) — new 4th Vite entry:**
- Entry: `gallery/index.html` → `src/gallery/main.tsx` → `src/gallery/GalleryPage.tsx`
- Styles: `src/gallery/GalleryPage.css` (all classes prefixed `gl-`)
- Data: `src/data/gallery.ts` — `GalleryPiece[]` (title, story, medium, year, tags, model3d, status). **No price, no ordering** — art shown as work, not merchandise.
- **Dark museum aesthetic** (vs. the store's warm/light theme) — sculpture reads as art, ties back to the main dark portfolio, and the reused 3D viewer's `#111` background blends in. Serif display font (`--gl-serif`) for titles.
- Cards: mini auto-spin viewer (or photo/placeholder) → tap opens a lightbox with the full draggable viewer + full story + "Commission a piece".
- Single "Start a commission" CTA at the bottom (mailto). No per-item buy buttons.
- `vite.config.ts`: added `gallery` to `rollupOptions.input`.
- `public/_redirects`: added `/gallery /gallery/index.html 200` before the SPA catch-all.
- **Discovery** — two entry points: (1) the main portfolio nav, where `Gallery` + `Store` are grouped after the in-page section anchors, separated by a `.nav__sep` divider (Store is a `.nav__cta` button, Gallery an accent link) — a clean sections-vs-destinations split; (2) a bold dark call-out card at the bottom of `StorePage` (`.sp-gallery-cta` — serif "The Gallery" title + cyan/purple glow).
- **Gallery header nav:** back button (`.gl-back`) goes to `/store` (that's where visitors come from); the right-side link goes to `/` (Portfolio).
- **18+ age gate:** pieces with `nsfw: true` in `gallery.ts` (currently just `figure-study`) render blurred behind a frosted `.gl-age-veil` (backdrop-filter blur + "18+" badge). Clicking opens the `AgeGate` modal ("I am 18 or older" / "Go back"); confirming sets session state `adultConfirmed` and opens the lightbox. Confirmation is per-session (resets on reload), not persisted.
- **Model3DViewer now loads `.stl` as well as `.3mf`** (picks the loader per part by file extension; STL geometry gets wrapped in a `Mesh` with the standard material). So gallery/store uploads can be either format.

**3D viewer CSS refactor:**
- Extracted the `.mv-*` viewer styles out of `StorePage.css` into a co-located `src/store/Model3DViewer.css`, imported by `Model3DViewer.tsx`. Now both the store and the gallery get viewer styles automatically (matches the "CSS co-located with components" convention). Store verified unchanged.

**Pieces (order is deliberate — family busts lead, figure study is last/low-key):**
- `papa` — **LIVE**, father's bust, `public/gallery/dad.stl`
- `noah` — **LIVE**, nephew's bust, `public/gallery/noah.stl`
- `tina` — **LIVE**, portrait bust, `public/gallery/tina.stl`
- `nana` — **LIVE**, grandmother bust, `public/gallery/nana.stl` (replaced the old `abuela` placeholder)
- `gf-mom` — **LIVE**, girlfriend's mother bust, title is placeholder "Portrait", `public/gallery/gf-mom.stl`
- `tia` — aunt bust, `coming-soon` → expects `public/gallery/tia.3mf`
- `zuriel` — **LIVE**, custom action figure (character work), `public/gallery/zuriel.stl`
- `figure-study` — **LIVE**, generic title (deliberately no personal name), `public/gallery/figure-study.stl`
- All uploaded STLs rendered upright as-is; no rotation calibration was needed. Story copy is warm placeholder text (marked `TODO`) meant to be replaced with Avelino's real words.

**To make a piece live:** drop its `.3mf` into `public/gallery/` (filenames above), then flip that piece's `status` to `'available'` in `src/data/gallery.ts`. Placeholder story copy is written but meant to be replaced with Avelino's real words.

**Next session:**
- Upload the bust/figure `.3mf` files to `public/gallery/`, flip `status` to `'available'`, replace placeholder story copy with real narratives
- Add games/art pieces to the gallery
- Add product photos from phone to existing store products
