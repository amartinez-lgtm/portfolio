/**
 * XYZ Wholesale — Google Apps Script receiver
 *
 * Receives POSTs from functions/api/wholesale-request.ts and appends one row
 * per request to the "XYZ Wholesale Order Requests" spreadsheet.
 *
 * SETUP (about two minutes)
 *  1. Open https://script.google.com → New project.
 *  2. Delete the placeholder code, paste this whole file in, Save.
 *  3. Set SHARED_SECRET below to any random string you like.
 *  4. Deploy → New deployment → type "Web app".
 *       Execute as:        Me
 *       Who has access:    Anyone
 *     Authorize when prompted, then copy the /exec URL.
 *  5. In Cloudflare Pages → your project → Settings → Variables and Secrets,
 *     add (Production):
 *       WHOLESALE_WEBHOOK_URL    = the /exec URL
 *       WHOLESALE_WEBHOOK_SECRET = the same string as SHARED_SECRET
 *     Redeploy the site.
 *
 * The site never stores a Google credential — the script runs as you, and the
 * only thing Cloudflare holds is the URL and the shared secret.
 */

const SHEET_ID = '1exScIw0X0f-gxj0L5M6zF-ofhVFane6laRR-J0SJ9oY'

/** Must match WHOLESALE_WEBHOOK_SECRET in Cloudflare. Empty = no check. */
const SHARED_SECRET = 'CHANGE-ME'

const HEADERS = [
  'Received', 'Reference', 'Shop', 'Contact', 'Email',
  'City', 'ZIP', 'Quantity', 'Unit price', 'Merchandise subtotal',
  'Requested delivery', 'Notes', 'Product', 'Configuration', 'Pricing revision',
]

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return reply(false, 'no body')

    const body = JSON.parse(e.postData.contents)

    if (SHARED_SECRET && body.secret !== SHARED_SECRET) return reply(false, 'bad secret')

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0]

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS)
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
      sheet.setFrozenRows(1)
    }

    const r = body.request || {}
    const p = body.pricing || {}

    sheet.appendRow([
      body.receivedAt || new Date().toISOString(),
      body.reference || '',
      r.shopName || '',
      r.contactName || '',
      r.email || '',
      r.deliveryCity || '',
      r.deliveryPostalCode || '',
      p.quantity || '',
      centsToUsd(p.unitPriceCents),
      centsToUsd(p.merchandiseSubtotalCents),
      r.preferredDeliveryDate || '',
      r.notes || '',
      (body.product && body.product.name) || '',
      (body.product && body.product.configuration || []).join('; '),
      p.pricingRevision || '',
    ])

    return reply(true, body.reference || '')
  } catch (err) {
    return reply(false, String(err))
  }
}

/** Lets you confirm the deployment is alive by opening the /exec URL. */
function doGet() {
  return reply(true, 'XYZ wholesale receiver is running')
}

function centsToUsd(cents) {
  return typeof cents === 'number' ? cents / 100 : ''
}

/**
 * Apps Script web apps always answer 200, so the caller checks this body.
 * functions/api/wholesale-request.ts treats {"ok":false} as a failed delivery
 * and tells the buyer the request did not go through.
 */
function reply(ok, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: ok, message: message }))
    .setMimeType(ContentService.MimeType.JSON)
}
