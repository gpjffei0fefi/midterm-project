import { useState } from 'react'
import { MAX_NAME_LENGTH, normalizeName, submitScore } from '../lib/leaderboard'

function SubmitScore({ player, onSubmitted }) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState('idle')
  const total = player.accuracy + player.fairness + player.transparency
  const sending = status === 'sending'

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanName = normalizeName(name)
    if (!cleanName || sending) return
    setStatus('sending')
    try {
      const row = await submitScore({
        name: cleanName,
        accuracy: player.accuracy,
        fairness: player.fairness,
        transparency: player.transparency,
      })
      onSubmitted(row)
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="submit-score" onSubmit={handleSubmit}>
      <p className="submit-score__prompt">
        Your final Trust Score is <strong>{total}</strong>. Add it to the leaderboard?
      </p>
      <div className="submit-score__row">
        <label className="submit-score__label" htmlFor="submit-score-name">
          Your name
        </label>
        <input
          id="submit-score-name"
          className="submit-score__input"
          type="text"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="nickname"
          onChange={(event) => setName(event.target.value)}
        />
        <button className="submit-score__button" type="submit" disabled={sending || !normalizeName(name)}>
          {sending ? 'Submitting…' : 'Submit score'}
        </button>
      </div>
      {status === 'error' && (
        <p className="submit-score__error" role="alert">
          Couldn't submit your score. Check your connection and try again.
        </p>
      )}
    </form>
  )
}

export default SubmitScore
