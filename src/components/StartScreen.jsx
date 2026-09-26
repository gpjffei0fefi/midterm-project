function StartScreen({ onPlay, children }) {
  return (
    <div className="intro">
      <div className="intro__panel intro__panel--start">
        <span className="intro__eyebrow">A board game about trustworthy AI</span>
        <h1 className="intro__title">Build-A-Brain Co.</h1>
        <p className="intro__lead">
          Race two AI rivals around the board, collecting the modules that make a model both capable and trustworthy.
        </p>
        <button type="button" className="intro__button" onClick={onPlay} autoFocus>
          Play
        </button>
      </div>
      {children}
    </div>
  )
}

export default StartScreen
