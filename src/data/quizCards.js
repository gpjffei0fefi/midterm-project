const CARDS_PER_DECK = 18

function buildDeck(deckName) {
  return Array.from({ length: CARDS_PER_DECK }, (_, i) => {
    const number = i + 1
    return {
      id: `${deckName}-${String(number).padStart(2, '0')}`,
      deck: deckName,
      difficultyTier: (i % 3) + 1,
      prompt: '',
      options: ['', '', '', ''],
      correctIndex: null,
    }
  })
}

export const MATH_CARDS = buildDeck('math')
export const ETHICS_CARDS = buildDeck('ethics')

export const DECKS = {
  math: MATH_CARDS,
  ethics: ETHICS_CARDS,
}
