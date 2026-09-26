function ResumePrompt({ onResume, onStartNew }) {
  return (
    <div className="resume-prompt" role="dialog" aria-modal="true" aria-labelledby="resume-title">
      <div className="resume-prompt__box">
        <h2 className="resume-prompt__title" id="resume-title">
          Resume your game?
        </h2>
        <p className="resume-prompt__text">You have a game in progress on this device.</p>
        <div className="resume-prompt__actions">
          <button type="button" className="intro__button" onClick={onResume} autoFocus>
            Resume
          </button>
          <button type="button" className="intro__button intro__button--ghost" onClick={onStartNew}>
            Start New
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResumePrompt
