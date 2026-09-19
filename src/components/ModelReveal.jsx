import { useEffect, useMemo, useState } from 'react'
import { leaderboardEnabled } from '../lib/leaderboard'
import PlayerCreature from './PlayerCreature'
import SubmitScore from './SubmitScore'
import LeaderboardScreen from './LeaderboardScreen'

const MODULE_SNAP_MS = 380
const STATS_REVEAL_DELAY_MS = 250
const PLAYER_PAUSE_MS = 650
const WINNER_DELAY_MS = 600

const AXES = [
  { key: 'accuracy', label: 'ACC' },
  { key: 'fairness', label: 'FAIR' },
  { key: 'transparency', label: 'TRANS' },
]

function totalTrust(player) {
  return player.accuracy + player.fairness + player.transparency
}

function ModelReveal({ players, ownedByPlayer }) {
  // Reveal order: lowest Trust Score first, winner revealed last.
  const ranking = useMemo(
    () => [...players].sort((a, b) => totalTrust(a) - totalTrust(b)).map((p) => p.id),
    [players]
  )
  const winnerId = ranking[ranking.length - 1]

  const [playerIndex, setPlayerIndex] = useState(0)
  const [moduleCount, setModuleCount] = useState(0)
  const [revealedStats, setRevealedStats] = useState({})
  const [showWinner, setShowWinner] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [submittedRow, setSubmittedRow] = useState(null)

  const humanPlayer = players.find((p) => !p.isAI)
  const currentId = playerIndex < ranking.length ? ranking[playerIndex] : null
  const currentModuleTotal = currentId ? (ownedByPlayer[currentId] || []).length : 0

  // Snap the active player's modules into place one at a time.
  useEffect(() => {
    if (!currentId || moduleCount >= currentModuleTotal) return
    const timer = setTimeout(() => setModuleCount((c) => c + 1), MODULE_SNAP_MS)
    return () => clearTimeout(timer)
  }, [currentId, moduleCount, currentModuleTotal])

  // Once all pieces are placed, reveal that player's Trust Score.
  useEffect(() => {
    if (!currentId || moduleCount < currentModuleTotal || revealedStats[currentId]) return
    const timer = setTimeout(() => {
      setRevealedStats((prev) => ({ ...prev, [currentId]: true }))
    }, STATS_REVEAL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [currentId, moduleCount, currentModuleTotal, revealedStats])

  // After a beat, move on to the next player.
  useEffect(() => {
    if (!currentId || !revealedStats[currentId]) return
    const timer = setTimeout(() => {
      setPlayerIndex((i) => i + 1)
      setModuleCount(0)
    }, PLAYER_PAUSE_MS)
    return () => clearTimeout(timer)
  }, [currentId, revealedStats])

  // Once every player has been revealed, highlight the winner.
  useEffect(() => {
    if (playerIndex < ranking.length) return
    const timer = setTimeout(() => setShowWinner(true), WINNER_DELAY_MS)
    return () => clearTimeout(timer)
  }, [playerIndex, ranking.length])

  function statusFor(playerId) {
    const orderIdx = ranking.indexOf(playerId)
    if (orderIdx < playerIndex) return 'done'
    if (orderIdx === playerIndex) return 'active'
    return 'pending'
  }

  return (
    <div className="model-reveal">
      <div className="model-reveal__content">
        <div className="model-reveal__header">
          <span className="model-reveal__eyebrow">Game over — every module has an owner</span>
          <h1 className="model-reveal__title">Model Reveal</h1>
        </div>

        <div className="model-reveal__players">
          {players.map((player) => {
            const status = statusFor(player.id)
            const modules = ownedByPlayer[player.id] || []
            const revealedCount =
              status === 'done' ? modules.length : status === 'active' ? moduleCount : 0
            const statsVisible = status === 'done' || revealedStats[player.id]
            const isWinner = showWinner && player.id === winnerId

            return (
              <div
                key={player.id}
                className={`reveal-card reveal-card--${status}${isWinner ? ' reveal-card--winner' : ''}`}
                style={{ '--token-color': player.color }}
              >
                {isWinner && <span className="reveal-card__badge">Winner</span>}

                <div className="reveal-card__header">
                  <span className="reveal-card__swatch" />
                  <span className="reveal-card__name">
                    {player.name}
                    {player.isAI && <span className="ai-tag">AI</span>}
                  </span>
                </div>

                <div className="reveal-card__creature">
                  <PlayerCreature modules={modules} revealedCount={revealedCount} />
                </div>

                <div className="reveal-card__stats">
                  {statsVisible ? (
                    <>
                      <div className="reveal-card__total">{totalTrust(player)}</div>
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
                    </>
                  ) : (
                    <span className="reveal-card__pending">Awaiting reveal…</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {showWinner && leaderboardEnabled && (
          <div className="reveal-actions">
            {humanPlayer && !submittedRow && (
              <SubmitScore
                player={humanPlayer}
                onSubmitted={(row) => {
                  setSubmittedRow(row)
                  setShowLeaderboard(true)
                }}
              />
            )}
            <button type="button" className="reveal-actions__button" onClick={() => setShowLeaderboard(true)}>
              View leaderboard
            </button>
          </div>
        )}
      </div>

      {showLeaderboard && (
        <LeaderboardScreen highlightId={submittedRow?.id} onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  )
}

export default ModelReveal
