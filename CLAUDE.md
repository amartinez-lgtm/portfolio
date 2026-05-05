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
| Custom domain | Not set up. Do in Cloudflare Pages → Custom Domains. |
| Profile photo in About | Not added yet |
| Analytics | Not added. Cloudflare Web Analytics is free and easy. |
| Mobile nav close-on-scroll | Not implemented |
| Active section highlighting in nav | Not implemented |

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
| `About` | `#about` | Bio, Leva LLC description, AI decision-framework callout, sticky skills panel |
| `Work` | `#work` | Interactive accordion list of 6 projects from `projects[]` |
| `SideHustles` | `#ventures` | 3 groups (active/in-progress/planned) from `sideHustles[]` |
| `CareerStories` | `#stories` | Numbered story list from `careerStories[]` |
| `Contact` | `#contact` | Inquiry form (mailto fallback) + Email/LinkedIn/GitHub link cards |
| `Footer` | — | Name + copyright |

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

### Session 3 (today)
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
