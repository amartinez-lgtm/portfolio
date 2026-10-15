/**
 * End-to-end suite for the wholesale quote page.
 *
 * Boots a stand-in order receiver and the real Cloudflare Pages runtime
 * (wrangler) against dist/, then runs three suites against them:
 *   api.mjs    — the Pages Function: validation, pricing, spam, delivery
 *   ui.mjs     — gallery, tabs, copy link, quantity maths
 *   submit.mjs — the whole submit flow, browser through to a delivered row
 *
 *   npm run build && npm run test:e2e
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const API = 'http://127.0.0.1:4180/api/wholesale-request'
const procs = []

function start(name, cmd, args, env = {}) {
  const p = spawn(cmd, args, { env: { ...process.env, ...env }, stdio: 'ignore' })
  p.on('error', (e) => console.error(`${name} failed to start:`, e.message))
  procs.push(p)
  return p
}

function stopAll() {
  for (const p of procs) { try { p.kill('SIGTERM') } catch { /* already gone */ } }
}

async function waitFor(url, label, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try { if ((await fetch(url)).ok) return } catch { /* not up yet */ }
    await sleep(1000)
  }
  throw new Error(`${label} did not come up within ${timeoutMs / 1000}s`)
}

function run(file) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [new URL(file, import.meta.url).pathname], { stdio: 'inherit' })
    p.on('exit', (code) => resolve(code ?? 1))
  })
}

try {
  start('receiver', process.execPath, [new URL('./receiver.mjs', import.meta.url).pathname])
  await waitFor('http://127.0.0.1:4191/rows', 'order receiver', 15_000)

  start('wrangler', 'npx', [
    '--yes', 'wrangler@3', 'pages', 'dev', 'dist',
    '--port', '4180', '--ip', '127.0.0.1', '--compatibility-date=2024-09-23',
  ])
  await waitFor(API, 'wrangler pages dev')

  let failed = 0
  for (const suite of ['./api.mjs', './ui.mjs', './submit.mjs']) {
    console.log(`\n═══ ${suite.replace('./', '')} ═══`)
    failed += await run(suite)
  }

  stopAll()
  console.log(failed ? '\nE2E FAILED' : '\nE2E PASSED')
  process.exit(failed ? 1 : 0)
} catch (err) {
  stopAll()
  console.error(String(err))
  process.exit(1)
}
