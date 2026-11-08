import AssetImage from './AssetImage'
import { PLAYER_COLORS } from '../data/boardData'
import { TOKENS_BY_COLOR_INDEX } from '../assets/assetMap'

function PlayerToken({ player, offset }) {
  const art = TOKENS_BY_COLOR_INDEX[PLAYER_COLORS.indexOf(player.color)]
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
        <AssetImage src={art} className="player-token__art" fallback={<span className="player-token__core" />} />
      </span>
    </div>
  )
}

export default PlayerToken
