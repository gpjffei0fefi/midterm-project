import Dice from './Dice'

function ControlPanel({ activePlayer, diceValue, isRolling, isMoving, onRoll }) {
  const busy = isRolling || isMoving
  const buttonLabel = isRolling ? 'Rolling…' : isMoving ? 'Moving…' : 'Roll'

  return (
    <div className="control-panel">
      <div className="control-panel__turn">
        <span className="control-panel__swatch" style={{ '--token-color': activePlayer.color }} />
        <span className="control-panel__turn-text">{activePlayer.name}'s turn</span>
      </div>
      <Dice value={diceValue} rolling={isRolling} />
      <button
        type="button"
        className="roll-button"
        onClick={onRoll}
        disabled={busy}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

export default ControlPanel
