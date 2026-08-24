<template>
  <DebugSection id="game-session" title="ゲーム / セッション" icon="◆" :badge="editionLabel">
    <div class="dbg-grid-2">
      <button
        v-for="item in EDITION_ITEMS"
        :key="item.id"
        type="button"
        class="dbg-btn"
        :class="{ 'is-active': edition === item.id }"
        @click="selectEdition(item)"
      >{{ item.label }}</button>
    </div>
    <p class="dbg-hint">操作対象のエディション。ゲームタブを開いていない場合は「ゲーム画面を開く」で表示できます。</p>
    <button type="button" class="dbg-btn dbg-btn--wide dbg-btn--primary" @click="openGameTab">ゲーム画面を開く</button>

    <p class="dbg-label">Session</p>
    <div class="dbg-grid-3">
      <button type="button" class="dbg-btn" @click="run(() => game.start(edition), 'START')">START</button>
      <button type="button" class="dbg-btn" @click="run(() => game.continueGame(edition), 'CONTINUE')">CONTINUE</button>
      <button type="button" class="dbg-btn" @click="run(() => game.patchSession({ currentScene: 'title' }, edition), 'タイトルへ')">TITLE</button>
    </div>
    <div class="dbg-grid-2">
      <button type="button" class="dbg-btn dbg-btn--danger" @click="run(() => game.resetEdition(edition), 'このエディションを初期化')">このエディションを初期化</button>
      <button type="button" class="dbg-btn dbg-btn--danger" @click="run(() => game.resetAll(), '両エディション初期化')">両方を初期化</button>
    </div>

    <dl class="dbg-facts">
      <div><dt>scene</dt><dd>{{ session.currentScene }}</dd></div>
      <div><dt>floor</dt><dd>{{ session.currentFloor }}</dd></div>
      <div><dt>room</dt><dd>{{ session.roomId || '—' }}</dd></div>
      <div><dt>pos</dt><dd>{{ session.playerPosition.x }},{{ session.playerPosition.y }}</dd></div>
      <div><dt>visited</dt><dd>{{ session.visited.length }}/{{ ROOM_IDS.length }}</dd></div>
      <div><dt>memories</dt><dd>{{ session.memories.length }}</dd></div>
    </dl>
  </DebugSection>

  <DebugSection id="game-warp" title="ワープ（階・部屋）" icon="⇄" :badge="session.currentFloor">
    <p class="dbg-hint">クリックで即移動。タイトル画面の場合は自動でSTARTします。</p>
    <div v-for="floor in FLOOR_ORDER" :key="floor" class="dbg-stack">
      <div class="dbg-subhead">
        <span class="dbg-label">{{ floor }} · {{ FLOOR_DEFINITIONS[floor].name }}</span>
        <button
          type="button"
          class="dbg-btn dbg-btn--sm"
          :class="{ 'is-active': isHere(floor, null) }"
          :disabled="!floorReachable(floor)"
          @click="warp(floor, null)"
        >廊下</button>
      </div>
      <div class="dbg-grid-3">
        <button
          v-for="room in FLOOR_DEFINITIONS[floor].rooms"
          :key="room"
          type="button"
          class="dbg-btn"
          style="flex-direction:column;gap:1px;align-items:flex-start;text-align:left"
          :class="{ 'is-active': isHere(floor, room) }"
          :disabled="!floorReachable(floor)"
          @click="warp(floor, room)"
        >
          <span class="dbg-item__sub">{{ room }}{{ session.visited.includes(room) ? ' ✓' : '' }}</span>
          <span style="font-size:10px">{{ roomName(room) }}</span>
        </button>
      </div>
    </div>
  </DebugSection>

  <DebugSection id="game-basement" title="地下ゲート" icon="▼" :badge="basementMode">
    <div class="dbg-grid-3">
      <button
        v-for="mode in BASEMENT_MODES"
        :key="mode.value"
        type="button"
        class="dbg-btn"
        :class="{ 'is-active': basementMode === mode.value }"
        @click="setBasement(mode)"
      >{{ mode.label }}</button>
    </div>
    <p class="dbg-hint">{{ basementReason }}</p>
  </DebugSection>

  <DebugSection id="game-anomaly" title="違和感 / 時計" icon="◌" :badge="session.anomalyLevel">
    <template v-if="edition === EDITIONS.ORIGINAL">
      <div class="dbg-row">
        <span class="dbg-label">Anomaly</span>
        <input
          class="dbg-range dbg-grow"
          type="range"
          min="0"
          max="4"
          step="1"
          :value="session.anomalyLevel"
          @input="setAnomaly($event.target.value)"
        />
        <span class="dbg-chip dbg-chip--accent">{{ session.anomalyLevel }}</span>
      </div>
      <p class="dbg-hint">再訪（+1）と anomalyPhase フラグ（+1）が加算され、部屋ごとの実効値は最大4になります。</p>
    </template>
    <p v-else class="dbg-warnline">Anomaly は初期版のみ有効です。</p>

    <p class="dbg-label">Clocks</p>
    <div v-for="clock in clocks" :key="clock.clockId" class="dbg-row">
      <span class="dbg-grow dbg-item__sub">{{ clock.clockId.replace('clock-', '') }}</span>
      <select class="dbg-select" style="width:120px" :value="clockValue(clock.clockId)" @change="setClock(clock.clockId, $event.target.value)">
        <option v-for="state in CLOCK_STATES" :key="state" :value="state">{{ state }}</option>
      </select>
    </div>
    <button type="button" class="dbg-btn dbg-btn--wide" @click="run(() => game.patchSession({ clockState: {} }, edition), '時計をリセット')">時計を既定に戻す</button>
  </DebugSection>

  <DebugSection id="game-settings" title="ゲーム内設定" icon="⚙">
    <label class="dbg-check">
      <input type="checkbox" :checked="session.settings.guideVisible" @change="setSetting('guideVisible', $event.target.checked)" />
      ガイド表示 (guideVisible)
    </label>
    <label class="dbg-check">
      <input type="checkbox" :checked="session.settings.soundEnabled" @change="setSetting('soundEnabled', $event.target.checked)" />
      環境音 (soundEnabled)
    </label>
    <p class="dbg-label">プレイヤー位置</p>
    <div class="dbg-row">
      <input class="dbg-input" type="number" :value="session.playerPosition.x" @change="setPosition('x', $event.target.value)" @keydown.stop @keyup.stop />
      <input class="dbg-input" type="number" :value="session.playerPosition.y" @change="setPosition('y', $event.target.value)" @keydown.stop @keyup.stop />
    </div>
    <p class="dbg-hint">部屋の内部座標（800×600）。反映にはワープか再入室が必要な場合があります。</p>
  </DebugSection>
