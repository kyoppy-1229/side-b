import { defineStore } from 'pinia'
import {
  CHAPTER_ORDER,
  INITIAL_POSITION,
  STORY_CHAPTERS,
  comparePositions,
  isKnownPosition
} from '../story/chapters.js'
import { STORY_EVENTS, isKnownEvent } from '../story/events.js'
import { STORY_MILESTONES, availableEvents, milestoneOnlyFor, milestonesUpTo, resolveTransition } from '../story/transitions.js'
import { clearReunionProgress } from '../story/reunionProgress.js'
import { DEFAULT_PLAYER_NAME, isPlayerSpeaker, resolvePlayerName, sanitizePlayerName } from '../story/player.js'
import { readJson, readValue, removeValue, writeJson } from './storage.js'

export const STORY_STATE_STORAGE_KEY = 'side-b:story-state:v2'
export const STORY_SCHEMA_VERSION = 2

// Read-only compatibility: the v1 key is migrated on first load and never
// written to again.
export const LEGACY_STORY_PHASE_STORAGE_KEY = 'side-b:story-phase:v1'

const LEGACY_PHASE_POSITIONS = Object.freeze({
  prologue_dm: Object.freeze({ chapter: STORY_CHAPTERS.PROLOGUE, step: 'dm' }),
  bbs: Object.freeze({ chapter: STORY_CHAPTERS.CH2_RECORDS_2015, step: 'bbs_opened' }),
  after_bbs_dm: Object.freeze({ chapter: STORY_CHAPTERS.CH3_BLUE_BIRDS, step: 'bird_prompt' })
})

export function createStoryState(){
  return {
    schemaVersion: STORY_SCHEMA_VERSION,
    chapter: INITIAL_POSITION.chapter,
    step: INITIAL_POSITION.step,
    // The protagonist's display name. It lives here rather than in a store of
    // its own because it is save data of exactly the same kind as the position:
    // one value, written once, read by every screen that names the player.
    playerName: DEFAULT_PLAYER_NAME,
    milestones: {},
    ending: null
  }
}

