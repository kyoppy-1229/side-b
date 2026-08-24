import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'
import {
  EDITIONS,
  canAccessBasement,
  FLOOR_DEFINITIONS,
  FLOOR_ORDER,
  ROOM_DEFINITIONS,
  ROOM_IDS,
  canEnterRoom,
  STAIR_CONNECTIONS
} from '../src/game/data/school.js'
import {
  MEMORY_DEFINITIONS,
  getEditionConfig,
  getInteractionText,
  getMemoryCatalogue,
  getRoomObjects,
  resolveClock,
  resolveObject,
  resolveRoom
} from '../src/game/data/editions.js'
import { canMovePlayer, createEditionSession, getNextPlayerPosition, useGameSessionStore } from '../src/store/gameSession.js'

function createMemoryStorage(){
  const values = new Map()
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear()
  }
}

globalThis.window = { localStorage: createMemoryStorage() }

assert.equal(ROOM_IDS.length, 21)
for(const floor of FLOOR_ORDER){
  assert.ok(FLOOR_DEFINITIONS[floor])
  assert.ok(FLOOR_DEFINITIONS[floor].rooms.length >= 3)
}
assert.deepEqual(FLOOR_DEFINITIONS['1F'].rooms, ['F1-01', 'F1-02', 'F1-03', 'F1-04', 'F1-05', 'F1-06'])
assert.deepEqual(FLOOR_DEFINITIONS['2F'].rooms, ['F2-01', 'F2-02', 'F2-03', 'F2-04', 'F2-05', 'F2-06'])
assert.deepEqual(FLOOR_DEFINITIONS['3F'].rooms, ['F3-01', 'F3-02', 'F3-03', 'F3-04', 'F3-05', 'F3-06'])
assert.deepEqual(FLOOR_DEFINITIONS.B1.rooms, ['B1-01', 'B1-02', 'B1-03'])
assert.equal(ROOM_DEFINITIONS['B1-01'].kind, 'storage')
assert.equal(ROOM_DEFINITIONS['B1-02'].kind, 'boiler')
assert.equal(ROOM_DEFINITIONS['B1-03'].kind, 'archive')

const ordinaryArchitecture = ROOM_DEFINITIONS['F2-01'].fixedArchitecture
assert.deepEqual(ROOM_DEFINITIONS['F2-06'].fixedArchitecture, ordinaryArchitecture)
assert.deepEqual(ROOM_DEFINITIONS['F3-06'].fixedArchitecture, ordinaryArchitecture)
assert.deepEqual(ROOM_DEFINITIONS['B1-01'].fixedArchitecture, ['north-corridor', 'north-entry', 'windowless-exterior', 'utility-pipes', 'metal-shelving'])
assert.deepEqual(STAIR_CONNECTIONS.west['2F'], ['1F', '3F'])
assert.deepEqual(STAIR_CONNECTIONS.east['2F'], ['1F', '3F'])
// B1 must have a way back up, or the basement is a one-way trip.
assert.deepEqual(STAIR_CONNECTIONS.west.B1, ['1F'])
assert.equal(ROOM_DEFINITIONS['F2-01'].furniture.filter((item) => item.id.startsWith('student-desk-')).length, 20)
assert.equal(ROOM_DEFINITIONS['F3-01'].furniture.filter((item) => item.id.startsWith('student-desk-')).length, 20)
assert.equal(getRoomObjects('F3-03', EDITIONS.REVIVAL).length, getRoomObjects('F3-03', EDITIONS.ORIGINAL).length)
assert.ok(getRoomObjects('F1-01', EDITIONS.REVIVAL).find((item) => item.id === 'school-map').memoryId)
assert.doesNotMatch(getInteractionText('school-map', EDITIONS.REVIVAL), /地下|B1/)
assert.notEqual(getEditionConfig(EDITIONS.REVIVAL).atmosphere.time, getEditionConfig(EDITIONS.ORIGINAL).atmosphere.time)
assert.equal(resolveClock('clock-2f-hall', EDITIONS.REVIVAL).state, 'normal')
assert.equal(resolveClock('clock-2f-hall', EDITIONS.ORIGINAL).state, 'stopped')

