// The story state machine: from where, on what event, to where.
//
// Only the prologue is played through in the current build. The later rows exist
// so a chapter that gets implemented has a declared landing point instead of an
// invented one — nothing outside the prologue is dispatched yet.

import { INITIAL_POSITION, STORY_CHAPTERS } from './chapters.js'
import { STORY_EVENTS } from './events.js'

// Durable "this happened" marks, independent of where the position currently is.
export const STORY_MILESTONES = Object.freeze({
  REUNION_COMPLETE: 'reunionComplete',
  DEVICE_MIGRATION_COMPLETE: 'deviceMigrationComplete',
  CHAT_RELOGIN_COMPLETE: 'chatReloginComplete',
  SEARCH_TUTORIAL_SEEN: 'searchTutorialSeen',
  FIRST_SEARCH_PERFORMED: 'firstSearchPerformed',
  MIZUNO_FIRST_MESSAGE_RECEIVED: 'mizunoFirstMessageReceived',
  MIZUNO_THREAD_OPENED: 'mizunoThreadOpened',
  PROLOGUE_DM_COMPLETE: 'prologueDmComplete',
  REVIVAL_LINK_RECEIVED: 'revivalLinkReceived',
  REVIVAL_OPENED: 'revivalOpened',
  REVIVAL_EXPLORATION_COMPLETE: 'revivalExplorationComplete',
  BBS_OPENED: 'bbsOpened',
  BASEMENT_MENTION_SEEN: 'basementMentionSeen',
  BBS_COMPLETE: 'bbsComplete',
  TWO_BIRDS_FOUND: 'twoBirdsFound',
  ACCESS_INFO_RESOLVED: 'accessInfoResolved',
  ORIGINAL_UNLOCKED: 'originalUnlocked',
  BASEMENT_PUZZLE_SOLVED: 'basementPuzzleSolved',
  BASEMENT_ENTERED: 'basementEntered',
  TIME_PATTERN_FOUND: 'timePatternFound',
  CLOCK_SEQUENCE_COMPLETE: 'clockSequenceComplete',
  ENDING_COMPLETE: 'endingComplete'
})

function to(chapter, step, milestone = null){
  return Object.freeze({ chapter, step, milestone })
}