function sanitizeMilestones(value){
  if(!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const milestones = {}
  for(const [key, milestone] of Object.entries(value)){
    if(typeof key !== 'string' || !key) continue
    if(milestone === null || typeof milestone === 'object') continue
    milestones[key] = milestone
  }
  return milestones
}

// Anything unrecognisable falls back to a fresh prologue rather than throwing:
// a damaged save must never leave the player staring at a blank screen.
function sanitizeStoryState(value){
  if(!value || typeof value !== 'object') return null
  if(!isKnownPosition(value.chapter, value.step)) return null
  return {
    schemaVersion: STORY_SCHEMA_VERSION,
    chapter: value.chapter,
    step: value.step,
    // A save written before the name existed simply reads as the default, which
    // is why adding the field did not need a schema bump.
    playerName: resolvePlayerName(value.playerName),
    milestones: sanitizeMilestones(value.milestones),
    ending: typeof value.ending === 'string' && value.ending ? value.ending : null
  }
}

// v1 stored a single phase string. Its three values map onto the closest v2
// position, and the milestones the story must have passed to get there are
// filled in from the transition table so a migrated save does not read as
// "none of that ever happened".
function migrateLegacyPhase(){
  let phase = null
  try {
    phase = readValue(LEGACY_STORY_PHASE_STORAGE_KEY)
  } catch {
    return null
  }
  const position = LEGACY_PHASE_POSITIONS[phase]
  if(!position) return null

  return {
    ...createStoryState(),
    ...position,
    milestones: milestonesUpTo(position.chapter, position.step)
  }
}

export function loadStoryState(){
  let stored = null
  try {
    stored = sanitizeStoryState(readJson(STORY_STATE_STORAGE_KEY))
  } catch {
    stored = null
  }
  // A saved v2 always wins over the legacy key.
  if(stored) return stored
  return migrateLegacyPhase() || createStoryState()
}

export const useStoryStore = defineStore('story', {
  state: () => loadStoryState(),
  getters: {
    position(state){
      return { chapter: state.chapter, step: state.step }
    },
    isChapter(state){
      return (chapter) => state.chapter === chapter
    },
    // "Has the story reached at least here?" — chapter only, or chapter + step.
    hasReached(state){
      return (chapter, step = null) => {
        const target = step === null ? { chapter, step: null } : { chapter, step }
        if(step === null) return CHAPTER_ORDER.indexOf(state.chapter) >= CHAPTER_ORDER.indexOf(chapter)
        return comparePositions({ chapter: state.chapter, step: state.step }, target) >= 0
      }
    },
    hasMilestone(state){
      return (key) => Boolean(state.milestones[key])
    },
    // The name to draw for the player. Reading the raw field would show an empty
    // string if a save were ever damaged, so every screen asks for this instead.
    playerDisplayName(state){
      return resolvePlayerName(state.playerName)
    },
    // A script line's speaker as the player should read it: the player's own
    // lines take the chosen name, everyone else keeps theirs. Speaker ids in the
    // data stay untouched — this only decides what is drawn.
    speakerName(state){
      return (speaker) => (isPlayerSpeaker(speaker) ? resolvePlayerName(state.playerName) : speaker)
    },
    canOpenRevival(state){
      return Boolean(state.milestones[STORY_MILESTONES.REVIVAL_LINK_RECEIVED])
    },
    canOpenOriginal(state){
      return Boolean(state.milestones[STORY_MILESTONES.ORIGINAL_UNLOCKED])
    },
    hasDiscoveredBasement(state){
      return Boolean(state.milestones[STORY_MILESTONES.BASEMENT_MENTION_SEEN])
    }
  },
  actions: {
    persist(){
      // Storyless in-memory play still works when browser storage is unavailable.
      writeJson(STORY_STATE_STORAGE_KEY, {
        schemaVersion: STORY_SCHEMA_VERSION,
        chapter: this.chapter,
        step: this.step,
        playerName: this.playerName,
        milestones: { ...this.milestones },
        ending: this.ending
      })
    },

    // The only way the story moves. Returns true when the event actually did
    // something, so a caller can tell "advanced" from "already past this".
    dispatch(event, payload = null){
      if(!isKnownEvent(event)) return false

      const milestoneOnly = milestoneOnlyFor(event)
      if(milestoneOnly) return this.markMilestone(milestoneOnly, true)

      const next = resolveTransition({ chapter: this.chapter, step: this.step }, event)
      if(!next) return false

      this.chapter = next.chapter
      this.step = next.step
      if(next.milestone) this.milestones[next.milestone] = true
      if(payload && typeof payload === 'object' && typeof payload.ending === 'string'){
        this.ending = payload.ending
      }
      this.persist()
      return true
    },

    // Renaming is a save-data write like any other: sanitized, persisted, and
    // reported so the caller can tell "changed" from "same name again".
    setPlayerName(name){
      const sanitized = sanitizePlayerName(name)
      if(!sanitized) return false
      if(sanitized === this.playerName) return false
      this.playerName = sanitized
      this.persist()
      return true
    },

    markMilestone(key, value = true){
      if(typeof key !== 'string' || !key) return false
      if(this.milestones[key] === value) return false
      this.milestones[key] = value
      this.persist()
      return true
    },

    setEnding(ending){
      this.ending = typeof ending === 'string' && ending ? ending : null
      this.persist()
    },

    resetStory(){
      const fresh = createStoryState()
      this.chapter = fresh.chapter
      this.step = fresh.step
      this.playerName = fresh.playerName
      this.milestones = fresh.milestones
      this.ending = fresh.ending
      clearReunionProgress()
      this.persist()
    },

    // Re-read the persisted state; used to sync a change made in another tab.
    reload(){
      const loaded = loadStoryState()
      this.chapter = loaded.chapter
      this.step = loaded.step
      this.playerName = loaded.playerName
      this.milestones = loaded.milestones
      this.ending = loaded.ending
    },

    // Debug console only. Game code dispatches events instead — jumping the
    // position by hand is exactly what the event table exists to prevent.
    //
    // `syncMilestones` also back-fills everything the story would have collected
    // on the way here, so a jumped-to state behaves like a played-to one.
    debugSetPosition(chapter, step, { syncMilestones = false } = {}){
      if(!isKnownPosition(chapter, step)) return false
      this.chapter = chapter
      this.step = step
      if(syncMilestones) this.milestones = milestonesUpTo(chapter, step)
      this.persist()
      return true
    },

    // Debug console only: which events would do something from where the story
    // stands, so the panel can show live buttons instead of a flat list.
    availableEvents(){
      return availableEvents({ chapter: this.chapter, step: this.step })
    },

    // Debug console only: the whole position in one object, for snapshots.
    exportState(){
      return {
        schemaVersion: STORY_SCHEMA_VERSION,
        chapter: this.chapter,
        step: this.step,
        playerName: this.playerName,
        milestones: { ...this.milestones },
        ending: this.ending
      }
    },

    // Debug console only. A snapshot that no longer describes a real position
    // restores as a fresh story rather than a broken one.
    importState(value){
      const restored = sanitizeStoryState(value) || createStoryState()
      this.chapter = restored.chapter
      this.step = restored.step
      this.playerName = restored.playerName
      this.milestones = restored.milestones
      this.ending = restored.ending
      this.persist()
      return true
    },

    // Drops the v1 key once a v2 save exists, so the migration cannot run twice
    // over a state the player has since moved on from.
    forgetLegacyPhase(){
      return removeValue(LEGACY_STORY_PHASE_STORAGE_KEY)
    }
  }
})

export { STORY_CHAPTERS, STORY_EVENTS, STORY_MILESTONES, LEGACY_PHASE_POSITIONS }
export { DEFAULT_PLAYER_NAME, PLAYER_NAME_MAX_LENGTH } from '../story/player.js'
