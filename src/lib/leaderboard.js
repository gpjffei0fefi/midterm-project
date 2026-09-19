// Shared leaderboard backed by Supabase's REST API (PostgREST). Optional: with
// no env vars set, `leaderboardEnabled` is false and the UI never renders.
const BASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '')
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const leaderboardEnabled = Boolean(BASE_URL && ANON_KEY)
export const LEADERBOARD_SIZE = 20
export const MAX_NAME_LENGTH = 20

const ENDPOINT = `${BASE_URL}/rest/v1/leaderboard`
const AUTH_HEADERS = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }

export function normalizeName(raw) {
  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH)
}

// Highest total first; earlier submission wins a tie.
export async function fetchTopScores() {
  const query = new URLSearchParams({
    select: 'id,name,accuracy,fairness,transparency,total,created_at',
    order: 'total.desc,created_at.asc',
    limit: String(LEADERBOARD_SIZE),
  })
  const res = await fetch(`${ENDPOINT}?${query}`, { headers: AUTH_HEADERS, cache: 'no-store' })
  if (!res.ok) throw new Error(`Could not load scores (${res.status})`)
  return res.json()
}

// `total` is computed by the database from the three axes, so it is not sent.
export async function submitScore({ name, accuracy, fairness, transparency }) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { ...AUTH_HEADERS, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ name, accuracy, fairness, transparency }),
  })
  if (!res.ok) throw new Error(`Could not submit score (${res.status})`)
  const [row] = await res.json()
  return row
}
