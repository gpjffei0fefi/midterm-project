// Trust Score = accuracy + fairness + transparency, each a live-tracked axis.
//
// Accuracy: earned/lost on every module quiz (any type) and every Math-deck
// neutral draw — the universal "did the technical answer hold up" signal.
// Fairness: earned/lost on Bias Audit module quizzes, Ethics-deck neutral
// draws, and irresponsible-module landing fees paid.
// Transparency: earned/lost on Explainability Layer module quizzes only.
export const MODULE_ACCURACY_BONUS = 10
export const MODULE_AXIS_BONUS = 10
export const ACQUIRE_WRONG_PENALTY = 6
export const FOLLOWUP_WRONG_PENALTY = 4
export const NEUTRAL_BONUS = 5
export const NEUTRAL_PENALTY = 5
export const LANDING_FEE_MULTIPLIER = 2

// AI opponents "answer" every card with a fixed probability of being
// correct, keyed by the card's difficulty tier — no real reasoning, just a
// weighted coin flip.
export const AI_CORRECT_PROBABILITY_BY_TIER = {
  1: 0.7,
  2: 0.5,
  3: 0.3,
}

// The game ends at the close of the first full round (everyone has had the same
// number of turns) in which any player has completed this many laps, or as soon
// as every module has an owner, whichever comes first. A lap is completed each
// time a token reaches or passes START.
export const LAPS_TO_WIN = 3
