/* Submission-failure handling: a request is only ever reported as received
   when a configured destination actually accepted it. */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { destinations, deliverySucceeded } from '../functions/api/_wholesale-delivery.ts'

describe('configured destinations', () => {
  test('no environment variables means submission is off', () => {
    assert.deepEqual(destinations({}), [])
  })

  test('a Resend key with no recipient is not a configured destination', () => {
    assert.deepEqual(destinations({ RESEND_API_KEY: 're_x' }), [])
    assert.deepEqual(destinations({ WHOLESALE_NOTIFY_EMAIL: 'a@b.com' }), [])
    assert.deepEqual(destinations({ RESEND_API_KEY: 're_x', WHOLESALE_NOTIFY_EMAIL: 'a@b.com' }), ['email'])
  })

  test('webhook and KV each stand alone, and they combine', () => {
    assert.deepEqual(destinations({ WHOLESALE_WEBHOOK_URL: 'https://x' }), ['webhook'])
    assert.deepEqual(destinations({ WHOLESALE_REQUESTS: {} }), ['kv'])
    assert.deepEqual(
      destinations({ WHOLESALE_WEBHOOK_URL: 'https://x', RESEND_API_KEY: 'k', WHOLESALE_NOTIFY_EMAIL: 'a@b.com', WHOLESALE_REQUESTS: {} }),
      ['webhook', 'email', 'kv'],
    )
  })

  test('an empty-string variable does not count as configured', () => {
    assert.deepEqual(destinations({ WHOLESALE_WEBHOOK_URL: '' }), [])
  })
})

describe('delivery outcome', () => {
  const ok = { status: 'fulfilled', value: undefined } as PromiseSettledResult<unknown>
  const bad = { status: 'rejected', reason: new Error('503') } as PromiseSettledResult<unknown>

  test('nothing attempted is never a success', () => {
    assert.equal(deliverySucceeded([]), false)
  })

  test('every destination failing is a failure', () => {
    assert.equal(deliverySucceeded([bad, bad]), false)
  })

  test('one destination accepting is enough', () => {
    assert.equal(deliverySucceeded([bad, ok]), true)
    assert.equal(deliverySucceeded([ok]), true)
  })
})
