import { describe, it, expect } from 'vitest'
import { buildPlayers } from './boardData'
import { buildHardModeSeats, buildAiModeSeats } from './seatBuilders'

describe('Hard Mode seats with the agent disabled (the demo default)', () => {
  it('is the plain tier-1 AI, labeled "Hard (preview)", with no agent', () => {
    const [human, hardAi] = buildPlayers(buildHardModeSeats('Player 1'))
    expect(hardAi.name).toBe('Hard (preview)')
    expect(hardAi.isAI).toBe(true)
    expect(hardAi.aiTier).toBe(1)
    expect(hardAi.usesAgent).toBe(false)
    expect(human.usesAgent).toBe(false)
  })
})

// Regression: buildPlayers used to drop `usesAgent`, so an agent-enabled
// Hard Mode game silently ran the plain coin-flip AI and never called
// /api/opponent.
describe('Hard Mode seats with the agent enabled', () => {
  it('marks only the Hard AI seat as using the search agent', () => {
    const [human, hardAi] = buildPlayers(buildHardModeSeats('Player 1', { agentEnabled: true }))
    expect(hardAi.name).toBe('Hard AI')
    expect(hardAi.usesAgent).toBe(true)
    expect(human.usesAgent).toBe(false)
  })
})

describe('AI Mode never uses the agent', () => {
  it('leaves usesAgent off for every seat', () => {
    const players = buildPlayers(buildAiModeSeats('Player 1', 3))
    expect(players).toHaveLength(4)
    expect(players.every((p) => p.usesAgent === false)).toBe(true)
  })
})
