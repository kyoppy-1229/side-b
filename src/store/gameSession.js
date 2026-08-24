import { defineStore } from 'pinia'
import { readJson, writeJson, writeValue } from './storage.js'
import {
  EDITIONS,
  EDITION_VALUES,
  FLOOR_DEFINITIONS,
  FLOOR_ORDER,
  canAccessBasement,
  canEnterRoom,
  getRoomDefinition,
  isBasementRoom,
  STAIR_CONNECTIONS
} from '../game/data/school.js'

export const GAME_SESSION_STORAGE_KEY = 'side-b:game-session:v2'
// A dedicated "ping" key other tabs listen on, so a debug apply refreshes an
// already-open game tab even when the written value is otherwise identical.
export const GAME_SYNC_KEY = 'side-b:sync:v1'

const DEFAULT_POSITION = Object.freeze({ x: 96, y: 300 })
const DEFAULT_RETURN_POINT = Object.freeze({ floor: '1F', corridorId: 'F1-CORRIDOR', door: 'entrance-main', x: 96, y: 300 })

function clone(value){
  if(value === null || typeof value !== 'object') return value
  if(Array.isArray(value)) return value.map(clone)
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]))
}

export function createEditionSession(edition){
  return {
    edition,
    currentScene: 'title',
    currentFloor: '1F',
    roomId: null,
    playerPosition: clone(DEFAULT_POSITION),
    entryDoor: null,
    returnPoint: clone(DEFAULT_RETURN_POINT),
    previousTransitionId: null,
    corridorAnchor: null,
    memories: [],
    objectState: {},
    basementUnlocked: false,
    canAccessBasement: false,
    storyFlags: {},
    puzzleFlags: {},
    anomalyLevel: 0,
    roomVisitCount: {},
    visited: [],
    clockState: {},
    settings: { guideVisible: true, soundEnabled: true },
    lastInteraction: null
  }
}

export function createGameSessionState(){
  return {
    activeEdition: EDITIONS.REVIVAL,
    sessions: {
      [EDITIONS.REVIVAL]: createEditionSession(EDITIONS.REVIVAL),
      [EDITIONS.ORIGINAL]: createEditionSession(EDITIONS.ORIGINAL)
    },
    hydrated: false
  }
}

function readStoredSession(){
  return readJson(GAME_SESSION_STORAGE_KEY)
}

function safeEdition(value){
  return EDITION_VALUES.includes(value) ? value : EDITIONS.REVIVAL
}

function sanitizeSession(value, edition){
  const fallback = createEditionSession(edition)
  if(!value || typeof value !== 'object') return fallback
  const session = { ...fallback, ...clone(value), edition }
  session.playerPosition = { ...fallback.playerPosition, ...(value.playerPosition || {}) }
  session.returnPoint = { ...fallback.returnPoint, ...(value.returnPoint || {}) }
  session.memories = Array.isArray(value.memories) ? [...new Set(value.memories.filter((item) => typeof item === 'string'))] : []
  session.visited = Array.isArray(value.visited) ? [...new Set(value.visited.filter((item) => typeof item === 'string'))] : []
  session.objectState = value.objectState && typeof value.objectState === 'object' ? value.objectState : {}
  session.storyFlags = value.storyFlags && typeof value.storyFlags === 'object' ? value.storyFlags : {}
  session.puzzleFlags = value.puzzleFlags && typeof value.puzzleFlags === 'object' ? value.puzzleFlags : {}
  session.roomVisitCount = value.roomVisitCount && typeof value.roomVisitCount === 'object' ? value.roomVisitCount : {}
  session.clockState = value.clockState && typeof value.clockState === 'object' ? value.clockState : {}
  session.basementUnlocked = Boolean(value.basementUnlocked)
  session.canAccessBasement = Boolean(value.canAccessBasement && session.basementUnlocked)
  if(edition !== EDITIONS.ORIGINAL){
    session.basementUnlocked = false
    session.canAccessBasement = false
  }
  session.anomalyLevel = Math.max(0, Math.min(4, Number(value.anomalyLevel) || 0))
  if(session.currentScene !== 'room') session.roomId = null
  if(session.currentFloor === 'B1' && !canAccessBasement(session, edition)){
    session.currentFloor = '1F'
    session.currentScene = 'corridor'
    session.roomId = null
    session.playerPosition = clone(DEFAULT_POSITION)
    session.returnPoint = clone(DEFAULT_RETURN_POINT)
    session.previousTransitionId = null
  }
  if(session.currentScene === 'room' && !canEnterRoom(session.roomId, session)){
    session.currentScene = 'corridor'
    session.roomId = null
  }
  return session
}

