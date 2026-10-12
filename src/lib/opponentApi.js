// Thin client-side wrapper around POST /api/opponent. Kept separate from
// GameBoard.jsx so the fetch call itself is the only thing that isn't unit
// tested directly — everything it talks to (api/_lib/opponentAgent.js) has
// its own tests, and GameBoard mocks this module rather than the network.
export async function requestOpponentMove({ cardId, difficulty, gameStateSummary }) {
  const res = await fetch('/api/opponent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardId, difficulty, gameStateSummary }),
  })
  if (!res.ok) throw new Error(`opponent api responded ${res.status}`)
  return res.json()
}
