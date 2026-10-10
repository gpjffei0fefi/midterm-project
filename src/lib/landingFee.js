import { LANDING_FEE_MULTIPLIER } from '../data/gameRules'

// Pulled out of GameBoard.jsx's applyLandingFee so the fee's size and which
// axis it moves — the two things a test can check without a full React
// component — are one small pure function.
//
// Irresponsible (technical) modules move a straight Accuracy transfer;
// responsible (ethics) modules move the module's own trust axis instead (or
// Fairness, for a responsible module with no axis of its own, like Privacy
// Filter) — same axis for both the visitor's debit and the owner's credit.
// The direction (owner receives, visitor pays) is the caller's job: this
// just says how much, and on which axis.
export function computeLandingFee(tile) {
  const fee = Math.abs(tile.ethicsWeight) * LANDING_FEE_MULTIPLIER
  const irresponsible = tile.ethicsWeight < 0
  const axis = irresponsible ? 'accuracy' : tile.trustAxis || 'fairness'
  return { axis, fee }
}