function persistState(state){
  // Gameplay remains available in memory when storage is disabled.
  writeJson(GAME_SESSION_STORAGE_KEY, {
    version: 2,
    activeEdition: state.activeEdition,
    sessions: state.sessions
  })
}

function floorForRoom(roomId){
  return getRoomDefinition(roomId)?.floor || null
}

function pointForDoor(floor, door = 'north-main'){
  const x = door.includes('rear') || door.includes('east') ? 650 : 130
  return { floor, corridorId: FLOOR_DEFINITIONS[floor]?.corridorId || `${floor}-CORRIDOR`, door, x, y: 300 }
}

export function rectanglesOverlap(first, second){
  return first.x < second.x + second.width && first.x + first.width > second.x &&
    first.y < second.y + second.height && first.y + first.height > second.y
}

export function canMovePlayer(room, position, delta){
  const next = getNextPlayerPosition(room, position, delta)
  if(!next) return false
  return !room.furniture.filter((item) => item.collision).some((item) => rectanglesOverlap(next, { ...item.position, ...item.size }))
}

export function getNextPlayerPosition(room, position, delta){
  if(!room) return false
  const next = {
    x: Math.max(24, Math.min(room.dimensions.width - 24, position.x + delta.x)),
    y: Math.max(42, Math.min(room.dimensions.height - 30, position.y + delta.y)),
    width: 24,
    height: 30
  }
  return next
}

