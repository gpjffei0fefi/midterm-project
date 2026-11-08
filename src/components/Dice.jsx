import { useState } from 'react'
import { diceFaceBlank } from '../assets/assetMap'

// Which cells of a 3x3 grid hold a pip, for each face (cells numbered
// 0-8, left to right, top to bottom).
const PIP_CELLS = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

// The blank die-face art with the pips drawn in code on top. If the art
// fails to load, it falls back to the original "D6 / number" readout.
function Dice({ value, rolling }) {
  const [artFailed, setArtFailed] = useState(false)
  const pips = PIP_CELLS[value] ?? []

  if (artFailed) {
    return (
      <div className={`dice${rolling ? ' dice--rolling' : ''}`}>
        <span className="dice__label">D6</span>
        <span className="dice__value">{value}</span>
      </div>
    )
  }

  return (
    <div className={`dice dice--art${rolling ? ' dice--rolling' : ''}`} role="img" aria-label={`Die showing ${value}`}>
      <img src={diceFaceBlank} className="dice__face" alt="" draggable="false" onError={() => setArtFailed(true)} />
      <span className="dice__pips" aria-hidden="true">
        {Array.from({ length: 9 }, (_, cell) => (
          <span key={cell} className={pips.includes(cell) ? 'dice__pip' : 'dice__pip dice__pip--empty'} />
        ))}
      </span>
    </div>
  )
}

export default Dice
