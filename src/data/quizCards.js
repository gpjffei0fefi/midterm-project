// The quiz decks are built from quiz-questions.csv (same folder), the single
// source of truth for question content. Edit the CSV, not this file.
//
// Columns: deck, difficultyTier, prompt, option1..option4, correctIndex
//   deck            "math" or "ethics"
//   difficultyTier  1, 2 or 3
//   option1..4      2-4 answers; trailing empty options are simply absent
//   correctIndex    0-based index into the options that are present
import csvText from './quiz-questions.csv?raw'

// Minimal RFC 4180 parser: quoted fields may contain commas, newlines, and
// doubled quotes ("" means a literal quote).
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  const src = text.replace(/^﻿/, '')

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else {
      field += ch
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

function buildDecks(text) {
  const [header, ...rows] = parseCsv(text)
  const col = Object.fromEntries(header.map((name, i) => [name.trim(), i]))
  const decks = { math: [], ethics: [] }

  rows.forEach((cells, index) => {
    const get = (name) => (cells[col[name]] ?? '').trim()
    const line = index + 2 // 1-based, counting the header
    const deck = get('deck')
    const tier = Number(get('difficultyTier'))
    const prompt = get('prompt')
    const options = ['option1', 'option2', 'option3', 'option4'].map(get).filter(Boolean)
    const correctIndex = Number(get('correctIndex'))

    const problem =
      !decks[deck] ? `unknown deck "${deck}"`
      : ![1, 2, 3].includes(tier) ? `difficultyTier must be 1, 2 or 3 (got "${get('difficultyTier')}")`
      : !prompt ? 'empty prompt'
      : options.length < 2 ? 'needs at least 2 options'
      : !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length
        ? `correctIndex "${get('correctIndex')}" is not a valid 0-based index for ${options.length} options`
        : null

    if (problem) {
      console.warn(`quiz-questions.csv line ${line} skipped: ${problem}`)
      return
    }

    const n = decks[deck].length + 1
    decks[deck].push({
      id: `${deck}-${String(n).padStart(2, '0')}`,
      deck,
      difficultyTier: tier,
      prompt,
      options,
      correctIndex,
    })
  })

  return decks
}

const decks = buildDecks(csvText)

export const MATH_CARDS = decks.math
export const ETHICS_CARDS = decks.ethics

export const DECKS = {
  math: MATH_CARDS,
  ethics: ETHICS_CARDS,
}
