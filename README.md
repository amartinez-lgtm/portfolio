# Avelino Martinez — Portfolio Site

Personal portfolio site for Avelino Martinez. Built with React + Vite + TypeScript, deployed on Cloudflare Pages.

**Live URL:** https://portfolio-4n2.pages.dev

---

## Stack

- **Framework:** React 18 + TypeScript
- **Build tool:** Vite 5
- **Styling:** Plain CSS with CSS custom properties (no Tailwind, no CSS-in-JS)
- **Deployment:** Cloudflare Pages (auto-deploys on push to `main`)
- **Repo:** https://github.com/amartinez-lgtm/portfolio

## Local Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # output → dist/
npm run preview   # preview the production build locally
```

## Project Structure

```
src/
├── main.tsx                  # App entry point
├── App.tsx                   # Root component — assembles all sections
├── index.css                 # Global design system (CSS vars, dark mode, layout)
├── data/
│   └── projects.ts           # All content: projects, side hustles, career stories
└── components/
    ├── Nav.tsx/.css           # Fixed nav, scroll blur effect, mobile burger menu
    ├── Hero.tsx/.css          # Full-height hero with stat counters
    ├── Work.tsx/.css          # 6 project cards in a 3-col grid
    ├── SideHustles.tsx/.css   # Ventures grouped by status (active/in-progress/planned)
    ├── CareerStories.tsx/.css # Numbered narrative stories
    ├── About.tsx/.css         # Bio + sticky skills panel
    ├── Contact.tsx/.css       # Email / LinkedIn / GitHub link cards
    └── Footer.tsx/.css        # Simple footer
```

## Content

All content lives in **`src/data/projects.ts`** — no CMS, no API. To update copy, edit that file and push.

Three data types:
- `Project[]` — professional dev work (6 projects)
- `SideHustle[]` — Leva LLC ventures (7 items, status: active/in-progress/planned)
- `CareerStory[]` — narrative career stories (3 stories)

## Deployment

Cloudflare Pages is connected to this repo. Every push to `main` triggers an automatic build and deploy (~60 seconds).

Build settings:
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 20 (set via `NODE_VERSION=20` env var)

The `public/_redirects` file handles SPA routing (all routes → index.html).  
The `public/_headers` file sets security headers and long-term asset caching.

## Design System

CSS custom properties defined in `src/index.css`:
- Full dark mode via `prefers-color-scheme: dark`
- Mobile responsive (breakpoints at 640px and 900px/1024px)
- Font stack: Inter (sans), JetBrains Mono (mono)
- Accent color: `#0ea5e9` (light) / `#38bdf8` (dark)

## TODO / Pending

- [ ] Replace placeholder email (`avelino@levalabs.com`) with real email
- [ ] Replace placeholder LinkedIn URL with real profile slug
- [ ] Custom domain setup in Cloudflare Pages
- [ ] Add real profile photo to About section
- [ ] Consider adding a `/uses` or `/now` page
- [ ] SmartWardrobe AI and QR Tool Tracking pages when those launch
