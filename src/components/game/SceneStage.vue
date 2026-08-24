<template>
  <div ref="host" class="scene-stage" :class="`stage-${edition}`">
    <canvas ref="canvas" class="scene-stage__canvas"></canvas>

    <!-- contextual dialog / action box (the "E：調べる / Enter：入る" bar) -->
    <div class="scene-dialog" :class="{ 'has-text': !!dialogText }">
      <div v-if="dialogText" class="scene-dialog__text" role="status">
        <span class="scene-dialog__mark" aria-hidden="true">✦</span>
        <!-- Most texts are a single line. A required memory of the trial adds a
             short line from the protagonist after the description, and it is
             drawn as his own voice rather than as more description. -->
        <span class="scene-dialog__lines">
          <p
            v-for="(line, index) in dialogLines"
            :key="index"
            :class="{ 'is-voice': isVoiceLine(line) }"
          >{{ line }}</p>
        </span>
        <button type="button" class="scene-dialog__close" aria-label="閉じる" @click="clearDialog">×</button>
      </div>
      <div v-else class="scene-dialog__bar">
        <template v-if="actions.length">
          <button
            v-for="(action, index) in actions"
            :key="action.key"
            type="button"
            class="scene-dialog__action"
            :class="{ primary: index === 0 }"
            @click="runAction(action)"
          >
            <b>{{ action.hint }}</b>{{ action.label }}
          </button>
        </template>
        <p v-else class="scene-dialog__idle">
          <kbd>WASD</kbd> / <kbd>↑↓←→</kbd> 移動　·　<kbd>E</kbd> 調べる　·　<kbd>Enter</kbd> 入る
        </p>
      </div>
    </div>

    <div v-if="edition === 'original'" class="scene-stage__scanlines" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { getTheme } from '../../game/render/theme.js'
import { renderScene } from '../../game/render/painter.js'
import {
  buildScene,
  corridorDoorCenter,
  distanceToObject,
  isBlocked,
  resolveSpawn
} from '../../game/scene/buildScene.js'
import { PX_PER_M } from '../../game/data/school.js'

const props = defineProps({
  edition: { type: String, required: true },
  session: { type: Object, required: true },
  active: { type: Boolean, default: true }
})

const emit = defineEmits(['enter-room', 'exit-room', 'travel', 'enter-basement', 'interact'])

const host = ref(null)
const canvas = ref(null)
const dialogText = ref('')
// Blank lines in the source text are the paragraph break between the plain
// description and the protagonist's line; they are dropped and the gap is drawn.
const dialogLines = computed(() => String(dialogText.value || '').split('\n').map((line) => line.trim()).filter(Boolean))

function isVoiceLine(line){
  return line.startsWith('「')
}

const theme = computed(() => getTheme(props.edition))

// The building is drawn at true scale, so a realistic 1.4 m/s walk would take
// most of a minute to cross a 70m hall. ~4.5 m/s reads as a hurried student and
// keeps the floor buttons in the HUD as the shortcut rather than the only option.
const WALK_SPEED = Math.round(PX_PER_M * 4.5)

const player = reactive({ x: 0, y: 0, dir: 'down', moving: false, animTime: 0, speed: WALK_SPEED })
const keys = new Set()
let scene = null
let highlight = null
let contextActions = []
let examinable = new Set()
const actions = ref([])
let raf = 0
let lastTime = 0
let ctx = null
let dpr = 1

// Scene identity — respawn the player whenever we move to a new scene.
const sceneKey = computed(() => `${props.session.currentScene}:${props.session.currentFloor}:${props.session.roomId || '-'}`)

function rebuildScene(){
  scene = buildScene(props.session, props.edition)
  spawnPlayer()
  updateContext()
}

