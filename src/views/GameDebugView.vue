<template>
  <div class="dbg debug-shell" :class="{ 'is-collapsed': !sidebarOpen }">
    <!-- ===================== SIDE MENU ===================== -->
    <nav class="debug-rail" aria-label="デバッグ項目">
      <button
        type="button"
        class="debug-rail__toggle"
        :aria-expanded="sidebarOpen"
        :title="sidebarOpen ? 'サイドメニューを閉じる' : 'サイドメニューを開く'"
        @click="toggleSidebar"
      >{{ sidebarOpen ? '⟨' : '⟩' }}</button>
      <button
        v-for="section in SECTIONS"
        :key="section.id"
        type="button"
        class="debug-rail__btn"
        :class="{ 'is-active': openSections[section.id] }"
        :title="section.title"
        @click="jumpToSection(section.id)"
      >{{ section.icon }}</button>
    </nav>

    <aside v-show="sidebarOpen" ref="sidebarEl" class="debug-sidebar" aria-label="デバッグメニュー">
      <header class="debug-sidebar__head">
        <div>
          <p class="dbg-label">SIDE-B / DEBUG CONSOLE</p>
          <h1>Game Lab</h1>
        </div>
        <span class="dbg-chip dbg-chip--warn" :title="`storage scope: ${scope}`">SANDBOX</span>
      </header>
      <p class="debug-sidebar__note">
        この画面は本編タブ（<span class="dbg-mono">#/</span>）と切り離された空間です。
        セーブは <span class="dbg-mono">{{ scope }}:</span> 名前空間に書かれ、本編には反映されません。
      </p>
      <div class="debug-sidebar__scroll">
        <DebugScenarioPanel />
        <DebugStoryPanel />
        <DebugBrowserPanel />
        <DebugWebPanel />
        <DebugGamePanel />
        <DebugStatePanel />
        <div class="debug-sidebar__foot">
          <button type="button" class="dbg-btn dbg-btn--sm" @click="setAllSections(true)">全て開く</button>
          <button type="button" class="dbg-btn dbg-btn--sm" @click="setAllSections(false)">全て閉じる</button>
        </div>
      </div>
    </aside>

    <!-- ===================== STAGE ===================== -->
    <main class="debug-main">
      <div class="debug-toolbar">
        <div class="debug-toolbar__row">
          <span class="dbg-chip dbg-chip--accent">LIVE GAME</span>
          <p class="debug-status" role="status">{{ message || 'サイドメニューから状態を操作すると、右のゲーム画面へ即時反映されます。' }}</p>
          <div class="dbg-btns">
            <button
              v-for="preset in VIEWPORTS"
              :key="preset.id"
              type="button"
              class="dbg-btn dbg-btn--sm"
              :class="{ 'is-active': viewport === preset.id }"
              @click="setViewport(preset.id)"
            >{{ preset.label }}</button>
          </div>
          <label class="debug-zoom" :title="viewport === 'fill' ? 'サイズ指定時のみ有効' : '表示倍率'">
            <span class="dbg-item__sub">{{ Math.round(zoom * 100) }}%</span>
            <input
              class="dbg-range"
              type="range"
              min="0.4"
              max="1.2"
              step="0.05"
              :value="zoom"
              :disabled="viewport === 'fill'"
              @input="setZoom($event.target.value)"
            />
          </label>
          <button type="button" class="dbg-btn dbg-btn--sm" title="ゲーム画面を作り直す" @click="remountStage(true)">⟳ 再構築</button>
        </div>
        <div class="debug-toolbar__row debug-toolbar__row--facts">
          <span class="dbg-chip dbg-chip--accent">{{ storyState.chapter }} / {{ storyState.step }}</span>
          <span v-if="showReunion" class="dbg-chip dbg-chip--warn">REUNION SCENE</span>
          <span v-if="showDeviceSetup" class="dbg-chip dbg-chip--warn">DEVICE SETUP</span>
          <span class="dbg-chip">tab: {{ browser.activeTab?.title || '—' }}</span>
          <span class="dbg-chip">{{ browser.currentUrl }}</span>
          <span class="dbg-chip dbg-chip--accent">{{ edition }}</span>
          <span class="dbg-chip">{{ session.currentScene }} / {{ session.currentFloor }}{{ session.roomId ? ` / ${session.roomId}` : '' }}</span>
          <span class="dbg-chip">visited {{ session.visited.length }}/21</span>
          <span class="dbg-chip">memories {{ session.memories.length }}</span>
          <span class="dbg-chip" :class="basementChipClass">B1 {{ basementLabel }}</span>
          <span v-if="edition === 'original'" class="dbg-chip dbg-chip--warn">anomaly {{ session.anomalyLevel }}</span>
          <span v-if="browser.unreadMessageCount" class="dbg-chip dbg-chip--warn">unread {{ browser.unreadMessageCount }}</span>
        </div>
      </div>

      <div class="debug-stage" :class="{ 'is-device': viewport !== 'fill' }">
        <div class="debug-frame" :style="frameOuterStyle">
          <div class="debug-frame__inner" :style="frameInnerStyle">
            <!-- Mirrors App.vue: before the DM there is no browser yet, only
                 the reunion and the new phone's setup, so the stage has to be
                 able to show them too. -->
            <ReunionScene v-if="showReunion" :key="`reunion-${stageKey}`" />
            <DeviceSetupScene v-else-if="showDeviceSetup" :key="`device-${stageKey}`" />
            <BrowserWorkspace v-else :key="stageKey" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import BrowserWorkspace from './BrowserWorkspace.vue'
