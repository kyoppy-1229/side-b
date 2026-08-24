// Where the reunion scene left off, so a reload resumes on the same line.
//
// Kept out of the story state itself: this is throwaway progress inside one
// scene, and it is deleted the moment the scene is finished or the story resets.

import { readJson, removeValue, writeJson } from '../store/storage.js'

export const REUNION_PROGRESS_STORAGE_KEY = 'side-b:prologue-reunion:v1'

export function readReunionProgress(){
  const stored = readJson(REUNION_PROGRESS_STORAGE_KEY)
  const lineId = typeof stored?.lineId === 'string' ? stored.lineId : ''
  return lineId ? { lineId, updatedAt: Number(stored.updatedAt) || 0 } : null
}

export function writeReunionProgress(lineId){
  if(typeof lineId !== 'string' || !lineId) return false
  return writeJson(REUNION_PROGRESS_STORAGE_KEY, { lineId, updatedAt: Date.now() })
}

export function clearReunionProgress(){
  return removeValue(REUNION_PROGRESS_STORAGE_KEY)
}
