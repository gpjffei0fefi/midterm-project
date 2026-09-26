const DECK_NAMES = {
  math: 'Math',
  ethics: 'Ethics',
}

function QuizCard({ card, flipped, selectedOption, onSelectOption, resolution, interactive = true }) {
  const deckLabel = DECK_NAMES[card.deck]
  const locked = resolution != null || !interactive

  return (
    <div className="quiz-card-scene">
      <div
        className={`quiz-card quiz-card--${card.deck}${flipped ? ' quiz-card--flipped' : ''}${resolution ? ` quiz-card--${resolution}` : ''}`}
      >
        <div className="quiz-card__face quiz-card__face--back">
          <span className="quiz-card__back-mark">{deckLabel}</span>
          <span className="quiz-card__back-sub">Deck</span>
        </div>

        <div className="quiz-card__face quiz-card__face--front">
          <div className="quiz-card__header">
            <span className="quiz-card__id">{card.id}</span>
            <span className="quiz-card__tier">Tier {card.difficultyTier}</span>
          </div>

          <div className="quiz-card__prompt">
            <span>{card.prompt}</span>
          </div>

          <div className={`quiz-card__options${locked ? ' quiz-card__options--locked' : ''}`}>
            {card.options.map((option, i) => {
              const isSelected = selectedOption === i
              const optionState = isSelected
                ? resolution === 'wrong'
                  ? 'wrong'
                  : resolution === 'correct'
                    ? 'correct'
                    : 'selected'
                : ''
              return (
                <button
                  key={i}
                  type="button"
                  className={`quiz-card__option${optionState ? ` quiz-card__option--${optionState}` : ''}`}
                  onClick={() => onSelectOption(i)}
                  disabled={locked}
                >
                  <span className="quiz-card__option-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="quiz-card__option-text">{option}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizCard
