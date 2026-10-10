import { useMemo, useState } from 'react'
import GameBoard from './components/GameBoard'
import QuizDeckSystem from './components/QuizDeckSystem'
import LeaderboardScreen from './components/LeaderboardScreen'
import StartScreen from './components/StartScreen'
import MechanicsScreen from './components/MechanicsScreen'
import StartMenu from './components/StartMenu'
import PlayerCountScreen from './components/PlayerCountScreen'
import LocalSetup from './components/LocalSetup'
import AiSetup from './components/AiSetup'
import HardSetup from './components/HardSetup'
import OnlineSetup from './components/OnlineSetup'
import ResumePrompt from './components/ResumePrompt'
import { buildPlayers } from './data/boardData'
import { buildLocalSeats, buildAiModeSeats, buildHardModeSeats } from './data/seatBuilders'
import { MIN_PLAYERS } from './data/gameRules'
import { leaderboardEnabled } from './lib/leaderboard'
import { loadSavedGame, clearSavedGame } from './lib/saveGame'
import './App.css'

// Flow: start (Play) -> mechanics -> mode select -> mode-specific setup ->
// game. A saved game found on load puts a "Resume your game?" prompt over
// the start screen. Every setup field lives in this component's own state
// (never reset by a Back navigation, only by starting a fresh flow from
// Start Menu), so going Back and forward again keeps whatever was chosen.
function App() {
  const [savedGame, setSavedGame] = useState(loadSavedGame)
  const [stage, setStage] = useState(() => (savedGame ? 'resume' : 'start'))
  const [initialSave, setInitialSave] = useState(null)
  // Bumping the key remounts GameBoard, which resets all of its state.
  const [gameKey, setGameKey] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const [mode, setMode] = useState(null)
  const [playerCount, setPlayerCount] = useState(MIN_PLAYERS)
  const [localNames, setLocalNames] = useState(Array(MIN_PLAYERS).fill(''))
  const [localTokens, setLocalTokens] = useState([0, 1, 2, 3].slice(0, MIN_PLAYERS))
  const [humanName, setHumanName] = useState('')
  // The seats that produced the current game, so Play Again can rebuild an
  // identical fresh roster (reset trust/position, same AI tiers/colors)
  // without re-running setup.
  const [seats, setSeats] = useState(null)

  // Deliberately keyed on gameKey too: Play Again bumps gameKey without
  // changing `seats`, and that's exactly when a fresh roster (reset trust,
  // position, laps) needs to be rebuilt from the same seats.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gamePlayers = useMemo(() => (seats ? buildPlayers(seats) : null), [seats, gameKey])

  function resume() {
    setInitialSave(savedGame)
    setGameKey((k) => k + 1)
    setStage('game')
  }

  function startNewFromPrompt() {
    clearSavedGame()
    setSavedGame(null)
    setStage('start')
  }

  function enterGame(nextSeats) {
    clearSavedGame()
    setInitialSave(null)
    setSeats(nextSeats)
    setGameKey((k) => k + 1)
    setStage('game')
  }

  function resizeTo(array, count, fill) {
    const next = array.slice(0, count)
    while (next.length < count) next.push(fill(next.length))
    return next
  }

  function handleModeSelect(selectedMode) {
    setMode(selectedMode)
    if (selectedMode === 'hard') {
      setStage('hardSetup')
    } else if (selectedMode === 'online') {
      setStage('onlineCount')
    } else {
      setStage('count')
    }
  }

  function handleCountContinue() {
    if (mode === 'local') {
      setLocalNames((names) => resizeTo(names, playerCount, () => ''))
      setLocalTokens((tokens) => resizeTo(tokens, playerCount, (i) => i))
      setStage('localSetup')
    } else {
      setStage('aiSetup')
    }
  }

  // Play Again: straight into a fresh game, no reload, same seats as before.
  function playAgain() {
    clearSavedGame()
    setInitialSave(null)
    setShowLeaderboard(false)
    setGameKey((k) => k + 1)
  }

  if (stage === 'game') {
    return (
      <div className="app">
        <GameBoard
          key={gameKey}
          players={gamePlayers}
          initialSave={initialSave}
          onPlayAgain={playAgain}
        />
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

  if (stage === 'mechanics') return <MechanicsScreen onContinue={() => setStage('modeSelect')} />

  if (stage === 'modeSelect') {
    return <StartMenu onSelect={handleModeSelect} onBack={() => setStage('mechanics')} />
  }

  if (stage === 'count') {
    return (
      <PlayerCountScreen
        mode={mode}
        count={playerCount}
        onChange={setPlayerCount}
        onBack={() => setStage('modeSelect')}
        onContinue={handleCountContinue}
      />
    )
  }

  if (stage === 'localSetup') {
    return (
      <LocalSetup
        names={localNames}
        tokens={localTokens}
        onNamesChange={setLocalNames}
        onTokensChange={setLocalTokens}
        onBack={() => setStage('count')}
        onStart={(names) => enterGame(buildLocalSeats(names, localTokens))}
      />
    )
  }

  if (stage === 'aiSetup') {
    return (
      <AiSetup
        aiCount={playerCount - 1}
        name={humanName}
        onNameChange={setHumanName}
        onBack={() => setStage('count')}
        onStart={(name) => enterGame(buildAiModeSeats(name, playerCount - 1))}
      />
    )
  }

  if (stage === 'hardSetup') {
    return (
      <HardSetup
        name={humanName}
        onNameChange={setHumanName}
        onBack={() => setStage('modeSelect')}
        onStart={(name) => enterGame(buildHardModeSeats(name))}
      />
    )
  }

  if (stage === 'onlineCount') {
    return (
      <PlayerCountScreen
        mode="online"
        count={playerCount}
        onChange={setPlayerCount}
        onBack={() => setStage('modeSelect')}
        onContinue={() => setStage('onlineRoom')}
      />
    )
  }

  if (stage === 'onlineRoom') {
    return <OnlineSetup playerCount={playerCount} onBack={() => setStage('onlineCount')} />
  }

  return (
    <StartScreen onPlay={() => setStage('mechanics')}>
      {stage === 'resume' && <ResumePrompt onResume={resume} onStartNew={startNewFromPrompt} />}
    </StartScreen>
  )
}

export default App