const edgeRoom = ROOM_DEFINITIONS['F1-05']
const edgePosition = getNextPlayerPosition(edgeRoom, { x: 400, y: 100 }, { x: 10000, y: 10000 })
assert.deepEqual(edgePosition, {
  x: edgeRoom.dimensions.width - 24,
  y: edgeRoom.dimensions.height - 30,
  width: 24,
  height: 30
})
assert.equal(canMovePlayer(edgeRoom, { x: 400, y: 100 }, { x: 10000, y: 10000 }), true)

// Rooms are authored in metres: 普通教室 = 9.0m × 7.5m, 特別教室 = 13.5m.
assert.equal(ROOM_DEFINITIONS['F2-01'].widthM, 9.0)
assert.equal(ROOM_DEFINITIONS['F2-01'].depthM, 7.5)
assert.equal(ROOM_DEFINITIONS['F1-04'].widthM, 13.5)
// 昇降口 is the one room that opens off the *south* (schoolyard) side of the hall.
assert.equal(ROOM_DEFINITIONS['F1-01'].corridorSide, 'south')
for(const roomId of ROOM_IDS){
  if(roomId === 'F1-01') continue
  assert.equal(ROOM_DEFINITIONS[roomId].corridorSide, 'north', `${roomId} should open onto the north wall`)
}
// Classrooms keep both sliding doors; every other room has one.
assert.equal(ROOM_DEFINITIONS['F2-01'].doors.length, 2)
assert.deepEqual(ROOM_DEFINITIONS['F2-01'].doors.map((d) => d.id), ['north-front', 'north-rear'])
assert.equal(ROOM_DEFINITIONS['F1-03'].doors.length, 1)
// Nothing paints a "?" badge that the interaction pass would then skip.
for(const roomId of ROOM_IDS){
  for(const object of ROOM_DEFINITIONS[roomId].furniture){
    assert.ok(!(object.interactable && object.type === 'transition'), `${roomId}/${object.id} is badged but not examinable`)
  }
}

const anomalySession = createEditionSession(EDITIONS.ORIGINAL)
const board = { id: 'entrance-board', roomId: 'F1-01', type: 'document', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, collision: false, interactable: true }
const computer = { id: 'teacher-pc', roomId: 'F3-03', type: 'computer', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, collision: false, interactable: true }
const curtain = { id: 'curtain', roomId: 'F1-03', type: 'furniture', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, collision: false, interactable: true }
const clock = { id: 'entrance-clock', roomId: 'F1-01', type: 'clock', position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, collision: false, interactable: true }
assert.equal(resolveObject(board, EDITIONS.REVIVAL, { ...anomalySession, anomalyLevel: 4 }).anomalyLevel, 0)
anomalySession.anomalyLevel = 1
assert.equal(resolveObject(board, EDITIONS.ORIGINAL, anomalySession).displayVariant, 'dated-difference')
anomalySession.anomalyLevel = 2
assert.equal(resolveObject(computer, EDITIONS.ORIGINAL, anomalySession).state, 'record-difference')
anomalySession.anomalyLevel = 3
assert.equal(resolveObject(curtain, EDITIONS.ORIGINAL, anomalySession).state, 'moved')
anomalySession.anomalyLevel = 4
assert.equal(resolveObject(clock, EDITIONS.ORIGINAL, anomalySession).state, 'clock-reverse')
anomalySession.anomalyLevel = 0
anomalySession.roomVisitCount['F1-01'] = 2
assert.equal(resolveRoom('F1-01', EDITIONS.ORIGINAL, anomalySession).anomalyLevel, 1)
anomalySession.storyFlags.anomalyPhase = true
assert.equal(resolveRoom('F1-01', EDITIONS.ORIGINAL, anomalySession).anomalyLevel, 2)

// ---- 思い出の一覧 --------------------------------------------------------
// Every memory an object can award must be described, or the ✦ panel would
// show an entry the player cannot read.
{
  const described = new Set(MEMORY_DEFINITIONS.map((entry) => entry.id))
  for(const roomId of ROOM_IDS){
    for(const object of getRoomObjects(roomId, EDITIONS.REVIVAL)){
      if(object.memoryId) assert.ok(described.has(object.memoryId), `${object.memoryId} (${roomId}/${object.id}) has no catalogue entry`)
    }
  }
  for(const entry of MEMORY_DEFINITIONS){
    assert.ok(entry.title && entry.source, `${entry.id} is missing a title or source`)
    assert.notEqual(entry.revival, entry.original, `${entry.id} should read differently per edition`)
  }

  const empty = createEditionSession(EDITIONS.REVIVAL)
  const blank = getMemoryCatalogue(EDITIONS.REVIVAL, empty)
  assert.equal(blank.length, MEMORY_DEFINITIONS.length)
  assert.equal(blank.every((entry) => !entry.recorded && entry.text === ''), true, 'unfound memories must not leak their text')

  empty.memories = ['memory:class-photo']
  const partial = getMemoryCatalogue(EDITIONS.REVIVAL, empty)
  const found = partial.find((entry) => entry.id === 'memory:class-photo')
  assert.equal(found.recorded, true)
  assert.match(found.text, /集合写真/)
  assert.equal(partial.filter((entry) => entry.recorded).length, 1)
  // same memory, different edition, different wording
  assert.notEqual(getMemoryCatalogue(EDITIONS.ORIGINAL, empty).find((e) => e.id === 'memory:class-photo').text, found.text)
  // ids the catalogue does not know about still surface
  empty.memories = ['memory:class-photo', 'school-archive']
  assert.ok(getMemoryCatalogue(EDITIONS.REVIVAL, empty).some((entry) => entry.id === 'school-archive'))
}

const locked = createEditionSession(EDITIONS.REVIVAL)
assert.equal(canEnterRoom('B1-01', locked), false)
locked.basementUnlocked = true
locked.canAccessBasement = true
assert.equal(canAccessBasement(locked, EDITIONS.REVIVAL), false)
assert.equal(canEnterRoom('B1-01', locked), false)
const originalUnlocked = createEditionSession(EDITIONS.ORIGINAL)
originalUnlocked.basementUnlocked = true
originalUnlocked.canAccessBasement = true
assert.equal(canAccessBasement(originalUnlocked, EDITIONS.ORIGINAL), true)
assert.equal(canAccessBasement({ sessions: { [EDITIONS.ORIGINAL]: originalUnlocked } }, EDITIONS.ORIGINAL), true)
assert.equal(canEnterRoom('B1-01', originalUnlocked), true)

setActivePinia(createPinia())
const game = useGameSessionStore()
game.hydrate()
game.start(EDITIONS.REVIVAL)
assert.equal(game.currentSession.roomId, 'F1-01')
assert.equal(game.currentSession.previousTransitionId, 'entrance-main')
assert.equal(game.enterRoom('F2-03', 'north-main'), true)
assert.equal(game.currentSession.roomId, 'F2-03')
assert.equal(game.currentSession.entryDoor, 'north-main')
assert.equal(game.currentSession.previousTransitionId, 'north-main')
assert.equal(game.exitRoom().door, 'north-main')
assert.equal(game.currentSession.currentScene, 'corridor')
assert.equal(game.currentSession.currentFloor, '2F')
assert.equal(game.enterRoom('F2-01', 'north-rear'), true)
assert.equal(game.exitRoom().door, 'north-rear')
assert.equal(game.travelStairs('east', '3F'), '3F')
assert.equal(game.currentSession.currentFloor, '3F')
assert.equal(game.currentSession.returnPoint.door, 'stair-east')
assert.equal(game.travelStairs('west', '2F'), '2F')
assert.equal(game.travelStairs('west', '1F'), '1F')
assert.equal(game.currentSession.returnPoint.door, 'stair-west')
assert.equal(game.enterRoom('B1-01'), false)

