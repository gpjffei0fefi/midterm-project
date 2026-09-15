import { partFor } from '../data/creatureParts'

function CreaturePart({ mod }) {
  const { shape } = partFor(mod.label)
  const accent = mod.ethicsWeight > 0 ? 'responsible' : 'performance'
  const glitchy = mod.state === 'glitchy'

  return (
    <span
      className={`creature-part creature-part--${shape} creature-part--${accent}${glitchy ? ' creature-part--glitchy' : ''}`}
      title={`${mod.label} (${mod.code}) — ${mod.state}`}
    />
  )
}

export default CreaturePart
