import { useEffect, useRef, useState } from 'react'
import { TILES, INITIAL_PLAYERS } from '../data/boardData'
import { DECKS } from '../data/quizCards'
import {
  MODULE_ACCURACY_BONUS,
  MODULE_AXIS_BONUS,
  ACQUIRE_WRONG_PENALTY,
  FOLLOWUP_WRONG_PENALTY,
  NEUTRAL_BONUS,
  NEUTRAL_PENALTY,
  LANDING_FEE_MULTIPLIER,
  AI_CORRECT_PROBABILITY_BY_TIER,
} from '../data/gameRules'
import {
  ROLL_TICK_MS,
  ROLL_DURATION_MS,
  STEP_PAUSE_MS,
  LANDING_GLOW_MS,
  FLIP_DELAY_MS,
  RESOLUTION_DISPLAY_MS,
  FLY_DURATION_MS,
  TRUST_DELTA_DISPLAY_MS,
  AI_TURN_START_DELAY_MS,
  AI_THINK_MS,
} from '../constants/timing'
import { sleep } from '../utils/sleep'
import Tile from './Tile'
import TrustPanel from './TrustPanel'
import ControlPanel from './ControlPanel'
import ModulesPanel from './ModulesPanel'
import LandingQuiz from './LandingQuiz'
import FlyingModuleChip from './FlyingModuleChip'
import ModelReveal from './ModelReveal'

function randomFace() {
  return 1 + Math.floor(Math.random() * 6)
}

function initialModuleState() {
  return Object.fromEntries(
    TILES.filter((t) => t.type === 'module').map((t) => [t.id, { owner: null, state: 'clean' }])
  )
}

function drawCardForTile(tile) {
  const deck = DECKS[tile.deckKey]
  const pool = deck.filter((c) => c.difficultyTier === tile.difficultyTier)
  const source = pool.length > 0 ? pool : deck
  return source[Math.floor(Math.random() * source.length)]
}

// AI opponents don't reason about the question — just a weighted coin flip
// keyed by the card's difficulty tier.
function rollAICorrectness(tier) {
  const probability = AI_CORRECT_PROBABILITY_BY_TIER[tier] ?? 0.5
  return Math.random() < probability
}

