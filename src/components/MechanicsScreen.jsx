function MechanicsScreen({ onContinue }) {
  return (
    <div className="intro">
      <div className="intro__panel intro__panel--mechanics">
        <h1 className="intro__title intro__title--small">How to play</h1>
        <p className="intro__lead">
          Assemble an AI by acquiring modules, and make it one people can actually trust.
        </p>

        <div className="mechanics">
          <section className="mechanics__card mechanics__card--pink">
            <h2 className="mechanics__heading">Your turn</h2>
            <ul>
              <li>
                <strong>Roll, move, land.</strong>
              </li>
              <li>
                <strong>Free module:</strong> answer its quiz card to acquire it. Get it wrong and you take a penalty.
              </li>
              <li>
                <strong>Opponent&rsquo;s module:</strong> pay a trust fee, scaled to how ethical that module is.
              </li>
            </ul>
          </section>

          <section className="mechanics__card mechanics__card--yellow">
            <h2 className="mechanics__heading">Trust Score</h2>
            <ul>
              <li>
                <strong>Accuracy + Fairness + Transparency,</strong> minus penalties.
              </li>
              <li>Fairness and transparency count as much as accuracy, so ethical modules pay off.</li>
            </ul>
          </section>

          <section className="mechanics__card mechanics__card--green">
            <h2 className="mechanics__heading">Clean vs. glitchy</h2>
            <ul>
              <li>
                <span className="mechanics__chip mechanics__chip--clean">Clean</span> is a module in good shape.
              </li>
              <li>
                Land on your own module and miss its follow-up question, and it turns{' '}
                <span className="mechanics__chip mechanics__chip--glitchy">Glitchy</span> and costs you trust.
              </li>
            </ul>
          </section>

          <section className="mechanics__card mechanics__card--blue">
            <h2 className="mechanics__heading">How it ends</h2>
            <ul>
              <li>
                <strong>3 laps</strong> around the board (or every module claimed).
              </li>
              <li>
                <strong>Highest Trust Score wins,</strong> not the most modules.
              </li>
            </ul>
          </section>
        </div>

        <button type="button" className="intro__button" onClick={onContinue} autoFocus>
          Continue
        </button>
      </div>
    </div>
  )
}

export default MechanicsScreen