function spawnPlayer(){
  if(!scene) return
  const walk = scene.walk
  let x
  let y
  let dir = 'down'

  if(scene.kind === 'room'){
    // Rooms are entered from the corridor door — appear just inside it, facing
    // into the room.
    const entry = scene.exits.find((e) => e.id === props.session.entryDoor) || scene.exits[0]
    if(entry){
      x = entry.cx
      y = entry.trigger.y + entry.trigger.h + 18
    } else {
      x = walk.x + walk.w / 2
      y = walk.y + 30
    }
  } else {
    // corridor: place by the anchor that brought us here
    const anchor = props.session.corridorAnchor
    const midY = walk.y + walk.h * 0.5
    if(anchor?.type === 'door' && anchor.roomId){
      const door = scene.doors.find((d) => d.roomId === anchor.roomId && (!anchor.door || d.doorId === anchor.door))
        || scene.doors.find((d) => d.roomId === anchor.roomId)
      x = door ? door.cx : corridorDoorCenter(scene.floor, anchor.roomId, anchor.door)
      y = door && door.side === 'south' ? walk.y + walk.h * 0.3 : walk.y + walk.h * 0.68
      dir = door && door.side === 'south' ? 'down' : 'up'
    } else if(anchor?.type === 'stair'){
      const west = anchor.side === 'west'
      x = west ? walk.x + scene.layout.stairW * 0.5 : walk.x + walk.w - scene.layout.stairW * 0.5
      y = midY
      dir = west ? 'right' : 'left'
    } else if(anchor?.type === 'basement'){
      // Coming back up: stand in front of the door we climbed out of.
      x = scene.basement ? scene.basement.cx : walk.x + scene.layout.stairW
      y = walk.y + walk.h * 0.62
      dir = 'up'
    } else {
      x = scene.width / 2
      y = midY
    }
  }

  // Never trust the nominal spawn: a doorway can open right behind a bookcase
  // run, and landing inside a collider blocks every axis at once — which is
  // exactly what "部屋に入ると動けない" looked like.
  const safe = resolveSpawn(scene, x, y)
  player.x = safe.x
  player.y = safe.y
  player.dir = dir
}

function clampToWalk(){
  const w = scene.walk
  player.x = Math.max(w.x, Math.min(w.x + w.w, player.x))
  player.y = Math.max(w.y, Math.min(w.y + w.h, player.y))
}

// ---- collision (AABB, resolved per-axis so the player slides along walls) ----
function blocked(nx, ny){
  return isBlocked(scene, nx, ny)
}

function step(dt){
  let vx = 0, vy = 0
  if(keys.has('left')) vx -= 1
  if(keys.has('right')) vx += 1
  if(keys.has('up')) vy -= 1
  if(keys.has('down')) vy += 1
  const moving = vx !== 0 || vy !== 0
  player.moving = moving
  if(moving){
    const len = Math.hypot(vx, vy) || 1
    const dist = player.speed * dt
    const dx = (vx / len) * dist
    const dy = (vy / len) * dist
    // facing
    if(Math.abs(vx) > Math.abs(vy)) player.dir = vx < 0 ? 'left' : 'right'
    else player.dir = vy < 0 ? 'up' : 'down'
    // resolve X then Y
    const w = scene.walk
    // If we somehow ended up inside geometry (an old save, a debug teleport),
    // let the player walk straight out instead of pinning them in place.
    const stuck = blocked(player.x, player.y)
    const tx = Math.max(w.x, Math.min(w.x + w.w, player.x + dx))
    if(stuck || !blocked(tx, player.y)) player.x = tx
    const ty = Math.max(w.y, Math.min(w.y + w.h, player.y + dy))
    if(stuck || !blocked(player.x, ty)) player.y = ty
    player.animTime += dt
    if(dialogText.value) dialogText.value = ''
    updateContext()
  }
}

// ---- context detection: what can the player do right where they stand ----
function pointInRect(px, py, r){ return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h }

// Reach measured from the object's edge — about an arm's length plus a step.
const REACH = Math.round(PX_PER_M * 1.15)

function updateContext(){
  if(!scene){ highlight = null; contextActions = []; actions.value = []; examinable = new Set(); return }
  const acts = []
  let hi = null

  if(scene.kind === 'corridor'){
    for(const d of scene.doors){
      if(pointInRect(player.x, player.y, d.trigger)){
        hi = d.id
        const which = scene.doors.filter((o) => o.roomId === d.roomId).length > 1 ? `（${d.doorLabel}）` : ''
        acts.push({
          key: d.id, hint: 'Enter', label: `${d.label}${which} に入る`,
          type: 'enter-room', roomId: d.roomId, entryDoor: d.doorId, priority: 0
        })
      }
    }
    for(const s of scene.stairs){
      if(pointInRect(player.x, player.y, s.trigger)){
        hi = hi || s.id
        for(const target of s.targets){
          acts.push({ key: `${s.id}-${target}`, hint: '', label: `${s.label}で ${target} へ`, type: 'travel', side: s.side, target, priority: 1 })
        }
      }
    }
    // 地下への階段は1階の廊下に独立して現れる（階段室とは別）。
    if(scene.basement && pointInRect(player.x, player.y, scene.basement.trigger)){
      hi = hi || scene.basement.id
      acts.push({ key: scene.basement.id, hint: 'Enter', label: '地下へ降りる', type: 'enter-basement', priority: 0 })
    }
  } else {
    // room: nearest interactable object within reach, plus exit doors
    let best = null
    let bestDist = Infinity
    for(const o of scene.interactables){
      const dist = distanceToObject(player.x, player.y, o)
      const radius = o.interactionRadius || REACH
      if(dist <= radius && dist < bestDist){ best = o; bestDist = dist }
    }
    if(best){
      hi = best.id
      acts.push({ key: best.id, hint: 'E', label: `${best.label} を調べる`, type: 'interact', object: best, priority: 0 })
    }
    for(const ex of scene.exits){
      if(pointInRect(player.x, player.y, ex.trigger)){
        hi = hi || ex.id
        acts.push({ key: ex.id, hint: 'Enter', label: '廊下へ戻る', type: 'exit-room', door: ex.id, priority: best ? 1 : 0 })
      }
    }
  }

  acts.sort((a, b) => a.priority - b.priority)
  highlight = hi
  contextActions = acts
  actions.value = acts.map(({ key, hint, label }) => ({ key, hint, label }))
  // The painter badges exactly this set, so a "?" always has an action behind it.
  examinable = new Set((scene.interactables || []).map((o) => o.id))
}

