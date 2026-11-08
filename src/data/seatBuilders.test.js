import { describe, it, expect } from 'vitest'
import { buildPlayers } from './boardData'
import { buildHardModeSeats, buildAiModeSeats } from './seatBuilders'

// Regression: buildPlayers used to drop `usesAgent`, so a Hard Mode game
// silently ran the plain coin-flip AI and never called /api/opponent.
describe('buildPlayers keeps the Hard Mode agent flag', () => {
  it('marks only the Hard AI seat as using the search agent', () => {
    const [human, hardAi] = buildPlayers(buildHardModeSeats('Player 1'))
    expect(hardAi.isAI).toBe(true)
    expect(hardAi.usesAgent).toBe(true)
    expect(human.usesAgent).toBe(false)
  })

  it('never turns on the agent for AI Mode opponents', () => {
    const players = buildPlayers(buildAiModeSeats('Player 1', 3))
    expect(players).toHaveLength(4)
    expect(players.every((p) => p.usesAgent === false)).toBe(true)
  })
})
