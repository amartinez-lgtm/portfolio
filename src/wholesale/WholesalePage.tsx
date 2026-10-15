import {
  useState, useRef, useEffect, useMemo, useCallback,
  lazy, Suspense, Component, type ReactNode, type FormEvent,
} from 'react'
import { storeProducts } from '../data/store'
import {
  getOffer,
  formatUSD,
  merchandiseSubtotalCents,
  normalizeQuantity,
  validateWholesaleRequest,
  isoToday,
  WHOLESALE_CONTACT_EMAIL,
} from '../data/wholesale'
import type { FieldErrors, WholesaleOffer } from '../data/wholesale'
import './WholesalePage.css'

const Model3DViewer = lazy(() => import('../store/Model3DViewer').catch(() => import('../store/Model3DViewer')))

class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() { return this.state.err ? this.props.fallback : this.props.children }
}

/* ── Backend availability ───────────────────────────── */

type Backend =
  | { state: 'checking' }
  | { state: 'ready' }
  | { state: 'unconfigured' }
  | { state: 'unreachable' }

/* ── Submission ─────────────────────────────────────── */

type Submission =
  | { state: 'idle' }
  | { state: 'sending' }
  | { state: 'sent'; reference: string; quantity: number; subtotalCents: number }
  | { state: 'failed'; message: string }

const FIELD_ORDER = [
  'contactName', 'shopName', 'email', 'quantity',
  'deliveryCity', 'deliveryPostalCode', 'preferredDeliveryDate', 'notes',
] as const

function slugFromPath(): string {
  const parts = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean)
  const i = parts.indexOf('wholesale')
  return i >= 0 && parts[i + 1] ? parts[i + 1] : ''
}

/** The page URL with no query string or hash — never carries customer details. */
function publicUrl(offer: WholesaleOffer): string {
  return `${window.location.origin}/wholesale/${offer.slug}`
}

export default function WholesalePage() {
  const offer = useMemo(() => getOffer(slugFromPath()), [])
  if (!offer) return <NotFound />
  return <Quote offer={offer} />
}

function NotFound() {
  return (
    <div className="wh">
      <Header />
      <main className="wh-main wh-main--empty">
        <h1 className="wh-notfound__title">No wholesale sheet here</h1>
        <p className="wh-notfound__body">
          That wholesale page doesn’t exist. Browse the products, or email{' '}
          <a href={`mailto:${WHOLESALE_CONTACT_EMAIL}`}>{WHOLESALE_CONTACT_EMAIL}</a> for a quote.
        </p>
        <a href="/store" className="wh-btn wh-btn--primary wh-btn--inline">View the store</a>
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="wh-header">
      <a href="/store" className="wh-back">
        <svg viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="7 1 1 7 7 13" />
        </svg>
        Store
      </a>
      <img src="/Photoroom_20250521_195827.jpeg" alt="XYZ" className="wh-logo" />
    </header>
  )
}

function Footer() {
  return (
    <footer className="wh-footer">
      <span>XYZ · Leva LLC · Avelino Martinez</span>
      <span>levallc.com</span>
    </footer>
  )
}