game.selectEdition(EDITIONS.ORIGINAL)
game.start(EDITIONS.ORIGINAL)
game.setBasementAccess({ unlocked: true, canAccess: true })
assert.equal(game.enterBasement(), true)
assert.equal(game.currentSession.currentFloor, 'B1')
assert.equal(game.enterRoom('B1-03'), true)
game.interact('archive-files', 'school-archive')
assert.ok(game.currentSession.memories.includes('school-archive'))
game.setAnomalyLevel(3)
assert.equal(game.currentSession.anomalyLevel, 3)
assert.equal(game.setClockState('clock-1f-hall', 'reverse'), true)
assert.equal(game.currentSession.clockState['clock-1f-hall'], 'reverse')
assert.deepEqual(game.debugMoveTo({ floor: 'B1', roomId: 'B1-02' }), { ok: true })
assert.equal(game.currentSession.roomId, 'B1-02')

game.setStoryFlag('anomalyPhase', true)
game.setPuzzleFlag('futureBasementHook', true)
game.setAnomalyLevel(2)
assert.equal(game.sessions[EDITIONS.ORIGINAL].storyFlags.anomalyPhase, true)
assert.equal(game.sessions[EDITIONS.ORIGINAL].puzzleFlags.futureBasementHook, true)
assert.equal(game.sessions[EDITIONS.ORIGINAL].anomalyLevel, 2)
assert.equal(game.sessions[EDITIONS.REVIVAL].anomalyLevel, 0)
assert.equal(game.sessions[EDITIONS.REVIVAL].roomId, null)
assert.equal(game.sessions[EDITIONS.REVIVAL].clockState['clock-1f-hall'], undefined)
game.setBasementAccess({ unlocked: false, canAccess: false })
assert.deepEqual(game.debugMoveTo({ floor: 'B1', roomId: 'B1-01' }), { ok: false, reason: '地下は未解放です' })
game.setBasementAccess({ unlocked: true, canAccess: false })
assert.deepEqual(game.debugMoveTo({ floor: 'B1' }), { ok: false, reason: '地下は解放済みですが、進入条件を満たしていません' })
game.setStoryFlag('debugFlag', true)
assert.equal(game.currentSession.storyFlags.debugFlag, true)
game.resetEdition(EDITIONS.ORIGINAL)
assert.equal(game.sessions[EDITIONS.ORIGINAL].storyFlags.debugFlag, undefined)
assert.equal(game.sessions[EDITIONS.ORIGINAL].anomalyLevel, 0)

game.selectEdition(EDITIONS.REVIVAL)
game.setBasementAccess({ unlocked: true, canAccess: true })
assert.equal(game.sessions[EDITIONS.REVIVAL].basementUnlocked, false)
assert.equal(game.sessions[EDITIONS.REVIVAL].canAccessBasement, false)
assert.equal(game.enterBasement(), false)
assert.equal(game.availableFloors.includes('B1'), false)

setActivePinia(createPinia())
const restored = useGameSessionStore()
restored.hydrate()
assert.equal(restored.sessions[EDITIONS.REVIVAL].basementUnlocked, false)
assert.equal(restored.sessions[EDITIONS.REVIVAL].canAccessBasement, false)
assert.equal(restored.sessions[EDITIONS.ORIGINAL].basementUnlocked, false)

console.log(`Game data OK: ${ROOM_IDS.length} rooms, ${FLOOR_ORDER.length} floors, both editions and save flow verified`)
