// The quiz decks are built from quiz-questions.csv (same folder), the single
// source of truth for question content. Edit the CSV, not this file.
// Parsing itself lives in csvDecks.js (no Vite-specific import), so the
// server-side Hard Mode agent (api/_lib/decks.js) can parse the identical
// file the identical way, without needing Vite's `?raw` suffix.
import csvText from './quiz-questions.csv?raw'
import { buildDecks } from './csvDecks'

const decks = buildDecks(csvText)

export const MATH_CARDS = decks.math
export const ETHICS_CARDS = decks.ethics

export const DECKS = {
  math: MATH_CARDS,
  ethics: ETHICS_CARDS,
}
