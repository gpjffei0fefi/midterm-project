// Illustrated module art lives in src/assets/modules as
// `<module-slug>-clean.png` and `<module-slug>-glitchy.png` (Data Pipeline's
// glitchy file is spelled `-glitch`, which is accepted too). The chassis is
// src/assets/creature/chassis-base.png.
//
// Globbing (instead of one import per file) means a file that isn't there
// yet can't break the build: lookups return null and callers fall back to the
// CSS placeholder shape for that module/state.
const moduleFiles = import.meta.glob('../assets/modules/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
})
const chassisFiles = import.meta.glob('../assets/creature/chassis-base.png', {
  eager: true,
  import: 'default',
  query: '?url',
})

const ART = {}
for (const [path, url] of Object.entries(moduleFiles)) {
  const match = path.match(/([^/]+)-(clean|glitchy|glitch)\.png$/)
  if (!match) continue
  const [, slug, variant] = match
  ART[slug] ??= {}
  ART[slug][variant === 'clean' ? 'clean' : 'glitchy'] = url
}

export const chassisArt = Object.values(chassisFiles)[0] ?? null

export function moduleSlug(label) {
  return label.toLowerCase().replace(/\s+/g, '-')
}

// Returns the image URL for a module in the given state, or null if that
// illustration hasn't been added yet.
export function moduleArt(label, state) {
  return ART[moduleSlug(label)]?.[state === 'glitchy' ? 'glitchy' : 'clean'] ?? null
}

// Fetches and decodes images ahead of time so they paint the instant they're
// mounted. These PNGs are large, so without this an animated entrance can play
// on an empty box while the image is still decoding. Never rejects.
export function preloadImages(urls) {
  return Promise.all(
    urls.map((url) => {
      const img = new Image()
      img.src = url
      return (img.decode ? img.decode() : Promise.resolve()).catch(() => {})
    })
  )
}
