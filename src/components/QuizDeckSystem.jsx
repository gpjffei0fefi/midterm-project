import { useState } from 'react'
import { DECKS } from '../data/quizCards'
import DeckTray from './DeckTray'
import QuizOverlay from './QuizOverlay'

const FLIP_DELAY_MS = 350

function drawRandomCard(deckKey) {
  const deck = DECKS[deckKey]
  return deck[Math.floor(Math.random() * deck.length)]
}

function QuizDeckSystem() {
  const [activeCard, setActiveCard] = useState(null)
  const [flipped, setFlipped] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)

  function handleDraw(deckKey) {
    setActiveCard(drawRandomCard(deckKey))
    setFlipped(false)
    setSelectedOption(null)
    setTimeout(() => setFlipped(true), FLIP_DELAY_MS)
  }

  function handleClose() {
    setActiveCard(null)
    setFlipped(false)
    setSelectedOption(null)
  }

  return (
    <div className="quiz-deck-system">
      <DeckTray onDraw={handleDraw} disabled={activeCard !== null} />

      {activeCard && (
        <QuizOverlay
          card={activeCard}
          flipped={flipped}
          selectedOption={selectedOption}
          onSelectOption={setSelectedOption}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

export default QuizDeckSystem
