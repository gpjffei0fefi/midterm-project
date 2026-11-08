import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getOpponentMove,
  fallbackAnswer,
  applyHandicap,
  isValidModelOutput,
  extractJson,
  extractSearchEvidence,
  buildPrompt,
  isPermanentModelError,
  describeModelError,
  HARD_MODE_MISS_RATE,
} from './opponentAgent.js'
import { findCardById } from './decks.js'

// A real card from the actual deck, so these tests exercise the same
// lookup path (by id) the live route uses — no live API calls, no quota
// spent: every `callModel` here is a fake we control.
const sampleCard = findCardById('math-01')

function interactionWithText(text, steps = []) {
  return { steps: [...steps, { type: 'model_output', content: [{ type: 'text', text }] }] }
}

describe('buildPrompt never leaks the correct answer', () => {
  it('does not mention correctIndex, and no option line is marked as correct', () => {
    const prompt = buildPrompt({ card: sampleCard, difficulty: 'hard', gameStateSummary: {} })
    expect(prompt).not.toMatch(/correctIndex/i)
    // Every option line should look identical in shape — none singled out
    // with a "(correct)"/"✓"/"right answer"-style marker.
    const optionLines = prompt.split('\n').filter((l) => /^[A-D]\. /.test(l))
    expect(optionLines).toHaveLength(sampleCard.options.length)
    for (const line of optionLines) {
      expect(line).not.toMatch(/correct|✓|\(right\)/i)
    }
  })

  it('never includes an actual player name — game state carries numbers only', () => {
    const prompt = buildPrompt({
      card: sampleCard,
      difficulty: 'hard',
      gameStateSummary: { lap: 2, yourTrust: 60, opponentTrust: 50 },
    })
    expect(prompt).not.toContain('Tester') // a plausible real player name
    expect(prompt).toContain('"lap":2') // the numeric summary itself is fine
  })
})

describe('isValidModelOutput', () => {
  it('accepts a well-formed answer', () => {
    expect(isValidModelOutput({ answerIndex: 1, confidence: 0.8, reasoning: 'because' }, 4)).toBe(true)
  })

  it('rejects an out-of-range answerIndex', () => {
    expect(isValidModelOutput({ answerIndex: 4, confidence: 0.8, reasoning: 'because' }, 4)).toBe(false)
    expect(isValidModelOutput({ answerIndex: -1, confidence: 0.8, reasoning: 'because' }, 4)).toBe(false)
  })

  it('rejects malformed shapes', () => {
    expect(isValidModelOutput(null, 4)).toBe(false)
    expect(isValidModelOutput({ answerIndex: '1', confidence: 0.8, reasoning: 'x' }, 4)).toBe(false)
    expect(isValidModelOutput({ answerIndex: 1, confidence: 'high', reasoning: 'x' }, 4)).toBe(false)
    expect(isValidModelOutput({ answerIndex: 1, confidence: 0.8 }, 4)).toBe(false)
  })
})

describe('extractJson', () => {
  it('parses a clean trailing JSON object', () => {
    const text = 'Some reasoning text.\n{"answerIndex":2,"confidence":0.9,"reasoning":"it checks out"}'
    expect(extractJson(text)).toEqual({ answerIndex: 2, confidence: 0.9, reasoning: 'it checks out' })
  })

  it('ignores earlier JSON-looking text and takes the last object', () => {
    const text = '{"not":"this one"}\nFinal answer: {"answerIndex":0,"confidence":0.5,"reasoning":"ok"}'
    expect(extractJson(text)).toEqual({ answerIndex: 0, confidence: 0.5, reasoning: 'ok' })
  })

  it('returns null for malformed JSON instead of throwing', () => {
    expect(extractJson('{"answerIndex": 1, oops')).toBeNull()
    expect(extractJson('no json here at all')).toBeNull()
    expect(extractJson(undefined)).toBeNull()
  })
})

