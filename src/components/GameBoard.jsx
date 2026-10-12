import { useEffect, useRef, useState } from 'react'
import { TILES } from '../data/boardData'
import { DECKS } from '../data/quizCards'
import {
  MODULE_ACCURACY_BONUS,
  MODULE_AXIS_BONUS,
  ACQUIRE_WRONG_PENALTY,
  FOLLOWUP_WRONG_PENALTY,
  NEUTRAL_BONUS,
  NEUTRAL_PENALTY,
  AI_CORRECT_PROBABILITY_BY_TIER,
  LAPS_TO_WIN,
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
  AGENT_EVIDENCE_DISPLAY_MS,
} from '../constants/timing'
import { sleep } from '../utils/sleep'
import { saveGame, clearSavedGame } from '../lib/saveGame'
import { createDrawPile, hydrateDrawPile, drawCard } from '../lib/deckDraw'
import { nextPlayerIndex } from '../lib/turnOrder'
import { computeLandingFee } from '../lib/landingFee'
import { totalTrust } from '../lib/scoring'
import { requestOpponentMove } from '../lib/opponentApi'
import Tile from './Tile'
import TrustPanel from './TrustPanel'
import ControlPanel from './ControlPanel'
import ModulesPanel from './ModulesPanel'
import BoardLegend from './BoardLegend'
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

// AI opponents don't reason about the question — just a weighted coin flip
// keyed by the ACTING PLAYER's own assigned skill tier (set once at seat
// setup, see data/seatBuilders.js), not by the card's own difficulty tier.
function rollAICorrectness(player) {
  const probability = AI_CORRECT_PROBABILITY_BY_TIER[player.aiTier] ?? 0.5
  return Math.random() < probability
}

// Once the AI's outcome is decided, it "picks" an option that produces it, so
// the card shows a real selection: the right answer, or a random wrong one.
function pickOptionForOutcome(card, isCorrect) {
  if (isCorrect) return card.correctIndex
  const wrong = card.options.map((_, i) => i).filter((i) => i !== card.correctIndex)
  return wrong[Math.floor(Math.random() * wrong.length)]
}

// Used only when /api/opponent itself can't be reached at all (the fetch
// throws — offline, dev server without the function, etc). The route's own
// handler already falls back to this same tier-based coin flip server-side
// for every other failure (bad JSON, timeout, rate limit), so this is the
// client-side half of "the game must never freeze."
function localAgentFallback(card, actingPlayer) {
  const isCorrect = rollAICorrectness(actingPlayer)
  return {
    answerIndex: pickOptionForOutcome(card, isCorrect),
    reasoning: "Answered without a live search (couldn't reach the search agent this turn).",
    queries: [],
    sources: [],
    usedFallback: true,
  }
}

