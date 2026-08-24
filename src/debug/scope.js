// Which routes belong to the debug console, and the storage scope they run in.
// Kept dependency-free so main.js can decide the scope before anything else
// (stores included) reads from localStorage.

export const DEBUG_STORAGE_SCOPE = 'debug'
export const DEBUG_PATH = '/debug'

const DEBUG_PATH_PATTERN = /^\/(debug|__debug)(\/|\?|$)/

export function isDebugPath(path){
  return DEBUG_PATH_PATTERN.test(String(path || ''))
}

export function isDebugLocation(){
  if(typeof window === 'undefined' || !window.location) return false
  const hash = String(window.location.hash || '')
  return isDebugPath(hash.startsWith('#') ? hash.slice(1) : hash)
}

// Walking in or out of the console needs a full reboot (the storage scope is
// fixed at boot). A hash change alone would not reload, and aborting the router
// navigation rolls the URL back — so the target path is parked in sessionStorage
// and re-applied on the way up, before the router reads the location.
export const BOOT_PATH_KEY = 'side-b:boot-path'

export function requestBoot(path){
  if(typeof window === 'undefined') return false
  try {
    window.sessionStorage.setItem(BOOT_PATH_KEY, path)
    return true
  } catch {
    return false
  }
}

export function consumePendingBootPath(){
  if(typeof window === 'undefined') return null
  try {
    const path = window.sessionStorage.getItem(BOOT_PATH_KEY)
    if(!path) return null
    window.sessionStorage.removeItem(BOOT_PATH_KEY)
    window.location.hash = path
    return path
  } catch {
    return null
  }
}
