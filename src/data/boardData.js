// Board is a 5x5 grid; tiles occupy the perimeter (16 cells), leaving the
// center 3x3 free for the title plate and trust readouts.
//
// Module tiles carry an ethicsWeight: positive for responsible modules
// (Bias Audit, Privacy Filter, Explainability Layer), negative for modules
// that only boost raw performance (Data Pipeline, Compute Cluster, Model
// Deployment). deckKey/difficultyTier pick which quiz card is drawn when a
// module is landed on.
export const TILES = [
  { id: 0, code: 'START', label: 'Start', type: 'start', row: 5, col: 1, corner: true },
  { id: 1, code: 'DP-1', label: 'Data Pipeline', type: 'module', row: 4, col: 1, ethicsWeight: -3, deckKey: 'math', difficultyTier: 1 },
  { id: 2, code: 'CC-1', label: 'Compute Cluster', type: 'module', row: 3, col: 1, ethicsWeight: -3, deckKey: 'math', difficultyTier: 1 },
  { id: 3, code: 'BA-1', label: 'Bias Audit', type: 'module', row: 2, col: 1, ethicsWeight: 3, deckKey: 'ethics', difficultyTier: 1 },
  { id: 4, code: 'ETH', label: 'Draw Ethics Card', type: 'ethics', row: 1, col: 1, corner: true, deckKey: 'ethics' },
  { id: 5, code: 'EL-1', label: 'Explainability Layer', type: 'module', row: 1, col: 2, ethicsWeight: 3, deckKey: 'ethics', difficultyTier: 2 },
  { id: 6, code: 'PF-1', label: 'Privacy Filter', type: 'module', row: 1, col: 3, ethicsWeight: 3, deckKey: 'ethics', difficultyTier: 2 },
  { id: 7, code: 'MD-1', label: 'Model Deployment', type: 'module', row: 1, col: 4, ethicsWeight: -3, deckKey: 'math', difficultyTier: 2 },
  { id: 8, code: 'PASS', label: 'Pass', type: 'pass', row: 1, col: 5, corner: true },
  { id: 9, code: 'DP-2', label: 'Data Pipeline', type: 'module', row: 2, col: 5, ethicsWeight: -3, deckKey: 'math', difficultyTier: 2 },
  { id: 10, code: 'CC-2', label: 'Compute Cluster', type: 'module', row: 3, col: 5, ethicsWeight: -3, deckKey: 'math', difficultyTier: 3 },
  { id: 11, code: 'MTH', label: 'Draw Math Card', type: 'math', row: 4, col: 5, deckKey: 'math' },
  { id: 12, code: 'BA-2', label: 'Bias Audit', type: 'module', row: 5, col: 5, corner: true, ethicsWeight: 3, deckKey: 'ethics', difficultyTier: 3 },
  { id: 13, code: 'EL-2', label: 'Explainability Layer', type: 'module', row: 5, col: 4, ethicsWeight: 3, deckKey: 'ethics', difficultyTier: 3 },
  { id: 14, code: 'PF-2', label: 'Privacy Filter', type: 'module', row: 5, col: 3, ethicsWeight: 3, deckKey: 'ethics', difficultyTier: 3 },
  { id: 15, code: 'MD-2', label: 'Model Deployment', type: 'module', row: 5, col: 2, ethicsWeight: -3, deckKey: 'math', difficultyTier: 3 },
]

export const INITIAL_PLAYERS = [
  { id: 'p1', name: 'Player 1', color: '#43D9C8', trustScore: 72, position: 0 },
  { id: 'p2', name: 'Player 2', color: '#E85D9E', trustScore: 58, position: 0 },
  { id: 'p3', name: 'Player 3', color: '#F2C14E', trustScore: 85, position: 0 },
]