// players: the freshly built roster for a new game (see data/boardData.js's
// buildPlayers), ignored when resuming a save.
// initialSave: a saved game to restore, or null for a new one.
// onPlayAgain: called from the Model Reveal to start a fresh game.
function GameBoard({ players: initialPlayers, initialSave, onPlayAgain }) {
  const [players, setPlayers] = useState(() => initialSave?.players ?? initialPlayers)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(initialSave?.currentPlayerIndex ?? 0)
  const [turns, setTurns] = useState(initialSave?.turns ?? 0)
  const [endReason, setEndReason] = useState(null)
  const [settling, setSettling] = useState(Boolean(initialSave))
  const [diceValue, setDiceValue] = useState(initialSave?.diceValue ?? 1)
  const [isRolling, setIsRolling] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [landingTileId, setLandingTileId] = useState(null)
  const [moduleState, setModuleState] = useState(() => initialSave?.moduleState ?? initialModuleState())
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [flyingModule, setFlyingModule] = useState(null)
  const [trustDeltas, setTrustDeltas] = useState({})
  const [gameOver, setGameOver] = useState(false)

  const tileRefs = useRef(new Map())
  const tileRefCallbacks = useRef({})
  const panelRefs = useRef(new Map())
  const panelRefCallbacks = useRef({})
  const quizResolverRef = useRef(null)
  // One shuffled draw pile per deck (not per tile, not per turn), so every
  // card in Math and every card in Ethics is dealt once before either
  // reshuffles. Lives in a ref: draw order doesn't need to trigger a render.
  const drawPilesRef = useRef({
    math: initialSave?.drawPiles?.math
      ? hydrateDrawPile(initialSave.drawPiles.math, DECKS.math)
      : createDrawPile(DECKS.math),
    ethics: initialSave?.drawPiles?.ethics
      ? hydrateDrawPile(initialSave.drawPiles.ethics, DECKS.ethics)
      : createDrawPile(DECKS.ethics),
  })

  function drawCardForTile(tile) {
    return drawCard(drawPilesRef.current[tile.deckKey], DECKS[tile.deckKey], tile.difficultyTier)
  }

  const activePlayer = players[currentPlayerIndex]

  function playerById(playerId) {
    return players.find((p) => p.id === playerId)
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
  //
  // context: a short label for *why* this change is happening (e.g.
  // "landing-fee:BA-1:visitor"), used only for the console warning below —
  // it isn't shown in the UI. A debit that hits the 0 floor still moves
  // nothing (there's nothing to go more negative), but it's easy to mistake
  // for a one-sided bug if you're only watching one player's number, so it's
  // logged and still gets its own (zero-amount) floating indicator instead
  // of vanishing silently.
  function applyAxisChange(playerId, deltas, context) {
    let netDelta = 0
    let flooredOut = false
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== playerId) return p
        const next = { ...p }
        for (const axis of ['accuracy', 'fairness', 'transparency']) {
          if (deltas[axis]) {
            const before = p[axis]
            const clamped = Math.max(0, before + deltas[axis])
            const change = clamped - before
            netDelta += change
            next[axis] = clamped
            if (deltas[axis] < 0 && change === 0) {
              flooredOut = true
              console.warn(
                `[trust] ${context ?? playerId}: ${axis} debit of ${deltas[axis]} had no effect — ${playerId}'s ${axis} was already at the 0 floor`
              )
            }
          }
        }
        return next
      })
    )
    if (netDelta === 0 && !flooredOut) return
    const key = `${playerId}-${Date.now()}-${Math.random()}`
    setTrustDeltas((prev) => ({ ...prev, [playerId]: { amount: netDelta, flooredOut, key } }))
    setTimeout(() => {
      setTrustDeltas((prev) => {
        if (prev[playerId]?.key !== key) return prev
        const next = { ...prev }
        delete next[playerId]
        return next
      })
    }, TRUST_DELTA_DISPLAY_MS)
  }

  function presentQuiz(card, describeResult, actingPlayer) {
    const isAI = actingPlayer.isAI
    const usesAgent = Boolean(actingPlayer.usesAgent)
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
        usesAgent,
        agentQueries: [],
        agentSources: [],
        agentReasoning: null,
        agentNote: null,
      })
      setTimeout(() => {
        setActiveQuiz((q) => (q ? { ...q, flipped: true } : q))
        if (usesAgent) {
          resolveWithAgent(card, describeResult, actingPlayer)
        } else if (isAI) {
          setTimeout(() => {
            const isCorrect = rollAICorrectness(actingPlayer)
            finishQuiz(pickOptionForOutcome(card, isCorrect), isCorrect, describeResult)
          }, AI_THINK_MS)
        }
      }, FLIP_DELAY_MS)
    })
  }

  // Hard Mode's web-searching agent path. Sends only the card id, a label,
  // and numeric trust/lap totals — never the player's name or the card's
  // correctIndex (the server resolves the real card itself; see
  // api/_lib/opponentAgent.js's buildPrompt). Shows what it searched (if
  // anything) and its one-sentence reasoning before the answer resolves, and
  // the "couldn't search" note whenever either side had to fall back.
  async function resolveWithAgent(card, describeResult, actingPlayer) {
    const opponent = players.find((p) => p.id !== actingPlayer.id)
    const gameStateSummary = {
      lap: actingPlayer.laps ?? 0,
      yourTrust: totalTrust(actingPlayer),
      opponentTrust: opponent ? totalTrust(opponent) : 0,
    }

    let move
    try {
      move = await requestOpponentMove({ cardId: card.id, difficulty: 'hard', gameStateSummary })
    } catch {
      move = localAgentFallback(card, actingPlayer)
    }

    setActiveQuiz((q) =>
      q
        ? {
            ...q,
            agentQueries: move.queries ?? [],
            agentSources: move.sources ?? [],
            agentReasoning: move.reasoning ?? null,
            agentNote: move.usedFallback ? "Opponent couldn't search this turn" : null,
          }
        : q
    )
    await sleep(AGENT_EVIDENCE_DISPLAY_MS)
    const isCorrect = move.answerIndex === card.correctIndex
    finishQuiz(move.answerIndex, isCorrect, describeResult)
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
    finishQuiz(index, index === card.correctIndex, describeResult)
  }

  async function flyModuleToPanel(tile, playerId) {
    const fromNode = tileRefs.current.get(tile.id)
    const toNode = panelRefs.current.get(playerId)

    if (fromNode && toNode) {
      setFlyingModule({
        key: `${tile.id}-${Date.now()}`,
        code: tile.code,
        label: tile.label,
        ethicsWeight: tile.ethicsWeight,
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
      playerById(playerId)
    )
    if (isCorrect) {
      await flyModuleToPanel(tile, playerId)
      const deltas = { accuracy: MODULE_ACCURACY_BONUS }
      if (tile.trustAxis) deltas[tile.trustAxis] = MODULE_AXIS_BONUS
      applyAxisChange(playerId, deltas, `acquire:${tile.code}`)
    } else {
      const deltas = { accuracy: -ACQUIRE_WRONG_PENALTY }
      if (tile.trustAxis) deltas[tile.trustAxis] = -ACQUIRE_WRONG_PENALTY
      applyAxisChange(playerId, deltas, `acquire-wrong:${tile.code}`)
    }
  }

  async function handleModuleFollowUpDraw(tile, playerId) {
    const card = drawCardForTile(tile)
    const isCorrect = await presentQuiz(
      card,
      (correct) => (correct ? 'Still clean' : 'Flagged glitchy'),
      playerById(playerId)
    )
    if (!isCorrect) {
      setModuleState((prev) => ({ ...prev, [tile.id]: { ...prev[tile.id], state: 'glitchy' } }))
      const deltas = { accuracy: -FOLLOWUP_WRONG_PENALTY }
      if (tile.trustAxis) deltas[tile.trustAxis] = -FOLLOWUP_WRONG_PENALTY
      applyAxisChange(playerId, deltas, `followup-wrong:${tile.code}`)
    }
  }

  async function handleNeutralDraw(tile, playerId) {
    const card = drawCard(drawPilesRef.current[tile.deckKey], DECKS[tile.deckKey])
    const axis = tile.deckKey === 'ethics' ? 'fairness' : 'accuracy'
    const isCorrect = await presentQuiz(
      card,
      (correct) => (correct ? `Trust +${NEUTRAL_BONUS}` : `Trust -${NEUTRAL_PENALTY}`),
      playerById(playerId)
    )
    applyAxisChange(playerId, { [axis]: isCorrect ? NEUTRAL_BONUS : -NEUTRAL_PENALTY }, `neutral:${tile.code}`)
  }

  async function applyLandingFee(tile, visitorId, ownerId) {
    const { axis, fee } = computeLandingFee(tile)
    // Logged unconditionally (not just when something's floored) so a full
    // trail of every landing fee is in the console if the two sides ever
    // look wrong again — cheap, and it's the exact interaction that's been
    // hard to verify from a screenshot alone.
    console.info(`[trust] landing fee: ${visitorId} pays ${ownerId} ${fee} ${axis} for ${tile.code}`)
    applyAxisChange(visitorId, { [axis]: -fee }, `landing-fee:${tile.code}:visitor`)
    applyAxisChange(ownerId, { [axis]: fee }, `landing-fee:${tile.code}:owner`)
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
      const completedLap = nextPosition === 0
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === movingPlayerId
            ? { ...p, position: nextPosition, laps: completedLap ? (p.laps ?? 0) + 1 : p.laps }
            : p
        )
      )
      await sleep(STEP_PAUSE_MS)
    }

    setLandingTileId(position)
    await sleep(LANDING_GLOW_MS)
    setLandingTileId(null)

    const landedTile = TILES.find((t) => t.id === position)
    await resolveLanding(landedTile, movingPlayerId)

    // These land in one batch, so the end-of-turn effect below sees the
    // finished turn: new player, new turn count, final scores and ownership.
    setTurns((t) => t + 1)
    setIsMoving(false)
    setCurrentPlayerIndex((prev) => nextPlayerIndex(prev, players.length))
  }

  // AI opponents roll for themselves — no button press needed.
  useEffect(() => {
    if (!activePlayer.isAI || isRolling || isMoving || gameOver) return
    const timer = setTimeout(() => {
      handleRoll()
    }, AI_TURN_START_DELAY_MS)
    return () => clearTimeout(timer)
  }, [currentPlayerIndex, gameOver])

  // Runs once each turn has fully resolved (and on mount). Ends the game if a
  // condition is met, otherwise saves the state so it can be resumed.
  useEffect(() => {
    if (isMoving || gameOver) return
    const allOwned = Object.values(moduleState).every((m) => m.owner !== null)
    const roundComplete = turns > 0 && currentPlayerIndex === 0
    const lapsDone = roundComplete && players.some((p) => (p.laps ?? 0) >= LAPS_TO_WIN)
    if (allOwned || lapsDone) {
      setEndReason(allOwned ? 'modules' : 'laps')
      setGameOver(true)
      clearSavedGame()
    } else if (turns > 0) {
      saveGame({ players, currentPlayerIndex, turns, diceValue, moduleState, drawPiles: drawPilesRef.current })
    }
    // Deliberately keyed on isMoving only: it flips false exactly when a turn ends.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMoving])

  // A restored game renders with transitions off for a beat, so tokens, bars
  // and chips appear in place instead of animating in from empty.
  useEffect(() => {
    if (!settling) return
    const timer = setTimeout(() => setSettling(false), 250)
    return () => clearTimeout(timer)
  }, [settling])

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
    <div className={`game${settling ? ' game--settling' : ''}`}>
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
              <span className="title-plate__eyebrow">Lap {Math.min(LAPS_TO_WIN, Math.max(...players.map((p) => p.laps ?? 0)) + 1)} of {LAPS_TO_WIN}</span>
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

      <BoardLegend />
      <ModulesPanel players={players} ownedByPlayer={ownedByPlayer} registerPanelRef={registerPanelRef} />

      {activeQuiz && <LandingQuiz quiz={activeQuiz} onSelectOption={handleSelectOption} />}
      {flyingModule && <FlyingModuleChip flight={flyingModule} />}
      {gameOver && (
        <ModelReveal
          players={players}
          ownedByPlayer={ownedByPlayer}
          endReason={endReason}
          lapsToWin={LAPS_TO_WIN}
          onPlayAgain={onPlayAgain}
        />
      )}
    </div>
  )
}

export default GameBoard
