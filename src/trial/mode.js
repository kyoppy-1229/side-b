// Which edition of the game this tab is running: the whole work, or the trial.
//
// Deliberately dependency-free, exactly like debug/scope.js: boot.js has to be
// able to settle the mode and the storage scope before the router or any store
// module is evaluated.
//
// The mode is decided ONCE, at boot, from the URL — and every other file asks
// this module rather than reading `location` again. That is what keeps
// `if(location.pathname.includes('/trial'))` from spreading through the app, and
// it is what makes the mode stable for the whole life of the tab (a reload of
// `#/trial` comes back as the trial; nothing can silently flip it mid-session).

export const GAME_MODES = Object.freeze({
  FULL: 'full',
  TRIAL: 'trial'
})

// The trial writes into its own storage namespace, so a finished playthrough of
// the full game is invisible to it and a trial run can never touch a real save.
export const TRIAL_STORAGE_SCOPE = 'trial'

export const TRIAL_PATH = '/trial'

const TRIAL_HASH_PATTERN = /^\/trial(\/|\?|$)/
// GitHub Pages (via public/404.html) and `vite dev` can both hand us
// `<base>/trial` with no hash at all; that spelling counts too.
const TRIAL_PATHNAME_PATTERN = /(^|\/)trial\/?$/

let activeMode = GAME_MODES.FULL

export function isTrialPath(path){
  return TRIAL_HASH_PATTERN.test(String(path || ''))
}

function hashPath(){
  if(typeof window === 'undefined' || !window.location) return ''
  const hash = String(window.location.hash || '')
  return hash.startsWith('#') ? hash.slice(1) : hash
}

export function isTrialLocation(){
  if(typeof window === 'undefined' || !window.location) return false
  const path = hashPath()
  if(path) return isTrialPath(path)
  return TRIAL_PATHNAME_PATTERN.test(String(window.location.pathname || ''))
}

// `<base>/trial` arrives without a hash — from the dev server's SPA fallback or
// from the 404 page's redirect. Put the route into the hash before the router
// reads the location, so the trial opens instead of the full game.
export function normalizeTrialLocation(){
  if(typeof window === 'undefined' || !window.location) return false
  if(hashPath()) return false
  if(!TRIAL_PATHNAME_PATTERN.test(String(window.location.pathname || ''))) return false
  window.location.hash = TRIAL_PATH
  return true
}

export function resolveGameMode(){
  return isTrialLocation() ? GAME_MODES.TRIAL : GAME_MODES.FULL
}

// Called once, from boot.js. Everything else only reads.
export function setGameMode(mode){
  activeMode = mode === GAME_MODES.TRIAL ? GAME_MODES.TRIAL : GAME_MODES.FULL
  return activeMode
}

export function getGameMode(){
  return activeMode
}

export function isTrialMode(){
  return activeMode === GAME_MODES.TRIAL
}
