// POST /api/opponent — Hard Mode's AI agent turn.
//
// SECURITY: GEMINI_API_KEY is read only in geminiClient.js, a server-only
// module nothing under src/ ever imports, so it can't end up in the client
// bundle. It is never logged — see the one try/catch below, which logs only
// `error.message`. The request body carries no player name or other
// personal data (just a card id, a difficulty label, and numeric game-state
// totals); see api/_lib/opponentAgent.js's buildPrompt for exactly what
// reaches the model.
import { getOpponentMove, fallbackAnswer } from './_lib/opponentAgent.js'
import { callGemini } from './_lib/geminiClient.js'
import { findCardById } from './_lib/decks.js'
import { isRateLimited, clientIp } from './_lib/rateLimit.js'

const TIMEOUT_MS = 15_000

function withTimeout(promise, ms) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const { cardId, difficulty, gameStateSummary } = req.body ?? {}
  if (typeof cardId !== 'string' || !cardId) {
    res.status(400).json({ error: 'cardId is required' })
    return
  }

  const card = findCardById(cardId)
  if (!card) {
    res.status(400).json({ error: 'unknown cardId' })
    return
  }

  if (isRateLimited(clientIp(req))) {
    res.status(429).json({ ...fallbackAnswer(card), rateLimited: true })
    return
  }

  try {
    const move = await withTimeout(
      getOpponentMove({ cardId, difficulty, gameStateSummary, callModel: callGemini }),
      TIMEOUT_MS
    )
    res.status(200).json(move)
  } catch (error) {
    // Never logs the request/response bodies or the API key — only the
    // error's own message, for operator debugging.
    console.error(`[opponent] falling back: ${error.message}`)
    res.status(200).json(fallbackAnswer(card))
  }
}
