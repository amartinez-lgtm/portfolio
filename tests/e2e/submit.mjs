import pw from 'playwright-core'
const { chromium } = pw
const BASE = process.env.BASE || 'http://127.0.0.1:4180'
let pass = 0, fail = 0
const ok = (n,c,x='') => { c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} ${x}`)) }

const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await b.newContext({ viewport:{width:390,height:844}, hasTouch:true })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e)))
await page.goto(`${BASE}/wholesale/soap-dispenser`, { waitUntil:'networkidle' })

console.log('\n── FORM IS ENABLED WHEN A DESTINATION EXISTS ──')
const submit = page.getByRole('button', { name: /Request wholesale order/ })
ok('submit enabled', !(await submit.isDisabled()))
ok('no "not configured" warning', (await page.locator('.wh-notice--warn').count()) === 0)

console.log('\n── CLIENT VALIDATION ──')
await submit.click(); await page.waitForTimeout(300)
ok('blocks empty submit', (await page.locator('.wh-err').allInnerTexts()).filter(Boolean).length >= 5)
ok('focus on first bad field', await page.evaluate(() => document.activeElement?.id) === 'wh-contact')

console.log('\n── SUCCESSFUL SUBMISSION ──')
await page.getByRole('button', { name: /^48 units/ }).click()
await page.fill('#wh-contact','Dana Reyes')
await page.fill('#wh-shop','Corner Goods Austin')
await page.fill('#wh-email','dana@cornergoods.com')
await page.fill('#wh-city','Austin')
await page.fill('#wh-zip','78704')
await page.fill('#wh-notes','Trial order for two stores.')
await page.waitForTimeout(3200)
await submit.click()
await page.waitForSelector('.wh-notice--ok', { timeout: 10000 })
const okText = (await page.locator('.wh-notice--ok').innerText()).replace(/\s+/g,' ')
ok('success banner shown', okText.includes('Request received'))
ok('shows a reference', /XYZ-WS-\d{8}-[0-9A-F]{6}/.test(okText), okText)
ok('shows 48 units and $288.00', okText.includes('48 units') && okText.includes('$288.00'), okText)
ok('says nothing is charged', /no production is reserved|Nothing is charged/i.test(okText))

const rows = await (await fetch('http://127.0.0.1:4191/rows')).json()
const last = rows[rows.length-1]
ok('row reached the receiver', last.request.shopName === 'Corner Goods Austin', JSON.stringify(last.request).slice(0,100))
ok('receiver got 48 units', last.pricing.quantity === 48)
ok('receiver got $288.00', last.pricing.merchandiseSubtotalCents === 28800)
ok('receiver got the notes', last.request.notes === 'Trial order for two stores.')
ok('reference matches the banner', okText.includes(last.reference))

console.log('\n── FAILURE IS SHOWN HONESTLY ──')
await fetch('http://127.0.0.1:4191/mode?m=down')
await page.reload({ waitUntil:'networkidle' })
await page.fill('#wh-contact','Sam Lee')
await page.fill('#wh-shop','Second Shop')
await page.fill('#wh-email','sam@second.com')
await page.fill('#wh-city','Dallas')
await page.fill('#wh-zip','75201')
await page.waitForTimeout(3200)
await page.getByRole('button', { name: /Request wholesale order/ }).click()
await page.waitForSelector('.wh-notice--err', { timeout: 10000 })
const errText = (await page.locator('.wh-notice--err').innerText()).replace(/\s+/g,' ')
ok('failure banner shown', errText.includes('was not sent'), errText)
ok('no success banner', (await page.locator('.wh-notice--ok').count()) === 0)
ok('offers the email fallback', errText.includes('levallcworks@gmail.com'))
await fetch('http://127.0.0.1:4191/mode?m=ok')

console.log(`\nerrors: ${errs.length ? errs.join(' | ') : 'none'}`)
console.log(`\n${pass} passed, ${fail} failed`)
await b.close()
process.exit(fail ? 1 : 0)
