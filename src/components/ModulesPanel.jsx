import ModuleIcon from './ModuleIcon'

function ModulesPanel({ players, ownedByPlayer, registerPanelRef }) {
  return (
    <div className="modules-panel">
      {players.map((player) => (
        <div className="modules-panel__column" key={player.id}>
          <div className="modules-panel__player">
            <span className="modules-panel__swatch" style={{ '--token-color': player.color }} />
            <span className="modules-panel__name">
              {player.name}
              {player.isAI && <span className="ai-tag">AI</span>}
            </span>
          </div>
          <div className="modules-panel__chips" ref={registerPanelRef(player.id)}>
            {ownedByPlayer[player.id].length === 0 ? (
              <span className="modules-panel__empty">No modules yet</span>
            ) : (
              ownedByPlayer[player.id].map((mod) => (
                <span
                  key={mod.id}
                  className={`module-chip module-chip--${mod.state}${mod.ethicsWeight > 0 ? ' module-chip--responsible' : ' module-chip--performance'}`}
                  title={`${mod.label}, ${mod.state}`}
                >
                  <span className="module-chip__icon">
                    <ModuleIcon label={mod.label} ethicsWeight={mod.ethicsWeight} state={mod.state} />
                  </span>
                  {mod.code}
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ModulesPanel
