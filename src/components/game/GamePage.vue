<template>
  <main class="side-b-game" :class="`edition-${edition}`">
    <!-- ===================== TITLE ===================== -->
    <section v-if="isTitle" class="game-title" aria-labelledby="game-title-heading">
      <div class="title-skyline" aria-hidden="true">
        <span v-for="windowIndex in 18" :key="windowIndex"></span>
      </div>
      <p class="title-eyebrow">A SCHOOL MEMORY</p>
      <h1 id="game-title-heading">{{ config.title }}</h1>
      <p v-if="config.subtitle" class="title-edition">{{ config.subtitle }}</p>
      <div class="title-building" aria-hidden="true">
        <span class="building-roof"></span>
        <span class="building-body"></span>
        <span class="building-door"></span>
      </div>
      <nav class="title-menu" :aria-label="`${config.title} メニュー`">
        <button
          v-for="item in config.menu"
          :key="item"
          type="button"
          :disabled="isLoadItem(item) && !hasSave"
          @click="handleMenu(item)"
        >
          {{ item }}
        </button>
      </nav>
      <p class="title-version">{{ config.version }}</p>
    </section>

    <!-- ===================== PLAY ===================== -->
    <section v-else class="game-play" :class="{ 'is-fading': isFading }">
      <div class="scene-fade" aria-hidden="true"></div>

      <!-- top-left location chips -->
      <div class="hud-chips">
        <span class="chip chip--edition">{{ config.subtitle || 'START' }}</span>
        <span class="chip">
          {{ currentFloorLabel }}<template v-if="session.currentScene === 'room' && currentRoom">　{{ currentRoom.name }}</template><template v-else>　廊下</template>
        </span>
      </div>

      <!-- top-right tools -->
      <div class="hud-tools">
        <!-- Read-only:階の移動は校舎の階段からのみ。地下は解放後も出さない。 -->
        <p class="hud-floors" role="img" :aria-label="`現在 ${currentFloorLabel}`">
          <span v-for="floor in indicatorFloors" :key="floor" :class="{ active: session.currentFloor === floor }">{{ floor }}</span>
        </p>
        <button
          type="button"
          class="hud-progress"
          :aria-expanded="memoriesOpen"
          title="探索した部屋 / 記録した思い出（クリックで一覧）"
          @click="toggleMemories"
        ><i>□</i>{{ session.visited.length }}<i>✦</i>{{ isTrial ? `${trialProgress.recorded}/${trialProgress.total}` : session.memories.length }}</button>
        <span v-if="edition === 'original' && session.anomalyLevel > 0" class="hud-anomaly" title="違和感">◌{{ session.anomalyLevel }}</span>
        <button type="button" class="hud-btn" aria-label="設定" @click="toggleSettings">⚙</button>
        <button type="button" class="hud-btn" aria-label="タイトルへ" @click="returnToTitle">✕</button>
      </div>

      <!-- ===================== 思い出 ===================== -->
      <aside v-if="memoriesOpen" class="game-memories" aria-label="記録した思い出">
        <button class="game-memories__close" type="button" aria-label="閉じる" @click="memoriesOpen = false">×</button>
        <p class="game-label">MEMORIES</p>

        <!-- The trial's list answers two questions and no others: how the
             exploration ends, and which rooms are still unvisited. The object,
             the furniture, the people and the memory itself stay unsaid — that
             is what is left to find. -->
        <template v-if="isTrial">
          <h2>思い出<span class="game-memories__count">{{ trialProgress.recorded }} / {{ trialProgress.total }}</span></h2>
          <p class="memory-goal">
            <b>探索完了条件</b>
            必須の思い出をすべて確認する
          </p>
          <ol class="memory-list memory-list--places">
            <li v-for="entry in trialProgress.entries" :key="entry.id" :class="{ locked: !entry.recorded }">
              <h3>
                <span>{{ entry.location }}</span>
                <i v-if="entry.recorded" aria-hidden="true">✓</i>
              </h3>
              <p class="memory-text">{{ entry.recorded ? '確認済み' : '未確認' }}</p>
            </li>
          </ol>
          <p class="memory-hint">場所を頼りに、その部屋の中を調べてみよう。</p>
        </template>

        <template v-else>
          <h2>思い出<span class="game-memories__count">{{ recordedMemories }} / {{ memories.length }}</span></h2>
          <ol class="memory-list">
            <li v-for="memory in memories" :key="memory.id" :class="{ locked: !memory.recorded }">
              <template v-if="memory.recorded">
                <h3>{{ memory.title }}</h3>
                <p class="memory-source" v-if="memory.source">{{ memory.source }}</p>
                <p class="memory-text">{{ memory.text }}</p>
              </template>
              <template v-else>
                <h3>???</h3>
                <p class="memory-text">まだ記録していない。</p>
              </template>
            </li>
          </ol>
          <p class="memory-hint">「？」のついたものを調べると、ここに残っていく。</p>
        </template>
      </aside>

      <SceneStage
        ref="stage"
        :edition="edition"
        :session="session"
        :active="active && !settingsOpen && !memoriesOpen"
        @enter-room="onEnterRoom"
        @exit-room="onExitRoom"
        @travel="onTravel"
        @enter-basement="onEnterBasement"
        @interact="onInteract"
      />

      <aside v-if="settingsOpen" class="game-settings" aria-label="ゲーム設定">
        <button class="game-settings__close" type="button" aria-label="設定を閉じる" @click="settingsOpen = false">×</button>
        <p class="game-label">SETTINGS</p>
        <h2>{{ edition === 'revival' ? 'REVIVAL' : 'CONFIG' }}</h2>
        <label><input v-model="soundEnabled" type="checkbox" />環境音を有効にする</label>
        <p class="settings-note">音の演出はブラウザの設定に従います。</p>
        <button type="button" class="settings-title-btn" @click="returnToTitle">タイトルに戻る</button>
      </aside>

      <!-- The trial's revival build, seen through. Quiet on purpose: the build
           is a nostalgic little school game, not a score screen. -->
      <div v-if="trialClearOpen" class="game-clear" role="dialog" aria-labelledby="game-clear-heading">
        <div class="game-clear__panel">
          <p class="game-label">REVIVAL</p>
          <h2 id="game-clear-heading">校舎を一通り見て回った</h2>
          <p class="game-clear__text">思い出はすべて確認した。</p>
          <p class="game-clear__text">復刻版の中で見られるものは、これで全部のようだ。</p>
          <p class="game-clear__voice">「……思ってたより、覚えてるもんだな。」</p>
          <button type="button" class="game-clear__close" @click="closeTrialClear">閉じる</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SceneStage from './SceneStage.vue'
