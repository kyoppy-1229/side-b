// Builds concrete, walkable world geometry from the shared school data.
// A "scene" is edition-agnostic geometry (fixed architecture is shared!) plus
// resolved objects for the current edition/session. The painter draws it and
// SceneStage walks the player through it.
//
// Corridor cross-section (片廊下型, drawn 2.5D — walls as elevation, floor in plan):
//
//   roomBand   教室ブロックの断面
//   wall       北側の壁：各室の引戸と室名札、欄間の廊下窓
//   floor      廊下 3.0m（歩ける）— 両端の階段室まで途切れない
//   southWall  南側の壁：連続窓・掲示板・手洗い場（1階のみ昇降口の扉）
//   outside    校庭

import { FLOOR_DEFINITIONS, STAIR_CONNECTIONS, PX_PER_M, m, getRoomDefinition, canAccessBasement } from '../data/school.js'
import { getRoomObjects, resolveRoom, getInteractionText } from '../data/editions.js'

// ---- Corridor geometry -----------------------------------------------------
export const CORRIDOR = Object.freeze({
  // The band at the top is the room block seen in section. It is deep enough
  // that the room name plates clear the HUD chips overlaid on the stage.
  roomBandY: 0, roomBandH: 76,
  wallY: 76, wallH: 140,
  floorY: 216, floorH: m(3.0),          // 3.0m walkable corridor
  southWallY: 216 + m(3.0), southWallH: 104,
  // Only the ground floor looks out onto the grounds. Above it the corridor
  // ends at the glazing — the windows themselves are the view.
  outsideY: 216 + m(3.0) + 104,
  outsideH: 150,
  H: 216 + m(3.0) + 104 + 150,
  stairW: m(4.0),                        // 4.0m stairwell at each end
  bayM: 2.4,                             // service bay of wall between stairwell and first room
  // The player's feet stay on the corridor slab, edge to edge — including the
  // stair landings, which is what makes the stairs reachable at all.
  walkInsetTop: 12,
  walkInsetBottom: 10,
  walkInsetSide: 10
})

/**
 * Lay the floor out from the rooms themselves: every room occupies its real
 * frontage (spanM) along the corridor, and its doorways sit where the room
 * definition puts them. North-side rooms are placed sequentially; south-side
 * rooms (the 昇降口) use an explicit offset.
 */
export function corridorLayout(floor){
  const roomIds = FLOOR_DEFINITIONS[floor]?.rooms || []
  const north = []
  const south = []
  let cursorM = 0

  for(const roomId of roomIds){
    const def = getRoomDefinition(roomId)
    if(!def) continue
    const onSouth = def.corridorSide === 'south'
    const startM = onSouth ? (def.corridorOffsetM ?? 0) : cursorM
    if(!onSouth) cursorM += def.spanM
    const entry = { roomId, def, startM, spanM: def.spanM, side: onSouth ? 'south' : 'north' }
    ;(onSouth ? south : north).push(entry)
  }

  const blockM = Math.max(cursorM, ...south.map((s) => s.startM + s.spanM), 0)
  const stairM = CORRIDOR.stairW / PX_PER_M
  // A short bay of plain wall sits between each stairwell and the first room —
  // the strip a real school hangs service doors and lockers on. On 1F it is
  // where the basement stair appears once it is open.
  const width = m(stairM * 2 + CORRIDOR.bayM * 2 + blockM)
  const originPx = CORRIDOR.stairW + m(CORRIDOR.bayM)

  return { floor, north, south, blockM, width, originPx, bayM: CORRIDOR.bayM }
}

function doorwaysFor(entry, originPx){
  const base = originPx + m(entry.startM)
  return entry.def.doors.map((door) => ({
    roomId: entry.roomId,
    doorId: door.id,
    label: entry.def.name,
    doorLabel: door.label,
    // The room stores its doorway relative to its own west wall; on the corridor
    // that offset lands at the room's frontage start.
    gx: base + (door.x - entry.def.interior.x),
    gw: door.w,
    cx: base + (door.cx - entry.def.interior.x)
  }))
}

export function corridorDoorCenter(floor, roomId, doorId = null){
  const layout = corridorLayout(floor)
  const entry = [...layout.north, ...layout.south].find((e) => e.roomId === roomId)
  if(!entry) return layout.width / 2
  const doors = doorwaysFor(entry, layout.originPx)
  const hit = (doorId && doors.find((d) => d.doorId === doorId)) || doors[0]
  return hit ? hit.cx : layout.width / 2
}

