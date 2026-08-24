// The trial's story progression, and only the trial's.
//
// The trial plays the same prologue as the full game and then walks the shared
// state machine (story/transitions.js) as far as chapter 1:
//
//   prologue/reunion … prologue/dm_complete   ← identical to the full game
//   → ch1_revival/link_received               ← 水野 shared the revival build
//   → ch1_revival/exploring                   ← the build is open
//   → ch1_revival/exploration_complete        ← every required memory recorded
//   → 水野 writes about the BBS, and stops there.
//
// The trial's last piece is the player's own, and it is not sequenced: 水野 hands
// over nothing, so the saved log has to be found on the ordinary web (the board's
// notice thread, the 検索避け article — see sites/forumSites.js) and opened by
// typing its address. His message is a hint, not a lock: the address answers
// whenever the player works it out. Reading it is where the trial ends; the story
// itself does not move, so no chapter, no chat beat and no page beyond the log is
// reached.
//
// The two marks below are trial-only, because the full game goes somewhere else
// from `exploration_complete` (the private archive as a chapter, and everything
// after it). Nothing here can be reached outside the trial: every entry point
// checks the mode first, so the full game's progression is exactly what it was.

import { STORY_CHAPTERS } from '../story/chapters.js'
import { STORY_EVENTS } from '../story/events.js'
import { STORY_MILESTONES } from '../story/transitions.js'
import { clearScope } from '../store/storage.js'
import { TRIAL_PATH, isTrialMode } from './mode.js'

// Trial-only marks. They live in the same milestone map as everything else (so
// they are saved, reloaded and reset by the machinery that already exists), but
// no transition in the shared table reads them.
export const TRIAL_MILESTONES = Object.freeze({
  BBS_FOUND: 'trialBbsFound',
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

// The saved log. Nobody shares it, so the address is the trial's own puzzle —
// and the trial does not make the player wait for 水野 before looking: whoever
// pieces the address together out of the ordinary web may read it whenever they
// find it. His message is a hint, not a lock.
//
// The full game keeps its own rule (store/virtualBrowser.js): there the log
// belongs to a chapter, and it opens only after 水野 has shared it.
export function canOpenTrialArchive(){
  return isTrialMode()
}

// The player got there. This records nothing about the story — the position
// stays where 水野 left it — it only lets Messages offer the end of the trial
// once the log has actually been opened.
export function markTrialBbsFound(story){
  if(!isTrialMode()) return false
  return story.markMilestone(TRIAL_MILESTONES.BBS_FOUND, true)
}

export function isTrialBbsFound(story){
  return isTrialMode() && story.hasMilestone(TRIAL_MILESTONES.BBS_FOUND)
}

// The thread 水野 opens after the revival build. In the trial it is a script of
// its own (data/trial_dm_after_revival.json): the BBS is mentioned, nothing is
// shared — not even an address — and the story does not move on to the archive
// chapter. It stays the last conversation of the trial: reading the saved log
// adds no message to it.
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

// A save written by an older build can carry COMPLETE without BBS_FOUND: back
// then the trial ended at 水野's last line, and the saved log was not findable
// at all. It ends on the log now, so the stale mark is dropped and the run picks
// up where he stopped writing — otherwise the end screen would cover the browser
// for good and the log could never be reached. Called once while the shell is
// deciding what to draw (App.vue); a no-op in the full game.
export function reopenUnfinishedTrial(story){
  if(!isTrialMode()) return false
  if(!story.hasMilestone(TRIAL_MILESTONES.COMPLETE)) return false
  if(story.hasMilestone(TRIAL_MILESTONES.BBS_FOUND)) return false
  return story.markMilestone(TRIAL_MILESTONES.COMPLETE, false)
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
