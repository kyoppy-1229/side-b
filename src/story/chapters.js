// The chapters and steps the whole work moves through.
//
// This is the *global* story position: which part of SIDE-B the player has
// reached across Messages, TRACE Search, the BBS, the revival build and the
// original build. It deliberately knows nothing about what happens *inside* a
// game edition — rooms, floors, anomalies and puzzle flags live in
// store/gameSession.js and must never be mixed in here.

export const STORY_CHAPTERS = Object.freeze({
  PROLOGUE: 'prologue',
  CH1_REVIVAL: 'ch1_revival',
  CH2_RECORDS_2015: 'ch2_records_2015',
  CH3_BLUE_BIRDS: 'ch3_blue_birds',
  CH4_ORIGINAL: 'ch4_original',
  CH5_BASEMENT: 'ch5_basement',
  CH6_REMAINS: 'ch6_remains',
  CH7_CLOCK: 'ch7_clock',
  CH8_TEN_PEOPLE: 'ch8_ten_people',
  FINAL: 'final',
  COMPLETE: 'complete'
})

export const CHAPTER_ORDER = Object.freeze(Object.values(STORY_CHAPTERS))

// Every step a chapter can rest on, in the order the story reaches them.
// Only the prologue is played through in the current build; the later chapters
// are declared so the state machine has somewhere defined to land, not because
// their content exists yet.
export const STORY_STEPS = Object.freeze({
  // The prologue walks through the reunion, the days that pass while the
  // protagonist replaces their phone, the chat app asking to sign in again on
  // the new device, the chat home with nothing in it yet, and only then the DM
  // thread — which opens because 水野 writes and the player taps the thread,
  // not because signing in took them there.
  [STORY_CHAPTERS.PROLOGUE]: Object.freeze(['reunion', 'device_setup', 'chat_login', 'chat_home', 'dm', 'dm_complete']),
  [STORY_CHAPTERS.CH1_REVIVAL]: Object.freeze(['link_received', 'exploring', 'exploration_complete']),
  [STORY_CHAPTERS.CH2_RECORDS_2015]: Object.freeze(['search', 'bbs_opened', 'bbs_complete']),
  [STORY_CHAPTERS.CH3_BLUE_BIRDS]: Object.freeze(['bird_prompt', 'birds_found']),
  [STORY_CHAPTERS.CH4_ORIGINAL]: Object.freeze(['access_ready', 'unlocked', 'clues_ready']),
  [STORY_CHAPTERS.CH5_BASEMENT]: Object.freeze(['puzzle', 'solved', 'entered']),
  [STORY_CHAPTERS.CH6_REMAINS]: Object.freeze(['records']),
  [STORY_CHAPTERS.CH7_CLOCK]: Object.freeze(['sequence']),
  [STORY_CHAPTERS.CH8_TEN_PEOPLE]: Object.freeze(['hypothesis']),
  [STORY_CHAPTERS.FINAL]: Object.freeze(['resolution', 'ending']),
  [STORY_CHAPTERS.COMPLETE]: Object.freeze(['done'])
})

// Where a brand new save starts: the reunion, before any browser exists.
export const INITIAL_POSITION = Object.freeze({
  chapter: STORY_CHAPTERS.PROLOGUE,
  step: 'reunion'
})

export function isKnownChapter(chapter){
  return CHAPTER_ORDER.includes(chapter)
}

export function isKnownPosition(chapter, step){
  return isKnownChapter(chapter) && (STORY_STEPS[chapter] || []).includes(step)
}

export function chapterIndex(chapter){
  return CHAPTER_ORDER.indexOf(chapter)
}

export function stepIndex(chapter, step){
  return (STORY_STEPS[chapter] || []).indexOf(step)
}

// -1 / 0 / 1, so callers can ask "have we reached at least here?".
// Unknown positions sort before everything, which keeps a corrupted save from
// reading as "further along than it is".
export function comparePositions(left, right){
  const leftChapter = chapterIndex(left?.chapter)
  const rightChapter = chapterIndex(right?.chapter)
  if(leftChapter !== rightChapter) return leftChapter < rightChapter ? -1 : 1
  const leftStep = stepIndex(left?.chapter, left?.step)
  const rightStep = stepIndex(right?.chapter, right?.step)
  if(leftStep === rightStep) return 0
  return leftStep < rightStep ? -1 : 1
}