export function buildCorridorScene(floor, edition, session){
  const L = CORRIDOR
  const layout = corridorLayout(floor)
  const W = layout.width
  const basementFloor = floor === 'B1'
  // 1F sits on the grounds, so its windows have something behind them to draw.
  // Upper floors and the basement stop at the wall.
  const grounds = floor === '1F'
  const H = L.outsideY + (grounds ? L.outsideH : 0)

  const doorTop = L.wallY + 30
  const doorH = L.wallH - 40

  // --- room doorways on the north wall ---
  const doors = []
  for(const entry of layout.north){
    const list = doorwaysFor(entry, layout.originPx)
    for(const [index, d] of list.entries()){
      doors.push({
        id: `door-${entry.roomId}-${d.doorId}`,
        roomId: entry.roomId,
        doorId: d.doorId,
        label: d.label,
        doorLabel: d.doorLabel,
        code: entry.roomId,
        side: 'north',
        // 室名札 hangs by the front door only, as it does in a real school.
        primary: index === 0,
        gx: d.gx, gy: doorTop, gw: d.gw, gh: doorH,
        cx: d.cx,
        // the player stands on the north half of the corridor to use it
        trigger: { x: d.gx - 10, y: L.floorY, w: d.gw + 20, h: Math.round(L.floorH * 0.56) },
        prompt: { x: d.cx, y: doorTop + doorH }
      })
    }
  }

  // --- south-side rooms (1階の昇降口) open through the window wall ---
  for(const entry of layout.south){
    for(const d of doorwaysFor(entry, layout.originPx)){
      doors.push({
        id: `door-${entry.roomId}-${d.doorId}`,
        roomId: entry.roomId,
        doorId: d.doorId,
        label: d.label,
        doorLabel: d.doorLabel,
        code: entry.roomId,
        side: 'south',
        primary: true,
        gx: d.gx, gy: L.southWallY + 22, gw: d.gw, gh: L.southWallH - 34,
        cx: d.cx,
        trigger: { x: d.gx - 10, y: L.floorY + Math.round(L.floorH * 0.44), w: d.gw + 20, h: Math.round(L.floorH * 0.56) },
        prompt: { x: d.cx, y: L.floorY + L.floorH - 14 }
      })
    }
  }

  // --- stairwells: alcoves off both ends, landings on the corridor slab ---
  const stairs = []
  for(const side of ['west', 'east']){
    const targets = STAIR_CONNECTIONS[side]?.[floor] || []
    if(!targets.length) continue
    const west = side === 'west'
    stairs.push({
      id: `stair-${side}`,
      side,
      targets: targets.filter((t) => t !== 'B1'),
      label: west ? '西階段' : '東階段',
      gx: west ? 10 : W - L.stairW + 10, gy: L.wallY + 6,
      gw: L.stairW - 20, gh: L.wallH - 12,
      // The landing IS the end of the corridor floor, so walking to the end of
      // the hall always puts the player on it.
      trigger: west
        ? { x: 0, y: L.floorY, w: L.stairW, h: L.floorH }
        : { x: W - L.stairW, y: L.floorY, w: L.stairW, h: L.floorH },
      prompt: { x: west ? L.stairW / 2 : W - L.stairW / 2, y: L.floorY + 34 }
    })
  }

  // --- the way down: its own doorway in the 1F corridor, separate from both
  // stairwells, appearing in the west service bay only once it is open. ---
  let basement = null
  if(floor === '1F' && canAccessBasement(session, edition)){
    const bayX = L.stairW
    const bayW = m(layout.bayM)
    basement = {
      id: 'basement-stair',
      label: '地下への階段',
      gx: bayX + 8, gy: doorTop, gw: bayW - 16, gh: doorH,
      cx: bayX + bayW / 2,
      // Sits strictly inside the bay so it never shares ground with the
      // stairwell landing — the two must stay separate places to stand.
      trigger: { x: bayX + 2, y: L.floorY, w: bayW - 4, h: Math.round(L.floorH * 0.56) },
      prompt: { x: bayX + bayW / 2, y: doorTop + doorH }
    }
  }

  // --- fixtures on the window wall ---
  const fixtures = []
  if(basementFloor){
    for(let x = layout.originPx; x < W - L.stairW; x += m(2.2)){
      fixtures.push({ type: 'pipe', x: Math.round(x), y: L.southWallY + 16, w: 10, h: L.southWallH - 30 })
    }
  }

  // The hall itself is clear — nothing sticks out into the walking line.
  const colliders = []

  return {
    kind: 'corridor',
    floor,
    width: W, height: H,
    // Every corridor is framed as if it were as deep as the tallest one, so the
    // player does not change size when they climb a floor. The floors that stop
    // at the window wall simply sit against the top of the frame.
    viewHeight: L.outsideY + L.outsideH,
    walk: {
      x: L.walkInsetSide,
      y: L.floorY + L.walkInsetTop,
      w: W - L.walkInsetSide * 2,
      h: L.floorH - L.walkInsetTop - L.walkInsetBottom
    },
    colliders,
    doors, stairs, basement, fixtures,
    windowed: !basementFloor,
    grounds,
    objects: [],
    layout: { ...CORRIDOR, ...layout }
  }
}

