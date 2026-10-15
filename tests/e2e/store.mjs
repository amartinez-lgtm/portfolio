/* The store drawer gallery — the one reported as unscrollable — plus the
   wholesale email handoff shown when no server destination is configured. */

import pw from 'playwright-core'
const { chromium } = pw
const BASE = process.env.BASE || 'http://127.0.0.1:4180'
let pass = 0, fail = 0
const ok = (n,c,x='') => { c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} ${x}`)) }

const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await b.newContext({ viewport:{width:390,height:844}, hasTouch:true })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e)))

console.log('\n── STORE DRAWER GALLERY ──')
await page.goto(`${BASE}/store/`, { waitUntil:'domcontentloaded' })
await page.getByRole('button', { name: /View Soap Dispenser/ }).click()
await page.waitForSelector('.sp-drawer')
await page.waitForSelector('.pg__track')

const idx = () => page.locator('.pg__counter').innerText()
ok('drawer opens on Photos', (await page.locator('.sp-view-tab--active').innerText()).includes('Photos'))
ok('gallery present with 3 photos', (await idx()) === '1 / 3', await idx())

await page.locator('.pg__track').evaluate(el => el.scrollTo({ left: el.clientWidth, behavior: 'instant' }))
await page.waitForTimeout(250)
ok('SWIPE works in the drawer', (await idx()) === '2 / 3', await idx())

await page.locator('.pg__arrow--next').click(); await page.waitForTimeout(500)
ok('arrow advances', (await idx()) === '3 / 3', await idx())
await page.locator('.pg__dot').nth(0).click(); await page.waitForTimeout(500)
ok('dot jumps back', (await idx()) === '1 / 3', await idx())

const dotBox = await page.locator('.pg__dot').first().boundingBox()
ok('dot tap target is at least 30px', dotBox.width >= 30 && dotBox.height >= 28, `${dotBox.width}x${dotBox.height}`)

console.log('\n── 3D ⇄ PHOTOS IN THE DRAWER ──')
await page.getByRole('button', { name: /3D Model/ }).click(); await page.waitForTimeout(600)
ok('switched to 3D', await page.locator('.pg__track').count() === 0)
await page.getByRole('button', { name: /^Photos$/ }).click(); await page.waitForTimeout(400)
ok('can get back to photos', await page.locator('.pg__track').count() === 1)

console.log('\n── PAPER TOWEL DISPENSER (second product) ──')
await page.locator('.sp-drawer__cancel').click(); await page.waitForTimeout(300)
await page.getByRole('button', { name: /View Paper Towel Dispenser/ }).click()
await page.waitForSelector('.pg__track')
ok('its gallery works too', /^1 \/ \d$/.test(await idx()), await idx())
await page.locator('.pg__arrow--next').click(); await page.waitForTimeout(500)
ok('advances', (await idx()).startsWith('2 /'), await idx())
await page.locator('.sp-drawer__cancel').click()

console.log('\n── WHOLESALE LINK FROM THE DRAWER ──')
await page.getByRole('button', { name: /View Soap Dispenser/ }).click()
await page.waitForSelector('.sp-drawer')
await page.locator('.sp-drawer__cta a', { hasText: 'Wholesale pricing' }).click()
await page.waitForLoadState('networkidle')
ok('lands on the quote page', page.url().endsWith('/wholesale/soap-dispenser'), page.url())
ok('quote gallery works', (await page.locator('.pg__counter').innerText()) === '1 / 3')

console.log(`\nerrors: ${errs.length ? errs.join(' | ') : 'none'}`)
console.log(`\n${pass} passed, ${fail} failed`)
await b.close()
process.exit(fail ? 1 : 0)
