import { moduleArt } from '../data/moduleArt'
import { partFor } from '../data/creatureParts'

// A module's illustration in its current state. If that illustration hasn't
// been added to src/assets/modules yet, draws the CSS placeholder shape instead.
// Fills whatever box its parent gives it. Decorative: parents carry the label.
function ModuleIcon({ label, ethicsWeight, state = 'clean' }) {
  const src = moduleArt(label, state)
  if (src) {
    return (
      <img className={`module-icon module-icon--${state}`} src={src} alt="" decoding="async" draggable={false} />
    )
  }

  const { shape } = partFor(label)
  const accent = ethicsWeight > 0 ? 'responsible' : 'performance'
  return (
    <span
      className={`module-shape module-shape--${shape} module-shape--${accent}${state === 'glitchy' ? ' module-shape--glitchy' : ''}`}
    />
  )
}

export default ModuleIcon
