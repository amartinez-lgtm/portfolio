/* Pure delivery-routing helpers for the wholesale endpoint.
   Leading underscore = Cloudflare Pages never routes this file.
   Kept dependency-free so it can be unit-tested directly. */

export type Destination = 'webhook' | 'email' | 'kv'

export interface DeliveryEnv {
  WHOLESALE_WEBHOOK_URL?: string
  RESEND_API_KEY?: string
  WHOLESALE_NOTIFY_EMAIL?: string
  WHOLESALE_REQUESTS?: unknown
}

/** Which destinations are actually configured. Empty = submission is off. */
export function destinations(env: DeliveryEnv): Destination[] {
  const out: Destination[] = []
  if (env.WHOLESALE_WEBHOOK_URL) out.push('webhook')
  // Resend needs both a key and somewhere to send to; one without the other is not configured.
  if (env.RESEND_API_KEY && env.WHOLESALE_NOTIFY_EMAIL) out.push('email')
  if (env.WHOLESALE_REQUESTS) out.push('kv')
  return out
}

/**
 * A request counts as received only if at least one configured destination
 * accepted it. Anything else must be reported to the sender as a failure.
 */
export function deliverySucceeded(results: PromiseSettledResult<unknown>[]): boolean {
  return results.length > 0 && results.some((r) => r.status === 'fulfilled')
}
