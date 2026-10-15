/* Serves the wholesale SPA shell for every /wholesale/* path.

   The `_redirects` rewrite (`/wholesale/* /wholesale/index.html 200`) is not
   honored by Pages here — the `/*  /index.html 200` SPA catch-all wins and
   buyers get the main portfolio instead. Functions run before both static
   asset serving and _redirects, so this is the reliable way to route
   /wholesale/<slug> to the wholesale entry. */

interface Env {
  ASSETS: { fetch(input: Request): Promise<Response> }
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } })
  }

  const shell = new URL('/wholesale/index.html', request.url)
  const upstream = await env.ASSETS.fetch(new Request(shell.toString(), { method: 'GET' }))

  const headers = new Headers(upstream.headers)
  // Entry documents must never be cached, so a new deploy shows on reload.
  headers.set('cache-control', 'no-store')

  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers,
  })
}
