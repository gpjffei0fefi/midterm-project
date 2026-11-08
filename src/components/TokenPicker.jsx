import AssetImage from './AssetImage'
import { PLAYER_COLORS } from '../data/boardData'
import { TOKENS_BY_COLOR_INDEX } from '../assets/assetMap'

// A row of swatch buttons for one player's token color. `takenByOthers`
// disables whichever colors another seat already picked, so two players
// can never end up with the same token.
function TokenPicker({ value, onChange, takenByOthers, label }) {
  return (
    <div className="token-picker" role="radiogroup" aria-label={label}>
      {PLAYER_COLORS.map((color, i) => {
        const disabled = takenByOthers.includes(i) && value !== i
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`Token ${i + 1}`}
            disabled={disabled}
            className={`token-picker__swatch${value === i ? ' token-picker__swatch--selected' : ''}`}
            style={{ '--token-color': color }}
            onClick={() => onChange(i)}
          >
            <AssetImage src={TOKENS_BY_COLOR_INDEX[i]} className="token-picker__art" />
          </button>
        )
      })}
    </div>
  )
}

export default TokenPicker
