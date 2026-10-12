// A best-effort, in-memory per-IP rate limiter. This protects the shared
// Google Search grounding quota (500 requests/day on the free tier, shared
// across gemini-2.5-flash and gemini-2.5-flash-lite — see DOCUMENTATION.md)
// from one runaway client, not a security boundary: a serverless function's
// memory isn't shared across instances or cold starts, so this is a courtesy
// cap, not a hard guarantee. Node's own `fetch`/network timeouts and
// Google's project-level quota are the real backstops.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 10

const hits = new Map() // ip -> array of request timestamps (ms)

export function isRateLimited(ip, now = Date.now()) {
  const key = ip || 'unknown'
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > MAX_PER_WINDOW
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress ?? 'unknown'
}
