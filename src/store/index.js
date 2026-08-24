// Compatibility layer over the global story state.
//
// The story used to be a single phase string (prologue_dm / bbs / after_bbs_dm)
// living in this store. It is now a chapter + step + milestone state machine in
// store/story.js, and this module keeps the old surface working for the parts of
// the app that have not been rewritten onto it yet (the BBS flow, the debug
// console's scenarios and snapshots, and the existing check scripts).
//
// New code must use `useStoryStore()` and `story.dispatch(STORY_EVENTS.X)`.
// Everything here is a bridge that will be removed once chapters 2 and 3 are
// implemented as real story events.

import { defineStore } from 'pinia'
import { STORY_CHAPTERS, chapterIndex } from '../story/chapters.js'
import {
  LEGACY_PHASE_POSITIONS,
  LEGACY_STORY_PHASE_STORAGE_KEY,
  STORY_STATE_STORAGE_KEY,
  useStoryStore
} from './story.js'

export const GAME_PHASES = Object.freeze({
  PROLOGUE_DM: 'prologue_dm',
  BBS: 'bbs',
  AFTER_BBS_DM: 'after_bbs_dm'
})

export const STORY_PHASE_STORAGE_KEY = LEGACY_STORY_PHASE_STORAGE_KEY
export { STORY_STATE_STORAGE_KEY }

const VALID_PHASES = new Set(Object.values(GAME_PHASES))
const PHASE_ORDER = Object.freeze(Object.values(GAME_PHASES))

// Which legacy phase a v2 position looks like from the outside. The prologue and
// chapter 1 both sit before the archive, so they read as the prologue DM.
export function legacyPhaseForChapter(chapter){
  const index = chapterIndex(chapter)
  if(index <= chapterIndex(STORY_CHAPTERS.CH1_REVIVAL)) return GAME_PHASES.PROLOGUE_DM
  if(index === chapterIndex(STORY_CHAPTERS.CH2_RECORDS_2015)) return GAME_PHASES.BBS
  return GAME_PHASES.AFTER_BBS_DM
}

export const useGameStore = defineStore('game', {
  getters: {
    phase(){
      return legacyPhaseForChapter(useStoryStore().chapter)
    }
  },
  actions: {
    setPhase(phase){
      if(!VALID_PHASES.has(phase)) return
      const position = LEGACY_PHASE_POSITIONS[phase]
      if(!position) return
      useStoryStore().debugSetPosition(position.chapter, position.step)
    },
    advancePhase(phase){
      if(!VALID_PHASES.has(phase)) return
      if(PHASE_ORDER.indexOf(phase) <= PHASE_ORDER.indexOf(this.phase)) return
      this.setPhase(phase)
    },
    openBBS(){
      this.advancePhase(GAME_PHASES.BBS)
    },
    completeBBS(){
      this.advancePhase(GAME_PHASES.AFTER_BBS_DM)
    },
    reset(){
      this.setPhase(GAME_PHASES.PROLOGUE_DM)
    },
    // Re-read the persisted state; used to sync a change made in another tab.
    reload(){
      useStoryStore().reload()
    }
  }
})
