// Server-side mirror of src/data/quizCards.js. Vercel's Node function
// bundler doesn't understand Vite's `?raw` import suffix, so this reads the
// exact same CSV file from disk instead, and parses it with the exact same
// (bundler-agnostic) logic from src/data/csvDecks.js — one CSV, one parser,
// read two different ways depending on which runtime is asking.
//
// This file is the server's OWN authority on what a card's correct answer
// is. The client only ever sends a card id (see api/opponent.js); the
// correct index for it is looked up here, never trusted from the request.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildDecks } from '../../src/data/csvDecks.js'

let cached = null

export function getDecks() {
  if (cached) return cached
  const csvPath = join(process.cwd(), 'src', 'data', 'quiz-questions.csv')
  const csvText = readFileSync(csvPath, 'utf-8')
  cached = buildDecks(csvText)
  return cached
}

export function findCardById(cardId) {
  const decks = getDecks()
  for (const deck of Object.values(decks)) {
    const card = deck.find((c) => c.id === cardId)
    if (card) return card
  }
  return null
}
