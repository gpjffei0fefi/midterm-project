// Maps each module type to a body-part slot for the Model Reveal creature.
// tier 0 = head (top row), 1 = torso (middle row), 2 = base (bottom row).
// Pieces snap into place base-first, so the creature builds bottom-up.
const CREATURE_PARTS = {
  'Explainability Layer': { tier: 0, shape: 'beacon' },
  'Bias Audit': { tier: 1, shape: 'eye' },
  'Privacy Filter': { tier: 1, shape: 'shield' },
  'Compute Cluster': { tier: 1, shape: 'core' },
  'Data Pipeline': { tier: 2, shape: 'base' },
  'Model Deployment': { tier: 2, shape: 'thruster' },
}

export function partFor(label) {
  return CREATURE_PARTS[label] ?? { tier: 1, shape: 'core' }
}
