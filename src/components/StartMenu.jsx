import { HARD_MODE_AGENT_ENABLED } from '../data/gameRules'

const MODES = [
  {
    id: 'local',
    accent: 'blue',
    title: 'Local Multiplayer',
    description: 'One device, pass-and-play. 2–4 players, no AI.',
  },
  {
    id: 'online',
    accent: 'orange',
    title: 'Online Multiplayer',
    description: 'Create or join a room with a code. 2–4 players.',
    // Yellow is reserved for a mode that does nothing yet at all.
    badge: 'Coming next',
  },
  HARD_MODE_AGENT_ENABLED
    ? {
        id: 'hard',
        accent: 'red',
        title: 'Hard Mode',
        description: 'You vs. an AI that can search the web for itself.',
      }
    : {
        id: 'hard',
        accent: 'red',
        title: 'Hard Mode',
        description: 'You vs. one tough AI opponent.',
        // A quieter grey badge: fully playable today, just a reduced preview
        // of the real thing — distinct from "Coming next" above.
        badge: 'Hard (preview)',
        badgeVariant: 'preview',
      },
  {
    id: 'ai',
    accent: 'yellow',
    title: 'AI Mode',
    description: 'You plus 1–3 simulated AIs, each a different skill level.',
  },
]

function StartMenu({ onSelect, onBack }) {
  return (
    <div className="intro">
      <div className="intro__panel intro__panel--menu">
        <h1 className="intro__title intro__title--small">Choose how to play</h1>
        <div className="mode-grid">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`mode-card mode-card--${mode.accent}`}
              onClick={() => onSelect(mode.id)}
            >
              {mode.badge && (
                <span
                  className={`mode-card__badge${mode.badgeVariant ? ` mode-card__badge--${mode.badgeVariant}` : ''}`}
                >
                  {mode.badge}
                </span>
              )}
              <span className="mode-card__title">{mode.title}</span>
              <span className="mode-card__description">{mode.description}</span>
            </button>
          ))}
        </div>
        <button type="button" className="intro__button intro__button--ghost" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  )
}

export default StartMenu
