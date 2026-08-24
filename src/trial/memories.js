// The trial's required memories — one table, read by everything.
//
// The clear condition, the progress counter, the 思い出 list and the text the
// player reads when they find one are all derived from this file, so the list
// can never disagree with the check ("5 in the list, 6 to clear" is impossible
// by construction).
//
// Only the REVIVAL build has them, and only while the tab is running the trial:
// the full game's memory catalogue (game/data/editions.js) is untouched.
//
// An entry is addressed by (roomId, interaction text id) rather than by a single
// furniture id on purpose. Several rooms are furnished from generated grids —
// six identical 閲覧机, twenty-two identical 生徒PC — and the trial asks the
// player to find *the kind of thing* in *that room*, not one particular desk out
// of six. The same id pair is what the shared object data already carries, so
// nothing new has to be threaded through the scene builder.

import { EDITIONS, FLOOR_DEFINITIONS, ROOM_DEFINITIONS } from '../game/data/school.js'
import { isTrialMode } from './mode.js'

// The player never sees more than 階 + 部屋名 of this, so the description and
// the protagonist's line stay in the file that also decides the location label:
// there is nowhere else for an object name to leak out of.
export const TRIAL_REQUIRED_MEMORIES = Object.freeze([
  Object.freeze({
    id: 'memory:trial-library-desk',
    roomId: 'F1-04',
    interactionTextId: 'reading-tables',
    description: '窓際の閲覧机。天板の隅に、鉛筆の跡がうすく残っている。\n何度も書いては消したようだ。',
    voice: '「……ここ、なんとなく覚えてる気がする。」'
  }),
  Object.freeze({
    id: 'memory:trial-music-piano',
    roomId: 'F1-06',
    interactionTextId: 'piano',
    description: 'グランドピアノ。蓋を上げると、鍵盤の白がわずかに黄ばんでいる。\n中央の何鍵かだけ、角が丸く擦れていた。',
    voice: '「この音、聞いたことがある。」'
  }),
  Object.freeze({
    id: 'memory:trial-classroom-lockers',
    roomId: 'F2-01',
    interactionTextId: 'lockers',
    description: '生徒用のロッカー。名前札を外した跡が、同じ大きさで並んでいる。\n一つだけ、札の四隅がまだ白く残っている。',
    voice: '「自分の場所が、どこだったか分かる。」'
  }),
  Object.freeze({
    id: 'memory:trial-art-table',
    roomId: 'F2-04',
    interactionTextId: 'art-tables',
    description: '四人で囲む制作机。天板に絵の具の跡が層になって沈んでいる。\n拭き取れなかった色が、木目の溝に残っていた。',
    voice: '「この机の角、見覚えがある。」'
  }),
  Object.freeze({
    id: 'memory:trial-computer-room',
    roomId: 'F3-03',
    interactionTextId: 'student-pcs',
    description: '授業用のPCが並んでいる。どの画面にも同じ壁紙が表示されたままだ。\n一台だけ、キーボードの文字が擦れて読めない。',
    voice: '「……この並び、覚えてる。」'
  })
])

export const TRIAL_REQUIRED_MEMORY_IDS = Object.freeze(TRIAL_REQUIRED_MEMORIES.map((entry) => entry.id))

function key(roomId, interactionTextId){
  return `${roomId}::${interactionTextId}`
}

const BY_OBJECT = Object.freeze(Object.fromEntries(
  TRIAL_REQUIRED_MEMORIES.map((entry) => [key(entry.roomId, entry.interactionTextId), entry])
))

const BY_ID = Object.freeze(Object.fromEntries(
  TRIAL_REQUIRED_MEMORIES.map((entry) => [entry.id, entry])
))

// 「1階・図書室」. Never the room id, and never anything more specific than the
// room: the object, the furniture and the memory itself stay unsaid.
export function trialMemoryLocation(entry){
  const room = ROOM_DEFINITIONS[entry?.roomId]
  if(!room) return ''
  const floor = FLOOR_DEFINITIONS[room.floor]?.name || room.floor
  return `${floor}・${room.name}`
}

function appliesTo(edition){
  return isTrialMode() && edition === EDITIONS.REVIVAL
}

// The object the trial hangs a required memory on, or null. Both lookups below
// go through here, so "is this required?" has exactly one answer.
export function trialRequiredMemoryFor(roomId, interactionTextId, edition = EDITIONS.REVIVAL){
  if(!appliesTo(edition) || !roomId || !interactionTextId) return null
  return BY_OBJECT[key(roomId, interactionTextId)] || null
}

export function trialMemoryIdFor(roomId, interactionTextId, edition = EDITIONS.REVIVAL){
  return trialRequiredMemoryFor(roomId, interactionTextId, edition)?.id || null
}

// 通常の客観的な描写 → 一行あけて → 主人公自身の短い言葉。
// SceneStage draws each line separately and marks the quoted one as the
// protagonist speaking.
export function trialInteractionText(roomId, interactionTextId, edition = EDITIONS.REVIVAL){
  const entry = trialRequiredMemoryFor(roomId, interactionTextId, edition)
  if(!entry) return ''
  return `${entry.description}\n\n${entry.voice}`
}

export function isTrialRequiredMemoryId(memoryId){
  return Boolean(BY_ID[memoryId])
}

/**
 * The one progress report: the list the 思い出 panel draws, the counter in the
 * HUD, and the clear check are all this object.
 */
export function trialMemoryProgress(session){
  const found = new Set(Array.isArray(session?.memories) ? session.memories : [])
  const entries = TRIAL_REQUIRED_MEMORIES.map((entry) => ({
    id: entry.id,
    location: trialMemoryLocation(entry),
    recorded: found.has(entry.id)
  }))
  const recorded = entries.filter((entry) => entry.recorded).length
  return {
    entries,
    total: entries.length,
    recorded,
    remaining: entries.length - recorded,
    complete: entries.length > 0 && recorded === entries.length
  }
}

// The trial's revival build is finished when every required memory is recorded.
// Optional memories, ordinary objects and unexplored rooms play no part.
export function isTrialRevivalComplete(session){
  return trialMemoryProgress(session).complete
}
