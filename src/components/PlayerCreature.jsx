import { partFor } from '../data/creatureParts'
import CreaturePart from './CreaturePart'

// Base-first build order: highest tier number (base) snaps in first.
function orderForReveal(modules) {
  return [...modules].sort(
    (a, b) => partFor(b.label).tier - partFor(a.label).tier || a.code.localeCompare(b.code)
  )
}

function PlayerCreature({ modules, revealedCount }) {
  if (modules.length === 0) {
    return <span className="creature__empty">No modules acquired</span>
  }

  const revealedIds = new Set(orderForReveal(modules).slice(0, revealedCount).map((m) => m.id))
  const rows = [0, 1, 2].map((tier) => modules.filter((m) => partFor(m.label).tier === tier))

  return (
    <div className="creature">
      {rows.map((row, i) => (
        <div className="creature__row" key={i}>
          {row.map((mod) =>
            revealedIds.has(mod.id) ? (
              <CreaturePart key={mod.id} mod={mod} />
            ) : (
              <span key={mod.id} className="creature-part-slot" />
            )
          )}
        </div>
      ))}
    </div>
  )
}

export default PlayerCreature