function runAction(a){
  const source = contextActions.find((c) => c.key === a.key) || a
  if(source.type === 'interact'){
    dialogText.value = source.object.interactionText || interactionFor(source.object)
    emit('interact', source.object)
    return
  }
  // persist final position before a scene transition
  emit(source.type, source)
}

// interaction text is resolved by the parent via the store; keep a fallback.
function interactionFor(object){
  return object.__text || '調べた。'
}

function primaryOfType(types){
  return contextActions.find((c) => types.includes(c.type))
}

// ---- input ----
const KEYMAP = {
  arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
  arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down'
}
// Movement keys are listened for on the window, so anything typed into a text
// field elsewhere in the shell (address bar, debug console) must not walk the
// player around or get swallowed by preventDefault().
function isTypingTarget(target){
  if(!target || typeof target !== 'object') return false
  if(target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function onKeyDown(e){
  if(!props.active || isTypingTarget(e.target)) return
  const k = e.key.toLowerCase()
  if(KEYMAP[k]){ keys.add(KEYMAP[k]); e.preventDefault(); return }
  if(k === 'e'){
    e.preventDefault()
    const act = primaryOfType(['interact'])
    if(act) runAction(act)
    else if(dialogText.value) dialogText.value = ''
    return
  }
  if(k === 'enter'){
    e.preventDefault()
    const act = primaryOfType(['enter-room', 'exit-room', 'travel', 'enter-basement'])
    if(act) runAction(act)
    else if(dialogText.value) dialogText.value = ''
  }
}
function onKeyUp(e){
  const k = e.key.toLowerCase()
  if(KEYMAP[k]) keys.delete(KEYMAP[k])
}

// A blurred/hidden stage must not keep a held direction pressed.
function onWindowBlur(){
  keys.clear()
}

function clearDialog(){ dialogText.value = '' }

// expose a way for the parent to feed resolved interaction text
function showInteractionText(text){ dialogText.value = text }
defineExpose({ showInteractionText, getPlayerPosition: () => ({ x: player.x, y: player.y }) })

// ---- camera + render loop ----
// One world scale everywhere: a desk is the same size on screen in a 6.75m
// study room as in a 70m corridor. Scenes smaller than the view are centred;
// larger ones follow the player and clamp at the walls.
const VIEW_W = 1020
const VIEW_H = 620
const MAX_SCALE = 1.9

function computeCamera(vw, vh){
  const s = scene
  // Frame against the scene's declared view height, not its drawn height: a
  // corridor that stops at the window wall must still be framed like a full
  // one, or the player would visibly resize when changing floors.
  const frameH = s.viewHeight || s.height
  const scale = Math.min(
    Math.min(vw / Math.min(s.width, VIEW_W), vh / Math.min(frameH, VIEW_H)),
    MAX_SCALE
  )
  const viewW = vw / scale
  const viewH = vh / scale
  const axis = (sceneSize, view, focus, viewport) => {
    if(sceneSize <= view) return (viewport - sceneSize * scale) / 2
    const cam = Math.max(0, Math.min(sceneSize - view, focus - view / 2))
    return -cam * scale
  }
  return {
    scale,
    ox: axis(s.width, viewW, player.x, vw),
    oy: axis(frameH, viewH, player.y, vh)
  }
}

function frame(ts){
  if(!ctx || !scene){ raf = requestAnimationFrame(frame); return }
  const dt = Math.min(0.05, (ts - lastTime) / 1000 || 0)
  lastTime = ts
  if(props.active) step(dt)

  const vw = canvas.value.width / dpr
  const vh = canvas.value.height / dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, vw, vh)
  const cam = computeCamera(vw, vh)
  ctx.save()
  ctx.setTransform(dpr * cam.scale, 0, 0, dpr * cam.scale, dpr * cam.ox, dpr * cam.oy)
  renderScene(ctx, scene, theme.value, { player, highlight, examinable })
  ctx.restore()

  raf = requestAnimationFrame(frame)
}

function resize(){
  if(!canvas.value || !host.value) return
  dpr = Math.min(2, window.devicePixelRatio || 1)
  const rect = host.value.getBoundingClientRect()
  canvas.value.width = Math.max(1, Math.floor(rect.width * dpr))
  canvas.value.height = Math.max(1, Math.floor(rect.height * dpr))
}

let resizeObserver = null
watch(sceneKey, () => rebuildScene())
watch(() => props.edition, () => rebuildScene())
// react to object-state / anomaly changes without respawning the player
watch(() => [props.session.memories.length, props.session.anomalyLevel, props.session.lastInteraction], () => {
  if(scene) { scene = buildScene(props.session, props.edition); updateContext() }
})

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resize()
  rebuildScene()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onWindowBlur)
  window.addEventListener('resize', resize)
  if(typeof ResizeObserver !== 'undefined'){
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host.value)
  }
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('blur', onWindowBlur)
  window.removeEventListener('resize', resize)
  if(resizeObserver) resizeObserver.disconnect()
  keys.clear()
})
</script>

