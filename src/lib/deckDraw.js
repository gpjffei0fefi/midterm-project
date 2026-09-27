// Draws cards from a deck (Math or Ethics) without repeats: the deck is
// shuffled once and dealt through card by card, and only once every card in
// it has been drawn does it reshuffle and start again. One draw pile per
// deck is tracked (in GameBoard, via a ref) — not per tile and not per turn —
// so a module-acquisition draw, a follow-up draw, and a neutral Ethics/Math
// tile draw all pull from the same sequence for that deck.
function shuffle(array) {
  const a = array.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function createDrawPile(cards) {
  return { queue: shuffle(cards.map((c) => c.id)), pos: 0 }
}

// Rebuilds a pile from a saved { queue, pos }. Ids that no longer exist in
// the current deck (e.g. the CSV changed between sessions) are dropped; if
// that leaves nothing usable, a fresh pile is dealt instead.
export function hydrateDrawPile(saved, cards) {
  const validIds = new Set(cards.map((c) => c.id))
  const queue = Array.isArray(saved?.queue) ? saved.queue.filter((id) => validIds.has(id)) : []
  if (queue.length === 0) return createDrawPile(cards)
  const pos = Number.isInteger(saved?.pos) && saved.pos >= 0 && saved.pos <= queue.length ? saved.pos : queue.length
  return { queue, pos }
}

// Draws the next card from `pile` (mutating it in place — piles live in a
// ref, not React state, since draw order doesn't need to trigger a render).
// With `preferTier`, the next remaining card matching that tier is drawn
// instead of strictly the next one in the shuffled order, so module tiles
// still usually get a difficulty-appropriate card; if none of the remaining
// cards match, the next card in order is drawn regardless of its tier — it's
// never skipped, since every card still has to be dealt before a reshuffle.
export function drawCard(pile, cards, preferTier) {
  if (pile.pos >= pile.queue.length) {
    pile.queue = shuffle(cards.map((c) => c.id))
    pile.pos = 0
  }
  const byId = (id) => cards.find((c) => c.id === id)
  if (preferTier != null) {
    for (let i = pile.pos; i < pile.queue.length; i++) {
      if (byId(pile.queue[i])?.difficultyTier === preferTier) {
        ;[pile.queue[i], pile.queue[pile.pos]] = [pile.queue[pile.pos], pile.queue[i]]
        break
      }
    }
  }
  const id = pile.queue[pile.pos]
  pile.pos += 1
  return byId(id)
}