// TRANSITIONS[chapter][step][event] -> destination
const TRANSITIONS = Object.freeze({
  [STORY_CHAPTERS.PROLOGUE]: Object.freeze({
    reunion: Object.freeze({
      [STORY_EVENTS.REUNION_COMPLETE]: to(STORY_CHAPTERS.PROLOGUE, 'device_setup', STORY_MILESTONES.REUNION_COMPLETE)
    }),
    // The new PC restores the account, the apps and the settings; the chat
    // history was local to the old machine and does not come with them.
    device_setup: Object.freeze({
      [STORY_EVENTS.DEVICE_MIGRATION_COMPLETE]: to(STORY_CHAPTERS.PROLOGUE, 'chat_login', STORY_MILESTONES.DEVICE_MIGRATION_COMPLETE)
    }),
    // Changing devices invalidated the chat session, so it has to be signed in
    // again from the account the migration carried over. Signing in lands on the
    // chat home, not in a thread: there is no thread yet.
    chat_login: Object.freeze({
      [STORY_EVENTS.CHAT_RELOGIN_COMPLETE]: to(STORY_CHAPTERS.PROLOGUE, 'chat_home', STORY_MILESTONES.CHAT_RELOGIN_COMPLETE)
    }),
    // 水野's first message arriving is a mark, not a move (see the
    // milestone-only table below): it makes the thread exist in the list. The
    // position follows the player, who has to open it themselves.
    chat_home: Object.freeze({
      [STORY_EVENTS.MIZUNO_THREAD_OPENED]: to(STORY_CHAPTERS.PROLOGUE, 'dm', STORY_MILESTONES.MIZUNO_THREAD_OPENED)
    }),
    dm: Object.freeze({
      [STORY_EVENTS.PROLOGUE_DM_COMPLETE]: to(STORY_CHAPTERS.PROLOGUE, 'dm_complete', STORY_MILESTONES.PROLOGUE_DM_COMPLETE)
    }),
    // The link card that carries the story out of the prologue is a separate
    // task; nothing dispatches REVIVAL_LINK_RECEIVED yet.
    dm_complete: Object.freeze({
      [STORY_EVENTS.REVIVAL_LINK_RECEIVED]: to(STORY_CHAPTERS.CH1_REVIVAL, 'link_received', STORY_MILESTONES.REVIVAL_LINK_RECEIVED)
    })
  }),
  [STORY_CHAPTERS.CH1_REVIVAL]: Object.freeze({
    link_received: Object.freeze({
      [STORY_EVENTS.REVIVAL_OPENED]: to(STORY_CHAPTERS.CH1_REVIVAL, 'exploring', STORY_MILESTONES.REVIVAL_OPENED)
    }),
    exploring: Object.freeze({
      [STORY_EVENTS.REVIVAL_EXPLORATION_COMPLETE]: to(STORY_CHAPTERS.CH1_REVIVAL, 'exploration_complete', STORY_MILESTONES.REVIVAL_EXPLORATION_COMPLETE)
    }),
    exploration_complete: Object.freeze({
      [STORY_EVENTS.AFTER_REVIVAL_DM_COMPLETE]: to(STORY_CHAPTERS.CH2_RECORDS_2015, 'search')
    })
  }),
  [STORY_CHAPTERS.CH2_RECORDS_2015]: Object.freeze({
    search: Object.freeze({
      [STORY_EVENTS.BBS_OPENED]: to(STORY_CHAPTERS.CH2_RECORDS_2015, 'bbs_opened', STORY_MILESTONES.BBS_OPENED)
    }),
    bbs_opened: Object.freeze({
      [STORY_EVENTS.BBS_COMPLETE]: to(STORY_CHAPTERS.CH3_BLUE_BIRDS, 'bird_prompt', STORY_MILESTONES.BBS_COMPLETE)
    })
  }),
  [STORY_CHAPTERS.CH3_BLUE_BIRDS]: Object.freeze({
    bird_prompt: Object.freeze({
      [STORY_EVENTS.TWO_BIRDS_FOUND]: to(STORY_CHAPTERS.CH3_BLUE_BIRDS, 'birds_found', STORY_MILESTONES.TWO_BIRDS_FOUND)
    }),
    birds_found: Object.freeze({
      [STORY_EVENTS.ACCESS_INFO_RESOLVED]: to(STORY_CHAPTERS.CH4_ORIGINAL, 'access_ready', STORY_MILESTONES.ACCESS_INFO_RESOLVED)
    })
  }),
  [STORY_CHAPTERS.CH4_ORIGINAL]: Object.freeze({
    access_ready: Object.freeze({
      [STORY_EVENTS.ORIGINAL_UNLOCKED]: to(STORY_CHAPTERS.CH4_ORIGINAL, 'unlocked', STORY_MILESTONES.ORIGINAL_UNLOCKED)
    }),
    unlocked: Object.freeze({
      [STORY_EVENTS.ORIGINAL_CLUES_READY]: to(STORY_CHAPTERS.CH5_BASEMENT, 'puzzle')
    })
  }),
  [STORY_CHAPTERS.CH5_BASEMENT]: Object.freeze({
    puzzle: Object.freeze({
      [STORY_EVENTS.BASEMENT_PUZZLE_SOLVED]: to(STORY_CHAPTERS.CH5_BASEMENT, 'solved', STORY_MILESTONES.BASEMENT_PUZZLE_SOLVED)
    }),
    solved: Object.freeze({
      [STORY_EVENTS.BASEMENT_ENTERED]: to(STORY_CHAPTERS.CH5_BASEMENT, 'entered', STORY_MILESTONES.BASEMENT_ENTERED)
    }),
    entered: Object.freeze({
      [STORY_EVENTS.BASEMENT_INVESTIGATION_COMPLETE]: to(STORY_CHAPTERS.CH6_REMAINS, 'records')
    })
  }),
  [STORY_CHAPTERS.CH6_REMAINS]: Object.freeze({
    records: Object.freeze({
      [STORY_EVENTS.TIME_PATTERN_FOUND]: to(STORY_CHAPTERS.CH7_CLOCK, 'sequence', STORY_MILESTONES.TIME_PATTERN_FOUND)
    })
  }),
  [STORY_CHAPTERS.CH7_CLOCK]: Object.freeze({
    sequence: Object.freeze({
      [STORY_EVENTS.CLOCK_SEQUENCE_COMPLETE]: to(STORY_CHAPTERS.CH8_TEN_PEOPLE, 'hypothesis', STORY_MILESTONES.CLOCK_SEQUENCE_COMPLETE)
    })
  }),
  [STORY_CHAPTERS.CH8_TEN_PEOPLE]: Object.freeze({
    hypothesis: Object.freeze({
      [STORY_EVENTS.HYPOTHESIS_READY]: to(STORY_CHAPTERS.FINAL, 'resolution')
    })
  }),
  [STORY_CHAPTERS.FINAL]: Object.freeze({
    resolution: Object.freeze({
      [STORY_EVENTS.FINAL_RESOLVED]: to(STORY_CHAPTERS.FINAL, 'ending')
    }),
    ending: Object.freeze({
      [STORY_EVENTS.ENDING_COMPLETE]: to(STORY_CHAPTERS.COMPLETE, 'done', STORY_MILESTONES.ENDING_COMPLETE)
    })
  })
})

