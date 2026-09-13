import QuizCard from './QuizCard'

function QuizOverlay({ card, flipped, selectedOption, onSelectOption, onClose }) {
  return (
    <div className="quiz-overlay" onClick={onClose}>
      <div className="quiz-overlay__content" onClick={(e) => e.stopPropagation()}>
        <QuizCard
          card={card}
          flipped={flipped}
          selectedOption={selectedOption}
          onSelectOption={onSelectOption}
        />
        <button type="button" className="quiz-overlay__close" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}

export default QuizOverlay
