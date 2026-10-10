// Advances to the next seat, wrapping around for any number of players —
// the single place turn order is computed, so every mode (2, 3, or 4
// seats) goes through the same logic instead of a bare 2 or 3 hardcoded
// somewhere in the game loop.
export function nextPlayerIndex(currentIndex, playerCount) {
  return (currentIndex + 1) % playerCount
}
