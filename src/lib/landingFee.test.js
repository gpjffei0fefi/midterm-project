import { describe, it, expect } from 'vitest'
import { computeLandingFee } from './landingFee'
import { LANDING_FEE_MULTIPLIER } from '../data/gameRules'

// A minimal stand-in for applyLandingFee's two applyAxisChange calls
// (GameBoard.jsx), so the "owner receives, visitor pays, never reversed"
// rule is checked directly against plain numbers instead of React state.
function simulateLanding(tile, visitor, owner) {
  const { axis, fee } = computeLandingFee(tile)
  return {
    visitor: { ...visitor, [axis]: visitor[axis] - fee },
    owner: { ...owner, [axis]: owner[axis] + fee },
  }
}

describe('landing fee direction (owner receives, visitor pays)', () => {
  it('an irresponsible (negative ethicsWeight) module moves a straight Accuracy fee', () => {
    const tile = { ethicsWeight: -3, deckKey: 'math' }
    const { axis, fee } = computeLandingFee(tile)
    expect(axis).toBe('accuracy')
    expect(fee).toBe(3 * LANDING_FEE_MULTIPLIER)
  })

  it('a responsible module with its own trust axis moves that axis', () => {
    const tile = { ethicsWeight: 3, trustAxis: 'fairness' }
    expect(computeLandingFee(tile).axis).toBe('fairness')
    const tile2 = { ethicsWeight: 3, trustAxis: 'transparency' }
    expect(computeLandingFee(tile2).axis).toBe('transparency')
  })

  it('a responsible module with no trust axis of its own falls back to Fairness', () => {
    const tile = { ethicsWeight: 3 }
    expect(computeLandingFee(tile).axis).toBe('fairness')
  })

  it('the visitor always loses what the owner always gains — never reversed', () => {
    const tile = { ethicsWeight: -3, deckKey: 'math' }
    const visitor = { accuracy: 50, fairness: 50, transparency: 50 }
    const owner = { accuracy: 20, fairness: 20, transparency: 20 }
    const result = simulateLanding(tile, visitor, owner)

    expect(result.visitor.accuracy).toBe(44) // paid the fee
    expect(result.owner.accuracy).toBe(26) // received the fee
    expect(owner.accuracy - result.owner.accuracy).toBe(-(visitor.accuracy - result.visitor.accuracy)) // equal and opposite
  })

  it('never credits the visitor or debits the owner, for either module ethics sign', () => {
    for (const ethicsWeight of [-3, 3]) {
      const tile = { ethicsWeight, trustAxis: 'fairness' }
      const visitor = { accuracy: 40, fairness: 40, transparency: 40 }
      const owner = { accuracy: 40, fairness: 40, transparency: 40 }
      const { axis } = computeLandingFee(tile)
      const result = simulateLanding(tile, visitor, owner)
      expect(result.visitor[axis]).toBeLessThan(visitor[axis])
      expect(result.owner[axis]).toBeGreaterThan(owner[axis])
    }
  })
})
