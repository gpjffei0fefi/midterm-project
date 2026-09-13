function PlayerToken({ player, offset }) {
  return (
    <div
      className="player-token"
      style={{
        '--token-color': player.color,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
      title={player.name}
    >
      <span className="player-token__hop">
        <span className="player-token__core" />
      </span>
    </div>
  )
}

export default PlayerToken
