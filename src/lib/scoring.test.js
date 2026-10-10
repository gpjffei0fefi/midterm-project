import { describe, it, expect } from 'vitest'
import { totalTrust, computeWinners, joinNames } from './scoring'

function player(id, name, accuracy, fairness, transparency) {
  return { id, name, accuracy, fairness, transparency }
}

describe('computeWinners (tie-break)', () => {
  it('declares a single winner when scores differ', () => {
    const players = [player('p1', 'A', 10, 10, 10), player('p2', 'B', 5, 5, 5)]
    const winners = computeWinners(players)
    expect(winners.map((p) => p.id)).toEqual(['p1'])
  })

  it('declares a tie for two players with equal scores — never picks one arbitrarily', () => {
    const players = [
      player('p1', 'A', 20, 14, 14), // 48
      player('p2', 'B', 10, 10, 10), // 30
      player('p3', 'C', 16, 16, 16), // 48 — tied with A
    ]
    const winners = computeWinners(players)
    expect(winners.map((p) => p.id).sort()).toEqual(['p1', 'p3'])
  })

  it('declares a tie across ALL players when every score is equal (4-player case)', () => {
    const players = [
      player('p1', 'A', 25, 25, 25),
      player('p2', 'B', 25, 25, 25),
      player('p3', 'C', 25, 25, 25),
      player('p4', 'D', 25, 25, 25),
    ]
    const winners = computeWinners(players)
    expect(winners).toHaveLength(4)
  })

  it('is independent of array order — the winner set does not depend on who sorts last', () => {
    const a = player('p1', 'A', 20, 20, 20)
    const b = player('p2', 'B', 20, 20, 20)
    const c = player('p3', 'C', 10, 10, 10)
    const forward = computeWinners([a, b, c]).map((p) => p.id).sort()
    const reversed = computeWinners([c, b, a]).map((p) => p.id).sort()
    expect(forward).toEqual(['p1', 'p2'])
    expect(reversed).toEqual(['p1', 'p2'])
  })
})

describe('totalTrust', () => {
  it('sums all three axes', () => {
    expect(totalTrust(player('p1', 'A', 10, 20, 30))).toBe(60)
  })
})

describe('joinNames', () => {
  it('formats 1, 2, and 3+ names in prose', () => {
    expect(joinNames([player('p1', 'A')])).toBe('A')
    expect(joinNames([player('p1', 'A'), player('p2', 'B')])).toBe('A and B')
    expect(joinNames([player('p1', 'A'), player('p2', 'B'), player('p3', 'C')])).toBe('A, B, and C')
  })
})
