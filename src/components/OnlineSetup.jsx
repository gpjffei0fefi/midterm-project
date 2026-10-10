// Screen and routing only — no backend exists yet. Every control here is
// disabled and the "coming next" notice is shown before them, not after —
// a critique finding: a live-looking Create/Join button that silently did
// nothing on click was the worst version of this placeholder.
function OnlineSetup({ playerCount, onBack }) {
  return (
    <div className="intro">
      <div className="intro__panel intro__panel--online">
        <h1 className="intro__title intro__title--small">Online Multiplayer</h1>
        <p className="intro__lead">
          Room for {playerCount} {playerCount === 1 ? 'player' : 'players'}.
        </p>

        <p className="online-coming-next">
          <span className="mode-card__badge">Coming next</span>
          Online play isn't wired up yet — the controls below don't connect to
          anything real. Pick another mode to play right now.
        </p>

        <div className="online-actions">
          <button type="button" className="intro__button" disabled aria-disabled="true">
            Create room
          </button>
          <div className="online-join">
            <label className="intro__field">
              <span className="intro__label">Room code</span>
              <input className="intro__input" type="text" maxLength={8} placeholder="ABCD1234" disabled />
            </label>
            <button type="button" className="intro__button intro__button--ghost" disabled aria-disabled="true">
              Join room
            </button>
          </div>
        </div>

        <div className="intro__actions">
          <button type="button" className="intro__button intro__button--ghost" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnlineSetup
