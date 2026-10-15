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
npm test          # pricing + validation unit tests (Node's built-in runner)
npm run test:e2e  # full stack: real Pages runtime + browser (needs `npm run build` first)
```

## Project Structure

```
src/
├── main.tsx                  # Portfolio entry point
├── App.tsx                   # Root component — assembles all sections
├── index.css                 # Global design tokens (CSS vars, dark mode)
├── data/
│   ├── projects.ts           # All portfolio content: projects, ventures, stories
│   ├── store.ts              # XYZ store product data
│   └── wholesale.ts          # Wholesale pricing config + shared validation
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
├── wholesale/                # Wholesale quote pages (standalone page)
│   ├── main.tsx
│   ├── WholesalePage.tsx     # Quote, live subtotal, order-request form
│   └── WholesalePage.css
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

---

## Wholesale quote pages

Shareable, no-index pages for retail buyers: `/wholesale/<slug>` (live:
`/wholesale/soap-dispenser`). Pricing, minimums, quick quantities, and terms all
live in **one place** — `src/data/wholesale.ts`. Change the price or minimum
there and both the page and the server pick it up.

Submissions go to `POST /api/wholesale-request` (a Cloudflare Pages Function,
same pattern as `/api/chat`). The server revalidates everything and recalculates
the subtotal from `src/data/wholesale.ts` — nothing about money is trusted from
the browser.

### Configuring where requests go

Set **at least one** of these in the Cloudflare Pages project
(Settings → Environment variables / Secrets). With none set, the form disables
itself and points buyers at `levallcworks@gmail.com` — it never fakes a success.

| Variable | Purpose |
|---|---|
| `WHOLESALE_WEBHOOK_URL` | HTTPS endpoint that receives the request JSON (Zapier, Make, a Google Apps Script web app…) |
| `WHOLESALE_WEBHOOK_SECRET` | Optional. Sent as `x-xyz-webhook-secret` so the receiver can verify the call |
| `RESEND_API_KEY` + `WHOLESALE_NOTIFY_EMAIL` | Email notification via Resend's REST API (no npm package needed). Both required |
| `RESEND_FROM` | Optional `From:` header, e.g. `XYZ Wholesale <wholesale@levallc.com>` |
| `WHOLESALE_REQUESTS` | Optional KV namespace binding — persists every request |

`GET /api/wholesale-request` reports only whether a destination is configured.
It never returns URLs, keys, or the notification address.

### Testing the submission flow

`npm run test:e2e` builds nothing itself — run `npm run build` first. It then
boots a stand-in order receiver plus the real Cloudflare Pages runtime
(`wrangler pages dev`) and drives three suites: the Function's validation,
pricing, spam guards, and delivery handling; the gallery, tabs, copy link, and
quantity maths in a real browser; and the whole submit path from form to a row
landing in the receiver — including the case where delivery fails and the page
must NOT report success.

Copy `.dev.vars.example` to `.dev.vars` to point a local run at your own
receiver. `.dev.vars` is gitignored.

### Google Sheet receiver

`docs/wholesale-apps-script.gs` is a ready-to-paste Google Apps Script that
appends each request as a row in a spreadsheet. Setup steps are in the file
header. It needs no Google credential on the site's side — the script runs as
you, and Cloudflare only holds the `/exec` URL and a shared secret.
