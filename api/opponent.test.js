import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findCardById } from './_lib/decks.js'

// The route's own forced-failure test: the real handler, with only the
// Gemini network call mocked. The rejection below is the exact error the
// live 2026-11-08 test got back from Google (see DOCUMENTATION.md's "Live
// test result"), so this proves that specific real-world failure still
// leaves the game with a playable move rather than a stuck turn.
vi.mock('./_lib/geminiClient.js', () => ({ callGemini: vi.fn() }))

const { callGemini } = await import('./_lib/geminiClient.js')
const { default: handler } = await import('./opponent.js')

function liveModelNotFoundError() {
  const error = new Error(
    '404 This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use models/gemini-3.8-flash for the latest features and improvements.'
  )
  error.name = 'NotFoundError'
  error.status = 404
  return error
}

function fakeRes() {
  const res = { statusCode: null, body: null }
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (body) => {
    res.body = body
    return res
  }
  return res
}

function fakeReq(body, ip = '203.0.113.7') {
  return { method: 'POST', body, headers: { 'x-forwarded-for': ip }, socket: {} }
}

describe('POST /api/opponent when Gemini rejects the model (forced failure)', () => {
  beforeEach(() => {
    callGemini.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('still answers 200 with a valid, clearly-marked fallback move', async () => {
    callGemini.mockRejectedValue(liveModelNotFoundError())
    const card = findCardById('math-01')
    const res = fakeRes()

    await handler(fakeReq({ cardId: card.id, difficulty: 'hard', gameStateSummary: { lap: 1 } }), res)

    expect(res.statusCode).toBe(200)
    expect(res.body.usedFallback).toBe(true)
    expect(res.body.searched).toBe(false)
    expect(Number.isInteger(res.body.answerIndex)).toBe(true)
    expect(res.body.answerIndex).toBeGreaterThanOrEqual(0)
    expect(res.body.answerIndex).toBeLessThan(card.options.length)
    expect(res.body.reasoning).toMatch(/without a live search/)
    // A 404 is permanent, so it is not retried.
    expect(callGemini).toHaveBeenCalledTimes(1)
  })

  it('logs the status and message, so the failure shows in Vercel logs', async () => {
    callGemini.mockRejectedValue(liveModelNotFoundError())
    await handler(fakeReq({ cardId: 'ethics-05', difficulty: 'hard', gameStateSummary: {} }, '203.0.113.8'), fakeRes())
    const logged = console.error.mock.calls.flat().join('\n')
    expect(logged).toContain('status 404')
    expect(logged).toContain('gemini-2.5-flash is no longer available')
    expect(logged).not.toContain('ethics-05') // never the request body
  })
})
