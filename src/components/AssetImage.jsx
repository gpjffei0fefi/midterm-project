import { useState } from 'react'

// An <img> for a piece of UI art that falls back to the old code-drawn
// version (`fallback`) if the file is missing or fails to load, so a broken
// asset never leaves a hole where a token, flag or die used to be.
function AssetImage({ src, className, fallback = null, alt = '' }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return fallback
  return <img src={src} className={className} alt={alt} draggable="false" onError={() => setFailed(true)} />
}

export default AssetImage
