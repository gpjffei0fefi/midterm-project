import { partFor } from '../data/creatureParts'
import { chassisArt } from '../data/moduleArt'
import ModuleIcon from './ModuleIcon'

// Base-first build order: highest tier number (base) snaps in first.
function orderForReveal(modules) {
  return [...modules].sort(
    (a, b) => partFor(b.label).tier - partFor(a.label).tier || a.code.localeCompare(b.code)
  )
}

// A module sits in its type's mount point on the chassis. Two copies of the
// same module type share that mount point, nudged apart and drawn smaller.
function mountBox(mod, modules) {
  const { slot } = partFor(mod.label)
  const twins = modules.filter((m) => m.label === mod.label)
  if (twins.length < 2) return { left: slot.x, top: slot.y, width: slot.size }
  const nudge = (twins.findIndex((m) => m.id === mod.id) === 0 ? -1 : 1) * slot.size * 0.16
  return { left: slot.x + nudge, top: slot.y + nudge, width: slot.size * 0.82 }
}

function PlayerCreature({ modules, revealedCount }) {
  const revealedIds = new Set(orderForReveal(modules).slice(0, revealedCount).map((m) => m.id))

  return (
    <>
      <div
        className="creature"
        role="img"
        aria-label={`Model with ${Math.min(revealedCount, modules.length)} of ${modules.length} modules assembled`}
      >
        {chassisArt && <img className="creature__chassis" src={chassisArt} alt="" decoding="async" draggable={false} />}
        {modules.map((mod) => {
          const box = mountBox(mod, modules)
          return (
            <span
              className="creature__mount"
              key={mod.id}
              style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%` }}
            >
              {revealedIds.has(mod.id) ? (
                <span className="creature-piece" title={`${mod.label} (${mod.code}), ${mod.state}`}>
                  <ModuleIcon label={mod.label} ethicsWeight={mod.ethicsWeight} state={mod.state} />
                </span>
              ) : (
                <span className="creature-socket" />
              )}
            </span>
          )
        })}
      </div>
      {modules.length === 0 && <span className="creature__empty">No modules acquired</span>}
    </>
  )
}

export default PlayerCreature
