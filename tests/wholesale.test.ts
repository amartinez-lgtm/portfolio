/* Pricing + validation tests for the wholesale quote.
   Run with: npm test   (Node's built-in runner, no extra dependencies) */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  getOffer,
  getOfferForProduct,
  formatUSD,
  merchandiseSubtotalCents,
  normalizeQuantity,
  validateWholesaleRequest,
  isoToday,
  wholesaleOffers,
} from '../src/data/wholesale.ts'

const offer = getOffer('soap-dispenser')!
const TODAY = '2026-10-15'

function validBody(over: Record<string, unknown> = {}) {
  return {
    contactName: 'Dana Reyes',
    shopName: 'Corner Goods',
    email: 'dana@cornergoods.com',
    quantity: 24,
    deliveryCity: 'Austin',
    deliveryPostalCode: '78704',
    preferredDeliveryDate: '',
    notes: '',
    ...over,
  }
}

describe('offer config', () => {
  test('soap dispenser offer exists and matches a real store product id', () => {
    assert.ok(offer)
    assert.equal(offer.productId, 'soap-dispenser')
    assert.equal(offer.unitPriceCents, 600)
    assert.equal(offer.minQuantity, 12)
    assert.equal(offer.suggestedRetailCents, 1199)
  })

  test('every quick quantity is at or above the minimum', () => {
    for (const o of wholesaleOffers) {
      for (const q of o.quickQuantities) assert.ok(q >= o.minQuantity, `${q} < ${o.minQuantity}`)
      assert.ok(o.maxQuantity > o.minQuantity)
    }
  })

  test('getOfferForProduct finds the sheet the store links to', () => {
    assert.equal(getOfferForProduct('soap-dispenser')?.slug, 'soap-dispenser')
    assert.equal(getOfferForProduct('candle-holder'), undefined)
  })
})

describe('quantity + subtotal', () => {
  test('the three quick selections produce the quoted totals', () => {
    assert.equal(merchandiseSubtotalCents(offer, 12), 7200)
    assert.equal(merchandiseSubtotalCents(offer, 24), 14400)
    assert.equal(merchandiseSubtotalCents(offer, 48), 28800)
    assert.equal(formatUSD(merchandiseSubtotalCents(offer, 12)), '$72.00')
    assert.equal(formatUSD(merchandiseSubtotalCents(offer, 24)), '$144.00')
    assert.equal(formatUSD(merchandiseSubtotalCents(offer, 48)), '$288.00')
  })

  test('a custom whole-number quantity multiplies out', () => {
    assert.equal(merchandiseSubtotalCents(offer, 37), 22200)
    assert.equal(formatUSD(merchandiseSubtotalCents(offer, 37)), '$222.00')
  })

  test('formatUSD groups thousands', () => {
    assert.equal(formatUSD(merchandiseSubtotalCents(offer, 1000)), '$6,000.00')
  })

  test('accepts the minimum and numeric strings', () => {
    assert.deepEqual(normalizeQuantity(12, offer), { ok: true, quantity: 12 })
    assert.deepEqual(normalizeQuantity(' 50 ', offer), { ok: true, quantity: 50 })
  })

  test('rejects below the minimum', () => {
    const r = normalizeQuantity(11, offer)
    assert.equal(r.ok, false)
    assert.match((r as { error: string }).error, /Minimum order is 12/)
  })

  test('rejects fractional, non-numeric, empty, and over-cap quantities', () => {
    for (const bad of [12.5, '12.5', '12abc', '1e3', '', '   ', null, undefined, {}, NaN, Infinity, -12]) {
      assert.equal(normalizeQuantity(bad, offer).ok, false, `accepted ${String(bad)}`)
    }
    assert.equal(normalizeQuantity(offer.maxQuantity + 1, offer).ok, false)
    assert.equal(normalizeQuantity(offer.maxQuantity, offer).ok, true)
  })
})

describe('request validation', () => {
  test('accepts a complete request and trims whitespace', () => {
    const r = validateWholesaleRequest(validBody({ contactName: '  Dana Reyes  ' }), offer, TODAY)
    assert.equal(r.ok, true)
    assert.equal((r as { value: { contactName: string } }).value.contactName, 'Dana Reyes')
  })

  test('requires every mandatory field', () => {
    const r = validateWholesaleRequest({}, offer, TODAY)
    assert.equal(r.ok, false)
    const errors = (r as { errors: Record<string, string> }).errors
    for (const f of ['contactName', 'shopName', 'email', 'quantity', 'deliveryCity', 'deliveryPostalCode']) {
      assert.ok(errors[f], `missing error for ${f}`)
    }
  })

  test('rejects malformed emails and postal codes', () => {
    for (const email of ['dana', 'dana@', 'dana@shop', 'a b@shop.com']) {
      const r = validateWholesaleRequest(validBody({ email }), offer, TODAY)
      assert.equal(r.ok, false, `accepted ${email}`)
    }
    const bad = validateWholesaleRequest(validBody({ deliveryPostalCode: '!!' }), offer, TODAY)
    assert.equal(bad.ok, false)
  })

  test('a quantity below the minimum fails the whole request', () => {
    const r = validateWholesaleRequest(validBody({ quantity: 6 }), offer, TODAY)
    assert.equal(r.ok, false)
    assert.match((r as { errors: { quantity: string } }).errors.quantity, /Minimum order is 12/)
  })

  test('preferred delivery date is optional, future-only, and bounded', () => {
    assert.equal(validateWholesaleRequest(validBody({ preferredDeliveryDate: '' }), offer, TODAY).ok, true)
    assert.equal(validateWholesaleRequest(validBody({ preferredDeliveryDate: TODAY }), offer, TODAY).ok, true)
    assert.equal(validateWholesaleRequest(validBody({ preferredDeliveryDate: '2026-11-30' }), offer, TODAY).ok, true)
    assert.equal(validateWholesaleRequest(validBody({ preferredDeliveryDate: '2026-10-14' }), offer, TODAY).ok, false)
    assert.equal(validateWholesaleRequest(validBody({ preferredDeliveryDate: '2030-01-01' }), offer, TODAY).ok, false)
    assert.equal(validateWholesaleRequest(validBody({ preferredDeliveryDate: 'next week' }), offer, TODAY).ok, false)
  })

  test('caps overlong free text', () => {
    assert.equal(validateWholesaleRequest(validBody({ notes: 'x'.repeat(2001) }), offer, TODAY).ok, false)
    assert.equal(validateWholesaleRequest(validBody({ notes: 'x'.repeat(2000) }), offer, TODAY).ok, true)
    assert.equal(validateWholesaleRequest(validBody({ shopName: 'x'.repeat(161) }), offer, TODAY).ok, false)
  })

  test('isoToday returns a YYYY-MM-DD string', () => {
    assert.match(isoToday(new Date('2026-10-15T23:30:00Z')), /^2026-10-15$/)
  })
})
