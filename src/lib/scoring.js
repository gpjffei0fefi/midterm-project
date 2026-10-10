// Trust Score = accuracy + fairness + transparency. Pulled out of
// ModelReveal.jsx so the tie-break rule is one small, directly testable
// function instead of logic embedded in a component.
export function totalTrust(player) {
  return player.accuracy + player.fairness + player.transparency
}

// Every player at the single highest Trust Score is a winner — for any
// number of players, and for any number of ties (two, three, or all of
// them). A stable sort-then-take-last would break a tie arbitrarily
// (whichever tied player happens to sort last); this computes the winner
// set directly instead, so a tie is never resolved to one arbitrary name.
export function computeWinners(players) {
  if (players.length === 0) return []
  const maxTrust = Math.max(...players.map(totalTrust))
  return players.filter((p) => totalTrust(p) === maxTrust)
}

// "A", "A and B", or "A, B, and C" — for the tie announcement.
export function joinNames(list) {
  const names = list.map((p) => p.name)
  if (names.length < 2) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}
