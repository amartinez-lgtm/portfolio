/* ═══════════════════════════════════════════════════════
   POST /api/wholesale-request  — wholesale order requests
   GET  /api/wholesale-request  — is a destination configured?

   Pricing is recalculated here from src/data/wholesale.ts.
   Anything the browser sends about money is ignored.

   Delivery destinations (configure at least one in the
   Cloudflare Pages project; all are optional individually):
     WHOLESALE_WEBHOOK_URL  — HTTPS endpoint that receives the JSON
     RESEND_API_KEY + WHOLESALE_NOTIFY_EMAIL (+ RESEND_FROM)
     WHOLESALE_REQUESTS     — KV namespace binding (persistence)

   With none configured, POST returns 503 `not_configured` and the
   page falls back to emailing levallcworks@gmail.com. A request is
   NEVER reported as received unless a destination actually accepted it.
   ═══════════════════════════════════════════════════════ */

import {
  getOffer,
  validateWholesaleRequest,
  merchandiseSubtotalCents,
  formatUSD,
  isoToday,
  WHOLESALE_CONTACT_EMAIL,
} from '../../src/data/wholesale'
import type { WholesaleOffer, WholesaleRequestValue } from '../../src/data/wholesale'
import { destinations, deliverySucceeded } from './_wholesale-delivery'
import type { Destination } from './_wholesale-delivery'

interface KVNamespace {
  put(key: string, value: string, options?: { metadata?: unknown }): Promise<void>
}

interface Env {
  WHOLESALE_WEBHOOK_URL?: string
  WHOLESALE_WEBHOOK_SECRET?: string
  RESEND_API_KEY?: string
  RESEND_FROM?: string
  WHOLESALE_NOTIFY_EMAIL?: string
  WHOLESALE_REQUESTS?: KVNamespace
}

interface RequestContext {
  request: Request
  env: Env
}

const JSON_HEADERS = { 'content-type': 'application/json', 'cache-control': 'no-store' }

const MAX_BODY_BYTES = 16 * 1024
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
/** A real person needs longer than this to fill the form in. */
const MIN_FILL_MS = 3000

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

/* ── Best-effort rate limiting ──────────────────────────
   Pages Functions isolates are short-lived and not shared, so this
   throttles bursts from one client rather than guaranteeing a global
   cap. Combined with the honeypot and fill-time check it is enough
   for a low-volume B2B form; move to KV if abuse ever shows up.      */

const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(key)
    }
  }
  return recent.length > RATE_LIMIT_MAX
}

/* ── Reference id ───────────────────────────────────── */

function makeReference(today: string): string {
  const bytes = new Uint8Array(3)
  crypto.getRandomValues(bytes)
  const suffix = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  return `XYZ-WS-${today.replace(/-/g, '')}-${suffix}`
}

/* ── Delivery ───────────────────────────────────────── */

interface Payload {
  reference: string
  receivedAt: string
  product: { id: string; name: string; configuration: string[] }
  request: WholesaleRequestValue
  pricing: {
    currency: string
    unitPriceCents: number
    quantity: number
    merchandiseSubtotalCents: number
    note: string
    pricingRevision: string
  }
}

function buildPayload(
  offer: WholesaleOffer,
  value: WholesaleRequestValue,
  reference: string,
): Payload {
  return {
    reference,
    receivedAt: new Date().toISOString(),
    product: { id: offer.productId, name: offer.productName, configuration: offer.configuration },
    request: value,
    pricing: {
      currency: offer.currency,
      unitPriceCents: offer.unitPriceCents,
      quantity: value.quantity,
      merchandiseSubtotalCents: merchandiseSubtotalCents(offer, value.quantity),
      note: 'Preliminary. Excludes shipping and applicable taxes. Subject to final confirmation.',
      pricingRevision: offer.pricingRevision,
    },
  }
}

