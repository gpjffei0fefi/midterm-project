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
                  {delta &&
                    (() => {
                      // A debit that landed on an axis already at 0 has
                      // nothing to show as a number (it moved by exactly 0),
                      // but it still gets its own marker rather than no
                      // indicator at all — otherwise a floored debit and "no
                      // change happened" look identical.
                      const atFloor = delta.amount === 0 && delta.flooredOut
                      return (
                        <span
                          key={delta.key}
                          className={`trust-row__delta trust-row__delta--${
                            atFloor ? 'floored' : delta.amount >= 0 ? 'positive' : 'negative'
                          }`}
                          title={atFloor ? 'Already at the minimum — this axis can’t drop further' : undefined}
                        >
                          {atFloor ? '±0' : delta.amount >= 0 ? `+${delta.amount}` : delta.amount}
                        </span>
                      )
                    })()}
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
