// Turns a mode + the setup screens' choices into the `seats` array
// buildPlayers (boardData.js) turns into real player objects. Kept separate
// from buildPlayers so each mode's own rule (how many AIs, which tier each
// gets) is in one tested place.
import { PLAYER_COLORS } from './boardData'
import { HARD_MODE_PREVIEW_TIER, HARD_MODE_AGENT_ENABLED } from './gameRules'

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

// Hard Mode: one human vs one tough AI. With the agent enabled, that AI is
// the web-searching agent (POST /api/opponent — see src/lib/opponentApi.js),
// and `aiTier` stays set so GameBoard has a same-shaped tier-based opponent
// to fall back to if the agent call fails. With it disabled (the demo
// default, see gameRules.js), it is just the tier-1 AI, named honestly.
export function buildHardModeSeats(humanName, { agentEnabled = HARD_MODE_AGENT_ENABLED } = {}) {
  return [
    { name: humanName, isAI: false, color: PLAYER_COLORS[0] },
    {
      name: agentEnabled ? 'Hard AI' : 'Hard (preview)',
      isAI: true,
      usesAgent: agentEnabled,
      aiTier: HARD_MODE_PREVIEW_TIER,
      color: PLAYER_COLORS[1],
    },
  ]
}