import { getEditionConfig, getMemoryCatalogue, resolveRoom } from '../../game/data/editions.js'
import { FLOOR_DEFINITIONS, FLOOR_ORDER } from '../../game/data/school.js'
import { useGameSessionStore } from '../../store/gameSession.js'
import { useStoryStore } from '../../store/story.js'
import { isTrialMode } from '../../trial/mode.js'
import { trialMemoryProgress } from '../../trial/memories.js'
import { completeTrialRevival, isTrialRevivalCleared, openTrialRevival } from '../../trial/flow.js'

const props = defineProps({
  edition: { type: String, required: true },
  active: { type: Boolean, default: true }
})

const game = useGameSessionStore()
const storyState = useStoryStore()
// Load the save before anything below can read or write it: the `active`
// watcher runs immediately, and it persists.
game.hydrate()
const stage = ref(null)
const config = computed(() => getEditionConfig(props.edition))
const session = computed(() => game.sessions[props.edition])
const currentRoom = computed(() => (session.value.currentScene === 'room' ? resolveRoom(session.value.roomId, props.edition, session.value) : null))
const isTitle = computed(() => session.value.currentScene === 'title')
const hasSave = computed(() => game.hasSave(props.edition))
// The indicator only ever names the above-ground floors: B1 stays off it even
// once it is open, so the HUD never hands the basement away.
const indicatorFloors = FLOOR_ORDER.filter((floor) => floor !== 'B1')
const currentFloorLabel = computed(() => FLOOR_DEFINITIONS[session.value.currentFloor]?.name || session.value.currentFloor)
const memories = computed(() => getMemoryCatalogue(props.edition, session.value))
const recordedMemories = computed(() => memories.value.filter((memory) => memory.recorded).length)

