// Snapshot / restore helpers for the debug sandbox.
//
// A snapshot is the whole observable state of one debug run: the story position
// and its milestones, where the reunion scene left off, both game editions and
// the virtual browser's tabs. They live in the sandbox storage scope, so saving
// one never reaches the real game's save data either.

import { clearReunionProgress, readReunionProgress, writeReunionProgress } from '../story/reunionProgress.js'
import { LEGACY_PHASE_POSITIONS } from '../store/story.js'
import { readJson, writeJson, clearScope, scopeKeys, scopedKey } from '../store/storage.js'

export const SNAPSHOT_STORAGE_KEY = 'side-b:debug-snapshots:v1'
export const SNAPSHOT_LIMIT = 12

export function captureState({ storyState, game, browser }){
  return {
    version: 2,
    savedAt: new Date().toISOString(),
    story: storyState.exportState(),
    // Where the reunion left off, so a snapshot taken mid-scene reopens there.
    reunionProgress: readReunionProgress(),
    gameSession: game.exportState(),
    virtualBrowser: browser.exportState()
  }
}

export function restoreState(payload, { storyState, game, browser }){
  if(!payload || typeof payload !== 'object') return false

  if(payload.story){
    storyState.importState(payload.story)
  } else if(payload.phase){
    // v1 snapshots stored only the old phase string.
    const position = LEGACY_PHASE_POSITIONS[payload.phase]
    if(position) storyState.debugSetPosition(position.chapter, position.step, { syncMilestones: true })
  }

  if(payload.reunionProgress?.lineId) writeReunionProgress(payload.reunionProgress.lineId)
  else clearReunionProgress()

  game.importState(payload.gameSession || null)
  browser.importState(payload.virtualBrowser || null)
  return true
}

export function resetSandboxState({ storyState, game, browser }){
  storyState.resetStory()
  game.resetAll()
  browser.resetBrowser()
}

export function listSnapshots(){
  const stored = readJson(SNAPSHOT_STORAGE_KEY)
  const items = Array.isArray(stored?.items) ? stored.items : []
  return items.filter((item) => item && typeof item.id === 'string')
}

export function saveSnapshot(name, state){
  const items = listSnapshots()
  const entry = {
    id: `snap-${Date.now().toString(36)}`,
    name: String(name || '').trim() || `snapshot ${items.length + 1}`,
    state
  }
  const next = [entry, ...items].slice(0, SNAPSHOT_LIMIT)
  writeJson(SNAPSHOT_STORAGE_KEY, { version: 1, items: next })
  return entry
}

export function deleteSnapshot(id){
  const next = listSnapshots().filter((item) => item.id !== id)
  writeJson(SNAPSHOT_STORAGE_KEY, { version: 1, items: next })
  return next
}

export function clearSnapshots(){
  writeJson(SNAPSHOT_STORAGE_KEY, { version: 1, items: [] })
}

// Every localStorage key this sandbox owns, with its real (prefixed) name so the
// console can show exactly what it is — and is not — writing to.
export function describeScopeKeys(){
  return scopeKeys().map((key) => ({ key, storageKey: scopedKey(key) }))
}

export function wipeSandboxStorage(){
  return clearScope()
}

export function downloadJson(filename, payload){
  if(typeof document === 'undefined') return false
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
  return true
}
