const API = 'http://127.0.0.1:4180/api/wholesale-request'
const HOOK = 'http://127.0.0.1:4191'
let pass = 0, fail = 0
const ok = (n, c, x='') => { c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} ${x}`)) }

const base = (o={}) => ({
  slug: 'soap-dispenser', contactName: 'Dana Reyes', shopName: 'Corner Goods',
  email: 'dana@cornergoods.com', quantity: 24, deliveryCity: 'Austin',
  deliveryPostalCode: '78704', preferredDeliveryDate: '', notes: '',
  website: '', elapsedMs: 9000, ...o,
})
let ipN = 0
// Each case gets its own client IP so one test cannot exhaust another's budget.
// Cloudflare sets cf-connecting-ip at the edge, so this is not spoofable live.
const post = (b, ip) => fetch(API, { method:'POST', headers:{'content-type':'application/json','cf-connecting-ip': ip || `10.0.0.${++ipN}`}, body: JSON.stringify(b) })
const rows = async () => (await fetch(HOOK + '/rows')).json()
const mode = (m) => fetch(`${HOOK}/mode?m=${m}`)

console.log('\n── HAPPY PATH ──')
const before = (await rows()).length
let r = await post(base()); let d = await r.json()
ok('200 OK', r.status === 200, r.status)
ok('ok:true with a reference', d.ok === true && /^XYZ-WS-\d{8}-[0-9A-F]{6}$/.test(d.reference), JSON.stringify(d))
ok('server returns 24 units', d.quantity === 24, d.quantity)
ok('server computed $144.00', d.merchandiseSubtotalCents === 14400, d.merchandiseSubtotalCents)
const after = await rows()
ok('row actually landed in the receiver', after.length === before + 1)
const row = after[after.length - 1]
ok('row has the shop', row.request.shopName === 'Corner Goods')
ok('row subtotal matches', row.pricing.merchandiseSubtotalCents === 14400)
ok('row carries the reference', row.reference === d.reference)

console.log('\n── SERVER RECOMPUTES MONEY (client cannot lie) ──')
r = await post({ ...base({ quantity: 12 }), merchandiseSubtotalCents: 1, unitPriceCents: 1 })
d = await r.json()
ok('ignores client-sent totals → $72.00', d.merchandiseSubtotalCents === 7200, d.merchandiseSubtotalCents)

console.log('\n── VALIDATION ──')
for (const [name, body, field] of [
  ['quantity below minimum', base({ quantity: 11 }), 'quantity'],
  ['fractional quantity',    base({ quantity: 12.5 }), 'quantity'],
  ['bad email',              base({ email: 'nope' }), 'email'],
  ['missing shop',           base({ shopName: '' }), 'shopName'],
  ['missing city',           base({ deliveryCity: '' }), 'deliveryCity'],
  ['past delivery date',     base({ preferredDeliveryDate: '2020-01-01' }), 'preferredDeliveryDate'],
]) {
  const res = await post(body); const j = await res.json()
  ok(`${name} → 400 on ${field}`, res.status === 400 && j.errors && j.errors[field], JSON.stringify(j).slice(0,120))
}
const n1 = (await rows()).length
ok('no invalid request reached the receiver', n1 === before + 2, n1)

console.log('\n── SPAM GUARDS ──')
r = await post(base({ website: 'http://spam.ru' }))
ok('honeypot rejected', r.status === 400)
r = await post(base({ elapsedMs: 100 }))
ok('instant submit rejected', r.status === 400)
r = await fetch(API, { method:'POST', headers:{'content-type':'application/json','origin':'https://evil.example','cf-connecting-ip':'10.0.1.1'}, body: JSON.stringify(base()) })
ok('cross-origin rejected', r.status === 403, r.status)
r = await fetch(API, { method:'POST', headers:{'content-type':'text/plain','cf-connecting-ip':'10.0.1.2'}, body: 'x' })
ok('non-JSON rejected', r.status === 415, r.status)
r = await post(base({ slug: 'does-not-exist' }))
ok('unknown product rejected', r.status === 404, r.status)
const n2 = (await rows()).length
ok('no spam reached the receiver', n2 === n1, n2)

console.log('\n── DELIVERY FAILURE IS NEVER REPORTED AS SUCCESS ──')
await mode('down')
r = await post(base()); d = await r.json()
ok('receiver down → 502', r.status === 502, r.status)
ok('ok:false', d.ok === false && d.code === 'delivery_failed', JSON.stringify(d))
ok('fallback email offered', d.fallbackEmail === 'levallcworks@gmail.com')

await mode('reject')
r = await post(base()); d = await r.json()
ok('receiver returns 200 but {ok:false} → still 502', r.status === 502, `${r.status} ${JSON.stringify(d)}`)

await mode('ok')
r = await post(base()); d = await r.json()
ok('recovers once the receiver is back', r.status === 200 && d.ok === true, r.status)

console.log('\n── RATE LIMIT ──')
// Typos must not burn the budget.
for (let i = 0; i < 6; i++) await post(base({ email: 'bad' }), '10.9.9.9')
let still = await post(base(), '10.9.9.9')
ok('six validation failures do NOT lock a shop out', still.status === 200, still.status)

// Real submissions are capped.
let limited = false
for (let i = 0; i < 8; i++) { const x = await post(base(), '10.9.9.8'); if (x.status === 429) { limited = true; break } }
ok('burst of real submissions gets rate limited', limited)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