// ---- trial ----------------------------------------------------------------
// The trial replaces the ✦ counter and the 思い出 list with its own required
// set, and ends the exploration when that set is complete. Both read the same
// table (trial/memories.js), so the list and the check cannot disagree.
const isTrial = computed(() => isTrialMode() && props.edition === 'revival')
const trialProgress = computed(() => trialMemoryProgress(session.value))
const trialClearOpen = ref(false)
// 少し間を取ってからクリア演出、そのあと少しして水野からの通知。
const TRIAL_CLEAR_DELAY_MS = 1500
const TRIAL_NOTICE_DELAY_MS = 2600
let trialClearTimer = null
let trialNoticeTimer = null

function clearTrialTimers(){
  if(typeof window === 'undefined') return
  if(trialClearTimer) window.clearTimeout(trialClearTimer)
  if(trialNoticeTimer) window.clearTimeout(trialNoticeTimer)
  trialClearTimer = null
  trialNoticeTimer = null
}

// Telling the story is what makes 水野 write, so it is deliberately a beat
// behind the clear screen: the player reads the screen, then the message lands.
// It happens on its own timer as well as on the button, so a player who leaves
// the screen open is not stranded.
function reportTrialRevivalComplete(){
  trialNoticeTimer = null
  completeTrialRevival(storyState)
}

function closeTrialClear(){
  clearTrialTimers()
  trialClearOpen.value = false
  reportTrialRevivalComplete()
}

const settingsOpen = ref(false)
const memoriesOpen = ref(false)
const soundEnabled = ref(session.value.settings.soundEnabled)
const isFading = ref(false)
let fadeTimer = null

watch(() => props.active, (active) => {
  if(!active) return
  game.selectEdition(props.edition)
  // 水野 shared the build and the player opened it: chapter 1 of the trial.
  // A no-op in the full game, and on every visit after the first.
  if(isTrial.value) openTrialRevival(storyState)
}, { immediate: true })

// The last required memory. Runs immediately as well, so a reload in the moment
// between the final examine and the clear screen still reaches it.
watch(() => isTrial.value && trialProgress.value.complete, (complete) => {
  if(!complete || trialClearOpen.value) return
  // Already reported: the player has seen this and is only revisiting.
  if(isTrialRevivalCleared(storyState)) return
  clearTrialTimers()
  if(typeof window === 'undefined'){
    trialClearOpen.value = true
    return
  }
  trialClearTimer = window.setTimeout(() => {
    trialClearTimer = null
    trialClearOpen.value = true
    memoriesOpen.value = false
    settingsOpen.value = false
    trialNoticeTimer = window.setTimeout(reportTrialRevivalComplete, TRIAL_NOTICE_DELAY_MS)
  }, TRIAL_CLEAR_DELAY_MS)
}, { immediate: true })

watch(soundEnabled, (value) => { session.value.settings.soundEnabled = value; game.persist() })

function isLoadItem(item){ return item === config.value.loadLabel }

function handleMenu(item){
  game.selectEdition(props.edition)
  if(item === 'START') withFade(() => game.start(props.edition))
  if(item === config.value.loadLabel) withFade(() => game.continueGame(props.edition))
  if(item === 'SETTINGS' || item === 'CONFIG') settingsOpen.value = true
}

function returnToTitle(){
  settingsOpen.value = false
  memoriesOpen.value = false
  game.selectEdition(props.edition)
  withFade(() => { session.value.currentScene = 'title'; game.persist() })
}

function toggleSettings(){
  settingsOpen.value = !settingsOpen.value
  if(settingsOpen.value) memoriesOpen.value = false
}

function toggleMemories(){
  memoriesOpen.value = !memoriesOpen.value
  if(memoriesOpen.value) settingsOpen.value = false
}

function withFade(action){
  if(isFading.value){ action(); return }
  isFading.value = true
  action()
  if(typeof window !== 'undefined'){
    fadeTimer = window.setTimeout(() => { isFading.value = false; fadeTimer = null }, 320)
  } else {
    isFading.value = false
  }
}

// ---- SceneStage events ----
function onEnterRoom({ roomId, entryDoor }){
  game.selectEdition(props.edition)
  withFade(() => game.enterRoom(roomId, entryDoor || 'north-main'))
}
function onExitRoom(){
  game.selectEdition(props.edition)
  withFade(() => game.exitRoom())
}
function onTravel({ side, target }){
  game.selectEdition(props.edition)
  withFade(() => game.travelStairs(side, target))
}
function onEnterBasement(){
  game.selectEdition(props.edition)
  withFade(() => game.enterBasement())
}
function onInteract(object){
  game.selectEdition(props.edition)
  game.interact(object.id, object.memoryId || null, 'examined', object.interactionTextId)
}

