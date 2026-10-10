import { MIN_PLAYERS, MAX_PLAYERS } from '../data/gameRules'

const MODE_COPY = {
  local: { title: 'How many players?', lead: 'Everyone plays on this device, taking turns.' },
  ai: { title: 'How many total players?', lead: 'You, plus simulated AI opponents filling the rest of the seats.' },
  online: { title: 'How many players in the room?', lead: 'Seats for whoever joins with the room code.' },
}

function PlayerCountScreen({ mode, count, onChange, onBack, onContinue }) {
  const copy = MODE_COPY[mode]
  const options = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i)

  return (
    <div className="intro">
      <div className="intro__panel intro__panel--count">
        <h1 className="intro__title intro__title--small">{copy.title}</h1>
        <p className="intro__lead">{copy.lead}</p>
        <div className="count-picker" role="radiogroup" aria-label="Number of players">
          {options.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={count === n}
              className={`count-picker__option${count === n ? ' count-picker__option--selected' : ''}`}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="intro__actions">
          <button type="button" className="intro__button intro__button--ghost" onClick={onBack}>
            Back
          </button>
          <button type="button" className="intro__button" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerCountScreen
