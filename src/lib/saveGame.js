// One in-progress game per browser, kept in localStorage. Saved after every
// resolved turn; cleared when the game ends or a new one is started.
import { TILES } from '../data/boardData'

const KEY = 'build-a-brain:save'
const VERSION = 1

const moduleIds = TILES.filter((t) => t.type === 'module').map((t) => String(t.id))
const isNum = (n) => typeof n === 'number' && Number.isFinite(n)

// Anything malformed (old version, hand-edited, partial write) is rejected so
// the game falls back to a fresh start instead of crashing on load.
function isValidSave(data) {
  if (!data || data.version !== VERSION) return false
  if (!Array.isArray(data.players) || data.players.length !== 3) return false
  for (const p of data.players) {
    if (typeof p.id !== 'string' || typeof p.name !== 'string' || typeof p.color !== 'string') return false
    if (typeof p.isAI !== 'boolean') return false
    if (![p.position, p.accuracy, p.fairness, p.transparency, p.laps].every(isNum)) return false
    if (p.position < 0 || p.position >= TILES.length) return false
  }
  if (!Number.isInteger(data.currentPlayerIndex) || data.currentPlayerIndex < 0 || data.currentPlayerIndex >= data.players.length) return false
  if (!isNum(data.turns) || !isNum(data.diceValue)) return false
  const ms = data.moduleState
  if (!ms || typeof ms !== 'object') return false
  for (const id of moduleIds) {
    const m = ms[id]
    if (!m || (m.owner !== null && !data.players.some((p) => p.id === m.owner))) return false
    if (m.state !== 'clean' && m.state !== 'glitchy') return false
  }
  return true
}

export function loadSavedGame() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (isValidSave(data)) return data
    localStorage.removeItem(KEY)
  } catch {
    // storage blocked or corrupt JSON — treat as no save
  }
  return null
}

export function saveGame({ players, currentPlayerIndex, turns, diceValue, moduleState }) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ version: VERSION, players, currentPlayerIndex, turns, diceValue, moduleState })
    )
  } catch {
    // storage full or blocked — the game still plays, it just can't be resumed
  }
}

export function clearSavedGame() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
