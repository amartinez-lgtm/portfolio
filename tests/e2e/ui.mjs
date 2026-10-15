import pw from 'playwright-core'
const { chromium } = pw
const BASE = process.env.BASE || 'http://localhost:4178'
let pass = 0, fail = 0
const ok  = (n, c, extra='') => { c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} ${extra}`)) }

const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, permissions: ['clipboard-read','clipboard-write'] })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e)))
await page.goto(`${BASE}/wholesale/soap-dispenser`, { waitUntil: 'networkidle' })

console.log('\n── GALLERY ──')
const idx = () => page.locator('.wh-counter').innerText()
ok('starts on photo 1 of 3', (await idx()) === '1 / 3', await idx())

// swipe via the scroll track (what a finger does)
const track = page.locator('.wh-track')
await track.evaluate(el => el.scrollTo({ left: el.clientWidth, behavior: 'instant' }))
await page.waitForTimeout(250)
ok('swipe advances the counter', (await idx()) === '2 / 3', await idx())
ok('dot 2 is active', await page.locator('.wh-dot').nth(1).evaluate(e => e.classList.contains('wh-dot--active')))

await page.locator('.wh-arrow--next').click(); await page.waitForTimeout(500)
ok('next arrow → photo 3', (await idx()) === '3 / 3', await idx())
ok('next arrow hidden at the end', await page.locator('.wh-arrow--next').isDisabled())
await page.locator('.wh-arrow--prev').click(); await page.waitForTimeout(500)
ok('prev arrow → photo 2', (await idx()) === '2 / 3', await idx())
await page.locator('.wh-dot').nth(0).click(); await page.waitForTimeout(500)
ok('dot jumps to photo 1', (await idx()) === '1 / 3', await idx())

console.log('\n── 3D TAB ROUND TRIP ──')
await page.getByRole('tab', { name: /3D Model/ }).click()
await page.waitForTimeout(600)
ok('3D tab selected', await page.getByRole('tab', { name: /3D Model/ }).getAttribute('aria-selected') === 'true')
ok('photo track gone', await page.locator('.wh-track').count() === 0)
const photosTab = page.getByRole('tab', { name: /^Photos$/ })
ok('Photos tab still clickable', await photosTab.isEnabled())
await photosTab.click(); await page.waitForTimeout(400)
ok('back on photos', await page.locator('.wh-track').count() === 1)
ok('counter back', (await idx()) === '1 / 3', await idx())

console.log('\n── COPY LINK ──')
await page.getByRole('button', { name: /Copy link/ }).click()
await page.waitForTimeout(300)
const clip = await page.evaluate(() => navigator.clipboard.readText())
ok('clipboard has the public URL', clip === `${BASE}/wholesale/soap-dispenser`, clip)
ok('no customer data in URL', !clip.includes('?') && !clip.includes('#'))
ok('confirmation shown', (await page.locator('.wh-actions__note').count()) === 1)

console.log('\n── QUANTITY ──')
for (const [q, total] of [[12,'$72.00'],[24,'$144.00'],[48,'$288.00']]) {
  await page.getByRole('button', { name: new RegExp(`^${q} units`) }).click()
  ok(`${q} units → ${total}`, (await page.locator('.wh-subtotal__value').innerText()) === total)
}
await page.locator('#wh-qty').fill('37')
ok('custom 37 → $222.00', (await page.locator('.wh-subtotal__value').innerText()) === '$222.00')
await page.locator('#wh-qty').fill('11')
ok('11 rejected', (await page.locator('#wh-qty-err').innerText()).includes('Minimum order is 12'))
await page.locator('#wh-qty').fill('24')

console.log('\n── JUMP TO FORM ──')
await page.getByRole('button', { name: /Continue to order request/ }).click()
await page.waitForTimeout(900)
ok('focus moved into the form', await page.evaluate(() => document.activeElement?.id) === 'wh-contact')

console.log(`\nerrors: ${errs.length ? errs.join(' | ') : 'none'}`)
console.log(`\n${pass} passed, ${fail} failed`)
await b.close()
process.exit(fail ? 1 : 0)