import DeviceSetupScene from './DeviceSetupScene.vue'
import ReunionScene from './ReunionScene.vue'
import DebugBrowserPanel from '../components/debug/DebugBrowserPanel.vue'
import DebugGamePanel from '../components/debug/DebugGamePanel.vue'
import DebugScenarioPanel from '../components/debug/DebugScenarioPanel.vue'
import DebugWebPanel from '../components/debug/DebugWebPanel.vue'
import DebugStatePanel from '../components/debug/DebugStatePanel.vue'
import DebugStoryPanel from '../components/debug/DebugStoryPanel.vue'
import { provideDebugConsole } from '../components/debug/debugContext.js'
import '../components/debug/debug-ui.css'
import { EDITIONS, canAccessBasement } from '../game/data/school.js'
import { useDebugStore } from '../store/debug.js'
import { useGameSessionStore } from '../store/gameSession.js'
import { useGameStore } from '../store/index.js'
import { useStoryStore } from '../store/story.js'
import { STORY_CHAPTERS } from '../story/chapters.js'
import { getStorageScope } from '../store/storage.js'
import { useVirtualBrowserStore } from '../store/virtualBrowser.js'

// `story` is the legacy 3-phase facade the older panels still read;
// `storyState` is the real chapter/step/milestone state.
const story = useGameStore()
const storyState = useStoryStore()
const game = useGameSessionStore()
// Same rule as the game page: load the sandbox save before anything can write.
game.hydrate()
const browser = useVirtualBrowserStore()
const debug = useDebugStore()

// The rail mirrors the sections the panels declare, so the menu can be reached
// even when it is collapsed.
const SECTIONS = Object.freeze([
  { id: 'scenarios', icon: '⚑', title: 'シナリオ（一発適用）' },
  { id: 'story', icon: '✉', title: '物語 / Story State' },
  { id: 'browser-tabs', icon: '▤', title: '仮想ブラウザ / タブ' },
  { id: 'browser-pages', icon: '⌘', title: 'ページ直接オープン' },
  { id: 'browser-notify', icon: '◔', title: '通知 / トースト' },
  { id: 'web-sites', icon: '◍', title: '一般Web / サイト' },
  { id: 'web-pages', icon: '⌗', title: '一般Web / ページ' },
  { id: 'web-search', icon: '⌕', title: '一般Web / 検索' },
  { id: 'game-session', icon: '◆', title: 'ゲーム / セッション' },
  { id: 'game-warp', icon: '⇄', title: 'ワープ（階・部屋）' },
  { id: 'game-basement', icon: '▼', title: '地下ゲート' },
  { id: 'game-anomaly', icon: '◌', title: '違和感 / 時計' },
  { id: 'game-settings', icon: '⚙', title: 'ゲーム内設定' },
  { id: 'flags', icon: '⚐', title: 'フラグ / 記憶' },
  { id: 'snapshots', icon: '⌸', title: 'スナップショット' },
  { id: 'state-json', icon: '{}', title: 'State JSON' },
  { id: 'storage', icon: '▣', title: 'サンドボックス / ストレージ' }
])

