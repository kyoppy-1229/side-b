// Single funnel for every value the app persists.
//
// The debug console (#/debug) boots with a storage *scope*, which prefixes every
// key it reads or writes. A debug tab therefore never touches the save data of a
// game tab open at #/ in the same browser profile: the two run in completely
// separate spaces even though they share an origin.

let activeScope = ''

function storage(){
  if(typeof window === 'undefined') return null
  try {
    return window.localStorage || null
  } catch {
    return null
  }
}

export function setStorageScope(scope){
  activeScope = typeof scope === 'string' ? scope : ''
}

export function getStorageScope(){
  return activeScope
}

export function isSandboxed(){
  return activeScope !== ''
}

export function scopedKey(key){
  return activeScope ? `${activeScope}:${key}` : key
}

export function readValue(key){
  const store = storage()
  if(!store) return null
  try {
    return store.getItem(scopedKey(key))
  } catch {
    return null
  }
}

export function writeValue(key, value){
  const store = storage()
  if(!store) return false
  try {
    store.setItem(scopedKey(key), String(value))
    return true
  } catch {
    // Everything keeps working in memory when storage is unavailable.
    return false
  }
}

export function removeValue(key){
  const store = storage()
  if(!store) return false
  try {
    store.removeItem(scopedKey(key))
    return true
  } catch {
    return false
  }
}

export function readJson(key){
  const raw = readValue(key)
  if(raw === null) return null
  try {
    const value = JSON.parse(raw)
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

export function writeJson(key, value){
  try {
    return writeValue(key, JSON.stringify(value))
  } catch {
    return false
  }
}

// Every key that belongs to the active scope, reported without its prefix.
export function scopeKeys(){
  const store = storage()
  if(!store || typeof store.length !== 'number' || typeof store.key !== 'function') return []
  const prefix = activeScope ? `${activeScope}:` : ''
  const keys = []
  try {
    for(let index = 0; index < store.length; index += 1){
      const key = store.key(index)
      if(typeof key !== 'string') continue
      if(prefix){
        if(key.startsWith(prefix)) keys.push(key.slice(prefix.length))
      } else if(key.startsWith('side-b:')){
        keys.push(key)
      }
    }
  } catch {
    return keys
  }
  return keys
}

// Wipes only the active scope, so clearing the sandbox leaves the real save alone.
export function clearScope(){
  const keys = scopeKeys()
  for(const key of keys) removeValue(key)
  return keys.length
}