describe('extractSearchEvidence', () => {
  it('reports no search when there is no google_search_call step', () => {
    const evidence = extractSearchEvidence([{ type: 'model_output', content: [] }])
    expect(evidence).toEqual({ searched: false, queries: [], sources: [] })
  })

  it('collects queries and url_citation sources from the real step log', () => {
    const steps = [
      { type: 'google_search_call', arguments: { queries: ['who won euro 2024'] } },
      {
        type: 'model_output',
        content: [
          {
            type: 'text',
            text: 'Spain won.',
            annotations: [{ type: 'url_citation', url: 'https://example.com/a', title: 'Example' }],
          },
        ],
      },
    ]
    const evidence = extractSearchEvidence(steps)
    expect(evidence.searched).toBe(true)
    expect(evidence.queries).toEqual(['who won euro 2024'])
    expect(evidence.sources).toEqual([{ title: 'Example', url: 'https://example.com/a' }])
  })
})

describe('applyHandicap (the beatability guarantee)', () => {
  it('never changes an already-wrong answer', () => {
    const wrongIndex = sampleCard.options.findIndex((_, i) => i !== sampleCard.correctIndex)
    // random() always "wins" the miss roll (returns 0 < any miss rate), but
    // there is nothing correct to turn wrong here.
    const result = applyHandicap(wrongIndex, sampleCard, { random: () => 0 })
    expect(result).toBe(wrongIndex)
  })

  it('leaves a correct answer alone when the miss roll does not land', () => {
    const result = applyHandicap(sampleCard.correctIndex, sampleCard, { random: () => 0.99, missRate: HARD_MODE_MISS_RATE })
    expect(result).toBe(sampleCard.correctIndex)
  })

  it('flips a correct answer to a wrong one when the miss roll lands', () => {
    const result = applyHandicap(sampleCard.correctIndex, sampleCard, { random: () => 0 })
    expect(result).not.toBe(sampleCard.correctIndex)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThan(sampleCard.options.length)
  })
})

describe('fallbackAnswer (used when the agent call fails entirely)', () => {
  it('always returns a valid option index and is clearly marked as a fallback', () => {
    const result = fallbackAnswer(sampleCard, { random: () => 0.5 })
    expect(result.answerIndex).toBeGreaterThanOrEqual(0)
    expect(result.answerIndex).toBeLessThan(sampleCard.options.length)
    expect(result.usedFallback).toBe(true)
    expect(result.searched).toBe(false)
    expect(result.queries).toEqual([])
    expect(result.sources).toEqual([])
  })
})

describe('getOpponentMove: the full decision path', () => {
  it('returns the model answer, with search evidence, when the model replies with valid JSON', async () => {
    const callModel = vi.fn().mockResolvedValue(
      interactionWithText(
        `{"answerIndex": ${sampleCard.correctIndex}, "confidence": 0.9, "reasoning": "Straightforward."}`,
        [{ type: 'google_search_call', arguments: { queries: ['test query'] } }]
      )
    )
    const move = await getOpponentMove({
      cardId: sampleCard.id,
      difficulty: 'hard',
      gameStateSummary: {},
      callModel,
      random: () => 0.99, // never land the handicap miss, for a deterministic assertion
    })
    expect(move.answerIndex).toBe(sampleCard.correctIndex)
    expect(move.searched).toBe(true)
    expect(move.queries).toEqual(['test query'])
    expect(move.usedFallback).toBe(false)
    expect(callModel).toHaveBeenCalledTimes(1)
  })

  it('retries once on malformed JSON, then succeeds on the second attempt', async () => {
    const callModel = vi
      .fn()
      .mockResolvedValueOnce(interactionWithText('not valid json at all'))
      .mockResolvedValueOnce(interactionWithText(`{"answerIndex": 0, "confidence": 0.7, "reasoning": "retry worked"}`))
    const move = await getOpponentMove({
      cardId: sampleCard.id,
      difficulty: 'hard',
      gameStateSummary: {},
      callModel,
      random: () => 0.99,
    })
    expect(callModel).toHaveBeenCalledTimes(2)
    expect(move.usedFallback).toBe(false)
    expect(move.reasoning).toBe('retry worked')
  })

  describe('the fallback path (forced failure — THE required "force a failure" test)', () => {
    it('falls back to the tier-based AI when the model call rejects every attempt', async () => {
      const callModel = vi.fn().mockRejectedValue(new Error('network down'))
      const move = await getOpponentMove({
        cardId: sampleCard.id,
        difficulty: 'hard',
        gameStateSummary: {},
        callModel,
        random: () => 0.5,
      })
      expect(callModel).toHaveBeenCalledTimes(2) // both attempts were made
      expect(move.usedFallback).toBe(true)
      expect(move.searched).toBe(false)
      expect(move.answerIndex).toBeGreaterThanOrEqual(0)
      expect(move.answerIndex).toBeLessThan(sampleCard.options.length)
    })

    it('falls back when the model replies with malformed JSON twice in a row', async () => {
      const callModel = vi.fn().mockResolvedValue(interactionWithText('garbage, no json'))
      const move = await getOpponentMove({
        cardId: sampleCard.id,
        difficulty: 'hard',
        gameStateSummary: {},
        callModel,
        random: () => 0.5,
      })
      expect(callModel).toHaveBeenCalledTimes(2)
      expect(move.usedFallback).toBe(true)
    })

    it('falls back when the model answers with an out-of-range index', async () => {
      const callModel = vi
        .fn()
        .mockResolvedValue(interactionWithText(`{"answerIndex": 99, "confidence": 0.9, "reasoning": "bad index"}`))
      const move = await getOpponentMove({
        cardId: sampleCard.id,
        difficulty: 'hard',
        gameStateSummary: {},
        callModel,
        random: () => 0.5,
      })
      expect(move.usedFallback).toBe(true)
    })
  })

  it('throws for an unknown card id rather than silently guessing', async () => {
    await expect(
      getOpponentMove({ cardId: 'not-a-real-card', callModel: vi.fn() })
    ).rejects.toThrow(/unknown card id/)
  })
})