</template>

<script setup>
import { computed } from 'vue'
import DebugSection from './DebugSection.vue'
import { useDebugConsole } from './debugContext.js'
import { CLOCK_STATES, getEditionConfig, resolveClock } from '../../game/data/editions.js'
import { EDITIONS, FLOOR_DEFINITIONS, FLOOR_ORDER, ROOM_IDS, canAccessBasement, getRoomDefinition } from '../../game/data/school.js'
import { VIRTUAL_URLS } from '../../virtual-web/constants.js'

const shell = useDebugConsole()
const game = shell.game

const EDITION_ITEMS = Object.freeze([
  { id: EDITIONS.REVIVAL, label: '復刻版 / REVIVAL' },
  { id: EDITIONS.ORIGINAL, label: '初期版 / ORIGINAL' }
])
const BASEMENT_MODES = Object.freeze([
  { value: 'locked', label: 'LOCKED' },
  { value: 'unlocked', label: 'UNLOCKED' },
  { value: 'access', label: 'ACCESS' }
])

const edition = computed(() => shell.edition.value)
const editionLabel = computed(() => (edition.value === EDITIONS.ORIGINAL ? '初期版' : '復刻版'))
const session = computed(() => game.sessions[edition.value])
const clocks = computed(() => Object.values(getEditionConfig(edition.value).clocks).map((clock) => resolveClock(clock.clockId, edition.value)))
const basementMode = computed(() => {
  if(session.value.canAccessBasement) return 'access'
  return session.value.basementUnlocked ? 'unlocked' : 'locked'
})
const basementReason = computed(() => {
  if(edition.value === EDITIONS.REVIVAL) return '復刻版は値に関わらず地下へ進入できません。'
  return canAccessBasement(session.value, edition.value) ? '地下へ進入可能です。' : '地下は閉じています。'
})

function run(action, label){
  game.selectEdition(edition.value)
  action()
  shell.notify(label)
}

function selectEdition(item){
  shell.setEdition(item.id)
  shell.notify(`対象エディション → ${item.label}`)
}

function openGameTab(){
  shell.browser.openVirtualUrl(edition.value === EDITIONS.ORIGINAL ? VIRTUAL_URLS.GAME_ORIGINAL : VIRTUAL_URLS.GAME_REVIVAL)
  shell.notify(`${editionLabel.value} のタブを開いた`)
}

function roomName(roomId){
  return getRoomDefinition(roomId)?.name || roomId
}

function floorReachable(floor){
  return floor !== 'B1' || canAccessBasement(session.value, edition.value)
}

function isHere(floor, roomId){
  const current = session.value
  if(current.currentScene === 'title') return false
  if(roomId) return current.roomId === roomId
  return current.currentScene === 'corridor' && current.currentFloor === floor
}

function warp(floor, roomId){
  game.selectEdition(edition.value)
  if(session.value.currentScene === 'title') game.start(edition.value)
  const result = game.debugMoveTo({ floor, roomId: roomId || null })
  shell.notify(result.ok ? `→ ${floor} ${roomId ? roomName(roomId) : '廊下'}` : result.reason)
}

function setBasement(mode){
  game.selectEdition(edition.value)
  game.setBasementAccess({ unlocked: mode.value !== 'locked', canAccess: mode.value === 'access' })
  shell.notify(`地下ゲート → ${mode.label}`)
}

function setAnomaly(value){
  game.selectEdition(edition.value)
  game.setAnomalyLevel(value)
  shell.notify(`Anomaly → ${session.value.anomalyLevel}`)
}

function clockValue(clockId){
  return session.value.clockState[clockId] || getEditionConfig(edition.value).clocks[clockId]?.state || 'normal'
}

function setClock(clockId, state){
  game.selectEdition(edition.value)
  game.setClockState(clockId, state)
  shell.notify(`${clockId} → ${state}`)
}

function setSetting(key, value){
  game.selectEdition(edition.value)
  game.setDebugSetting(key, value)
  shell.notify(`${key} → ${value ? 'ON' : 'OFF'}`)
}

function setPosition(axis, value){
  const next = { ...session.value.playerPosition, [axis]: Math.round(Number(value) || 0) }
  game.patchSession({ playerPosition: next }, edition.value)
  shell.notify(`position → ${next.x},${next.y}`)
}
</script>
