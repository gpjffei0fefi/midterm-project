import { useState } from 'react'
import GameBoard from './components/GameBoard'
import QuizDeckSystem from './components/QuizDeckSystem'
import LeaderboardScreen from './components/LeaderboardScreen'
import { leaderboardEnabled } from './lib/leaderboard'
import './App.css'

function App() {
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  return (
    <div className="app">
      <GameBoard />
      <QuizDeckSystem />
      {leaderboardEnabled && (
        <button type="button" className="leaderboard-open" onClick={() => setShowLeaderboard(true)}>
          View leaderboard
        </button>
      )}
      {showLeaderboard && <LeaderboardScreen onClose={() => setShowLeaderboard(false)} />}
    </div>
  )
}

export default App