<style scoped>
.scene-stage{position:relative;width:100%;height:100%;min-height:0;overflow:hidden;background:#c7a06d}
.stage-original{background:#080e16}
.scene-stage__canvas{display:block;width:100%;height:100%;image-rendering:auto}
.scene-stage__scanlines{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.14) 0 1px,transparent 1px 3px);mix-blend-mode:multiply;opacity:.5}
.scene-dialog{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);width:min(760px,calc(100% - 28px));z-index:4}
.scene-dialog__bar,.scene-dialog__text{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;background:rgba(28,20,14,0.86);border:1px solid rgba(255,239,200,0.28);box-shadow:0 10px 30px rgba(0,0,0,0.35);backdrop-filter:blur(6px)}
.stage-original .scene-dialog__bar,.stage-original .scene-dialog__text{background:rgba(9,15,23,0.9);border-color:rgba(120,160,196,0.32)}
.scene-dialog__idle{margin:0;color:#f6ecd9;font:13px/1 "Hiragino Sans",ui-monospace,monospace;letter-spacing:.02em}
.stage-original .scene-dialog__idle{color:#cfe0ef}
.scene-dialog__idle kbd{display:inline-block;padding:2px 6px;margin:0 1px;border:1px solid currentColor;border-radius:4px;font:11px ui-monospace,monospace;opacity:.9}
.scene-dialog__action{display:flex;align-items:center;gap:7px;padding:9px 13px;border-radius:9px;border:1px solid rgba(255,239,200,0.28);background:rgba(255,255,255,0.06);color:#f6ecd9;font:13px "Hiragino Sans",sans-serif;cursor:pointer;transition:.15s}
.scene-dialog__action:hover,.scene-dialog__action:focus-visible{background:rgba(255,255,255,0.16)}
.scene-dialog__action.primary{background:#a26743;border-color:#c88f5f;color:#fff6e6}
.stage-original .scene-dialog__action{color:#cfe0ef;border-color:rgba(120,160,196,0.32)}
.stage-original .scene-dialog__action.primary{background:#496d8f;border-color:#6d94b7;color:#eaf3fb}
.scene-dialog__action b{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 5px;border-radius:5px;background:rgba(0,0,0,0.28);font:11px ui-monospace,monospace}
.scene-dialog__action b:empty{display:none}
.scene-dialog__text{align-items:flex-start}
.scene-dialog__lines{display:flex;flex:1;flex-direction:column;gap:5px;min-width:0}
.scene-dialog__text p{margin:0;color:#f6ecd9;font:14px/1.7 "Hiragino Mincho ProN",Georgia,serif}
.scene-dialog__text p.is-voice{margin-top:4px;color:#f3d9ae}
.stage-original .scene-dialog__text p{color:#cfe0ef}
.stage-original .scene-dialog__text p.is-voice{color:#b6d5f2}
.scene-dialog__mark{color:#e0ad66;font-size:16px;line-height:1.6}
.scene-dialog__close{border:0;background:none;color:inherit;font-size:18px;line-height:1;cursor:pointer;opacity:.7}
.scene-dialog__close:hover{opacity:1}
@media(max-width:640px){.scene-dialog{bottom:10px}.scene-dialog__bar,.scene-dialog__text{flex-wrap:wrap;padding:10px 12px}.scene-dialog__idle{font-size:11px}}
</style>
