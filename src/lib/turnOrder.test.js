import { describe, it, expect } from 'vitest'
import { nextPlayerIndex } from './turnOrder'

describe('nextPlayerIndex (N-player turn order)', () => {
  it('cycles 0 -> 1 -> 0 for 2 players', () => {
    expect(nextPlayerIndex(0, 2)).toBe(1)
    expect(nextPlayerIndex(1, 2)).toBe(0)
  })

  it('cycles 0 -> 1 -> 2 -> 0 for 3 players', () => {
    expect(nextPlayerIndex(0, 3)).toBe(1)
    expect(nextPlayerIndex(1, 3)).toBe(2)
    expect(nextPlayerIndex(2, 3)).toBe(0)
  })

  it('cycles 0 -> 1 -> 2 -> 3 -> 0 for 4 players (MAX_PLAYERS)', () => {
    expect(nextPlayerIndex(0, 4)).toBe(1)
    expect(nextPlayerIndex(1, 4)).toBe(2)
    expect(nextPlayerIndex(2, 4)).toBe(3)
    expect(nextPlayerIndex(3, 4)).toBe(0)
  })

  it('a full round returns to seat 0 for every player count from 2 to 4', () => {
    for (const count of [2, 3, 4]) {
      let index = 0
      for (let turn = 0; turn < count; turn++) index = nextPlayerIndex(index, count)
      expect(index).toBe(0)
    }
  })
})