// Events that only record that something was seen. They never move the
// position, so they are safe to fire from wherever the player noticed it.
const MILESTONE_ONLY_EVENTS = Object.freeze({
  [STORY_EVENTS.BASEMENT_MENTION_SEEN]: STORY_MILESTONES.BASEMENT_MENTION_SEEN,
  // The protagonist talks the player through the search box once, on the chat
  // home; marking it keeps the monologue from replaying on every remount.
  [STORY_EVENTS.SEARCH_TUTORIAL_COMPLETE]: STORY_MILESTONES.SEARCH_TUTORIAL_SEEN,
  // The player's first search of the open web. This is what 水野's first message
  // answers, so it is a mark rather than a move: searching does not take the
  // player anywhere, it just makes the phone go off a moment later.
  [STORY_EVENTS.FIRST_SEARCH_PERFORMED]: STORY_MILESTONES.FIRST_SEARCH_PERFORMED,
  // The first message lands a couple of seconds after that first search, while
  // the player is still reading results; marking it is what puts 水野 in the
  // conversation list and what keeps the wait from being replayed on a remount.
  [STORY_EVENTS.MIZUNO_FIRST_MESSAGE_RECEIVED]: STORY_MILESTONES.MIZUNO_FIRST_MESSAGE_RECEIVED
})

// The events that apply from `position`, in table order. The console uses this
// to show which buttons would actually do something from where the story is.
export function availableEvents(position){
  return Object.keys(TRANSITIONS[position?.chapter]?.[position?.step] || {})
}

// Every milestone the story would have collected on its way to `chapter/step`,
// walked along the table instead of listed by hand. Used when a save is migrated
// from v1 and when the console drops the story somewhere it did not play to.
export function milestonesUpTo(chapter, step){
  const collected = {}
  let position = { chapter: INITIAL_POSITION.chapter, step: INITIAL_POSITION.step }

  // The table is a line, so each step has one way out; the bound is only there
  // so a future branch cannot turn this into an endless walk.
  for(let guard = 0; guard < 64; guard += 1){
    if(position.chapter === chapter && position.step === step) return collected
    const [event] = availableEvents(position)
    // Walked off the end without meeting the target: it is not on the line, so
    // claiming every milestone along the way would be a lie.
    if(!event) return {}
    const next = TRANSITIONS[position.chapter][position.step][event]
    if(next.milestone) collected[next.milestone] = true
    position = { chapter: next.chapter, step: next.step }
  }
  return {}
}

// The destination for `event` from `position`, or null when the event does not
// apply there — which is how out-of-order events end up doing nothing.
export function resolveTransition(position, event){
  return TRANSITIONS[position?.chapter]?.[position?.step]?.[event] || null
}

export function milestoneOnlyFor(event){
  return MILESTONE_ONLY_EVENTS[event] || null
}
