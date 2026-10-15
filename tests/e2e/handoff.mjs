/* With no delivery destination configured the page must still be usable: it
   hands the completed request to the buyer's email client and never claims
   the request was submitted. */

import pw from 'playwright-core'
const { chromium } = pw
const BASE = process.env.BASE || 'http://127.0.0.1:4182'
let pass = 0, fail = 0
const ok = (n,c,x='') => { c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} ${x}`)) }

const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await b.newContext({ viewport:{width:390,height:844}, hasTouch:true })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e)))

// Record the mailto the page hands to the mail client, and stop the browser
// from actually trying to open one.
await page.addInitScript(() => {
  window.__mailto = ''
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href^="mailto:"]') : null
    if (a) { window.__mailto = a.getAttribute('href'); e.preventDefault() }
  }, true)
})
const readMailto = () => page.evaluate(() => window.__mailto || '')

await page.goto(`${BASE}/wholesale/soap-dispenser`, { waitUntil:'networkidle' })

console.log('\n── UNCONFIGURED: STILL USABLE ──')
const submit = page.getByRole('button', { name: /Request wholesale order/ })
ok('submit is NOT disabled', !(await submit.isDisabled()))
const info = (await page.locator('.wh-notice--info').innerText()).replace(/\s+/g,' ')
ok('explains the email route', info.includes('handled by email'), info)
ok('names the address', info.includes('levallcworks@gmail.com'))

console.log('\n── VALIDATION STILL APPLIES ──')
await submit.click(); await page.waitForTimeout(300)
ok('blocks an empty submit', (await page.locator('.wh-err').allInnerTexts()).filter(Boolean).length >= 5)
ok('no handoff banner yet', (await page.locator('.wh-handoff').count()) === 0)

console.log('\n── HANDOFF ──')
await page.getByRole('button', { name: /^48 units/ }).click()
await page.fill('#wh-contact','Dana Reyes')
await page.fill('#wh-shop','Corner Goods Austin')
await page.fill('#wh-email','dana@cornergoods.com')
await page.fill('#wh-city','Austin')
await page.fill('#wh-zip','78704')
await page.fill('#wh-notes','Trial order for two stores.')
await submit.click()
await page.waitForSelector('.wh-handoff', { timeout: 5000 })

const mailto = await readMailto()
ok('mail client was invoked', mailto.startsWith('mailto:levallcworks@gmail.com'), mailto.slice(0,60))
const body = decodeURIComponent(mailto)
for (const bit of ['Corner Goods Austin','Dana Reyes','dana@cornergoods.com','Austin','78704','48 units','$288.00','Trial order for two stores.']) {
  ok(`email carries "${bit}"`, body.includes(bit))
}
const banner = (await page.locator('.wh-notice--info').last().innerText()).replace(/\s+/g,' ')
ok('does NOT claim it was sent', !/Request received/i.test(banner) && /not sent yet/i.test(banner), banner.slice(0,120))
ok('no success banner anywhere', (await page.locator('.wh-notice--ok').count()) === 0)
const copyText = await page.locator('.wh-handoff textarea').inputValue()
ok('copyable text has the details', copyText.includes('Corner Goods Austin') && copyText.includes('$288.00'))

console.log(`\nerrors: ${errs.length ? errs.join(' | ') : 'none'}`)
console.log(`\n${pass} passed, ${fail} failed`)
await b.close()
process.exit(fail ? 1 : 0)
