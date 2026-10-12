// The testable core of the Hard Mode opponent: everything except the HTTP
// plumbing (that's api/opponent.js) and the actual Gemini network call
// (injected as `callModel`, so tests can supply a fake one instead of
// spending real quota — see api/_lib/opponentAgent.test.js).
import { AI_CORRECT_PROBABILITY_BY_TIER, HARD_MODE_PREVIEW_TIER } from '../../src/data/gameRules.js'
import { findCardById } from './decks.js'

export const HARD_MODE_MODEL = 'gemini-2.5-flash'
// Config constant, per the brief: Hard Mode must be beatable, so even a
// correct, well-searched answer has a chance of being overridden to wrong.
export const HARD_MODE_MISS_RATE = 0.15
// The tier the pre-existing coin-flip AI uses when the agent call fails.
export const FALLBACK_TIER = HARD_MODE_PREVIEW_TIER

function randomWrongIndex(options, correctIndex, random) {
  const wrong = options.map((_, i) => i).filter((i) => i !== correctIndex)
  return wrong[Math.floor(random() * wrong.length)]
}

// The pre-existing tier-based coin-flip AI, used whenever the live agent
// call fails, times out, or is rate-limited — the game must never freeze
// waiting on a search that isn't coming.
export function fallbackAnswer(card, { random = Math.random } = {}) {
  const probability = AI_CORRECT_PROBABILITY_BY_TIER[FALLBACK_TIER] ?? 0.5
  const isCorrect = random() < probability
  const answerIndex = isCorrect ? card.correctIndex : randomWrongIndex(card.options, card.correctIndex, random)
  return {
    answerIndex,
    confidence: 0.5,
    reasoning: "Answered without a live search (couldn't reach the search agent this turn).",
    searched: false,
    queries: [],
    sources: [],
    usedFallback: true,
  }
}

// An intentional miss rate: even a correct, well-reasoned model answer has
// a MISS_RATE chance of being overridden to a wrong option, so Hard Mode
// stays beatable. Never "un-misses" an answer the model already got wrong.
export function applyHandicap(answerIndex, card, { missRate = HARD_MODE_MISS_RATE, random = Math.random } = {}) {
  if (answerIndex !== card.correctIndex) return answerIndex
  if (random() >= missRate) return answerIndex
  return randomWrongIndex(card.options, card.correctIndex, random)
}

export function isValidModelOutput(parsed, optionsLength) {
  return (
    Boolean(parsed) &&
    typeof parsed === 'object' &&
    Number.isInteger(parsed.answerIndex) &&
    parsed.answerIndex >= 0 &&
    parsed.answerIndex < optionsLength &&
    typeof parsed.confidence === 'number' &&
    parsed.confidence >= 0 &&
    parsed.confidence <= 1 &&
    typeof parsed.reasoning === 'string' &&
    parsed.reasoning.length > 0
  )
}

// The model is asked to end its turn with exactly one JSON object and
// nothing after it; this pulls out the last {...} block and parses it.
// Never throws — returns null on anything unparseable, so the caller can
// retry once (per the brief) rather than crash the request.
export function extractJson(text) {
  if (typeof text !== 'string') return null
  const match = text.match(/\{[^{}]*\}/g)
  if (!match) return null
  try {
    return JSON.parse(match[match.length - 1])
  } catch {
    return null
  }
}

// Builds the model-facing question text. Deliberately omits the card's own
// correctIndex (per the brief: the model must never be told the answer) and
// the game-state summary is numbers only — no player names, no personal
// data of any kind.
export function buildPrompt({ card, difficulty, gameStateSummary }) {
  const optionsList = card.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')
  return [
    'You are the AI opponent in a quiz board game (Hard Mode). Answer the question below as well as you genuinely can.',
    `Difficulty: ${difficulty ?? 'hard'}. Deck: ${card.deck}.`,
    'You have a google_search tool. Decide for yourself whether this question needs a search: use it for anything that depends on current events, specific facts, or real organizations/policies you are not certain of. A self-contained math problem rarely needs a search — solve it directly.',
    `Game state (numbers only, no names): ${JSON.stringify(gameStateSummary ?? {})}`,
    `Question: ${card.prompt}`,
    `Options:\n${optionsList}`,
    'When you are done (whether or not you searched), reply with exactly one JSON object and nothing else after it, no markdown code fence: {"answerIndex": <0-based integer index into the options above>, "confidence": <number 0 to 1>, "reasoning": "<one sentence, your reasoning>"}',
  ].join('\n\n')
}

// Pulls "did it search / what did it search / what sources" out of the
// Interactions API's own step log, rather than trusting the model to
// self-report them — the steps are the actual record of what happened.
export function extractSearchEvidence(steps) {
  const queries = []
  const sources = []
  for (const step of steps ?? []) {
    if (step.type === 'google_search_call' && Array.isArray(step.arguments?.queries)) {
      queries.push(...step.arguments.queries)
    }
    if (step.type === 'model_output') {
      for (const block of step.content ?? []) {
        for (const a of block.annotations ?? []) {
          if (a.type === 'url_citation' && a.url) {
            sources.push({ title: a.title ?? a.url, url: a.url })
          }
        }
      }
    }
  }
  return { searched: queries.length > 0, queries, sources }
}

function finalOutputText(steps) {
  const outputs = (steps ?? []).filter((s) => s.type === 'model_output')
  const last = outputs[outputs.length - 1]
  if (!last) return ''
  return (last.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
}

// One real call to the model, extracting both its JSON decision and the
// search evidence from the same response.
async function runOnce({ card, difficulty, gameStateSummary, callModel }) {
  const prompt = buildPrompt({ card, difficulty, gameStateSummary })
  const interaction = await callModel(prompt)
  const steps = interaction?.steps ?? []
  const text = finalOutputText(steps)
  const parsed = extractJson(text)
  const evidence = extractSearchEvidence(steps)
  return { parsed, evidence }
}

// The full decision: call the model, validate its JSON, retry once on a
// malformed reply, apply the handicap to a correct answer, and only fall
// back to the tier-based coin-flip AI if the model never produces a usable
// answer at all. `callModel` is injected so tests never spend real quota.
export async function getOpponentMove({ cardId, difficulty, gameStateSummary, callModel, random = Math.random }) {
  const card = findCardById(cardId)
  if (!card) {
    throw new Error(`unknown card id "${cardId}"`)
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { parsed, evidence } = await runOnce({ card, difficulty, gameStateSummary, callModel })
      if (isValidModelOutput(parsed, card.options.length)) {
        return {
          answerIndex: applyHandicap(parsed.answerIndex, card, { random }),
          confidence: parsed.confidence,
          reasoning: parsed.reasoning,
          searched: evidence.searched,
          queries: evidence.queries,
          sources: evidence.sources,
          usedFallback: false,
        }
      }
    } catch {
      // network error, non-2xx, timeout, etc. — fall through to the retry,
      // and ultimately to the fallback below, rather than rejecting.
    }
  }

  return fallbackAnswer(card, { random })
}
