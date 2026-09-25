import PlayerToken from './PlayerToken'
import ModuleIcon from './ModuleIcon'

const TOKEN_OFFSETS = [
  { x: -14, y: -10 },
  { x: 14, y: -10 },
  { x: 0, y: 14 },
]

function Tile({ tile, occupants, isLanding, innerRef, moduleInfo, ownerColor }) {
  const isModule = tile.type === 'module'
  const owned = moduleInfo?.owner != null
  const glitchy = moduleInfo?.state === 'glitchy'

  const classes = ['tile', `tile--${tile.type}`]
  if (isModule) classes.push(tile.ethicsWeight > 0 ? 'tile--responsible' : 'tile--performance')
  if (isModule && !owned) classes.push('tile--open')
  if (tile.corner) classes.push('tile--corner')
  if (isLanding) classes.push('tile--landing')
  if (owned) classes.push('tile--owned')
  if (glitchy) classes.push('tile--glitchy')

  return (
    <div
      ref={innerRef}
      className={classes.join(' ')}
      style={{ gridRow: tile.row, gridColumn: tile.col, ...(ownerColor ? { '--owner-color': ownerColor } : {}) }}
    >
      {isModule && (
        <span className="tile__icon">
          <ModuleIcon label={tile.label} ethicsWeight={tile.ethicsWeight} state={glitchy ? 'glitchy' : 'clean'} />
        </span>
      )}
      <span className="tile__code">{tile.code}</span>
      <span className="tile__label">{tile.label}</span>
      {owned && <span className="tile__owner-mark" />}
      {occupants.length > 0 && (
        <div className="tile__tokens">
          {occupants.map((player, i) => (
            <PlayerToken key={player.id} player={player} offset={TOKEN_OFFSETS[i % TOKEN_OFFSETS.length]} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Tile