const VIEWPORTS = Object.freeze([
  { id: 'fill', label: 'FILL' },
  { id: 'desktop', label: '1280', width: 1280, height: 820 },
  { id: 'laptop', label: '1024', width: 1024, height: 700 },
  { id: 'tablet', label: '834', width: 834, height: 1112 },
  { id: 'mobile', label: '390', width: 390, height: 844 }
])

const scope = getStorageScope() || '(none)'
const sidebarEl = ref(null)
const stageKey = ref(0)
const message = ref('')
// Follows the store, so the console always targets the edition the visible game
// tab is showing.
const edition = computed({
  get: () => game.activeEdition,
  set: (value) => game.selectEdition(value)
})
const sidebarOpen = ref(debug.sidebarOpen)
const viewport = ref(VIEWPORTS.some((item) => item.id === debug.viewport) ? debug.viewport : 'fill')
const zoom = ref(Math.min(1.2, Math.max(0.4, debug.zoom || 1)))
const openSections = reactive({ ...(debug.openSections || { scenarios: true, 'game-session': true }) })

const showReunion = computed(() => (
  storyState.chapter === STORY_CHAPTERS.PROLOGUE && storyState.step === 'reunion'
))

const showDeviceSetup = computed(() => (
  storyState.chapter === STORY_CHAPTERS.PROLOGUE && storyState.step === 'device_setup'
))

const session = computed(() => game.sessions[edition.value])
const basementLabel = computed(() => {
  if(canAccessBasement(session.value, edition.value)) return 'ACCESS'
  return session.value.basementUnlocked ? 'UNLOCKED' : 'LOCKED'
})
const basementChipClass = computed(() => (basementLabel.value === 'ACCESS' ? 'dbg-chip--on' : ''))
const activeViewport = computed(() => VIEWPORTS.find((item) => item.id === viewport.value) || VIEWPORTS[0])

const frameOuterStyle = computed(() => {
  const preset = activeViewport.value
  if(!preset.width) return { width: '100%', height: '100%' }
  return { width: `${Math.round(preset.width * zoom.value)}px`, height: `${Math.round(preset.height * zoom.value)}px` }
})
const frameInnerStyle = computed(() => {
  const preset = activeViewport.value
  if(!preset.width) return { width: '100%', height: '100%' }
  return {
    width: `${preset.width}px`,
    height: `${preset.height}px`,
    transform: `scale(${zoom.value})`,
    transformOrigin: 'top left'
  }
})

function notify(text){
  message.value = text
}

function remountStage(announce = false){
  stageKey.value += 1
  if(announce) notify('ゲーム画面を再構築しました')
}

function setEdition(value){
  edition.value = value === EDITIONS.ORIGINAL ? EDITIONS.ORIGINAL : EDITIONS.REVIVAL
}

function isSectionOpen(id){
  return Boolean(openSections[id])
}

function persistSections(){
  debug.setPref('openSections', { ...openSections })
}

function toggleSection(id){
  openSections[id] = !openSections[id]
  persistSections()
}

function setAllSections(value){
  for(const section of SECTIONS) openSections[section.id] = value
  persistSections()
}

