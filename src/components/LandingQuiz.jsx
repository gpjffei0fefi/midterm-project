import QuizCard from './QuizCard'

function LandingQuiz({ quiz, onSelectOption }) {
  const { card, flipped, selectedOption, resolution, resultLabel } = quiz

  return (
    <div className="quiz-overlay">
      <div className="quiz-overlay__content">
        <QuizCard
          card={card}
          flipped={flipped}
          selectedOption={selectedOption}
          onSelectOption={onSelectOption}
          resolution={resolution}
        />
        {resultLabel && (
          <div className={`quiz-outcome quiz-outcome--${resolution}`}>{resultLabel}</div>
        )}
      </div>
    </div>
  )
}

export default LandingQuiz
