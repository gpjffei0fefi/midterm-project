// The one place the incoming art's filenames appear. The files keep their
// original names (spaces, capitals and number suffixes included), so
// components import these role names instead of ever writing a path.
// Each file is a resized copy of the original in assets_incoming/.
import tokenChip from './tokens/Friendly red microchip game token-1.png'
import tokenSatellite from './tokens/Boxy green satellite token-2.png'
import tokenRobot from './tokens/Playful Orange Robot Bust-3.png'
import tokenNeuron from './tokens/Friendly three-armed neuron token-4.png'
import coinCredit from './ui/Yellow chip coin icon-2.png'
import iconTrust from './ui/Heart Badge with White Checkmark-1.png'
import badgeV1 from './ui/Brown badge with upward chevron-3.png'
import badgeV2 from './ui/Light Blue Stacked Chevron Badge-4.png'
import badgeDeployed from './ui/Yellow badge with star and chevrons-5.png'
import flagOwned from './ui/Minimal white pennant flag-6.png'
import diceFaceBlank from './dice/Blank Light Blue Die Face.png'
import diceBlank from './dice/Clean blue isometric cube icon.png'
// A second blank cube that came with the set; no role yet.
import diceBlankSpare from './dice/Minimal isometric cyan cube.png'

export {
  tokenChip,
  tokenSatellite,
  tokenRobot,
  tokenNeuron,
  coinCredit,
  iconTrust,
  badgeV1,
  badgeV2,
  badgeDeployed,
  flagOwned,
  diceFaceBlank,
  diceBlank,
  diceBlankSpare,
}

// One token per seat color, in PLAYER_COLORS order (data/boardData.js):
// blue, magenta, yellow, green — each paired with the art closest to it.
export const TOKENS_BY_COLOR_INDEX = [tokenNeuron, tokenChip, tokenRobot, tokenSatellite]
