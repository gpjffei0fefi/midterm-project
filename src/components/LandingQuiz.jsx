import QuizCard from './QuizCard'

function LandingQuiz({ quiz, onSelectOption }) {
  const {
    card,
    flipped,
    selectedOption,
    resolution,
    resultLabel,
    isAI,
    usesAgent,
    agentQueries,
    agentSources,
    agentReasoning,
    agentNote,
  } = quiz
  const hasSearched = usesAgent && agentQueries?.length > 0

  return (
    <div className="quiz-overlay">
      <div className="quiz-overlay__content">
        <QuizCard
          card={card}
          flipped={flipped}
          selectedOption={selectedOption}
          onSelectOption={onSelectOption}
          resolution={resolution}
          interactive={!isAI}
        />
        {usesAgent && flipped && (
          <div className="agent-evidence">
            {!resultLabel && !hasSearched && (
              <div className="quiz-outcome quiz-outcome--thinking">Opponent is thinking…</div>
            )}
            {hasSearched && (
              <div className="agent-evidence__chip">
                Searched: “{agentQueries[0]}”
                {agentSources?.length > 0 && (
                  <span className="agent-evidence__sources">
                    {agentSources.map((s, i) => (
                      <a key={s.url ?? i} href={s.url} target="_blank" rel="noreferrer">
                        {s.title ?? s.url}
                      </a>
                    ))}
                  </span>
                )}
              </div>
            )}
            {agentNote && <div className="agent-evidence__note">{agentNote}</div>}
            {resultLabel && agentReasoning && <div className="agent-evidence__reasoning">“{agentReasoning}”</div>}
          </div>
        )}
        {resultLabel ? (
          <div className={`quiz-outcome quiz-outcome--${resolution}`}>{resultLabel}</div>
        ) : (
          !usesAgent && isAI && flipped && <div className="quiz-outcome quiz-outcome--thinking">AI is answering…</div>
        )}
      </div>
    </div>
  )
}

export default LandingQuiz
