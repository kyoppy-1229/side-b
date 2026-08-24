// The trial's story progression, and only the trial's.
//
// The trial plays the same prologue as the full game and then walks the shared
// state machine (story/transitions.js) as far as chapter 1:
//
//   prologue/reunion … prologue/dm_complete   ← identical to the full game
//   → ch1_revival/link_received               ← 水野 shared the revival build
//   → ch1_revival/exploring                   ← the build is open
//   → ch1_revival/exploration_complete        ← every required memory recorded
//   → 水野 writes about the BBS, and the trial ends there.
//
// The last beat is a trial-only mark rather than a chapter, because the full
// game goes somewhere else from `exploration_complete` (the private archive, and
// everything after it). Nothing here can be reached outside the trial: every
// entry point checks the mode first, so the full game's progression is exactly
// what it was.

import { STORY_CHAPTERS } from '../story/chapters.js'
import { STORY_EVENTS } from '../story/events.js'
import { STORY_MILESTONES } from '../story/transitions.js'
import { clearScope } from '../store/storage.js'
import { TRIAL_PATH, isTrialMode } from './mode.js'

// Trial-only marks. They live in the same milestone map as everything else (so
// they are saved, reloaded and reset by the machinery that already exists), but
// no transition in the shared table reads them.
export const TRIAL_MILESTONES = Object.freeze({
  COMPLETE: 'trialComplete'
})

// The revival build is only reachable once 水野 has actually sent it.
export function canOpenTrialRevival(story){
  return story.hasMilestone(STORY_MILESTONES.PROLOGUE_DM_COMPLETE)
    || story.hasReached(STORY_CHAPTERS.PROLOGUE, 'dm_complete')
}

// Opening the revival build. Both events are idempotent: the second visit, a
// reload inside the build and a remount of the tab all do nothing.
export function openTrialRevival(story){
  if(!isTrialMode()) return false
  if(!canOpenTrialRevival(story)) return false
  story.dispatch(STORY_EVENTS.REVIVAL_LINK_RECEIVED)
  story.dispatch(STORY_EVENTS.REVIVAL_OPENED)
  return story.hasReached(STORY_CHAPTERS.CH1_REVIVAL, 'exploring')
}

// Every required memory is recorded. This is what makes 水野 write again.
export function completeTrialRevival(story){
  if(!isTrialMode()) return false
  return story.dispatch(STORY_EVENTS.REVIVAL_EXPLORATION_COMPLETE)
}

export function isTrialRevivalCleared(story){
  return isTrialMode() && story.hasMilestone(STORY_MILESTONES.REVIVAL_EXPLORATION_COMPLETE)
}

// The thread 水野 opens after the revival build. In the trial it is a script of
// its own (data/trial_dm_after_revival.json): the BBS is mentioned, nothing is
// shared, and the story does not move on to the archive chapter.
export function isTrialAfterRevivalChat(story){
  return isTrialRevivalCleared(story)
}

export function markTrialComplete(story){
  if(!isTrialMode()) return false
  return story.markMilestone(TRIAL_MILESTONES.COMPLETE, true)
}

export function isTrialComplete(story){
  return isTrialMode() && story.hasMilestone(TRIAL_MILESTONES.COMPLETE)
}

/**
 * 「最初から」. Everything the trial saved lives in the trial's storage scope
 * (see mode.js), so wiping the scope drops the whole run in one go — the story
 * position, the chat, the notifications, the revival session with its memories,
 * the browser's tabs, the reunion's resume point. Reloading afterwards rebuilds
 * every store from the now-empty namespace, which is both simpler and safer than
 * resetting them one by one and hoping none was missed.
 *
 * The full game's save is in a different namespace and is not touched.
 */
export function restartTrial(){
  clearScope()
  if(typeof window === 'undefined') return false
  window.location.hash = TRIAL_PATH
  window.location.reload()
  return true
}
