import { useEffect, useState } from 'react'
import { fetchTopScores, LEADERBOARD_SIZE } from '../lib/leaderboard'

const AXES = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'fairness', label: 'Fairness' },
  { key: 'transparency', label: 'Transparency' },
]

function LeaderboardScreen({ onClose, highlightId }) {
  const [status, setStatus] = useState('loading')
  const [rows, setRows] = useState([])
  const [reloadKey, setReloadKey] = useState(0)

  function reload() {
    setStatus('loading')
    setReloadKey((k) => k + 1)
  }

  // Fetches on open and on every refresh, so each visit shows current scores.
  useEffect(() => {
    let ignore = false
    fetchTopScores()
      .then((data) => {
        if (ignore) return
        setRows(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!ignore) setStatus('error')
      })
    return () => {
      ignore = true
    }
  }, [reloadKey])

  // Keep the page behind the dialog from scrolling while it's open.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="leaderboard-screen" role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
      <div className="leaderboard">
        <div className="leaderboard__header">
          <div>
            <h2 className="leaderboard__title" id="leaderboard-title">
              Leaderboard
            </h2>
            <p className="leaderboard__subtitle">Top {LEADERBOARD_SIZE} final Trust Scores</p>
          </div>
          <div className="leaderboard__actions">
            <button type="button" className="leaderboard__button" onClick={reload} disabled={status === 'loading'}>
              Refresh
            </button>
            <button type="button" className="leaderboard__button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="leaderboard__legend" aria-hidden="true">
          {AXES.map(({ key, label }) => (
            <span className="leaderboard__legend-item" key={key}>
              <span className={`leaderboard__legend-swatch trust-axis__fill--${key}`} />
              {label}
            </span>
          ))}
        </div>

        {status === 'loading' && <p className="leaderboard__message">Loading scores…</p>}

        {status === 'error' && (
          <div className="leaderboard__message" role="alert">
            <p>Couldn't load the leaderboard. Check your connection and try again.</p>
            <button type="button" className="leaderboard__button" onClick={reload}>
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && rows.length === 0 && (
          <p className="leaderboard__message">No scores yet. Finish a game to post the first one.</p>
        )}

        {status === 'ready' && rows.length > 0 && (
          <ol className="leaderboard__list">
            {rows.map((row, index) => (
              <li
                key={row.id}
                className={`leaderboard__row${row.id === highlightId ? ' leaderboard__row--you' : ''}`}
              >
                <span className="leaderboard__rank">{index + 1}</span>
                <span className="leaderboard__name">{row.name}</span>
                <span
                  className="leaderboard__bars"
                  title={AXES.map(({ key, label }) => `${label} ${row[key]}`).join(', ')}
                >
                  {AXES.map(({ key }) => (
                    <span className="leaderboard__bar" key={key}>
                      <span
                        className={`trust-axis__fill trust-axis__fill--${key}`}
                        style={{ width: `${Math.min(100, Math.max(0, row[key]))}%` }}
                      />
                    </span>
                  ))}
                </span>
                <span className="leaderboard__total">{row.total}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export default LeaderboardScreen