function Quote({ offer }: { offer: WholesaleOffer }) {
  const product = useMemo(
    () => storeProducts.find((p) => p.id === offer.productId),
    [offer.productId],
  )

  const photos = useMemo(
    () => [product?.image, ...(product?.images ?? [])].filter(Boolean) as string[],
    [product],
  )

  const [qtyInput, setQtyInput] = useState(String(offer.minQuantity))
  const [view, setView] = useState<'photo' | '3d'>(photos.length > 0 ? 'photo' : '3d')
  const [imgIdx, setImgIdx] = useState(0)
  const [backend, setBackend] = useState<Backend>({ state: 'checking' })
  const [submission, setSubmission] = useState<Submission>({ state: 'idle' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [copied, setCopied] = useState(false)
  const mountedAt = useRef(Date.now())
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  const qty = normalizeQuantity(qtyInput, offer)
  const quantity = qty.ok ? qty.quantity : 0
  const subtotalCents = qty.ok ? merchandiseSubtotalCents(offer, quantity) : 0

  /* Ask the server whether a delivery destination is configured, so the
     form can be honest up front instead of failing after a submit. */
  useEffect(() => {
    let alive = true
    fetch('/api/wholesale-request', { headers: { accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { configured?: boolean }) => {
        if (alive) setBackend({ state: d.configured ? 'ready' : 'unconfigured' })
      })
      .catch(() => { if (alive) setBackend({ state: 'unreachable' }) })
    return () => { alive = false }
  }, [])

  const canSubmit = backend.state === 'ready' && submission.state !== 'sending'

  const copyLink = useCallback(async () => {
    const url = publicUrl(offer)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy this link:', url)
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }, [offer])

  function mailtoFallback(): string {
    const subject = `Wholesale order request — ${offer.productName}`
    const body = [
      `Product: ${offer.productName}`,
      `Configuration: ${offer.configuration.join('; ')}`,
      `Quantity: ${qty.ok ? quantity : offer.minQuantity} units`,
      `Wholesale unit price: ${formatUSD(offer.unitPriceCents)}`,
      `Merchandise subtotal: ${formatUSD(qty.ok ? subtotalCents : merchandiseSubtotalCents(offer, offer.minQuantity))} (excludes shipping and applicable taxes)`,
      '',
      'Shop/business name:',
      'Contact name:',
      'Delivery city + ZIP/postal code:',
      'Preferred delivery date (request):',
      'Notes:',
    ].join('\n')
    return `mailto:${WHOLESALE_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit || !formRef.current) return

    const fd = new FormData(formRef.current)
    const input = {
      contactName: fd.get('contactName'),
      shopName: fd.get('shopName'),
      email: fd.get('email'),
      quantity: qtyInput,
      deliveryCity: fd.get('deliveryCity'),
      deliveryPostalCode: fd.get('deliveryPostalCode'),
      preferredDeliveryDate: fd.get('preferredDeliveryDate'),
      notes: fd.get('notes'),
    }

    const local = validateWholesaleRequest(input, offer, isoToday())
    if (!local.ok) {
      setErrors(local.errors)
      setSubmission({ state: 'idle' })
      const first = FIELD_ORDER.find((f) => local.errors[f])
      if (first) formRef.current.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }

    setErrors({})
    setSubmission({ state: 'sending' })

    try {
      const res = await fetch('/api/wholesale-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...local.value,
          slug: offer.slug,
          website: fd.get('website'),
          elapsedMs: Date.now() - mountedAt.current,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        reference?: string
        quantity?: number
        merchandiseSubtotalCents?: number
        message?: string
        errors?: FieldErrors
      }

      if (res.ok && data.ok && data.reference) {
        setSubmission({
          state: 'sent',
          reference: data.reference,
          quantity: data.quantity ?? local.value.quantity,
          subtotalCents: data.merchandiseSubtotalCents ?? subtotalCents,
        })
        return
      }

      if (data.errors) setErrors(data.errors)
      setSubmission({
        state: 'failed',
        message: data.message || 'Your request was not sent. Please try again or email us.',
      })
    } catch {
      setSubmission({
        state: 'failed',
        message: 'Your request could not be sent — the connection failed.',
      })
    }
  }

  /* Move focus to the result banner so screen readers and keyboard users
     land on the outcome rather than staying on the submit button. */
  useEffect(() => {
    if (submission.state === 'sent' || submission.state === 'failed') statusRef.current?.focus()
  }, [submission.state])

  return (
    <div className="wh">
      <Header />

      <section className="wh-hero">
        <div className="wh-hero__inner">
          <p className="wh-eyebrow">Wholesale · by Leva LLC</p>
          <h1 className="wh-headline">{offer.productName}</h1>
          <p className="wh-sub">3D Prints for Everyday Living — wholesale pricing for retail shops.</p>
          <p className="wh-prelim">
            <span className="wh-prelim__dot" aria-hidden="true" />
            Preliminary pricing — subject to final confirmation.
          </p>
        </div>
      </section>

      <main className="wh-main">
        <div className="wh-layout">
          {/* ── Quote: everything needed to pick a quantity, above the fold ── */}
          <section className="wh-card wh-quote" aria-labelledby="wh-quote-h">
            <h2 id="wh-quote-h" className="wh-sr-only">Wholesale pricing and quantity</h2>

            <div className="wh-media">
              {view === 'photo' && photos.length > 0 ? (
                <img
                  key={photos[imgIdx]}
                  src={photos[imgIdx]}
                  alt={`${offer.productName} — photo ${imgIdx + 1} of ${photos.length}`}
                  className="wh-media__img"
                />
              ) : product?.model3d ? (
                <ViewerBoundary fallback={<MediaFallback />}>
                  <Suspense fallback={<MediaFallback loading />}>
                    <Model3DViewer
                      parts={product.model3d.parts}
                      color={product.model3d.color}
                      rotationX={product.model3d.rotationX}
                      rotationY={product.model3d.rotationY}
                      rotationZ={product.model3d.rotationZ}
                    />
                  </Suspense>
                </ViewerBoundary>
              ) : (
                <MediaFallback />
              )}

              <div className="wh-media__bar wh-no-print">
                <div className="wh-media__dots" role="group" aria-label="Product photos">
                  {photos.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      className={`wh-dot${view === 'photo' && i === imgIdx ? ' wh-dot--active' : ''}`}
                      aria-label={`Photo ${i + 1}`}
                      aria-pressed={view === 'photo' && i === imgIdx}
                      onClick={() => { setView('photo'); setImgIdx(i) }}
                    />
                  ))}
                </div>
                {product?.model3d && (
                  <button
                    type="button"
                    className={`wh-media__3d${view === '3d' ? ' wh-media__3d--active' : ''}`}
                    aria-pressed={view === '3d'}
                    onClick={() => setView('3d')}
                  >
                    ◈ 3D
                  </button>
                )}
              </div>
            </div>

            <div className="wh-pricestrip">
              <div>
                <strong>{formatUSD(offer.unitPriceCents)}</strong>
                <span>per unit</span>
              </div>
              <div>
                <strong>{offer.minQuantity}</strong>
                <span>minimum</span>
              </div>
              <div>
                <strong>{formatUSD(offer.suggestedRetailCents)}</strong>
                <span>suggested retail</span>
              </div>
            </div>

            <div className="wh-quick" role="group" aria-label="Quick quantity selection">
              {offer.quickQuantities.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`wh-quick__btn${quantity === q ? ' wh-quick__btn--active' : ''}`}
                  aria-pressed={quantity === q}
                  onClick={() => setQtyInput(String(q))}
                >
                  <span className="wh-quick__qty">{q} units</span>
                  <span className="wh-quick__total">{formatUSD(merchandiseSubtotalCents(offer, q))}</span>
                </button>
              ))}
            </div>

            <div className="wh-field wh-qty-field">
              <label className="wh-label" htmlFor="wh-qty">
                Or enter your own quantity <span className="wh-req" aria-hidden="true">*</span>
              </label>
              <input
                id="wh-qty"
                name="quantity"
                form="wh-form"
                className={`wh-input${!qty.ok ? ' wh-input--err' : ''}`}
                type="number"
                inputMode="numeric"
                step={1}
                min={offer.minQuantity}
                max={offer.maxQuantity}
                value={qtyInput}
                required
                aria-describedby="wh-qty-help wh-qty-err"
                aria-invalid={!qty.ok}
                onChange={(e) => setQtyInput(e.target.value)}
              />
              <p id="wh-qty-help" className="wh-help">Whole units, minimum {offer.minQuantity}.</p>
              <p id="wh-qty-err" className="wh-err" role="alert">{qty.ok ? '' : qty.error}</p>
            </div>

            <div className="wh-subtotal" aria-live="polite">
              <div className="wh-subtotal__row">
                <span>{qty.ok ? `${quantity} × ${formatUSD(offer.unitPriceCents)}` : 'Merchandise subtotal'}</span>
                <strong className="wh-subtotal__value">{qty.ok ? formatUSD(subtotalCents) : '—'}</strong>
              </div>
              <p className="wh-subtotal__note">
                Merchandise only. <strong>Shipping and any applicable taxes are additional</strong> and
                confirmed separately.
              </p>
            </div>

            <a href="#wh-form-h" className="wh-btn wh-btn--primary wh-jump wh-no-print">
              Continue to order request&nbsp;↓
            </a>
          </section>

          {/* ── Details ─────────────────────────────── */}
          <section className="wh-card wh-details" aria-labelledby="wh-details-h">
            <h2 id="wh-details-h" className="wh-card__title">{offer.productName}</h2>
            {product && <p className="wh-product__desc">{product.description}</p>}

            <h3 className="wh-subhead">Quoted configuration</h3>
            <ul className="wh-list">
              {offer.configuration.map((c) => <li key={c}>{c}</li>)}
            </ul>

            <h3 className="wh-subhead">Proposed terms</h3>
            <ul className="wh-list">
              {offer.terms.map((t) => <li key={t}>{t}</li>)}
            </ul>

            <p className="wh-fineprint">
              Suggested retail is guidance only — you set your own selling price. Custom colors,
              branding, or packaging are quoted separately. Pricing revision: {offer.pricingRevision}.
            </p>

            <div className="wh-actions wh-no-print">
              <button type="button" className="wh-btn wh-btn--outline" onClick={() => window.print()}>
                Print / Save quote
              </button>
              <button type="button" className="wh-btn wh-btn--outline" onClick={copyLink}>
                {copied ? 'Link copied ✓' : 'Copy link'}
              </button>
            </div>
            <span className="wh-actions__note" role="status" aria-live="polite">
              {copied ? 'Public page link copied — no customer details included.' : ''}
            </span>
          </section>

          {/* ── Request form ────────────────────────── */}
          <section className="wh-card wh-form-card" aria-labelledby="wh-form-h">
            <h2 id="wh-form-h" className="wh-card__title">Request a wholesale order</h2>
            <p className="wh-form__intro">
              Submitting this form <strong>requests availability and a final quote</strong>. It does not
              place a paid order, take payment, or reserve production time.
            </p>

            {backend.state === 'unconfigured' && (
              <div className="wh-notice wh-notice--warn" role="status">
                <strong>Online submission isn’t switched on yet.</strong>
                <span>
                  Rather than pretend a request went through, the form is disabled. Send the same
                  details to{' '}
                  <a href={mailtoFallback()}>{WHOLESALE_CONTACT_EMAIL}</a> and you’ll get the same reply.
                </span>
              </div>
            )}
            {backend.state === 'unreachable' && (
              <div className="wh-notice wh-notice--warn" role="status">
                <strong>Can’t reach the request service.</strong>
                <span>
                  Reload the page, or email{' '}
                  <a href={mailtoFallback()}>{WHOLESALE_CONTACT_EMAIL}</a> directly.
                </span>
              </div>
            )}

            <div
              className="wh-status"
              ref={statusRef}
              tabIndex={-1}
              role="status"
              aria-live="polite"
            >
              {submission.state === 'sent' && (
                <div className="wh-notice wh-notice--ok">
                  <strong>Request received — reference {submission.reference}</strong>
                  <span>
                    {submission.quantity} units · {formatUSD(submission.subtotalCents)} merchandise
                    subtotal (excludes shipping and taxes). Avelino will reply by email with
                    availability, lead time, shipping cost, and a final quote. Nothing is charged
                    and no production is reserved yet.
                  </span>
                </div>
              )}
              {submission.state === 'failed' && (
                <div className="wh-notice wh-notice--err">
                  <strong>Your request was not sent.</strong>
                  <span>
                    {submission.message} Email{' '}
                    <a href={mailtoFallback()}>{WHOLESALE_CONTACT_EMAIL}</a> and it will reach the
                    same inbox.
                  </span>
                </div>
              )}
            </div>

            <form id="wh-form" ref={formRef} className="wh-form" onSubmit={handleSubmit} noValidate>
              <Field id="wh-contact" name="contactName" label="Contact name" required
                autoComplete="name" error={errors.contactName} />
              <Field id="wh-shop" name="shopName" label="Shop / business name" required
                autoComplete="organization" error={errors.shopName} />
              <Field id="wh-email" name="email" label="Email" type="email" required
                autoComplete="email" error={errors.email} />

              <div className="wh-field">
                <span className="wh-label">Selected quantity</span>
                <output htmlFor="wh-qty" className="wh-output">
                  {qty.ok
                    ? `${quantity} units — ${formatUSD(subtotalCents)} merchandise subtotal`
                    : 'Set a valid quantity above'}
                </output>
                {errors.quantity && <p className="wh-err" role="alert">{errors.quantity}</p>}
              </div>

              <div className="wh-field-row">
                <Field id="wh-city" name="deliveryCity" label="Delivery city" required
                  autoComplete="address-level2" error={errors.deliveryCity} />
                <Field id="wh-zip" name="deliveryPostalCode" label="ZIP / postal code" required
                  autoComplete="postal-code" error={errors.deliveryPostalCode} />
              </div>

              <Field id="wh-date" name="preferredDeliveryDate" label="Preferred delivery date"
                type="date" min={isoToday()}
                help="A request, not a promise — the actual lead time is agreed before any deposit."
                error={errors.preferredDeliveryDate} />

              <div className="wh-field">
                <label className="wh-label" htmlFor="wh-notes">Notes <span className="wh-optional">(optional)</span></label>
                <textarea
                  id="wh-notes" name="notes" className="wh-input wh-textarea" rows={4}
                  maxLength={2000}
                  aria-describedby={errors.notes ? 'wh-notes-err' : undefined}
                  aria-invalid={errors.notes ? true : undefined}
                />
                {errors.notes && <p id="wh-notes-err" className="wh-err" role="alert">{errors.notes}</p>}
              </div>

              {/* Honeypot — hidden from people, irresistible to bots. */}
              <div className="wh-hp" aria-hidden="true">
                <label htmlFor="wh-website">Website</label>
                <input id="wh-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <button type="submit" className="wh-btn wh-btn--primary" disabled={!canSubmit}>
                {submission.state === 'sending' ? (
                  <><span className="wh-spinner" aria-hidden="true" /> Sending…</>
                ) : (
                  'Request wholesale order'
                )}
              </button>
              <p className="wh-fineprint">
                Requests availability and a final quote only. No payment is taken and no production
                is reserved.
              </p>
            </form>
          </section>
        </div>

        <p className="wh-contact-line">
          Questions, custom colors, or larger volumes?{' '}
          <a href={`mailto:${WHOLESALE_CONTACT_EMAIL}?subject=${encodeURIComponent(`Wholesale enquiry — ${offer.productName}`)}`}>
            {WHOLESALE_CONTACT_EMAIL}
          </a>
        </p>
      </main>

      <Footer />
    </div>
  )
}

function MediaFallback({ loading = false }: { loading?: boolean }) {
  return (
    <div className="wh-product__placeholder">
      {loading ? <div className="mv-spinner" /> : <span aria-hidden="true">◈</span>}
      <span>{loading ? 'Loading 3D model…' : 'Preview unavailable'}</span>
    </div>
  )
}

interface FieldProps {
  id: string
  name: string
  label: string
  type?: string
  required?: boolean
  autoComplete?: string
  min?: string
  help?: string
  error?: string
}

function Field({ id, name, label, type = 'text', required, autoComplete, min, help, error }: FieldProps) {
  const helpId = help ? `${id}-help` : undefined
  const errId = error ? `${id}-err` : undefined
  const describedBy = [helpId, errId].filter(Boolean).join(' ') || undefined

  return (
    <div className="wh-field">
      <label className="wh-label" htmlFor={id}>
        {label}{' '}
        {required ? <span className="wh-req" aria-hidden="true">*</span> : <span className="wh-optional">(optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        min={min}
        required={required}
        autoComplete={autoComplete}
        className={`wh-input${error ? ' wh-input--err' : ''}`}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      />
      {help && <p id={helpId} className="wh-help">{help}</p>}
      {error && <p id={errId} className="wh-err" role="alert">{error}</p>}
    </div>
  )
}
