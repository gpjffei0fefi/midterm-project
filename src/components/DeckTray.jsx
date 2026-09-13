import { MATH_CARDS, ETHICS_CARDS } from '../data/quizCards'

function DeckTray({ onDraw, disabled }) {
  return (
    <div className="deck-tray">
      <button
        type="button"
        className="deck-stack deck-stack--math"
        onClick={() => onDraw('math')}
        disabled={disabled}
      >
        <span className="deck-stack__label">Math Deck</span>
        <span className="deck-stack__count">{MATH_CARDS.length} cards</span>
      </button>

      <button
        type="button"
        className="deck-stack deck-stack--ethics"
        onClick={() => onDraw('ethics')}
        disabled={disabled}
      >
        <span className="deck-stack__label">Ethics Deck</span>
        <span className="deck-stack__count">{ETHICS_CARDS.length} cards</span>
      </button>
    </div>
  )
}

export default DeckTray