// ---- Room geometry ---------------------------------------------------------
// Legacy shape kept for callers that only need nominal wall thicknesses.
export const ROOM = Object.freeze({ wallTop: 48, wallSide: 18, wallBottom: 34 })

export function buildRoomScene(roomId, edition, session){
  const base = resolveRoom(roomId, edition, session)
  if(!base) return null

  const objects = getRoomObjects(roomId, edition, session).map((obj) => ({
    ...obj,
    cx: obj.position.x + obj.size.width / 2,
    cy: obj.position.y + obj.size.height / 2,
    interactionText: obj.interactable
      ? getInteractionText(obj.interactionTextId || obj.id, edition, { object: obj, session })
      : ''
  }))

  const colliders = objects
    .filter((o) => o.collision)
    .map((o) => ({ x: o.position.x, y: o.position.y, w: o.size.width, h: o.size.height, soft: true }))

  const interior = base.interior
  const exits = base.doors.map((door) => ({
    id: door.id,
    label: '廊下へ戻る',
    doorLabel: door.label,
    gx: door.x, gy: 10, gw: door.w, gh: interior.y - 14,
    cx: door.cx,
    trigger: { x: door.x - 12, y: interior.y, w: door.w + 24, h: 56 },
    prompt: { x: door.cx, y: interior.y + 40 }
  }))

  const interactables = objects.filter((o) => o.interactable && o.type !== 'transition')

  return {
    kind: 'room',
    room: base,
    roomId,
    floor: base.floor,
    width: base.dimensions.width,
    height: base.dimensions.height,
    viewHeight: base.dimensions.height,
    interior,
    walls: base.walls,
    floorStyle: base.floorStyle,
    windowed: base.windows,
    walk: { x: interior.x + 6, y: interior.y + 6, w: interior.w - 12, h: interior.h - 12 },
    colliders,
    doors: [], stairs: [], basement: null, fixtures: [],
    objects,
    exits,
    interactables,
    layout: ROOM
  }
}

export function buildScene(session, edition){
  if(!session) return null
  if(session.currentScene === 'room' && session.roomId){
    return buildRoomScene(session.roomId, edition, session)
  }
  return buildCorridorScene(session.currentFloor || '1F', edition, session)
}

// ---- shared collision / spawn helpers --------------------------------------
export const PLAYER_HALF_W = Math.round(m(0.25))   // ~0.5m shoulder width
export const PLAYER_FOOT_H = Math.round(m(0.28))   // the footprint the body occupies

export function playerBox(x, y){
  return { x: x - PLAYER_HALF_W, y: y - PLAYER_FOOT_H, w: PLAYER_HALF_W * 2, h: PLAYER_FOOT_H }
}

export function isBlocked(scene, x, y){
  if(!scene?.colliders?.length) return false
  const b = playerBox(x, y)
  return scene.colliders.some((c) => b.x < c.x + c.w && b.x + b.w > c.x && b.y < c.y + c.h && b.y + b.h > c.y)
}

/**
 * Never drop the player inside furniture. A doorway can legitimately open right
 * behind a bookcase run, so instead of trusting the nominal spawn we push it to
 * the closest free tile — otherwise every axis is blocked and the player is
 * stuck in the room for good.
 */
export function resolveSpawn(scene, x, y){
  const w = scene.walk
  const clampX = (v) => Math.max(w.x, Math.min(w.x + w.w, v))
  const clampY = (v) => Math.max(w.y, Math.min(w.y + w.h, v))
  let px = clampX(x)
  let py = clampY(y)
  if(!isBlocked(scene, px, py)) return { x: px, y: py }

  const step = 8
  const maxRings = Math.ceil(Math.max(w.w, w.h) / step)
  for(let ring = 1; ring <= maxRings; ring += 1){
    const r = ring * step
    // Prefer moving further into the room (down) before sideways or back out.
    const candidates = [
      [0, r], [0, -r], [r, 0], [-r, 0],
      [r, r], [-r, r], [r, -r], [-r, -r],
      [r / 2, r], [-r / 2, r]
    ]
    for(const [dx, dy] of candidates){
      const cx = clampX(px + dx)
      const cy = clampY(py + dy)
      if(!isBlocked(scene, cx, cy)) return { x: cx, y: cy }
    }
  }
  return { x: px, y: py }
}

/**
 * Distance from the player to an object's *edge*, not its centre. A 5m book
 * stack has a centre 2.5m away from anywhere you can physically stand, so a
 * centre-based radius silently makes big furniture impossible to examine even
 * though it is drawn with a "?" badge.
 */
export function distanceToObject(px, py, obj){
  const x0 = obj.position.x
  const y0 = obj.position.y
  const x1 = x0 + obj.size.width
  const y1 = y0 + obj.size.height
  const dx = px < x0 ? x0 - px : px > x1 ? px - x1 : 0
  const dy = py < y0 ? y0 - py : py > y1 ? py - y1 : 0
  return Math.hypot(dx, dy)
}
