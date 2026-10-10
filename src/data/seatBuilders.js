// Turns a mode + the setup screens' choices into the `seats` array
// buildPlayers (boardData.js) turns into real player objects. Kept separate
// from buildPlayers so each mode's own rule (how many AIs, which tier each
// gets) is in one tested place.
import { PLAYER_COLORS } from './boardData'
import { HARD_MODE_PREVIEW_TIER } from './gameRules'

// AI seats are assigned a fixed skill tier in a fixed order — tier 1
// (70% correct) first, down to the lowest tier present — so "3 AIs" always
// means one tough, one medium, one weak opponent, not three random ones.
const AI_TIER_ORDER = [1, 2, 3]

export function aiTierForSeatIndex(aiSeatIndex) {
  return AI_TIER_ORDER[aiSeatIndex % AI_TIER_ORDER.length]
}

// Local Multiplayer: every seat is a human, pass-and-play on one device.
export function buildLocalSeats(names) {
  return names.map((name, i) => ({ name, isAI: false, color: PLAYER_COLORS[i] }))
}

// AI Mode: you plus 1-3 simulated AIs, each a different tier.
export function buildAiModeSeats(humanName, aiCount) {
  const seats = [{ name: humanName, isAI: false, color: PLAYER_COLORS[0] }]
  for (let i = 0; i < aiCount; i++) {
    seats.push({
      name: `Player ${i + 2}`,
      isAI: true,
      aiTier: aiTierForSeatIndex(i),
      color: PLAYER_COLORS[i + 1],
    })
  }
  return seats
}

// Hard Mode: one human vs one AI, previewed with the existing tier-based AI
// at its toughest setting until a real web-searching agent is wired in.
export function buildHardModeSeats(humanName) {
  return [
    { name: humanName, isAI: false, color: PLAYER_COLORS[0] },
    { name: 'Hard AI (preview)', isAI: true, aiTier: HARD_MODE_PREVIEW_TIER, color: PLAYER_COLORS[1] },
  ]
}
