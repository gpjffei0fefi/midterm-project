function TrustPanel({ players, activePlayerId, trustDeltas }) {
  return (
    <div className="trust-panel">
      <div className="trust-panel__heading">
        <span className="trust-panel__title">Trust readouts</span>
      </div>
      <div className="trust-panel__rows">
        {players.map((player) => {
          const delta = trustDeltas?.[player.id]
          return (
            <div
              className={`trust-row${player.id === activePlayerId ? ' trust-row--active' : ''}`}
              key={player.id}
              style={{ '--token-color': player.color }}
            >
              <span className="trust-row__swatch" />
              <span className="trust-row__name">{player.name}</span>
              <div className="trust-row__meter">
                <div className="trust-row__fill" style={{ width: `${Math.min(100, player.trustScore)}%` }} />
              </div>
              <div className="trust-row__value-wrap">
                <span className="trust-row__value">{player.trustScore}</span>
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
          )
        })}
      </div>
    </div>
  )
}

export default TrustPanel
