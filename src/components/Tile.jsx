import PlayerToken from './PlayerToken'

const TOKEN_OFFSETS = [
  { x: -14, y: -10 },
  { x: 14, y: -10 },
  { x: 0, y: 14 },
]

function Tile({ tile, occupants, isLanding, innerRef, moduleInfo, ownerColor }) {
  const owned = moduleInfo?.owner != null
  const glitchy = moduleInfo?.state === 'glitchy'

  return (
    <div
      ref={innerRef}
      className={`tile tile--${tile.type}${tile.corner ? ' tile--corner' : ''}${isLanding ? ' tile--landing' : ''}${owned ? ' tile--owned' : ''}${glitchy ? ' tile--glitchy' : ''}`}
      style={{ gridRow: tile.row, gridColumn: tile.col, ...(ownerColor ? { '--owner-color': ownerColor } : {}) }}
    >
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
