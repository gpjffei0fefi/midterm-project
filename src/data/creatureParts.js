// Where each module type mounts on the creature chassis in the Model Reveal.
//
// slot: center (x, y) and width (size) as a percentage of the chassis square,
//   chosen to sit on the matching part of the chassis art (face screen, chest,
//   arms) or in the empty bottom corners for the two "outside" modules.
// tier: snap-in order. Higher tier numbers land first, so the model builds
//   from the base up: corners, then torso and arms, then the head.
// shape: the CSS placeholder drawn only when a module's illustration is
//   missing (see ModuleIcon).
const CREATURE_PARTS = {
  'Explainability Layer': { tier: 0, shape: 'beacon', slot: { x: 50, y: 19, size: 34 } },
  'Compute Cluster': { tier: 1, shape: 'core', slot: { x: 50, y: 54, size: 30 } },
  'Bias Audit': { tier: 1, shape: 'eye', slot: { x: 18, y: 60, size: 23 } },
  'Privacy Filter': { tier: 1, shape: 'shield', slot: { x: 82, y: 60, size: 23 } },
  'Data Pipeline': { tier: 2, shape: 'base', slot: { x: 11, y: 88, size: 22 } },
  'Model Deployment': { tier: 2, shape: 'thruster', slot: { x: 89, y: 88, size: 22 } },
}

const FALLBACK = { tier: 1, shape: 'core', slot: { x: 50, y: 54, size: 28 } }

export function partFor(label) {
  return CREATURE_PARTS[label] ?? FALLBACK
}
