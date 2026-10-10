import { PLAYER_COLORS } from '../data/boardData'

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
          />
        )
      })}
    </div>
  )
}

export default TokenPicker
