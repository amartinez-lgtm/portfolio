# Avelino Martinez — Portfolio + XYZ Store

Personal portfolio and 3D print store for Avelino Martinez. Built with React + Vite + TypeScript, deployed on Cloudflare Pages.

**Live URLs:**
- Portfolio: https://levallc.com
- XYZ Store: https://levallc.com/store
- NFC Token page: https://levallc.com/token

---

## Stack

- **Framework:** React 18 + TypeScript
- **Build tool:** Vite 5 (multi-page: main + store + token)
- **Styling:** Plain CSS with CSS custom properties (no Tailwind, no CSS-in-JS)
- **3D viewer:** Three.js + ThreeMFLoader (lazy-loaded, loads `.3mf` files)
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
├── main.tsx                  # Portfolio entry point
├── App.tsx                   # Root component — assembles all sections
├── index.css                 # Global design tokens (CSS vars, dark mode)
├── data/
│   ├── projects.ts           # All portfolio content: projects, ventures, stories
│   └── store.ts              # XYZ store product data
├── components/               # Portfolio components (each has co-located .css)
│   ├── Nav.tsx               # Fixed nav, scroll blur, mobile hamburger
│   ├── Hero.tsx              # Full-height hero
│   ├── About.tsx             # Bio + sticky skills panel + AI framework callout
│   ├── Work.tsx              # Accordion project list
│   ├── SideHustles.tsx       # Ventures grouped by status
│   ├── CareerStories.tsx     # Numbered narrative stories
│   ├── Contact.tsx           # Mailto form + link cards
│   ├── Footer.tsx            # Footer with ◈ Token link
│   └── AuroraBackground.tsx  # Fixed starfield with orbital dots + gravity
├── store/                    # XYZ store (standalone page)
│   ├── main.tsx              # Store entry point
│   ├── StorePage.tsx         # Product grid, drawer, 3D viewer integration
│   ├── StorePage.css
│   └── Model3DViewer.tsx     # Three.js .3mf viewer (mini card + full drawer)
└── token/                    # NFC token page (standalone page)
    ├── main.tsx
    ├── TokenPage.tsx         # Hex grid, coin, achievement card, nav cards
    └── TokenPage.css

public/
├── products/                 # All store product assets (.3mf models + photos)
├── avatar_jpg.jpeg           # Profile photo
├── XYZ.png                   # Store brand asset
├── _redirects                # Cloudflare routing rules
└── _headers                  # Security + cache headers
```

## Content

**Portfolio content** lives in `src/data/projects.ts` — no CMS. Edit and push to update.
- `Project[]` — 6 professional projects with descriptions, LOC, tags, AI notes
- `SideHustle[]` — Leva LLC ventures (active/in-progress)
- `CareerStory[]` — 3 narrative career stories

**Store content** lives in `src/data/store.ts`.
- `StoreProduct[]` — 6 physical products, each with 3D model config
- To add a product: upload `.3mf` to `public/products/`, add entry to `storeProducts[]`
- To enable STL download: set `stlStatus: 'available'` and `downloadUrl` on the product

**Token page content** — edit directly in `src/token/TokenPage.tsx`:
- `NAV_ITEMS` array — nav card links and subtitles
- `ACHIEVEMENT_SKILLS` array — skill chips in achievement card
- Sections marked with `/* EDIT: */` comments

## 3D Model Orientation

Models are exported from Onshape. Three.js uses Y-up coordinates.
- Export with Y-axis pointing up in the CAD workspace
- If orientation needs fixing, append `?calibrate` to the store URL while viewing a product — exposes rotation buttons and live value readout
- Bake final values into `model3d.rotationX/Y/Z` in `store.ts`

## Deployment

Cloudflare Pages watches `main`. Every push deploys in ~60 seconds.

Build settings:
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 20 (`NODE_VERSION=20` env var)

`public/_redirects` handles:
- `/token` → `token/index.html`
- `/store` → `store/index.html`
- SPA catch-all: `/* /index.html 200`

## TODO / Next Session

- [ ] AI chat widget — Claude-powered, Cloudflare Worker backend, floating UI on portfolio (needs Anthropic API key in Cloudflare env vars)
- [ ] Product photos — upload from phone to `public/products/`, wire into store data
- [ ] STL download files — set `stlStatus: 'available'` + `downloadUrl` per product when files are ready
- [ ] Gmail auto-reply filter for product order inquiries
