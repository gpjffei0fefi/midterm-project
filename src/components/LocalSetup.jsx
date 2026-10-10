import TokenPicker from './TokenPicker'

const MAX_NAME_LENGTH = 16

// names/tokens: arrays already sized to `count` by App.jsx, so going Back
// and returning keeps whatever was typed/picked.
function LocalSetup({ names, tokens, onNamesChange, onTokensChange, onBack, onStart }) {
  function handleNameChange(i, value) {
    const next = [...names]
    next[i] = value
    onNamesChange(next)
  }

  function handleTokenChange(i, colorIndex) {
    const next = [...tokens]
    next[i] = colorIndex
    onTokensChange(next)
  }

  function handleSubmit(event) {
    event.preventDefault()
    onStart(names.map((n, i) => n.trim() || `Player ${i + 1}`))
  }

  return (
    <div className="intro">
      <form className="intro__panel intro__panel--local" onSubmit={handleSubmit}>
        <h1 className="intro__title intro__title--small">Names and tokens</h1>
        <p className="intro__lead">Everyone plays on this device — pass it around on your turn.</p>
        <div className="local-seats">
          {names.map((name, i) => (
            <div className="local-seat" key={i}>
              <label className="intro__field">
                <span className="intro__label">Player {i + 1}</span>
                <input
                  className="intro__input"
                  type="text"
                  value={name}
                  maxLength={MAX_NAME_LENGTH}
                  placeholder={`Player ${i + 1}`}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  autoFocus={i === 0}
                />
              </label>
              <TokenPicker
                label={`Player ${i + 1}'s token`}
                value={tokens[i]}
                onChange={(colorIndex) => handleTokenChange(i, colorIndex)}
                takenByOthers={tokens.filter((_, j) => j !== i)}
              />
            </div>
          ))}
        </div>
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

export default LocalSetup
