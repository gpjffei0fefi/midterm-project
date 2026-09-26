import { useState } from 'react'

const MAX_NAME_LENGTH = 16

function NameEntry({ onStart }) {
  const [name, setName] = useState('')

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
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </label>
        <button type="submit" className="intro__button">
          Start game
        </button>
      </form>
    </div>
  )
}

export default NameEntry