function errorWithStatus(status, message = `status ${status}`) {
  const error = new Error(message)
  error.status = status
  return error
}

describe('which model errors get retried', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    console.error.mockRestore()
  })

  it('treats 4xx other than 429 as permanent, everything else as retryable', () => {
    expect(isPermanentModelError(errorWithStatus(400))).toBe(true)
    expect(isPermanentModelError(errorWithStatus(401))).toBe(true)
    expect(isPermanentModelError(errorWithStatus(404))).toBe(true)
    expect(isPermanentModelError(errorWithStatus(429))).toBe(false)
    expect(isPermanentModelError(errorWithStatus(503))).toBe(false)
    expect(isPermanentModelError(new Error('timeout'))).toBe(false)
  })

  it('does not retry a 404, and falls back after one call', async () => {
    const callModel = vi.fn().mockRejectedValue(errorWithStatus(404, 'model not found'))
    const move = await getOpponentMove({ cardId: sampleCard.id, callModel, random: () => 0.5 })
    expect(callModel).toHaveBeenCalledTimes(1)
    expect(move.usedFallback).toBe(true)
  })

  it('retries a 429 once, and uses the answer if the retry succeeds', async () => {
    const callModel = vi
      .fn()
      .mockRejectedValueOnce(errorWithStatus(429, 'quota'))
      .mockResolvedValueOnce(interactionWithText('{"answerIndex": 0, "confidence": 0.6, "reasoning": "after 429"}'))
    const move = await getOpponentMove({ cardId: sampleCard.id, callModel, random: () => 0.99 })
    expect(callModel).toHaveBeenCalledTimes(2)
    expect(move.usedFallback).toBe(false)
  })

  it('retries a timeout once', async () => {
    const callModel = vi.fn().mockRejectedValue(new Error('timeout'))
    await getOpponentMove({ cardId: sampleCard.id, callModel, random: () => 0.5 })
    expect(callModel).toHaveBeenCalledTimes(2)
  })

  it('logs status and message for each failed call', async () => {
    const callModel = vi.fn().mockRejectedValue(errorWithStatus(403, 'permission denied'))
    await getOpponentMove({ cardId: sampleCard.id, callModel, random: () => 0.5 })
    expect(console.error).toHaveBeenCalledWith('[opponent] model error (status 403): permission denied')
  })
})

describe('describeModelError never prints a key', () => {
  it('redacts key-shaped strings and key= query params', () => {
    const fakeKey = 'AIza' + 'x'.repeat(35)
    const line = describeModelError(errorWithStatus(400, `bad request for ${fakeKey} at /v1?key=${fakeKey}&alt=json`))
    expect(line).not.toContain(fakeKey)
    expect(line).toContain('status 400')
    expect(line).toContain('[redacted]')
  })

  it('reports "none" when the error has no status', () => {
    expect(describeModelError(new Error('timeout'))).toBe('[opponent] model error (status none): timeout')
  })
})
