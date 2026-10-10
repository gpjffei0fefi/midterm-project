// A small, always-visible reminder of what each tile color means — the
// "How to play" screen teaches this once before the game starts, but
// nothing on the board itself repeated it during play (critique finding).
const ITEMS = [
  { swatch: 'math', label: 'Technical module' },
  { swatch: 'ethics', label: 'Responsible module' },
  { swatch: 'highlight', label: 'Neutral space' },
  { swatch: 'ghost', label: 'Glitchy' },
]

function BoardLegend() {
  return (
    <div className="board-legend">
      {ITEMS.map(({ swatch, label }) => (
        <span className="board-legend__item" key={swatch}>
          <span className={`board-legend__swatch board-legend__swatch--${swatch}`} />
          {label}
        </span>
      ))}
    </div>
  )
}

export default BoardLegend
