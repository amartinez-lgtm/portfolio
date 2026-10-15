/* ═══════════════════════════════════════════════════════
   XYZ WHOLESALE — single source of truth
   ═══════════════════════════════════════════════════════
   Shared by the public page (src/wholesale) AND the server
   handler (functions/api/wholesale-request.ts). Prices are
   recalculated on the server from THIS file — never trusted
   from the browser.

   To change a price or minimum: edit the offer below. Nothing
   else needs to change.
   ═══════════════════════════════════════════════════════ */

export interface WholesaleOffer {
  /** Must match a `storeProducts[].id` in src/data/store.ts */
  productId: string
  /** URL segment: /wholesale/<slug> */
  slug: string
  productName: string
  /** Exactly what is being quoted. Keep to verified facts only. */
  configuration: string[]
  currency: 'USD'
  unitPriceCents: number
  minQuantity: number
  /** Upper bound accepted by the form; larger volumes are quoted by email. */
  maxQuantity: number
  /** One-tap quantity buttons. Each must be >= minQuantity. */
  quickQuantities: number[]
  /** Guidance only — the retailer sets their own shelf price. */
  suggestedRetailCents: number
  terms: string[]
  /** Shown on the printed quote so a stale printout is obvious. */
  pricingRevision: string
}

export const WHOLESALE_CONTACT_EMAIL = 'levallcworks@gmail.com'

export const wholesaleOffers: WholesaleOffer[] = [
  {
    productId: 'soap-dispenser',
    slug: 'soap-dispenser',
    productName: 'Soap Dispenser',
    configuration: [
      'Matte black PLA body',
      'Black pump, standard pump thread',
      'Supplied empty (no soap)',
      'Basic protective bulk packaging',
    ],
    currency: 'USD',
    unitPriceCents: 600,
    minQuantity: 12,
    maxQuantity: 1000,
    quickQuantities: [12, 24, 48],
    suggestedRetailCents: 1199,
    terms: [
      '50% deposit after final order confirmation.',
      'Balance due before dispatch.',
      'Lead time and shipping cost agreed before deposit.',
      'Custom colors, branding, or packaging quoted separately.',
    ],
    pricingRevision: '2026-10 preliminary',
  },
]

export function getOffer(slug: string): WholesaleOffer | undefined {
  return wholesaleOffers.find((o) => o.slug === slug)
}

/** Used by the store to decide whether a product has a wholesale sheet. */
export function getOfferForProduct(productId: string): WholesaleOffer | undefined {
  return wholesaleOffers.find((o) => o.productId === productId)
}

/* ── Money ──────────────────────────────────────────── */

export function formatUSD(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Merchandise subtotal only — excludes shipping and any applicable taxes. */
export function merchandiseSubtotalCents(offer: WholesaleOffer, quantity: number): number {
  return offer.unitPriceCents * quantity
}

/* ── Quantity ───────────────────────────────────────── */

export type QuantityResult =
  | { ok: true; quantity: number }
  | { ok: false; error: string }

/**
 * Accepts the raw value from a form field or a JSON body and returns a
 * whole-number quantity inside the offer's bounds, or a human-readable error.
 * Strings are accepted so the same function can validate an `<input>` value.
 */
export function normalizeQuantity(raw: unknown, offer: WholesaleOffer): QuantityResult {
  let n: number
  if (typeof raw === 'number') {
    n = raw
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim()
    // Reject "12abc", "1e3", "", " " — only plain digits with optional sign.
    if (!/^[+-]?\d+$/.test(trimmed)) {
      return { ok: false, error: `Enter a whole number of units (minimum ${offer.minQuantity}).` }
    }
    n = Number(trimmed)
  } else {
    return { ok: false, error: `Enter a whole number of units (minimum ${offer.minQuantity}).` }
  }

  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, error: 'Quantity must be a whole number of units.' }
  }
  if (n < offer.minQuantity) {
    return { ok: false, error: `Minimum order is ${offer.minQuantity} units.` }
  }
  if (n > offer.maxQuantity) {
    return {
      ok: false,
      error: `For more than ${offer.maxQuantity} units, email ${WHOLESALE_CONTACT_EMAIL} for a volume quote.`,
    }
  }
  return { ok: true, quantity: n }
}