function plainText(p: Payload): string {
  const r = p.request
  return [
    `New wholesale order request — ${p.product.name}`,
    `Reference: ${p.reference}`,
    '',
    `Shop:     ${r.shopName}`,
    `Contact:  ${r.contactName}`,
    `Email:    ${r.email}`,
    `Deliver:  ${r.deliveryCity} ${r.deliveryPostalCode}`,
    `Requested delivery date: ${r.preferredDeliveryDate || '(none given)'}`,
    '',
    `Quantity: ${p.pricing.quantity} units`,
    `Unit:     ${formatUSD(p.pricing.unitPriceCents)}`,
    `Subtotal: ${formatUSD(p.pricing.merchandiseSubtotalCents)} (merchandise only)`,
    `Config:   ${p.product.configuration.join('; ')}`,
    `Pricing:  ${p.pricing.pricingRevision} — ${p.pricing.note}`,
    '',
    `Notes: ${r.notes || '(none)'}`,
    '',
    `Reply to ${r.email} with availability, lead time, and shipping cost.`,
  ].join('\n')
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

async function deliverWebhook(env: Env, payload: Payload): Promise<void> {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (env.WHOLESALE_WEBHOOK_SECRET) headers['x-xyz-webhook-secret'] = env.WHOLESALE_WEBHOOK_SECRET
  const res = await fetch(env.WHOLESALE_WEBHOOK_URL as string, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`webhook responded ${res.status}`)
}

async function deliverEmail(env: Env, payload: Payload): Promise<void> {
  const text = plainText(payload)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || 'XYZ Wholesale <onboarding@resend.dev>',
      to: [env.WHOLESALE_NOTIFY_EMAIL],
      reply_to: payload.request.email,
      subject: `Wholesale request — ${payload.product.name} ×${payload.pricing.quantity} — ${payload.request.shopName}`,
      text,
      html: `<pre style="font:14px/1.6 ui-monospace,monospace">${escapeHtml(text)}</pre>`,
    }),
  })
  if (!res.ok) throw new Error(`email provider responded ${res.status}`)
}

async function deliverKV(env: Env, payload: Payload): Promise<void> {
  await (env.WHOLESALE_REQUESTS as KVNamespace).put(
    `request:${payload.receivedAt}:${payload.reference}`,
    JSON.stringify(payload),
  )
}

/* ── Handlers ───────────────────────────────────────── */

export async function onRequestGet({ env }: RequestContext): Promise<Response> {
  const configured: Destination[] = destinations(env)
  return json({
    configured: configured.length > 0,
    // Labels only — never the URLs, keys, or the destination address.
    methods: configured,
    fallbackEmail: WHOLESALE_CONTACT_EMAIL,
  })
}

export async function onRequestPost({ request, env }: RequestContext): Promise<Response> {
  // Same-origin only. The page is served from the same deployment.
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return json({ ok: false, code: 'bad_origin', message: 'Request blocked.' }, 403)
  }

  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return json({ ok: false, code: 'bad_request', message: 'Expected JSON.' }, 415)
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  if (rateLimited(ip)) {
    return json(
      {
        ok: false,
        code: 'rate_limited',
        message: `Too many requests. Wait a few minutes or email ${WHOLESALE_CONTACT_EMAIL}.`,
      },
      429,
    )
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) {
    return json({ ok: false, code: 'too_large', message: 'Request is too large.' }, 413)
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return json({ ok: false, code: 'bad_request', message: 'Could not read the request.' }, 400)
  }

  const offer = getOffer(String(body.slug ?? ''))
  if (!offer) {
    return json({ ok: false, code: 'unknown_product', message: 'Unknown wholesale product.' }, 404)
  }

  // Honeypot: a hidden field no human ever fills in.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json({ ok: false, code: 'rejected', message: 'Request rejected.' }, 400)
  }

  // Fill-time check — instant submissions are bots.
  const elapsed = Number(body.elapsedMs)
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return json(
      { ok: false, code: 'too_fast', message: 'That was too quick — please try again.' },
      400,
    )
  }

  const result = validateWholesaleRequest(body, offer, isoToday())
  if (!result.ok) {
    return json(
      { ok: false, code: 'invalid', message: 'Please correct the highlighted fields.', errors: result.errors },
      400,
    )
  }

  const configured = destinations(env)
  if (configured.length === 0) {
    return json(
      {
        ok: false,
        code: 'not_configured',
        message: 'Online submission is not configured yet.',
        fallbackEmail: WHOLESALE_CONTACT_EMAIL,
      },
      503,
    )
  }

  const reference = makeReference(isoToday())
  const payload = buildPayload(offer, result.value, reference)

  const attempts = await Promise.allSettled([
    ...(env.WHOLESALE_WEBHOOK_URL ? [deliverWebhook(env, payload)] : []),
    ...(env.RESEND_API_KEY && env.WHOLESALE_NOTIFY_EMAIL ? [deliverEmail(env, payload)] : []),
    ...(env.WHOLESALE_REQUESTS ? [deliverKV(env, payload)] : []),
  ])

  if (!deliverySucceeded(attempts)) {
    // Nothing accepted it — say so. Never report success on a failed delivery.
    return json(
      {
        ok: false,
        code: 'delivery_failed',
        message: 'We could not deliver your request.',
        fallbackEmail: WHOLESALE_CONTACT_EMAIL,
      },
      502,
    )
  }

  return json({
    ok: true,
    reference,
    quantity: payload.pricing.quantity,
    unitPriceCents: payload.pricing.unitPriceCents,
    merchandiseSubtotalCents: payload.pricing.merchandiseSubtotalCents,
  })
}
