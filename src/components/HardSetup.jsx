const MAX_NAME_LENGTH = 16

function HardSetup({ name, onNameChange, onBack, onStart }) {
  function handleSubmit(event) {
    event.preventDefault()
    onStart(name.trim() || 'Player 1')
  }

  return (
    <div className="intro">
      <form className="intro__panel intro__panel--name" onSubmit={handleSubmit}>
        <h1 className="intro__title intro__title--small">What should we call you?</h1>
        <label className="intro__field">
          <span className="intro__label">Your name</span>
          <input
            className="intro__input"
            type="text"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Player 1"
            onChange={(e) => onNameChange(e.target.value)}
            autoFocus
          />
        </label>
        <p className="intro__lead">
          One opponent, no mercy — Hard Mode's AI can search the web for itself before
          answering. If it ever can't reach the search agent, it falls back to a tough
          coin-flip AI so the game keeps moving.
        </p>
        <div className="intro__actions">
          <button type="button" className="intro__button intro__button--ghost" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="intro__button">
            Start game
          </button>
        </div>
      </form>
    </div>
  )
}

export default HardSetup
