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

A personal portfolio site + Leva LLC store. Live at: **https://levallc.com**

- Portfolio: `https://levallc.com`
- Store: `https://levallc.com/store`
- Token page: `https://levallc.com/token`
- Cloudflare fallback domain: `https://portfolio-4n2.pages.dev` (still works)

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
| Custom domain | ✓ Done — `levallc.com` pointing to Cloudflare Pages |
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
  → live in ~60 seconds at levallc.com (and portfolio-4n2.pages.dev)
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
| `StorePage` | `/store` | Leva LLC product store — filter tabs, product cards, detail drawer with image gallery + Three.js 3D model viewer |
| `Model3DViewer` | — | Lazy-loaded Three.js viewer for 3MF files; used inside the store product drawer |

## NFC Token Page (`/token`)

A completely separate React app (Vite multi-page build) for the physical 3D-printed NFC smart business card.

**URL:** `https://levallc.com/token`

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

**NFC tag URL to program:** `https://levallc.com/token`

## Store Page (`/store`)

A separate React app (Vite multi-page build) for the Leva LLC physical + digital product store.

**URL:** `https://levallc.com/store`

**Architecture:**
- Entry: `store/index.html` → `src/store/main.tsx` → `src/store/StorePage.tsx`
- Styles: `src/store/StorePage.css`
- Product data: `src/data/store.ts` — single source of truth for all store content
- 3D viewer: `src/store/Model3DViewer.tsx` — lazy-loaded Three.js component, reads `.3mf` files from `/public/products/`
- `vite.config.ts` has three `rollupOptions.input` entries: `main`, `token`, `store`
- `public/_redirects` has `/store /store/index.html 200`

**Product assets** live in `public/products/` — images and 3MF model files.

**StoreProduct interface:**
```typescript
interface StoreProduct {
  id: string
  name: string
  type: 'physical' | 'digital'
  description: string
  price: string
  tags: string[]
  image?: string         // hero image
  images?: string[]      // additional gallery images
  model3d?: { parts: ModelPart[]; color?: string; rotationX?: number; rotationZ?: number }
  status: 'available' | 'coming-soon'
  downloadUrl?: string
}
```

**Edit content in `src/data/store.ts`** — add/update products here. To add images, drop files in `public/products/` and reference them as `/products/filename.jpg`.

**Current products (9 total):**
- Physical (available): NFC Portfolio Token, Light Switch Cover, Planter Pot Small, Planter Pot Large, Paper Towel Dispenser (has photos + 3D model), Soap Dispenser
- Digital STL (coming-soon): Light Switch Cover STL, Planter Pot STL, Soap Dispenser STL

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

### Session 7 (store + domain)
- Built Leva LLC store at `/store` — Vite multi-page entry (`store/index.html`), `src/store/StorePage.tsx`, `src/store/StorePage.css`
- Product data in `src/data/store.ts` — `StoreProduct` interface with `type`, `status`, `model3d`, `images`, `downloadUrl` fields
- Product detail drawer: image gallery with thumbnail nav, Three.js 3D model viewer (`Model3DViewer.tsx`) lazy-loaded with error boundary
- Paper towel dispenser is the hero product: 5 photos + 3MF assembly model in `/public/products/`
- 9 products total: 6 physical (available), 3 digital STLs (coming-soon)
- Custom domain confirmed live: **levallc.com** — portfolio at root, store at `/store`, token at `/token`
- `_redirects` has `/store /store/index.html 200` rule
- CLAUDE.md updated to reflect levallc.com as canonical domain
