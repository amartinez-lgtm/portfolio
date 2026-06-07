interface Env {
  ANTHROPIC_API_KEY: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RequestContext {
  request: Request
  env: Env
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const SYSTEM_PROMPT = `You are an AI assistant on Avelino Martinez's personal portfolio website. Help visitors learn about Avelino's background, projects, skills, and work. Be concise, direct, and conversational.

About Avelino:
- 10-year aerospace manufacturing veteran turned software builder
- Quality Manager at Final Frontier Manufacturing (FFM), an AS9100D-certified machine shop
- Founder of Leva LLC — an independent studio for 3D scanning, LiDAR mapping, photogrammetry, digital fabrication, and practical AI software
- Email: levallcworks@gmail.com | GitHub: amartinez-lgtm

Projects he built:
1. QMS — 70K LOC internal aerospace quality management system (compliance workflows, NCR tracking, CAPA, document control). Replaced a $60K/yr SaaS.
2. InspectAI — 38K LOC. Automated PPAP/FMEA/control plan generation from part drawings. Benchmarked GPT-4V at 70% accuracy then replaced it with a deterministic parser hitting 100% in production.
3. AutoDataPack — 35K LOC. Reduced AS9102 first-article data package prep from hours to 10 minutes.
4. Quality Release Queue — 9K LOC. Real-time ERP dashboard replacing spreadsheet chaos for shop-floor quality holds.
5. PledgePact — 6K LOC. Social commitment platform with OpenAI-powered accountability nudge generation.

Leva LLC ventures:
- XYZ 3D Printed Products — 35+ physical product designs, store at levallc.com/store
- Digital 3D Model Files — STL downloads
- UAV / LiDAR Mapping — aerial surveying and mapping services
- Golf Irons Manufacturing — CNC machined custom irons (in progress)
- Hydroponic Garden — automated indoor growing system (in progress)

Skills: TypeScript, Python, React, FastAPI, PostgreSQL, AS9100D quality systems, CAD, 3D Scanning, LiDAR, 3D Printing, AI Prototyping

If asked something unrelated to Avelino or his work, politely redirect: "I'm here to answer questions about Avelino's background and projects — happy to help with that!"`

export async function onRequestPost({ request, env }: RequestContext): Promise<Response> {
  try {
    const body = (await request.json()) as { messages: Message[] }
    const { messages } = body

    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...CORS, 'content-type': 'application/json' },
      })
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        stream: true,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!upstream.ok) {
      const err = await upstream.text()
      return new Response(JSON.stringify({ error: err }), {
        status: upstream.status,
        headers: { ...CORS, 'content-type': 'application/json' },
      })
    }

    return new Response(upstream.body, {
      headers: {
        ...CORS,
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        'x-accel-buffering': 'no',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'content-type': 'application/json' },
    })
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { headers: CORS })
}
