import { describe, it, expect } from 'vitest'
import { createDrawPile, hydrateDrawPile, drawCard } from './deckDraw'

function makeCards(n) {
  return Array.from({ length: n }, (_, i) => ({ id: `c${i}`, difficultyTier: (i % 3) + 1 }))
}

describe('no-repeat deck draws', () => {
  it('deals every card exactly once before reshuffling (untiered draws)', () => {
    const cards = makeCards(20)
    const pile = createDrawPile(cards)
    const firstCycle = Array.from({ length: 20 }, () => drawCard(pile, cards).id)
    expect(new Set(firstCycle).size).toBe(20) // no repeats within one full deal

    const secondCycle = Array.from({ length: 20 }, () => drawCard(pile, cards).id)
    expect(new Set(secondCycle).size).toBe(20) // the reshuffle also deals every card once
  })

  it('never repeats within a cycle even when draws prefer a tier (module-tile draws)', () => {
    const cards = makeCards(18)
    const pile = createDrawPile(cards)
    const tiers = [1, 2, 3, undefined] // mixes tiered (module) and untiered (neutral tile) draws
    const firstCycle = Array.from({ length: 18 }, (_, i) => drawCard(pile, cards, tiers[i % tiers.length]).id)
    expect(new Set(firstCycle).size).toBe(18)
  })

  it('reshuffles into a different order at least once across many cycles (it is a real shuffle, not a fixed rotation)', () => {
    const cards = makeCards(10)
    const pile = createDrawPile(cards)
    const cycles = []
    for (let c = 0; c < 5; c++) {
      cycles.push(Array.from({ length: 10 }, () => drawCard(pile, cards).id).join(','))
    }
    expect(new Set(cycles).size).toBeGreaterThan(1)
  })

  it('a resumed pile (hydrated from a save) continues the same order instead of reshuffling', () => {
    const cards = makeCards(18)
    const pile = createDrawPile(cards)
    drawCard(pile, cards)
    drawCard(pile, cards)
    const saved = JSON.parse(JSON.stringify(pile)) // simulates a localStorage round-trip
    const restored = hydrateDrawPile(saved, cards)

    const nextFromOriginal = drawCard(pile, cards).id
    const nextFromRestored = drawCard(restored, cards).id
    expect(nextFromRestored).toBe(nextFromOriginal)
  })
})
