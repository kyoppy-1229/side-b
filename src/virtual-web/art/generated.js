// Bitmap art supplied by the visual pass. Vite expands this glob at build
// time; the manifest below is also consumed by Node-based contract checks.
// The call must stay unguarded: Vite only rewrites a direct `import.meta.glob`
// call, so wrapping it in a `typeof` check leaves the check itself in the
// bundle, where `import.meta.glob` is undefined and the map would silently come
// back empty. Node-based contract checks have no glob helper at all, so the
// TypeError they hit here is caught and falls back to an empty map.
let generatedFiles = {}
try{
  generatedFiles = import.meta.glob('../../assets/web/generated/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
}catch{
  generatedFiles = {}
}

function keyFromPath(path){
  return path.split('/').pop().replace(/\.(?:png|jpe?g|webp)$/i, '')
}

export const GENERATED_ART = Object.freeze(Object.fromEntries(
  Object.entries(generatedFiles).map(([path, value]) => [keyFromPath(path), value])
))

export const GENERATED_ART_KEYS = Object.freeze([
  'local-news-city',
  'city',
  'city-night',
  'station',
  'shopping-street',
  'park',
  'seaside',
  'festival',
  'sunset',
  'stadium',
  'bus',
  'school-campus',
  'classroom',
  'classroom-desk',
  'classroom-old',
  'library',
  'community-center',
  'school-lunch',
  'cafe',
  'tech-desk',
  'abstract-tech',
  'abstract-grid',
  'abstract',
  'abstract-warm',
  'diagram',
  'screenshot',
  'culture-cinema-music',
  'poster',
  'jacket',
  'commerce-lifestyle',
  'product',
  'product-laptop',
  'product-monitor',
  'product-mouse',
  'product-keyboard',
  'product-ssd',
  'product-bag',
  'tourism-coast',
  'map',
  'map-water',
  'map-rail',
  'weather-town',
  'weather',
  'weather-sunny',
  'weather-cloudy',
  'weather-rain',
  'retro-forum'
])

// Keep a one-to-one key/file contract. Reusing a generic subject here would
// make unrelated articles show the same picture again.
export const GENERATED_ART_MANIFEST = Object.freeze(Object.fromEntries(
  GENERATED_ART_KEYS.map((key) => [key, `${key}.webp`])
))

export const ART_ASSET_KEY_BY_KIND = Object.freeze(Object.fromEntries(
  GENERATED_ART_KEYS.map((key) => [key, key])
))

const baseUrl = typeof import.meta.env === 'object' && import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL
  : '/side-b/'

function bitmapUrl(assetKey){
  const imported = GENERATED_ART[assetKey]
  if(imported) return imported
  const filename = GENERATED_ART_MANIFEST[assetKey]
  // Vite's glob map is available in the browser build. During SSR and
  // Node-based checks it is intentionally empty, so use the source URL that
  // Vite's dev server actually serves instead of a non-existent build path.
  return filename ? `${baseUrl}src/assets/web/generated/${filename}` : ''
}

export function generatedArtFor(kind){
  const assetKey = ART_ASSET_KEY_BY_KIND[kind] || ART_ASSET_KEY_BY_KIND.abstract
  return bitmapUrl(assetKey)
}
