// Walks every scene in the building the way a player would and asserts the
// three things that were broken:
//
//   1. the player never spawns inside furniture (部屋に入って動けなくなる)
//   2. both stairwell landings are reachable on foot (階段が反応しない)
//   3. every object drawn with a "?" can actually be reached and examined
//      (調べられないオブジェクトがある)
//
// Reachability is a flood fill over the walkable area using the same collision
// box the running game uses, so this fails for real geometry regressions.

import assert from 'node:assert/strict'
import { EDITIONS, FLOOR_ORDER, ROOM_IDS, PX_PER_M, getRoomDefinition } from '../src/game/data/school.js'
import {
  buildCorridorScene,
  buildRoomScene,
  corridorLayout,
  distanceToObject,
  isBlocked,
  resolveSpawn
} from '../src/game/scene/buildScene.js'

globalThis.window = { localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} } }

const REACH = Math.round(PX_PER_M * 1.15)   // must match SceneStage
const STEP = 6

function unlockedSession(){
  return {
    edition: EDITIONS.ORIGINAL,
    basementUnlocked: true,
    canAccessBasement: true,
    roomVisitCount: {},
    objectState: {},
    storyFlags: {},
    anomalyLevel: 0
  }
}

/** Flood fill the walkable area from a spawn; returns the set of reached cells. */
function reachable(scene, from){
  const w = scene.walk
  const cols = Math.max(1, Math.floor(w.w / STEP) + 1)
  const rows = Math.max(1, Math.floor(w.h / STEP) + 1)
  const key = (c, r) => r * cols + c
  const toCell = (x, y) => [
    Math.max(0, Math.min(cols - 1, Math.round((x - w.x) / STEP))),
    Math.max(0, Math.min(rows - 1, Math.round((y - w.y) / STEP)))
  ]
  const toPoint = (c, r) => [w.x + c * STEP, w.y + r * STEP]

  const seen = new Set()
  const start = toCell(from.x, from.y)
  const queue = [start]
  seen.add(key(...start))
  const points = []

  while(queue.length){
    const [c, r] = queue.pop()
    points.push(toPoint(c, r))
    for(const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
      const nc = c + dc
      const nr = r + dr
      if(nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue
      const k = key(nc, nr)
      if(seen.has(k)) continue
      const [px, py] = toPoint(nc, nr)
      if(isBlocked(scene, px, py)) continue
      seen.add(k)
      queue.push([nc, nr])
    }
  }
  return points
}

function overlapsAny(points, rect){
  return points.some((p) => p[0] >= rect.x && p[0] <= rect.x + rect.w && p[1] >= rect.y && p[1] <= rect.y + rect.h)
}

// ---------------------------------------------------------------- corridors
let corridorCount = 0
for(const floor of FLOOR_ORDER){
  const session = unlockedSession()
  const scene = buildCorridorScene(floor, EDITIONS.ORIGINAL, session)
  corridorCount += 1

  const layout = corridorLayout(floor)
  assert.ok(scene.width > 0, `${floor}: corridor has no length`)
  assert.ok(scene.doors.length > 0, `${floor}: corridor has no doors`)

  // Spawn where the player lands arriving with no anchor, then walk everywhere.
  const spawn = resolveSpawn(scene, scene.width / 2, scene.walk.y + scene.walk.h / 2)
  assert.equal(isBlocked(scene, spawn.x, spawn.y), false, `${floor}: corridor spawn is inside geometry`)
  const points = reachable(scene, spawn)

  // (2) stairs — the bug was a walk band inset past both stairwells.
  assert.ok(scene.stairs.length > 0, `${floor}: no stairwell at all`)
  for(const stair of scene.stairs){
    assert.ok(
      overlapsAny(points, stair.trigger),
      `${floor}: ${stair.label} landing cannot be walked onto`
    )
    assert.ok(stair.targets.length > 0 || stair.toBasement, `${floor}: ${stair.label} leads nowhere`)
  }

  // every room door on this floor must be reachable from the hall
  for(const door of scene.doors){
    assert.ok(
      overlapsAny(points, door.trigger),
      `${floor}: door to ${door.label} (${door.doorId}) cannot be reached`
    )
  }

  // classrooms contribute both of their sliding doors to the corridor
  for(const entry of layout.north){
    const doors = scene.doors.filter((d) => d.roomId === entry.roomId)
    assert.equal(doors.length, entry.def.doors.length, `${floor}: ${entry.roomId} door count mismatch`)
  }

  // the 昇降口 opens off the south wall on 1F only
  const southDoors = scene.doors.filter((d) => d.side === 'south')
  if(floor === '1F') assert.equal(southDoors.length, 1, '1F should have exactly one south-wall door (昇降口)')
  else assert.equal(southDoors.length, 0, `${floor}: no room should open onto the window wall`)
}
assert.equal(corridorCount, 4)

// B1 must offer a way back up in-world, not only via the HUD.
const b1 = buildCorridorScene('B1', EDITIONS.ORIGINAL, unlockedSession())
assert.ok(b1.stairs.some((s) => s.targets.includes('1F')), 'B1 has no stair back to 1F')

// The way down is its own doorway in the 1F corridor — never folded into the
// east or west stairwell — and only in the original edition once unlocked.
const lockedHall = buildCorridorScene('1F', EDITIONS.REVIVAL, { edition: EDITIONS.REVIVAL })
assert.equal(lockedHall.basement, null, 'revival must never show the basement entrance')
const stillLocked = buildCorridorScene('1F', EDITIONS.ORIGINAL, { edition: EDITIONS.ORIGINAL })
assert.equal(stillLocked.basement, null, 'the basement entrance must stay hidden until unlocked')

const openHall = buildCorridorScene('1F', EDITIONS.ORIGINAL, unlockedSession())
assert.ok(openHall.basement, 'unlocked original should show the basement entrance in the 1F corridor')
for(const stair of openHall.stairs){
  assert.equal(stair.toBasement, undefined, `${stair.label} must not offer the basement`)
  assert.equal(stair.targets.includes('B1'), false, `${stair.label} must not travel to B1`)
  // and its trigger must not overlap the basement doorway's
  const a = stair.trigger
  const b = openHall.basement.trigger
  assert.equal(
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
    false,
    `${stair.label} overlaps the basement entrance`
  )
}
// It must be standable, on the 1F hall floor.
{
  const spawn = resolveSpawn(openHall, openHall.width / 2, openHall.walk.y + openHall.walk.h / 2)
  const points = reachable(openHall, spawn)
  assert.ok(overlapsAny(points, openHall.basement.trigger), 'the basement entrance cannot be walked to')
}
// Upper floors never grow one.
for(const floor of ['2F', '3F']){
  assert.equal(buildCorridorScene(floor, EDITIONS.ORIGINAL, unlockedSession()).basement, null, `${floor} must not have a basement entrance`)
}
// The hall is clear — no fixture sticks out into the walking line, and the
// 水飲み場 / 消火栓 are gone for good.
for(const floor of FLOOR_ORDER){
  const hall = buildCorridorScene(floor, EDITIONS.ORIGINAL, unlockedSession())
  assert.equal(hall.colliders.length, 0, `${floor}: the corridor floor should be unobstructed`)
  for(const gone of ['wash-station', 'hydrant']){
    assert.equal(hall.fixtures.some((f) => f.type === gone), false, `${floor}: ${gone} should be gone`)
  }
}

// Only the ground floor draws the grounds; above it the glazing is the view,
// so the scene stops at the window wall instead of leaving a dead band.
{
  const ground = buildCorridorScene('1F', EDITIONS.ORIGINAL, unlockedSession())
  assert.equal(ground.grounds, true, '1F should look out onto the grounds')
  assert.equal(ground.height, ground.layout.outsideY + ground.layout.outsideH)
  for(const floor of ['2F', '3F', 'B1']){
    const hall = buildCorridorScene(floor, EDITIONS.ORIGINAL, unlockedSession())
    assert.equal(hall.grounds, false, `${floor} should show windows only`)
    assert.equal(hall.height, hall.layout.outsideY, `${floor}: the corridor should end at the window wall`)
    assert.ok(hall.height < ground.height, `${floor} should be shorter than the ground floor`)
    // ...but every floor is framed identically, so the player never resizes.
    assert.equal(hall.viewHeight, ground.viewHeight, `${floor}: corridors must share one camera frame`)
  }
}

// 時計 are removed from the building.
for(const roomId of ROOM_IDS){
  for(const object of getRoomDefinition(roomId).furniture){
    assert.notEqual(object.type, 'clock', `${roomId}/${object.id}: clocks were removed`)
    assert.doesNotMatch(object.label, /時計/, `${roomId}/${object.id}: clocks were removed`)
  }
}

// ---------------------------------------------------------------- rooms
let checkedRooms = 0
let checkedObjects = 0
for(const edition of [EDITIONS.REVIVAL, EDITIONS.ORIGINAL]){
  for(const roomId of ROOM_IDS){
    const def = getRoomDefinition(roomId)
    const session = unlockedSession()
    const scene = buildRoomScene(roomId, edition, session)
    assert.ok(scene, `${roomId}: no scene`)
    checkedRooms += 1

    for(const exit of scene.exits){
      const spawn = resolveSpawn(scene, exit.cx, exit.trigger.y + exit.trigger.h + 18)

      // (1) the spawn must be standable — this is the "stuck in the room" bug.
      assert.equal(
        isBlocked(scene, spawn.x, spawn.y),
        false,
        `${roomId}/${exit.id} (${edition}): player spawns inside furniture`
      )

      const points = reachable(scene, spawn)

      // the player can always get back out of the door they came in by
      assert.ok(
        overlapsAny(points, exit.trigger),
        `${roomId}/${exit.id} (${edition}): cannot walk back to the exit`
      )
      // ...and to every other door of the room
      for(const other of scene.exits){
        assert.ok(
          overlapsAny(points, other.trigger),
          `${roomId} (${edition}): ${other.id} unreachable from ${exit.id}`
        )
      }

      // (3) everything badged with a "?" must be examinable from somewhere
      // the player can actually stand.
      if(exit.id === scene.exits[0].id){
        for(const object of scene.interactables){
          const near = points.some((p) => distanceToObject(p[0], p[1], object) <= REACH)
          assert.ok(
            near,
            `${roomId} (${edition}): 「${object.label}」(${object.id}) shows a ? but cannot be examined`
          )
          checkedObjects += 1
        }
      }
    }

    // Nothing may stand in a doorway. The flood fill can still find a way in
    // around the side, but walking straight through the door has to work.
    for(const exit of scene.exits){
      for(const object of scene.objects){
        if(!object.collision) continue
        const o = { x: object.position.x, y: object.position.y, w: object.size.width, h: object.size.height }
        const t = exit.trigger
        const overlaps = o.x < t.x + t.w && o.x + o.w > t.x && o.y < t.y + t.h && o.y + o.h > t.y
        assert.ok(!overlaps, `${roomId}: 「${object.label}」(${object.id}) blocks the ${exit.id} doorway`)
      }
    }

    // Furniture must stay inside its own room.
    for(const object of scene.objects){
      const r = { x: object.position.x, y: object.position.y, w: object.size.width, h: object.size.height }
      assert.ok(
        r.x >= 0 && r.y >= 0 && r.x + r.w <= scene.width + 1 && r.y + r.h <= scene.height + 1,
        `${roomId}: ${object.id} sticks out of the room`
      )
    }
    void def
  }
}

console.log(`Scene geometry OK: ${corridorCount} corridors, ${checkedRooms} room builds, ${checkedObjects} examinable objects all reachable`)
