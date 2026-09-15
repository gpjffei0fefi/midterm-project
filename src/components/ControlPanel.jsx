import Dice from './Dice'

function ControlPanel({ activePlayer, diceValue, isRolling, isMoving, onRoll }) {
  const busy = isRolling || isMoving
  const buttonLabel = isRolling ? 'Rolling…' : isMoving ? 'Moving…' : activePlayer.isAI ? 'AI turn…' : 'Roll'

  return (
    <div className="control-panel">
      <div className="control-panel__turn">
        <span className="control-panel__swatch" style={{ '--token-color': activePlayer.color }} />
        <span className="control-panel__turn-text">
          {activePlayer.name}
          {activePlayer.isAI && <span className="control-panel__ai-tag">AI</span>}
          {"'s turn"}
        </span>
      </div>
      <Dice value={diceValue} rolling={isRolling} />
      <button
        type="button"
        className="roll-button"
        onClick={onRoll}
        disabled={busy || activePlayer.isAI}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

export default ControlPanel