function GameBoard() {
  const [players, setPlayers] = useState(INITIAL_PLAYERS)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceValue, setDiceValue] = useState(1)
  const [isRolling, setIsRolling] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [landingTileId, setLandingTileId] = useState(null)
  const [moduleState, setModuleState] = useState(initialModuleState)
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [flyingModule, setFlyingModule] = useState(null)
  const [trustDeltas, setTrustDeltas] = useState({})
  const [gameOver, setGameOver] = useState(false)

  const tileRefs = useRef(new Map())
  const tileRefCallbacks = useRef({})
  const panelRefs = useRef(new Map())
  const panelRefCallbacks = useRef({})
  const quizResolverRef = useRef(null)

  const activePlayer = players[currentPlayerIndex]

  function isAIPlayer(playerId) {
    return players.find((p) => p.id === playerId)?.isAI ?? false
  }

  function registerTileRef(tileId) {
    if (!tileRefCallbacks.current[tileId]) {
      tileRefCallbacks.current[tileId] = (node) => {
        if (node) tileRefs.current.set(tileId, node)
        else tileRefs.current.delete(tileId)
      }
    }
    return tileRefCallbacks.current[tileId]
  }

  function registerPanelRef(playerId) {
    if (!panelRefCallbacks.current[playerId]) {
      panelRefCallbacks.current[playerId] = (node) => {
        if (node) panelRefs.current.set(playerId, node)
        else panelRefs.current.delete(playerId)
      }
    }
    return panelRefCallbacks.current[playerId]
  }

  // deltas: partial { accuracy?, fairness?, transparency? } — applies each
  // axis independently (clamped at 0) and pops a single floating indicator
  // showing the net change to the player's total Trust Score.
  function applyAxisChange(playerId, deltas) {
    let netDelta = 0
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== playerId) return p
        const next = { ...p }
        for (const axis of ['accuracy', 'fairness', 'transparency']) {
          if (deltas[axis]) {
            const clamped = Math.max(0, p[axis] + deltas[axis])
            netDelta += clamped - p[axis]
            next[axis] = clamped
          }
        }
        return next
      })
    )
    if (netDelta === 0) return
    const key = `${playerId}-${Date.now()}-${Math.random()}`
    setTrustDeltas((prev) => ({ ...prev, [playerId]: { amount: netDelta, key } }))
    setTimeout(() => {
      setTrustDeltas((prev) => {
        if (prev[playerId]?.key !== key) return prev
        const next = { ...prev }
        delete next[playerId]
        return next
      })
    }, TRUST_DELTA_DISPLAY_MS)
  }

  function presentQuiz(card, describeResult, isAI = false) {
    return new Promise((resolve) => {
      quizResolverRef.current = resolve
      setActiveQuiz({
        card,
        flipped: false,
        selectedOption: null,
        resolution: null,
        resultLabel: null,
        describeResult,
        isAI,
      })
      setTimeout(() => {
        setActiveQuiz((q) => (q ? { ...q, flipped: true } : q))
        if (isAI) {
          setTimeout(() => {
            const optionIndex = Math.floor(Math.random() * card.options.length)
            const isCorrect =
              card.correctIndex === null
                ? rollAICorrectness(card.difficultyTier)
                : optionIndex === card.correctIndex
            finishQuiz(optionIndex, isCorrect, describeResult)
          }, AI_THINK_MS)
        }
      }, FLIP_DELAY_MS)
    })
  }

  function finishQuiz(index, isCorrect, describeResult) {
    const resultLabel = describeResult(isCorrect)
    setActiveQuiz((q) => (q ? { ...q, selectedOption: index, resolution: isCorrect ? 'correct' : 'wrong', resultLabel } : q))
    setTimeout(() => {
      setActiveQuiz(null)
      const resolve = quizResolverRef.current
      quizResolverRef.current = null
      resolve?.(isCorrect)
    }, RESOLUTION_DISPLAY_MS)
  }

  function handleSelectOption(index) {
    if (!activeQuiz || activeQuiz.selectedOption !== null || activeQuiz.isAI) return
    const { card, describeResult } = activeQuiz
    const isCorrect = card.correctIndex === null ? Math.random() < 0.5 : index === card.correctIndex
    finishQuiz(index, isCorrect, describeResult)
  }

  async function flyModuleToPanel(tile, playerId) {
    const fromNode = tileRefs.current.get(tile.id)
    const toNode = panelRefs.current.get(playerId)

    if (fromNode && toNode) {
      setFlyingModule({
        key: `${tile.id}-${Date.now()}`,
        code: tile.code,
        accent: tile.ethicsWeight > 0 ? 'responsible' : 'performance',
        fromRect: fromNode.getBoundingClientRect(),
        toRect: toNode.getBoundingClientRect(),
      })
      await sleep(FLY_DURATION_MS)
      setFlyingModule(null)
    }

    setModuleState((prev) => ({ ...prev, [tile.id]: { owner: playerId, state: 'clean' } }))
  }

  async function handleModuleAcquisitionDraw(tile, playerId) {
    const card = drawCardForTile(tile)
    const isCorrect = await presentQuiz(
      card,
      (correct) => (correct ? 'Acquired — module is clean' : 'Incorrect — trust penalty'),
      isAIPlayer(playerId)
    )
    if (isCorrect) {
      await flyModuleToPanel(tile, playerId)
      const deltas = { accuracy: MODULE_ACCURACY_BONUS }
      if (tile.trustAxis) deltas[tile.trustAxis] = MODULE_AXIS_BONUS
      applyAxisChange(playerId, deltas)
    } else {
      const deltas = { accuracy: -ACQUIRE_WRONG_PENALTY }
      if (tile.trustAxis) deltas[tile.trustAxis] = -ACQUIRE_WRONG_PENALTY
      applyAxisChange(playerId, deltas)
    }
  }

  async function handleModuleFollowUpDraw(tile, playerId) {
    const card = drawCardForTile(tile)
    const isCorrect = await presentQuiz(
      card,
      (correct) => (correct ? 'Still clean' : 'Flagged glitchy'),
      isAIPlayer(playerId)
    )
    if (!isCorrect) {
      setModuleState((prev) => ({ ...prev, [tile.id]: { ...prev[tile.id], state: 'glitchy' } }))
      const deltas = { accuracy: -FOLLOWUP_WRONG_PENALTY }
      if (tile.trustAxis) deltas[tile.trustAxis] = -FOLLOWUP_WRONG_PENALTY
      applyAxisChange(playerId, deltas)
    }
  }

  async function handleNeutralDraw(tile, playerId) {
    const deck = DECKS[tile.deckKey]
    const card = deck[Math.floor(Math.random() * deck.length)]
    const axis = tile.deckKey === 'ethics' ? 'fairness' : 'accuracy'
    const isCorrect = await presentQuiz(
      card,
      (correct) => (correct ? `Trust +${NEUTRAL_BONUS}` : `Trust -${NEUTRAL_PENALTY}`),
      isAIPlayer(playerId)
    )
    applyAxisChange(playerId, { [axis]: isCorrect ? NEUTRAL_BONUS : -NEUTRAL_PENALTY })
  }

  async function applyLandingFee(tile, visitorId, ownerId) {
    const fee = Math.abs(tile.ethicsWeight) * LANDING_FEE_MULTIPLIER
    const irresponsible = tile.ethicsWeight < 0
    const visitorAxis = irresponsible ? 'fairness' : 'accuracy'
    const ownerAxis = irresponsible ? 'accuracy' : tile.trustAxis || 'accuracy'
    applyAxisChange(visitorId, { [visitorAxis]: -fee })
    applyAxisChange(ownerId, { [ownerAxis]: fee })
    await sleep(TRUST_DELTA_DISPLAY_MS)
  }

  async function resolveLanding(tile, playerId) {
    if (tile.type === 'module') {
      const info = moduleState[tile.id]
      if (!info.owner) {
        await handleModuleAcquisitionDraw(tile, playerId)
      } else if (info.owner === playerId) {
        await handleModuleFollowUpDraw(tile, playerId)
      } else {
        await applyLandingFee(tile, playerId, info.owner)
      }
    } else if (tile.type === 'ethics' || tile.type === 'math') {
      await handleNeutralDraw(tile, playerId)
    }
  }

  async function handleRoll() {
    if (isRolling || isMoving || gameOver) return

    setIsRolling(true)
    const ticks = Math.round(ROLL_DURATION_MS / ROLL_TICK_MS)
    for (let i = 0; i < ticks; i++) {
      setDiceValue(randomFace())
      await sleep(ROLL_TICK_MS)
    }
    const finalRoll = randomFace()
    setDiceValue(finalRoll)
    setIsRolling(false)

    setIsMoving(true)
    const movingPlayerId = activePlayer.id
    let position = activePlayer.position
    for (let step = 0; step < finalRoll; step++) {
      position = (position + 1) % TILES.length
      const nextPosition = position
      setPlayers((prev) =>
        prev.map((p) => (p.id === movingPlayerId ? { ...p, position: nextPosition } : p))
      )
      await sleep(STEP_PAUSE_MS)
    }

    setLandingTileId(position)
    await sleep(LANDING_GLOW_MS)
    setLandingTileId(null)

    const landedTile = TILES.find((t) => t.id === position)
    await resolveLanding(landedTile, movingPlayerId)

    setIsMoving(false)
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length)
  }

  // AI opponents roll for themselves — no button press needed.
  useEffect(() => {
    if (!activePlayer.isAI || isRolling || isMoving || gameOver) return
    const timer = setTimeout(() => {
      handleRoll()
    }, AI_TURN_START_DELAY_MS)
    return () => clearTimeout(timer)
  }, [currentPlayerIndex, gameOver])

  // The game ends the moment every module tile has an owner.
  useEffect(() => {
    if (Object.values(moduleState).every((m) => m.owner !== null)) {
      setGameOver(true)
    }
  }, [moduleState])

  const ownedByPlayer = players.reduce((acc, p) => {
    acc[p.id] = TILES.filter((t) => t.type === 'module' && moduleState[t.id]?.owner === p.id).map((t) => ({
      id: t.id,
      code: t.code,
      label: t.label,
      ethicsWeight: t.ethicsWeight,
      state: moduleState[t.id].state,
    }))
    return acc
  }, {})

  return (
    <>
      <div className="board-frame">
        <div className="board">
          {TILES.map((tile) => {
            const info = moduleState[tile.id]
            const owner = info?.owner ? players.find((p) => p.id === info.owner) : null
            return (
              <Tile
                key={tile.id}
                tile={tile}
                occupants={players.filter((p) => p.position === tile.id)}
                isLanding={landingTileId === tile.id}
                innerRef={registerTileRef(tile.id)}
                moduleInfo={info}
                ownerColor={owner?.color}
              />
            )
          })}

          <div className="board__center">
            <div className="title-plate">
              <span className="title-plate__eyebrow">Prototype v0.1</span>
              <h1 className="title-plate__name">Build-A-Brain Co.</h1>
            </div>
            <ControlPanel
              activePlayer={activePlayer}
              diceValue={diceValue}
              isRolling={isRolling}
              isMoving={isMoving}
              onRoll={handleRoll}
            />
            <TrustPanel players={players} activePlayerId={activePlayer.id} trustDeltas={trustDeltas} />
          </div>
        </div>
      </div>

      <ModulesPanel players={players} ownedByPlayer={ownedByPlayer} registerPanelRef={registerPanelRef} />

      {activeQuiz && <LandingQuiz quiz={activeQuiz} onSelectOption={handleSelectOption} />}
      {flyingModule && <FlyingModuleChip flight={flyingModule} />}
      {gameOver && <ModelReveal players={players} ownedByPlayer={ownedByPlayer} />}
    </>
  )
}

export default GameBoard