/* ── Request validation (server + client) ───────────── */

export interface WholesaleRequestInput {
  contactName?: unknown
  shopName?: unknown
  email?: unknown
  quantity?: unknown
  deliveryCity?: unknown
  deliveryPostalCode?: unknown
  preferredDeliveryDate?: unknown
  notes?: unknown
}

export interface WholesaleRequestValue {
  contactName: string
  shopName: string
  email: string
  quantity: number
  deliveryCity: string
  deliveryPostalCode: string
  preferredDeliveryDate: string
  notes: string
}

export type FieldErrors = Partial<Record<keyof WholesaleRequestValue, string>>

export type ValidationResult =
  | { ok: true; value: WholesaleRequestValue }
  | { ok: false; errors: FieldErrors }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/
const POSTAL_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * `today` is injected so the server can use its own clock and tests stay
 * deterministic. Format: YYYY-MM-DD.
 */
export function validateWholesaleRequest(
  input: WholesaleRequestInput,
  offer: WholesaleOffer,
  today: string,
): ValidationResult {
  const errors: FieldErrors = {}

  const contactName = str(input.contactName)
  if (contactName.length < 2) errors.contactName = 'Enter your name.'
  else if (contactName.length > 120) errors.contactName = 'Name is too long (120 characters max).'

  const shopName = str(input.shopName)
  if (shopName.length < 2) errors.shopName = 'Enter your shop or business name.'
  else if (shopName.length > 160) errors.shopName = 'Business name is too long (160 characters max).'

  const email = str(input.email)
  if (!email) errors.email = 'Enter an email address so we can send the quote.'
  else if (email.length > 254 || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.'

  const q = normalizeQuantity(input.quantity, offer)
  if (!q.ok) errors.quantity = q.error

  const deliveryCity = str(input.deliveryCity)
  if (deliveryCity.length < 2) errors.deliveryCity = 'Enter the delivery city.'
  else if (deliveryCity.length > 120) errors.deliveryCity = 'City is too long (120 characters max).'

  const deliveryPostalCode = str(input.deliveryPostalCode)
  if (!deliveryPostalCode) errors.deliveryPostalCode = 'Enter the delivery ZIP or postal code.'
  else if (!POSTAL_RE.test(deliveryPostalCode)) errors.deliveryPostalCode = 'Enter a valid ZIP or postal code.'

  // Optional — a request, never a commitment.
  const preferredDeliveryDate = str(input.preferredDeliveryDate)
  if (preferredDeliveryDate) {
    if (!ISO_DATE_RE.test(preferredDeliveryDate) || Number.isNaN(Date.parse(preferredDeliveryDate))) {
      errors.preferredDeliveryDate = 'Use a valid date.'
    } else if (preferredDeliveryDate < today) {
      errors.preferredDeliveryDate = 'Choose a date that is not in the past.'
    } else if (preferredDeliveryDate > addYears(today, 2)) {
      errors.preferredDeliveryDate = 'Choose a date within the next two years.'
    }
  }

  const notes = str(input.notes)
  if (notes.length > 2000) errors.notes = 'Notes are too long (2000 characters max).'

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: {
      contactName,
      shopName,
      email,
      quantity: (q as { ok: true; quantity: number }).quantity,
      deliveryCity,
      deliveryPostalCode,
      preferredDeliveryDate,
      notes,
    },
  }
}

function addYears(isoDate: string, years: number): string {
  const [y, m, d] = isoDate.split('-')
  return `${String(Number(y) + years).padStart(4, '0')}-${m}-${d}`
}

/** YYYY-MM-DD in UTC. */
export function isoToday(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}
