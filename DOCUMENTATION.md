# Build-A-Brain Co. — Technical Documentation

A browser-only React board game about assembling an AI system one module at a
time, while an ethics/accuracy "Trust Score" tracks how responsibly you built
it. No backend, no database — all state lives in memory for the current
browser tab.

This file describes the **current** state of the codebase. It is rewritten
each time it's regenerated, not appended to — see `reports/` for a
day-by-day history of how the project got here.

## Getting started

Requirements: Node.js (any recent LTS) and npm.

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run lint     # oxlint
```

There are no environment variables and no `.env` file — the app has no
external services to configure. `.gitignore` excludes `node_modules`,
`dist`/`dist-ssr`, and any `.env*` file in case one is added later.

## File & folder structure

```
index.html                  Vite entry HTML; loads Google Fonts (Space Grotesk, JetBrains Mono)
vite.config.js               Vite + React plugin config
.oxlintrc.json                Lint rules (React hooks correctness, etc.)

src/
  main.jsx                    React root render
  App.jsx                     Top-level layout: <GameBoard /> + <QuizDeckSystem />
  index.css                   CSS custom-property palette, global reset, fonts
  App.css                     All component styles (single stylesheet, one file per concern
                               marked off with comment banners — board, tiles, tokens, control
                               panel, trust panel, deck tray, quiz card, model reveal, creature…)

  data/
    boardData.js               TILES (the 16-space board loop) and INITIAL_PLAYERS
    quizCards.js                Card deck generator — produces MATH_CARDS / ETHICS_CARDS
    gameRules.js                 Tunable balance constants (trust bonuses/penalties, AI odds)
    creatureParts.js              Maps each module type to a Model Reveal body-part slot

  constants/
    timing.js                   All animation/pacing durations in one place (ms)

  utils/
    sleep.js                    `sleep(ms)` promise helper used throughout the async turn logic

  components/
    GameBoard.jsx                The orchestrator: owns all game state and turn/quiz/trust logic
    Tile.jsx                     One board space (renders tokens, ownership marker, glitch state)
    PlayerToken.jsx               A player's colored marker on the board, with hop animation
    ControlPanel.jsx               Dice + Roll button + whose-turn indicator
    Dice.jsx                       The digital die readout
    TrustPanel.jsx                 Live per-player Trust Score + 3-axis bar breakdown
    ModulesPanel.jsx                Per-player list of owned module chips (clean/glitchy)
    FlyingModuleChip.jsx             The "module flies from tile to panel" acquisition animation
    LandingQuiz.jsx                  The auto-flow quiz overlay used during actual gameplay
    QuizCard.jsx                     The flip-card itself (shared by LandingQuiz and the demo deck)
    QuizOverlay.jsx / QuizDeckSystem.jsx / DeckTray.jsx
                                       Standalone "draw a card and look at it" demo, independent
                                       of board play — the two Math/Ethics deck buttons under the board
    ModelReveal.jsx                   End-of-game screen: builds each player's creature, then
                                       highlights the Trust Score winner
    PlayerCreature.jsx                 Lays one player's owned modules into head/torso/base rows
    CreaturePart.jsx                    One placeholder module-shape (clean or glitchy)

screenshots/                    Current UI screenshots (overwritten on each doc regeneration)
reports/                        One dated markdown file per work session (append-only log)
```

## Core systems

### Board & turn logic (`GameBoard.jsx`, `data/boardData.js`)

The board is a fixed loop of 16 tiles (`TILES`), laid out on a 5×5 CSS grid
with the perimeter as spaces and the center 3×3 area used for the
title/dice/trust UI. Each tile has a `type` (`start`, `module`, `ethics`,
`math`, `pass`) and, for modules, an `ethicsWeight`, `deckKey`, and
`difficultyTier` that decide which quiz card gets drawn there.

A turn (`handleRoll`) is one async sequence:

1. Cycle the dice display randomly, then settle on a real 1–6 result.
2. Move the active player's token one tile at a time (`STEP_PAUSE_MS` apart)
   — this is what makes movement "hop" instead of teleport.
3. Pulse-highlight the landing tile.
4. Resolve the landing (`resolveLanding`):
   - **Unowned module** → draw a card, then acquire on correct answer
     (with the fly-to-panel animation) or apply a trust penalty on wrong.
   - **Own module** → a "follow-up" draw; wrong flips the module to
     `glitchy` (visually and in the Trust Score).
   - **Opponent's module** → no card, just a Trust Score transfer (a
     landing fee) between visitor and owner.
   - **Neutral (Ethics/Math) tile** → draw a card for a flat trust swing.
   - **Pass / Start** → no-op.
5. Advance `currentPlayerIndex` to the next player.

All of this reuses the exact same code path for human and AI turns — see
"AI opponent logic" below.

### Quiz deck data model (`data/quizCards.js`)

Each card is:

```js
{ id, deck: 'math' | 'ethics', difficultyTier: 1 | 2 | 3, prompt: '', options: ['', '', '', ''], correctIndex: null }
```

`MATH_CARDS` and `ETHICS_CARDS` are generated as 18 blank placeholders each
(6 per tier) — **no real question content has been written yet**; that's
intentional and left for later. Because `correctIndex` is always `null`
right now, `GameBoard.jsx` falls back to a coin flip to decide correctness
for human players, and to the tier-weighted AI odds for AI players (see
below). Once real `correctIndex` values are filled in, both paths
automatically switch to grading the actual selected answer — no code
changes needed.

### Trust Score formula (`data/gameRules.js`, `GameBoard.jsx`)

```
Trust Score = accuracy + fairness + transparency
```

Each of the three axes is tracked independently per player and animated
live in `TrustPanel.jsx` (and again in `ModelReveal.jsx` at game end):

- **Accuracy** — the universal signal. Moves on every module quiz result
  (any module type) and every Math-deck neutral draw.
- **Fairness** — moves (in addition to accuracy) specifically on Bias
  Audit module quizzes, on every Ethics-deck neutral draw, and is the axis
  debited when a player pays a landing fee on an *irresponsible*
  (negative-`ethicsWeight`) opponent module.
- **Transparency** — moves (in addition to accuracy) only on
  Explainability Layer module quizzes.
- **Landing fees** scale with `|ethicsWeight| × LANDING_FEE_MULTIPLIER` and
  transfer trust from visitor to owner on the axis matching the module
  (irresponsible → Fairness debit / Accuracy credit; responsible → Accuracy
  debit / the module's own bonus axis as credit).

All the point values (bonuses, penalties, the fee multiplier) live in
`gameRules.js` as named constants — tune balance there, not in
`GameBoard.jsx`.

### AI opponent logic (`GameBoard.jsx`, `data/gameRules.js`)

Players 2 and 3 are marked `isAI: true` in `INITIAL_PLAYERS`; Player 1 is
human. For an AI player:

- A `useEffect` keyed on `currentPlayerIndex` waits
  `AI_TURN_START_DELAY_MS`, then calls the exact same `handleRoll()` the
  human's Roll button calls — same dice animation, same hop movement.
- When their quiz card flips face-up, `presentQuiz(..., isAI=true)` waits
  `AI_THINK_MS` and then auto-picks a random option. Correctness is a
  weighted coin flip via `AI_CORRECT_PROBABILITY_BY_TIER` (currently
  70% / 50% / 30% for tiers 1/2/3) — no reasoning, just tier-scaled luck.
- The resolution path (`finishQuiz`) is shared with human answers, so the
  correct/wrong card animation and Trust Score math are identical either
  way; only *how* the answer gets chosen differs.
- The Roll button and card options are disabled/hidden during an AI turn
  (`ControlPanel.jsx`, `QuizCard.jsx`'s `interactive` prop) so the human
  can't interfere with it.

### Game end & Model Reveal (`GameBoard.jsx`, `ModelReveal.jsx`)

A `useEffect` watches `moduleState` and sets `gameOver` the instant every
module tile has a confirmed owner (a wrong answer never counts — the
module has to actually be acquired). Once `gameOver` is true, rolling stops
(both the button and the AI auto-roll effect are guarded) and
`ModelReveal` renders as a full-screen overlay.

The reveal sorts players **ascending by total Trust Score** and builds
each one's creature (via `PlayerCreature.jsx` / `CreaturePart.jsx`) one
module at a time, base-to-head, with a "snap into place" animation, then
shows that player's score and 3-axis bars before moving to the next
player — saving the highest score for last. Once everyone's revealed, the
top-scoring player gets a highlighted "Winner" badge. **Module count has no
bearing on the win condition** — only the final Trust Score does.

### Save / resume

There is currently no save/resume. All game state (`players`,
`moduleState`, dice, turn index, etc.) lives in `GameBoard`'s React
`useState`/`useRef` — a page refresh resets the game to its initial state.
Nothing is written to `localStorage` or any backend. If persistence is
wanted later, the natural approach is to serialize `GameBoard`'s state to
`localStorage` on change and rehydrate it on mount.

### Git workflow

The repo is a standard local git repo (`git init`, no submodules). Per the
project's working agreement: saying **"save progress"** or **"commit
this"** means stage everything and commit with a short descriptive
message — no confirmation needed for that specific action. Force-pushes,
history rewrites, and pushes to remote still require an explicit ask.
`.gitignore` covers `node_modules`, `dist`/`dist-ssr`, and `.env*` files.

## Current UI

![Board](screenshots/board.png)
*The board mid-game: 16-tile loop, live dice/turn control, and the Trust
Score panel.*

![Card draw in progress](screenshots/card-draw.png)
*A quiz card flipped face-up during a landing, showing the placeholder
prompt/options and its deck/tier.*

![Trust Score breakdown](screenshots/trust-breakdown.png)
*The live per-player Accuracy / Fairness / Transparency bars.*

![Model Reveal](screenshots/model-reveal.png)
*The end-of-game reveal screen — each player's creature assembled from
their owned modules, with the highest Trust Score highlighted as the
winner (shown here with representative sample data, since reaching a real
end-game state requires a full playthrough).*