export const useGameSessionStore = defineStore('game-session', {
  state: createGameSessionState,
  getters: {
    currentSession(state){
      return state.sessions[state.activeEdition]
    },
    hasSave: (state) => (edition) => {
      const session = state.sessions[safeEdition(edition)]
      return session.currentScene !== 'title' || session.visited.length > 0
    },
    currentRoom(state){
      return getRoomDefinition(state.sessions[state.activeEdition]?.roomId)
    },
    availableFloors(state){
      const session = state.sessions[state.activeEdition]
      return FLOOR_ORDER.filter((floor) => floor !== 'B1' || canAccessBasement(session, state.activeEdition))
    },
    basementAccessReason(state){
      const session = state.sessions[state.activeEdition]
      if(canAccessBasement(session, state.activeEdition)) return ''
      if(!session.basementUnlocked) return '地下は未解放です'
      return '地下は解放済みですが、進入条件を満たしていません'
    }
  },
  actions: {
    hydrate(){
      if(this.hydrated) return
      this.loadFromStorage()
      this.hydrated = true
    },
    // Re-read persisted state into the reactive store. Used to pull in changes
    // another tab (e.g. the debug console) wrote to localStorage.
    loadFromStorage(){
      const stored = readStoredSession()
      this.activeEdition = safeEdition(stored?.activeEdition)
      for(const edition of EDITION_VALUES){
        this.sessions[edition] = sanitizeSession(stored?.sessions?.[edition], edition)
      }
    },
    // Broadcast the current persisted state to other tabs (bumps the ping key).
    broadcastSync(){
      if(typeof window === 'undefined') return
      this.persist()
      writeValue(GAME_SYNC_KEY, `${Date.now()}-${Math.round(Math.random() * 1e6)}`)
    },
    persist(){
      // Before hydration the store still holds nothing but defaults. Writing
      // those out would overwrite a real save with a blank title screen — which
      // is exactly what happened when a component persisted from setup(), i.e.
      // one tick before its onMounted hydrate().
      if(!this.hydrated) return
      persistState(this)
    },
    selectEdition(edition){
      this.hydrate()
      this.activeEdition = safeEdition(edition)
      this.persist()
      return this.currentSession
    },
    start(edition = this.activeEdition){
      this.hydrate()
      const safe = safeEdition(edition)
      this.activeEdition = safe
      const session = this.sessions[safe]
      session.currentScene = 'room'
      session.currentFloor = '1F'
      session.roomId = 'F1-01'
      session.playerPosition = { x: 400, y: 430 }
      session.entryDoor = 'entrance-main'
      session.previousTransitionId = 'entrance-main'
      session.returnPoint = pointForDoor('1F', 'entrance-main')
      this.visitRoom('F1-01')
      session.settings.guideVisible = true
      this.persist()
      return session
    },
    continueGame(edition = this.activeEdition){
      this.hydrate()
      const safe = safeEdition(edition)
      this.activeEdition = safe
      const session = this.sessions[safe]
      if(session.currentScene === 'title') return this.start(safe)
      this.persist()
      return session
    },
    enterRoom(roomId, entryDoor = 'north-main'){
      const session = this.currentSession
      const room = getRoomDefinition(roomId)
      if(!room || !canEnterRoom(roomId, session)) return false
      session.currentScene = 'room'
      session.currentFloor = room.floor
      session.roomId = roomId
      session.entryDoor = entryDoor
      session.previousTransitionId = entryDoor
      session.returnPoint = pointForDoor(room.floor, entryDoor)
      // Just inside the doorway the player actually used. SceneStage refines
      // this against the furniture, but the stored value stays sensible.
      const door = room.doors.find((d) => d.id === entryDoor) || room.doors[0]
      session.playerPosition = {
        x: Math.round(door ? door.cx : room.dimensions.width / 2),
        y: Math.round(room.interior.y + Math.min(room.interior.h - 20, 70))
      }
      this.visitRoom(roomId)
      this.persist()
      return true
    },
    exitRoom(){
      const session = this.currentSession
      if(session.currentScene !== 'room') return false
      const exitedRoom = session.roomId
      const returnPoint = session.returnPoint || pointForDoor(session.currentFloor, session.entryDoor)
      session.currentScene = 'corridor'
      session.currentFloor = returnPoint.floor
      session.roomId = null
      session.playerPosition = { x: returnPoint.x, y: returnPoint.y }
      session.previousTransitionId = returnPoint.door
      session.corridorAnchor = { type: 'door', roomId: exitedRoom, door: returnPoint.door }
      session.lastInteraction = null
      this.persist()
      return returnPoint
    },
    travelStairs(side, targetFloor = null){
      const session = this.currentSession
      if(session.currentScene === 'room') return false
      const floor = session.currentFloor
      const targets = STAIR_CONNECTIONS[side]?.[floor] || []
      const nextFloor = targetFloor || targets[0]
      if(!targets.includes(nextFloor) || nextFloor === 'B1') return false
      session.currentFloor = nextFloor
      session.roomId = null
      session.playerPosition = { x: side === 'west' ? 110 : 700, y: 300 }
      session.returnPoint = pointForDoor(nextFloor, `stair-${side}`)
      session.previousTransitionId = `stair-${side}`
      session.corridorAnchor = { type: 'stair', side }
      this.persist()
      return nextFloor
    },
    enterBasement(){
      const session = this.currentSession
      if(!canAccessBasement(session, this.activeEdition)) return false
      session.currentFloor = 'B1'
      session.currentScene = 'corridor'
      session.roomId = null
      session.playerPosition = { x: 400, y: 300 }
      session.returnPoint = pointForDoor('B1', 'basement-stair')
      session.previousTransitionId = 'basement-stair'
      session.corridorAnchor = { type: 'basement' }
      this.persist()
      return true
    },
    setBasementAccess({ unlocked = false, canAccess = false } = {}){
      const session = this.currentSession
      const original = this.activeEdition === EDITIONS.ORIGINAL
      session.basementUnlocked = original && Boolean(unlocked)
      session.canAccessBasement = original && Boolean(canAccess && unlocked)
      if(!canAccessBasement(session, this.activeEdition) && session.currentFloor === 'B1'){
        session.currentFloor = '1F'
        session.currentScene = 'corridor'
        session.roomId = null
      }
      this.persist()
    },
    setDebugSetting(key, value){
      if(!['guideVisible', 'soundEnabled'].includes(key)) return false
      this.currentSession.settings[key] = Boolean(value)
      this.persist()
      return true
    },
    debugMoveTo({ floor, roomId = null } = {}){
      const session = this.currentSession
      if(!FLOOR_ORDER.includes(floor)) return { ok: false, reason: '存在しない階です' }
      if(floor === 'B1' && !canAccessBasement(session, this.activeEdition)) {
        return { ok: false, reason: this.basementAccessReason }
      }
      if(roomId){
        const room = getRoomDefinition(roomId)
        if(!room || room.floor !== floor) return { ok: false, reason: '選択した部屋はこの階にありません' }
        if(!canEnterRoom(roomId, session)) return { ok: false, reason: 'この部屋へは現在入室できません' }
        this.enterRoom(roomId, 'debug')
        return { ok: true }
      }
      session.currentFloor = floor
      session.currentScene = 'corridor'
      session.roomId = null
      session.lastInteraction = null
      this.persist()
      return { ok: true }
    },
    visitRoom(roomId){
      const session = this.currentSession
      session.visited = [...new Set([...session.visited, roomId])]
      session.roomVisitCount[roomId] = (session.roomVisitCount[roomId] || 0) + 1
    },
    interact(objectId, memoryId = null, value = 'examined', interactionTextId = null){
      const session = this.currentSession
      session.objectState[objectId] = value
      if(memoryId) session.memories = [...new Set([...session.memories, memoryId])]
      session.lastInteraction = { objectId, memoryId, value, interactionTextId: interactionTextId || objectId }
      this.persist()
      return session.lastInteraction
    },
    setStoryFlag(flag, value = true){
      if(!flag) return
      this.currentSession.storyFlags[flag] = value
      this.persist()
    },
    setPuzzleFlag(flag, value = true){
      if(!flag) return
      this.currentSession.puzzleFlags[flag] = value
      this.persist()
    },
    setAnomalyLevel(level){
      this.currentSession.anomalyLevel = Math.max(0, Math.min(4, Number(level) || 0))
      this.persist()
    },
    setClockState(clockId, state){
      if(!['normal', 'stopped', 'offset', 'reverse'].includes(state)) return false
      this.currentSession.clockState[clockId] = state
      this.persist()
      return true
    },
    movePlayer(delta){
      const session = this.currentSession
      if(session.currentScene !== 'room') return false
      const room = getRoomDefinition(session.roomId)
      const next = getNextPlayerPosition(room, session.playerPosition, delta)
      if(!canMovePlayer(room, session.playerPosition, delta)) return false
      session.playerPosition = { x: next.x, y: next.y }
      this.persist()
      return true
    },
    dismissGuide(){
      this.currentSession.settings.guideVisible = false
      this.persist()
    },
    // Used by the walkable canvas engine, which manages continuous motion
    // locally and writes the resolved position back on transitions/unmount.
    setPlayerPosition(position, { persist = false } = {}){
      const session = this.currentSession
      if(!position) return
      session.playerPosition = { x: Math.round(position.x), y: Math.round(position.y) }
      if(persist) this.persist()
    },
    resetEdition(edition = this.activeEdition){
      const safe = safeEdition(edition)
      this.sessions[safe] = createEditionSession(safe)
      this.persist()
    },
    // ---- debug console helpers -------------------------------------------
    // Merge an arbitrary patch into one edition. Everything still runs through
    // sanitizeSession, so a hand-written patch cannot produce an impossible
    // state (B1 while locked, a room the edition cannot enter, ...).
    patchSession(patch = {}, edition = this.activeEdition){
      const safe = safeEdition(edition)
      this.sessions[safe] = sanitizeSession({ ...this.sessions[safe], ...patch }, safe)
      this.persist()
      return this.sessions[safe]
    },
    setVisitedRooms(roomIds = [], edition = this.activeEdition){
      const safe = safeEdition(edition)
      const rooms = roomIds.filter((roomId) => Boolean(getRoomDefinition(roomId)))
      this.sessions[safe].visited = [...new Set(rooms)]
      this.persist()
      return this.sessions[safe].visited
    },
    setMemories(memories = [], edition = this.activeEdition){
      const safe = safeEdition(edition)
      this.sessions[safe].memories = [...new Set(memories.filter((item) => typeof item === 'string'))]
      this.persist()
      return this.sessions[safe].memories
    },
    removeMemory(memoryId, edition = this.activeEdition){
      const safe = safeEdition(edition)
      this.sessions[safe].memories = this.sessions[safe].memories.filter((item) => item !== memoryId)
      this.persist()
    },
    setObjectState(objectId, value = 'examined'){
      if(!objectId) return false
      this.currentSession.objectState[objectId] = value
      this.persist()
      return true
    },
    clearObjectState(){
      this.currentSession.objectState = {}
      this.currentSession.lastInteraction = null
      this.persist()
    },
    removeStoryFlag(flag){
      delete this.currentSession.storyFlags[flag]
      this.persist()
    },
    removePuzzleFlag(flag){
      delete this.currentSession.puzzleFlags[flag]
      this.persist()
    },
    exportState(){
      return clone({ version: 2, activeEdition: this.activeEdition, sessions: this.sessions })
    },
    // Replace both editions at once (snapshot restore / JSON import).
    importState(payload){
      this.activeEdition = safeEdition(payload?.activeEdition)
      for(const edition of EDITION_VALUES){
        this.sessions[edition] = sanitizeSession(payload?.sessions?.[edition], edition)
      }
      this.persist()
      return true
    },
    resetAll(){
      this.activeEdition = EDITIONS.REVIVAL
      for(const edition of EDITION_VALUES) this.sessions[edition] = createEditionSession(edition)
      this.persist()
    }
  }
})

export { EDITIONS, isBasementRoom }
