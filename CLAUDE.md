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

A personal portfolio site. Live at: **https://levallc.com**

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
| Custom domain | ✓ Done — `levallc.com` registered on Cloudflare, attached to Pages project. |
| Analytics | Not added. Cloudflare Web Analytics is free and easy. |
| Mobile nav close-on-scroll | Not implemented |
| Active section highlighting in nav | Not implemented |
| Shopify Products URL in token page | Placeholder `https://leva-llc.myshopify.com` — will be replaced when `/shop` is built (next session) |
| `/shop` route (XYZ Designs storefront) | 🔜 Next session — spec + phasing plan saved below in this file |
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
  → live in ~60 seconds at levallc.com
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

### Session 7
- Registered custom domain `levallc.com` on Cloudflare Registrar ($10.46/yr, auto-renews May 2027)
- Attached `levallc.com` to Cloudflare Pages portfolio project — Active + SSL enabled
- Updated all `portfolio-4n2.pages.dev` references in codebase to `levallc.com`
- NFC tag programmed with old URL still works; new tags should use `https://levallc.com/token`

---

## Next Session — XYZ Designs Shop (`/shop`)

### What we're building
Integrating 3D printing business (XYZ Designs) into the portfolio as a `/shop` route. Replacing Shopify with a zero-monthly-cost print-on-demand + free download storefront.

### Spec (do not start until clarifying questions are answered)

**Routes to add:**
- `/shop` — product grid, hero section "XYZ Designs — Made-to-order 3D prints + free downloads"
- `/shop/[slug]` — individual product page with image gallery, specs, CTAs

**Product card CTAs:**
- "Download Free 3MF" → email gate modal → signed R2 URL
- "Order Printed — $XX" → external Stripe Payment Link (created manually in Stripe dashboard)

**Product data source of truth** (`src/data/products.ts`):
```ts
export interface Product {
  slug: string
  title: string
  description: string
  longDescription: string
  images: string[]
  printedPrice: number
  stripePaymentLink: string
  r2FileKey: string          // key in Cloudflare R2 bucket
  specs: {
    material: string
    dimensions: string
    printTimeHours: number
  }
  featured: boolean
}
```

**Free download flow:**
1. User clicks "Download Free 3MF"
2. Email gate modal: name + email (required)
3. POST to `/api/download` Worker endpoint
4. Worker: logs email + slug to D1, generates signed R2 URL (15 min expiry), returns URL
5. Frontend redirects to signed URL → file downloads
6. Confirmation email via Resend (free tier)

**Order flow:** "Order Printed" → Stripe Payment Link. No checkout to build.

**Worker endpoints:**
- `POST /api/download` — body: `{ productSlug, email, name }` → returns `{ signedUrl }`
- `GET /api/downloads/count/:slug` → download count for social proof

**Infrastructure needed:**
- R2 bucket: `xyz-designs-files` (private)
- D1 database: `xyz-designs-db`, table: `downloads (id, email, name, product_slug, timestamp)`
- Resend API key in Wrangler secrets
- Worker via Cloudflare Pages Functions: `/functions/api/[[route]].ts`

**Constraints:**
- TypeScript only — no Python, no Shopify, no FastAPI
- All secrets via Wrangler secrets, never committed
- Code clarity over brevity — Avelino is in active learning mode, comments on non-obvious CF patterns
- Reuse existing portfolio design system (plain CSS, design tokens)

### ⚠️ Discrepancies to resolve at session start

1. **Tailwind vs plain CSS** — the spec mentions TailwindCSS but this portfolio uses **plain CSS with CSS custom properties** (intentional, enforced rule). Clarify before writing any component code.
2. **No existing Worker** — this will be the first Cloudflare Worker/Function in the repo. Need to confirm Wrangler setup from scratch.
3. **Hono** — spec mentions Hono. Confirm whether to use Hono inside the Pages Function or raw `fetch` handler. Hono is fine but adds a dependency.
4. **Deployed URL** — spec still references `portfolio-4n2.pages.dev`; correct URL is now `levallc.com`.

### Questions to ask before writing any code
1. Current repo file structure (run `find src -type f | sort`)
2. Does a `wrangler.toml` exist yet?
3. Confirm Tailwind vs plain CSS decision
4. Confirm Hono or raw handler preference
5. Do you have a Resend account / API key already?
6. Do you have a Stripe account with Payment Links ready?
7. Do you have any product images ready, or use placeholders for now?

### ⚠️ Architectural decision — Router (must resolve before any code)

The portfolio currently has **no router**. The `/token` page is a separate Vite entry point. The main app is pure anchor-link navigation.

`/shop/[slug]` is a dynamic route — impossible without a router. Options:

| Option | Verdict |
|---|---|
| **Add React Router** | ✅ Recommended. Right long-term move now that there's a real storefront with dynamic pages. |
| **Vite multi-page** | ❌ Works for `/shop` but can't do `/shop/[slug]` — would need a separate HTML file per product. |
| **Separate app** (like `/token`) | ❌ Totally isolated, slug pages still need a router inside anyway. |

**Recommendation: add React Router.** "No router" rule made sense for a one-page portfolio. A storefront with dynamic product pages is the right moment for it.

### Recommended build phases

Rather than building everything at once, phase the work:

**Phase 1 (first shop session):** Shop index + product pages + Stripe Payment Links only. No backend, no email gate. Working storefront in one session.

**Phase 2 (second shop session):** Email gate modal + R2 signed URL download flow + D1 email logging + Resend confirmation email.

This keeps each session focused and ships something real at the end of every session.