onMounted(() => {
  if(props.active) game.selectEdition(props.edition)
})

onBeforeUnmount(() => {
  if(fadeTimer) window.clearTimeout(fadeTimer)
  clearTrialTimers()
  if(stage.value && session.value.currentScene === 'room'){
    game.selectEdition(props.edition)
    game.setPlayerPosition(stage.value.getPlayerPosition(), { persist: true })
  }
})
</script>

<style scoped>
.side-b-game{position:relative;height:100%;min-height:100%;color:#3e2b22;background:#c7a06d;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:hidden}
.edition-original{color:#dae6f4;background:#080e16}

/* ---------- title ---------- */
.game-title{position:relative;display:grid;box-sizing:border-box;place-items:center;align-content:center;gap:10px;height:100%;min-height:100%;overflow:hidden;padding:48px 24px;background:linear-gradient(180deg,#b8d2d7 0%,#e8d8b5 70%,#9f7859 70%,#765740 100%);text-align:center}
.edition-original .game-title{background:linear-gradient(180deg,#111c2e 0%,#263b54 70%,#17202c 70%,#101720 100%)}
.title-eyebrow,.game-label{margin:0;color:#8c6047;font-size:11px;letter-spacing:.16em;text-transform:uppercase}
.edition-original .title-eyebrow,.edition-original .game-label{color:#8ba8ca}
.game-title h1{z-index:1;margin:0;font:700 clamp(42px,8vw,86px)/.95 Georgia,serif;letter-spacing:.08em;color:#fff9ea;text-shadow:2px 3px 0 rgba(75,49,33,.32)}
.edition-original .game-title h1{color:#dbe7f3;font-family:ui-monospace,monospace;text-shadow:2px 3px 0 #0b111a}
.title-edition{z-index:1;margin:0;color:#fff4d8;font:600 clamp(16px,3vw,24px)/1 ui-monospace,monospace;letter-spacing:.28em}
.title-building{position:absolute;right:8%;bottom:16%;left:8%;height:32%;opacity:.8}
.building-body{position:absolute;right:8%;bottom:0;left:8%;height:78%;border:10px solid #735241;background:#a17a61;box-shadow:inset 0 -18px rgba(47,44,50,.14)}
.building-roof{position:absolute;right:5%;bottom:78%;left:5%;height:18%;background:#61483d;clip-path:polygon(0 100%,8% 0,92% 0,100% 100%)}
.building-door{position:absolute;bottom:0;left:47%;width:7%;height:42%;background:#4b3f42}
.title-skyline{position:absolute;right:12%;bottom:29%;left:12%;display:grid;grid-template-columns:repeat(9,1fr);gap:8%;height:27%;opacity:.7}.title-skyline span{height:42%;margin-top:22%;background:#d6bd7b}.title-skyline span:nth-child(3n){height:68%;margin-top:0}.edition-original .title-skyline span{background:#546f88}
.title-menu{z-index:1;display:grid;gap:6px;width:min(240px,80%);margin-top:14px}
.title-menu button{border:1px solid rgba(91,67,52,.45);border-radius:3px;padding:9px 14px;background:rgba(255,249,231,.82);color:#4d3326;font:600 14px ui-monospace,monospace;cursor:pointer}
.title-menu button:hover{filter:brightness(1.06)}.title-menu button:disabled{cursor:not-allowed;opacity:.4}
.edition-original .title-menu button{border-color:#526981;background:#1a2635;color:#c7d8eb;border-radius:0}
.title-version{z-index:1;margin:3px 0 0;color:#79563f;font:11px ui-monospace,monospace}.edition-original .title-version{color:#8199b4}
.title-menu button:focus-visible{outline:2px solid #e0ad66;outline-offset:2px}

/* ---------- play ---------- */
.game-play{position:relative;display:flex;flex-direction:column;height:100%;min-height:0}
.scene-fade{position:absolute;z-index:20;inset:0;background:#2b211b;opacity:0;pointer-events:none;transition:opacity .16s ease-out}
.is-fading .scene-fade{opacity:1;transition:opacity .16s ease-in}
.edition-original .scene-fade{background:#050b12}

.hud-chips{position:absolute;z-index:6;top:14px;left:14px;display:flex;gap:8px}
.chip{display:inline-flex;align-items:center;padding:7px 14px;border-radius:9px;background:rgba(28,20,14,0.82);color:#f6ecd9;border:1px solid rgba(255,239,200,0.26);font:600 14px "Hiragino Sans",ui-monospace,monospace;box-shadow:0 4px 14px rgba(0,0,0,.28)}
.chip--edition{letter-spacing:.14em;color:#ffd9a1}
.edition-original .chip{background:rgba(9,15,23,0.85);color:#cfe0ef;border-color:rgba(120,160,196,0.3)}
.edition-original .chip--edition{color:#a9cdf0}

.hud-tools{position:absolute;z-index:6;top:14px;right:14px;display:flex;align-items:center;gap:6px}
.hud-floors{display:flex;gap:3px;margin:0;padding:3px;border-radius:9px;background:rgba(28,20,14,0.72);border:1px solid rgba(255,239,200,0.22)}
.hud-floors span{min-width:34px;padding:5px 7px;border-radius:6px;text-align:center;color:#e9d9bd;font:11px ui-monospace,monospace;opacity:.55}
.hud-floors span.active{background:#a26743;color:#fff8ec;opacity:1}
.edition-original .hud-floors{background:rgba(9,15,23,0.8);border-color:rgba(120,160,196,0.26)}
.edition-original .hud-floors span{color:#b7cee2}.edition-original .hud-floors span.active{background:#496d8f;color:#fff}
.hud-progress{display:inline-flex;align-items:center;gap:4px;padding:6px 11px;border-radius:9px;border:1px solid rgba(255,239,200,0.24);background:rgba(28,20,14,0.72);color:#f0e2c8;font:11px ui-monospace,monospace;cursor:pointer}
.hud-progress:hover{background:rgba(28,20,14,0.92)}
.hud-progress i{font-style:normal;color:#e0ad66;margin-left:4px}
.edition-original .hud-progress{background:rgba(9,15,23,0.8);color:#cfe0ef;border-color:rgba(120,160,196,0.28)}.edition-original .hud-progress i{color:#86b1d6}

/* ---------- memories ---------- */
.game-memories{position:absolute;z-index:12;top:58px;right:16px;display:flex;flex-direction:column;width:min(380px,calc(100% - 32px));max-height:calc(100% - 90px);padding:22px;border-radius:8px;border:1px solid rgba(109,82,60,.35);background:#fff9ec;box-shadow:0 18px 42px rgba(54,35,25,.28)}
.edition-original .game-memories{border-color:#40566d;background:#1b2a39;color:#dae6f4}
.game-memories h2{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:5px 0 14px;font:600 24px Georgia,serif}
.game-memories__count{color:#8d725d;font:12px ui-monospace,monospace}
.edition-original .game-memories__count{color:#8ba6be}
.game-memories__close{position:absolute;top:7px;right:8px;border:0;background:none;color:inherit;font-size:20px;cursor:pointer}
.memory-list{overflow-y:auto;flex:1;margin:0;padding:0;list-style:none}
.memory-list li{padding:11px 0;border-top:1px solid rgba(109,82,60,.22)}
.edition-original .memory-list li{border-top-color:rgba(120,160,196,.22)}
.memory-list li:first-child{border-top:0}
.memory-list li.locked{opacity:.42}
.memory-list h3{margin:0;font:600 14px "Hiragino Sans",sans-serif}
.memory-source{margin:3px 0 0;color:#9c8570;font:11px ui-monospace,monospace}
.edition-original .memory-source{color:#7f9ab2}
.memory-text{margin:5px 0 0;font:13px/1.7 "Hiragino Mincho ProN",Georgia,serif}
.memory-hint{margin:12px 0 0;color:#8d725d;font-size:11px}
.memory-goal{display:flex;flex-direction:column;gap:3px;margin:0 0 12px;padding:9px 12px;border-radius:6px;background:rgba(158,102,63,.1);color:#6b4a34;font:12px/1.6 "Hiragino Sans",sans-serif}
.memory-goal b{color:#9e663f;font:700 10px ui-monospace,monospace;letter-spacing:.12em}
.edition-original .memory-goal{background:rgba(120,160,196,.12);color:#cfe0ef}
.edition-original .memory-goal b{color:#8ba8ca}
/* A checklist reads the other way round from the catalogue: what is still
   missing is the useful line, so it stays legible and the done ones fade. */
.memory-list--places li.locked{opacity:1}
.memory-list--places li:not(.locked){opacity:.5}
.memory-list--places h3{display:flex;align-items:center;justify-content:space-between;gap:8px;font:600 15px "Hiragino Sans",sans-serif}
.memory-list--places h3 i{color:#9e663f;font-style:normal;font-size:13px}
.edition-original .memory-list--places h3 i{color:#8ba8ca}
.memory-list--places .memory-text{color:#9c8570;font:11px ui-monospace,monospace}
.edition-original .memory-list--places .memory-text{color:#7f9ab2}
.edition-original .memory-hint{color:#8ba6be}
.hud-anomaly{padding:6px 9px;border-radius:9px;background:rgba(9,15,23,0.8);color:#d67d78;font:11px ui-monospace,monospace;animation:anomaly-pulse 2s ease-in-out infinite}
.hud-btn{width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,239,200,0.24);background:rgba(28,20,14,0.72);color:#f0e2c8;font-size:14px;cursor:pointer}
.hud-btn:hover{background:rgba(28,20,14,0.9)}
.edition-original .hud-btn{background:rgba(9,15,23,0.8);border-color:rgba(120,160,196,0.28);color:#cfe0ef}

.game-settings{position:absolute;z-index:12;top:58px;right:16px;width:min(320px,calc(100% - 32px));padding:22px;border-radius:8px;border:1px solid rgba(109,82,60,.35);background:#fff9ec;box-shadow:0 18px 42px rgba(54,35,25,.28)}
.edition-original .game-settings{border-color:#40566d;background:#1b2a39;color:#dae6f4}
.game-settings h2{margin:5px 0 18px;font:600 24px Georgia,serif}
.game-settings label{display:flex;gap:8px;align-items:center;font-size:13px}
.settings-note{color:#8d725d;font-size:12px;line-height:1.6}.edition-original .settings-note{color:#8ba6be}
.settings-title-btn{margin-top:10px;width:100%;padding:9px;border:1px solid rgba(91,67,52,.4);border-radius:5px;background:rgba(255,249,231,.7);color:#5a3c2a;font:12px ui-monospace,monospace;cursor:pointer}
.edition-original .settings-title-btn{border-color:#526981;background:#152130;color:#c7d8eb}
.game-settings__close{position:absolute;top:7px;right:8px;border:0;background:none;color:inherit;font-size:20px;cursor:pointer}

/* ---------- trial: 復刻版クリア ---------- */
.game-clear{position:absolute;z-index:18;inset:0;display:grid;place-items:center;padding:24px;background:rgba(43,33,27,.62);animation:game-clear-in 520ms ease-out both}
.edition-original .game-clear{background:rgba(5,11,18,.7)}
.game-clear__panel{display:flex;flex-direction:column;align-items:center;gap:9px;width:min(430px,100%);padding:30px 26px 24px;border-radius:10px;border:1px solid rgba(109,82,60,.35);background:#fff9ec;box-shadow:0 22px 50px rgba(54,35,25,.34);text-align:center}
.edition-original .game-clear__panel{border-color:#40566d;background:#1b2a39;color:#dae6f4}
.game-clear__panel h2{margin:2px 0 8px;font:600 22px/1.5 Georgia,serif}
.game-clear__text{margin:0;color:#5f4736;font:13px/1.9 "Hiragino Mincho ProN",Georgia,serif}
.edition-original .game-clear__text{color:#c3d4e6}
.game-clear__voice{margin:12px 0 0;color:#8d5f3c;font:14px/1.8 "Hiragino Mincho ProN",Georgia,serif}
.edition-original .game-clear__voice{color:#9fc2e2}
.game-clear__close{margin-top:18px;padding:9px 26px;border:1px solid rgba(91,67,52,.4);border-radius:5px;background:rgba(255,249,231,.7);color:#5a3c2a;font:12px ui-monospace,monospace;letter-spacing:.1em;cursor:pointer}
.game-clear__close:hover{filter:brightness(1.05)}
.edition-original .game-clear__close{border-color:#526981;background:#152130;color:#c7d8eb}
@keyframes game-clear-in{from{opacity:0}to{opacity:1}}
@keyframes anomaly-pulse{50%{opacity:.5}}
@media(max-width:640px){.hud-chips{top:10px;left:10px}.chip{padding:5px 10px;font-size:12px}.hud-tools{top:10px;right:10px;gap:4px}.hud-progress{display:none}}
</style>