async function jumpToSection(id){
  if(!sidebarOpen.value){
    sidebarOpen.value = true
    debug.setPref('sidebarOpen', true)
  }
  openSections[id] = true
  persistSections()
  await nextTick()
  const target = sidebarEl.value?.querySelector(`#dbg-section-${id}`)
  target?.parentElement?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

function toggleSidebar(){
  sidebarOpen.value = !sidebarOpen.value
  debug.setPref('sidebarOpen', sidebarOpen.value)
}

function setViewport(id){
  viewport.value = id
  debug.setPref('viewport', id)
  notify(`表示サイズ: ${VIEWPORTS.find((item) => item.id === id)?.label}`)
}

function setZoom(value){
  zoom.value = Number(value) || 1
  debug.setPref('zoom', zoom.value)
}

// The stores double as the sandbox: panels drive them, the stage renders them.
provideDebugConsole({
  story,
  storyState,
  game,
  browser,
  debug,
  context: { story, storyState, game, browser, debug },
  edition,
  setEdition,
  notify,
  remountStage,
  isSectionOpen,
  toggleSection
})

onMounted(() => {
  game.hydrate()
  browser.initializeBrowser()
})
</script>

<style scoped>
.debug-shell{
  display:grid;
  grid-template-columns:auto minmax(320px, 400px) minmax(0, 1fr);
  height:100vh;
  height:100dvh;
  overflow:hidden;
  background:var(--dbg-bg);
}

.debug-shell.is-collapsed{
  grid-template-columns:auto minmax(0, 1fr);
}

/* ---------- rail ---------- */
.debug-rail{
  display:flex;
  flex-direction:column;
  gap:3px;
  width:42px;
  padding:8px 5px;
  overflow-y:auto;
  border-right:1px solid var(--dbg-line-soft);
  background:#090d14;
}

.debug-rail__toggle,
.debug-rail__btn{
  display:grid;
  flex:0 0 auto;
  place-items:center;
  width:32px;
  height:28px;
  border:1px solid transparent;
  border-radius:6px;
  background:transparent;
  color:var(--dbg-muted);
  font-size:12px;
  cursor:pointer;
}

.debug-rail__toggle{margin-bottom:6px;border-color:var(--dbg-line);color:var(--dbg-text)}
.debug-rail__btn:hover,
.debug-rail__toggle:hover{background:#16202c;color:var(--dbg-text)}
.debug-rail__btn.is-active{background:var(--dbg-accent-soft);color:#a9d0ef}

/* ---------- sidebar ---------- */
.debug-sidebar{
  display:flex;
  flex-direction:column;
  min-width:0;
  overflow:hidden;
  border-right:1px solid var(--dbg-line);
  background:var(--dbg-panel);
}

.debug-sidebar__head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px;
  padding:12px 12px 8px;
}

.debug-sidebar__head h1{
  margin:3px 0 0;
  color:#f0f6fb;
  font:600 20px/1.1 Georgia,serif;
}

.debug-sidebar__note{
  margin:0;
  padding:0 12px 10px;
  border-bottom:1px solid var(--dbg-line-soft);
  color:var(--dbg-muted);
  font-size:10.5px;
  line-height:1.6;
}

.debug-sidebar__scroll{
  flex:1;
  min-height:0;
  overflow-y:auto;
  overscroll-behavior:contain;
}

.debug-sidebar__foot{
  display:flex;
  gap:6px;
  padding:12px;
}

/* ---------- main ---------- */
.debug-main{
  display:flex;
  flex-direction:column;
  min-width:0;
  min-height:0;
}

.debug-toolbar{
  display:grid;
  gap:6px;
  padding:8px 12px;
  border-bottom:1px solid var(--dbg-line-soft);
  background:#0a0f16;
}

.debug-toolbar__row{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:8px;
}

.debug-toolbar__row--facts{gap:5px}

.debug-status{
  flex:1;
  min-width:180px;
  margin:0;
  color:var(--dbg-warn);
  font-size:11px;
}

.debug-zoom{display:flex;align-items:center;gap:6px;width:130px}

.debug-stage{
  flex:1;
  min-height:0;
  overflow:auto;
  padding:0;
  background:#070a10;
}

.debug-stage.is-device{
  display:grid;
  place-items:start center;
  padding:14px;
}

.debug-frame{
  overflow:hidden;
  border-radius:10px;
  background:#0b1017;
}

.debug-stage.is-device .debug-frame{
  border:1px solid var(--dbg-line);
  box-shadow:0 18px 60px rgba(0,0,0,.55);
}

.debug-frame__inner{position:relative;overflow:hidden}

/* The workspace normally owns the viewport; inside the console it fills the
   frame instead. */
.debug-frame__inner :deep(.virtual-browser-stage){
  min-height:100%;
  height:100%;
  padding:0;
}

.debug-frame__inner :deep(.virtual-browser){
  width:100%;
  height:100%;
  min-height:0;
  border:0;
  border-radius:0;
  box-shadow:none;
}

@media (max-width:1100px){
  .debug-shell{grid-template-columns:auto minmax(280px, 45vw) minmax(0, 1fr)}
}
</style>
