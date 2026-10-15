// Stand-in for the Apps Script receiver: records rows, and can be told to fail.
import { createServer } from 'node:http'
export const rows = []
let mode = 'ok'
const srv = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x')
  if (u.pathname === '/mode') { mode = u.searchParams.get('m') || 'ok'; res.end('mode=' + mode); return }
  if (u.pathname === '/rows') { res.setHeader('content-type','application/json'); res.end(JSON.stringify(rows)); return }
  let raw = ''; for await (const c of req) raw += c
  if (mode === 'down') { res.statusCode = 500; return res.end('boom') }
  const body = JSON.parse(raw || '{}')
  if (mode === 'reject') { res.setHeader('content-type','application/json'); return res.end(JSON.stringify({ ok:false, message:'bad secret' })) }
  if (body.secret !== 'test-secret-123') { res.setHeader('content-type','application/json'); return res.end(JSON.stringify({ ok:false, message:'bad secret' })) }
  rows.push(body)
  res.setHeader('content-type','application/json')
  res.end(JSON.stringify({ ok: true, message: body.reference }))
})
srv.listen(4191, () => console.log('hook up on 4191'))
