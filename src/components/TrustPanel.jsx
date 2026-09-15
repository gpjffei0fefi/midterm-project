const AXES = [
  { key: 'accuracy', label: 'ACC' },
  { key: 'fairness', label: 'FAIR' },
  { key: 'transparency', label: 'TRANS' },
]

function TrustPanel({ players, activePlayerId, trustDeltas }) {
  return (
    <div className="trust-panel">
      <div className="trust-panel__heading">
        <span className="trust-panel__title">Trust readouts</span>
      </div>
      <div className="trust-panel__rows">
        {players.map((player) => {
          const total = player.accuracy + player.fairness + player.transparency
          const delta = trustDeltas?.[player.id]
          return (
            <div
              className={`trust-player${player.id === activePlayerId ? ' trust-player--active' : ''}`}
              key={player.id}
              style={{ '--token-color': player.color }}
            >
              <div className="trust-player__header">
                <span className="trust-player__swatch" />
                <span className="trust-player__name">
                  {player.name}
                  {player.isAI && <span className="ai-tag">AI</span>}
                </span>
                <div className="trust-row__value-wrap">
                  <span className="trust-row__value">{total}</span>
                  {delta && (
                    <span
                      key={delta.key}
                      className={`trust-row__delta trust-row__delta--${delta.amount >= 0 ? 'positive' : 'negative'}`}
                    >
                      {delta.amount >= 0 ? `+${delta.amount}` : delta.amount}
                    </span>
                  )}
                </div>
              </div>
              <div className="trust-player__axes">
                {AXES.map(({ key, label }) => (
                  <div className="trust-axis" key={key} title={`${label}: ${player[key]}`}>
                    <span className="trust-axis__label">{label}</span>
                    <div className="trust-axis__meter">
                      <div
                        className={`trust-axis__fill trust-axis__fill--${key}`}
                        style={{ width: `${Math.min(100, Math.max(0, player[key]))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrustPanel
