// Trust Score = accuracy + fairness + transparency, each a live-tracked axis.
//
// Accuracy: earned/lost on every module quiz (any type), every Math-deck
// neutral draw, and irresponsible-module (negative-ethicsWeight) landing
// fees — the universal "did the technical answer hold up" signal.
// Fairness: earned/lost on Bias Audit module quizzes, Ethics-deck neutral
// draws, and landing fees on responsible modules whose own trust axis is
// Fairness (Bias Audit) or that have none of their own (Privacy Filter).
// Transparency: earned/lost on Explainability Layer module quizzes, and on
// Explainability Layer's own landing fees.
export const MODULE_ACCURACY_BONUS = 10
export const MODULE_AXIS_BONUS = 10
export const ACQUIRE_WRONG_PENALTY = 6
export const FOLLOWUP_WRONG_PENALTY = 4
export const NEUTRAL_BONUS = 5
export const NEUTRAL_PENALTY = 5
export const LANDING_FEE_MULTIPLIER = 2

// AI opponents "answer" every card with a fixed probability of being
// correct — no real reasoning, just a weighted coin flip. The probability
// comes from the ACTING PLAYER's own assigned `aiTier` (set once at seat
// setup — see data/boardData.js's buildPlayers), not from the card's own
// difficultyTier: AI Mode gives each AI opponent a different, fixed skill
// level (tier 1 = toughest/most accurate) rather than having every AI get
// harder or easier on the exact same cards a human would.
export const AI_CORRECT_PROBABILITY_BY_TIER = {
  1: 0.7,
  2: 0.5,
  3: 0.3,
}

// Seat limits, shared by every mode's player-count screen and by every
// place that validates a roster size (saveGame, the N-player tests). Not
// hardcoded as a bare 2/3/4 anywhere else in the game loop.
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4

// Hard Mode is one human vs one AI, previewed with the existing tier-based
// AI at its toughest (tier 1) setting — see data/seatBuilders.js's
// buildHardModeSeats.
export const HARD_MODE_PREVIEW_TIER = 1

// Whether Hard Mode's AI uses the web-searching agent (POST /api/opponent).
// Off for the demo: the 2026-11-08 live test found gemini-2.5-flash
// deprecated (404), and Google's pricing page lists search grounding on
// gemini-3.8-flash as "Not available" on the free tier — see
// DOCUMENTATION.md. While false, Hard Mode makes no API calls, shows no
// search UI, and is labeled "Hard (preview)". Turning it on needs a working
// model in api/_lib/opponentAgent.js, billing for grounding, and a live test.
export const HARD_MODE_AGENT_ENABLED = false

// The game ends at the close of the first full round (everyone has had the same
// number of turns) in which any player has completed this many laps, or as soon
// as every module has an owner, whichever comes first. A lap is completed each
// time a token reaches or passes START.
export const LAPS_TO_WIN = 3
