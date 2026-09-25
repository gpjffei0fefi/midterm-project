import { useEffect, useState } from 'react'
import { FLY_DURATION_MS } from '../constants/timing'
import ModuleIcon from './ModuleIcon'

function FlyingModuleChip({ flight }) {
  const [phase, setPhase] = useState('start')

  useEffect(() => {
    setPhase('start')
    const raf = requestAnimationFrame(() => setPhase('end'))
    return () => cancelAnimationFrame(raf)
  }, [flight.key])

  const { fromRect, toRect } = flight
  const target = phase === 'start' ? fromRect : toRect

  return (
    <div
      className={`flying-module flying-module--${flight.accent}`}
      style={{
        top: target.top,
        left: target.left,
        width: fromRect.width,
        height: fromRect.height,
        transform: phase === 'start' ? 'scale(1)' : 'scale(0.4)',
        opacity: phase === 'start' ? 1 : 0,
        transitionDuration: `${FLY_DURATION_MS}ms`,
      }}
    >
      <span className="flying-module__icon">
        <ModuleIcon label={flight.label} ethicsWeight={flight.ethicsWeight} state="clean" />
      </span>
      {flight.code}
    </div>
  )
}

export default FlyingModuleChip
