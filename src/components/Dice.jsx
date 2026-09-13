function Dice({ value, rolling }) {
  return (
    <div className={`dice${rolling ? ' dice--rolling' : ''}`}>
      <span className="dice__label">D6</span>
      <span className="dice__value">{value}</span>
    </div>
  )
}

export default Dice
