# CLAUDE.md — AI Context for Portfolio Project

This file gives any AI assistant (Claude, Codex, Cursor, etc.) full context to pick up this project cold.

---

## Who This Is For

**Avelino Martinez** — 10-year aerospace manufacturing veteran who builds software.
- Quality Manager at Final Frontier Manufacturing (FFM), an AS9100-certified machine shop
- Founder of Leva LLC (personal business umbrella)
- Positioning: "manufacturing domain expert who builds software"
- GitHub: https://github.com/amartinez-lgtm
- Cloudflare account: Levallcworks@gmail.com (personal account, not a work account)

## What This Project Is

A personal portfolio site. Live at: **https://portfolio-4n2.pages.dev**

Sections: Hero → Work → Side Hustles (Ventures) → Career Stories → About → Contact

## Tech Stack

- React 18 + TypeScript
- Vite 5 (build tool)
- Plain CSS with CSS custom properties (NO Tailwind, NO CSS-in-JS, NO styled-components)
- No state management library — local state only
- No router — single-page, anchor-link navigation
- Deployed on Cloudflare Pages via GitHub integration

## Key Decisions Made

- **No framework CSS** — intentional. Keep it lean. Do not add Tailwind or any CSS framework.
- **No animations library** — CSS transitions only. Keep it fast.
- **No router** — single page with anchor links. Do not add React Router.
- **All content in one file** — `src/data/projects.ts` is the single source of truth for all copy. No CMS.
- **CSS co-located with components** — each `Component.tsx` has a `Component.css` next to it.
- **Dark mode via CSS** — uses `prefers-color-scheme: dark` media query on `:root` CSS vars. No JS toggle needed yet.

## Design Tokens (src/index.css)

All design tokens are CSS custom properties on `:root`. Dark mode overrides them in a media query.

Key vars:
- `--bg`, `--bg-subtle`, `--bg-muted` — background layers
- `--text`, `--text-muted`, `--text-subtle` — text hierarchy
- `--accent` (#0ea5e9 light / #38bdf8 dark) — brand color
- `--accent-dim` — light tint of accent for backgrounds
- `--border` — separator color
- `--font-sans`, `--font-mono` — type stacks
- `--max-w: 1100px` — max content width
- `--section-pad: 96px` — vertical section padding

## Content Data (src/data/projects.ts)

Three exported arrays — edit these to update site content:

```typescript
projects: Project[]        // 6 professional projects
sideHustles: SideHustle[]  // 7 Leva LLC ventures (active/in-progress/planned)
careerStories: CareerStory[] // 3 narrative career stories
```

## Placeholders That Need Replacing

These are placeholder values that need real data from Avelino:

| Field | Current value | Location |
|---|---|---|
| Email | `avelino@levalabs.com` | `src/components/Contact.tsx` |
| LinkedIn URL | `https://linkedin.com/in/avelinomartinez` | `src/components/Contact.tsx` |
| LinkedIn display name | `Avelino Martinez` | `src/components/Contact.tsx` |

## Deployment Pipeline

```
git push origin main
  → Cloudflare Pages detects push
  → runs: npm run build
  → serves: dist/
  → live in ~60 seconds at portfolio-4n2.pages.dev
```

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
| `Nav` | — | Fixed top nav, scroll blur, mobile menu |
| `Hero` | (top) | Headline, stats (161K LOC / 7 tools / 10 wks), CTAs |
| `Work` | `#work` | 6 project cards from `projects[]` |
| `SideHustles` | `#ventures` | 3 groups (active/in-progress/planned) from `sideHustles[]` |
| `CareerStories` | `#stories` | Numbered story list from `careerStories[]` |
| `About` | `#about` | Bio paragraphs + sticky skills panel |
| `Contact` | `#contact` | Email / LinkedIn / GitHub link cards |
| `Footer` | — | Name + copyright |

## What's NOT Done Yet

- Real email and LinkedIn URL (Avelino needs to provide)
- Custom domain (needs to be set up in Cloudflare Pages → Custom Domains)
- Profile photo in About section
- Any analytics (Cloudflare Web Analytics can be added for free)
- Mobile nav close-on-scroll behavior
- Active section highlighting in nav

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
