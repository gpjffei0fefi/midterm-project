import { useState } from 'react'
import GameBoard from './components/GameBoard'
import QuizDeckSystem from './components/QuizDeckSystem'
import LeaderboardScreen from './components/LeaderboardScreen'
import StartScreen from './components/StartScreen'
import MechanicsScreen from './components/MechanicsScreen'
import NameEntry from './components/NameEntry'
import ResumePrompt from './components/ResumePrompt'
import { leaderboardEnabled } from './lib/leaderboard'
import { loadSavedGame, clearSavedGame } from './lib/saveGame'
import './App.css'

// Flow: start (Play) -> mechanics -> name entry -> game. A saved game found on
// load puts a "Resume your game?" prompt over the start screen.
function App() {
  const [savedGame, setSavedGame] = useState(loadSavedGame)
  const [stage, setStage] = useState(() => (savedGame ? 'resume' : 'start'))
  const [playerName, setPlayerName] = useState('')
  const [initialSave, setInitialSave] = useState(null)
  // Bumping the key remounts GameBoard, which resets all of its state.
  const [gameKey, setGameKey] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  function resume() {
    setInitialSave(savedGame)
    // Keep the saved human player's name so Play Again after a resume still uses it.
    setPlayerName(savedGame.players.find((p) => !p.isAI)?.name ?? '')
    setGameKey((k) => k + 1)
    setStage('game')
  }

  function startNewFromPrompt() {
    clearSavedGame()
    setSavedGame(null)
    setStage('start')
  }

  function startGame(name) {
    clearSavedGame()
    setPlayerName(name)
    setInitialSave(null)
    setGameKey((k) => k + 1)
    setStage('game')
  }

  // Play Again: straight into a fresh game, no reload, keeping the same name.
  function playAgain() {
    clearSavedGame()
    setInitialSave(null)
    setShowLeaderboard(false)
    setGameKey((k) => k + 1)
  }

  if (stage === 'game') {
    return (
      <div className="app">
        <GameBoard key={gameKey} playerName={playerName} initialSave={initialSave} onPlayAgain={playAgain} />
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

  if (stage === 'mechanics') return <MechanicsScreen onContinue={() => setStage('name')} />
  if (stage === 'name') return <NameEntry onStart={startGame} />

  return (
    <StartScreen onPlay={() => setStage('mechanics')}>
      {stage === 'resume' && <ResumePrompt onResume={resume} onStartNew={startNewFromPrompt} />}
    </StartScreen>
  )
}

export default App
