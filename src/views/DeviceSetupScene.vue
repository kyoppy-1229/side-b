<template>
  <div class="setup" role="application" aria-label="新しいPCのセットアップ">
    <div class="setup__stage">
      <!-- A desk with a laptop on it, not a web form: the player learns that the
           machine was replaced by watching it set itself up. It is a PC rather
           than a phone because everything that follows — the browser window, the
           tabs, the chat app inside them — is a PC screen, and the beat has to
           hand over to that without changing what the player is looking at. -->
      <div class="machine" :class="{ 'machine--lit': stage !== 'boot' }">
        <div class="machine__lid">
          <div class="machine__bezel">
            <i class="machine__camera" aria-hidden="true"></i>
            <div class="machine__screen" :class="`machine__screen--${stage}`">
              <!-- ---- power on ------------------------------------------ -->
              <section v-if="stage === 'boot'" class="boot">
                <span class="boot__mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <rect x="2.5" y="4.5" width="19" height="12" rx="1.6" />
                    <path d="M1 19.5h22" />
                  </svg>
                </span>
                <span class="boot__bar" aria-hidden="true"><i></i></span>
              </section>

              <template v-else>
                <!-- ---- the OS's own menu bar --------------------------- -->
                <div class="menubar" aria-hidden="true">
                  <span class="menubar__left">
                    <strong>{{ OS_NAME }}</strong>
                    <span>ファイル</span>
                    <span>表示</span>
                    <span>ヘルプ</span>
                  </span>
                  <span class="menubar__right">
                    <svg class="menubar__wifi" viewBox="0 0 16 12">
                      <path d="M1.4 4.1a9.4 9.4 0 0 1 13.2 0" />
                      <path d="M4 6.8a5.7 5.7 0 0 1 8 0" />
                      <path d="M6.5 9.4a2.2 2.2 0 0 1 3 0" />
                    </svg>
                    <span class="menubar__battery"><i :style="{ width: `${BATTERY_LEVEL}%` }"></i></span>
                    <span class="menubar__clock">{{ CLOCK_LABEL }}</span>
                  </span>
                </div>

                <div class="desk" :class="{ 'desk--home': stage === 'home' }">
                  <!-- ---- the setup window ----------------------------- -->
                  <section v-if="stage !== 'home'" class="window" aria-live="polite">
                    <header class="window__bar">
                      <span class="window__dots" aria-hidden="true"><i></i><i></i><i></i></span>
                      <span class="window__title">{{ windowTitle }}</span>
                    </header>

                    <div class="window__body">
                      <!-- ---- ready to migrate ------------------------- -->
                      <div v-if="stage === 'intro'" class="pane">
                        <p class="pane__eyebrow">初期設定</p>
                        <h1 class="pane__title">以前のPCからデータを移行しますか？</h1>
                        <p class="pane__lead">同じネットワーク上に、移行できるPCが見つかりました。両方のPCの電源を入れたまま、移行を開始してください。</p>

                        <div class="handoff" aria-hidden="true">
                          <span class="handoff__device handoff__device--old">
                            <i class="handoff__laptop"></i>
                            <small>{{ SOURCE_DEVICE_SHORT }}</small>
                          </span>
                          <span class="handoff__link">
                            <i></i><i></i><i></i>
                          </span>
                          <span class="handoff__device handoff__device--new">
                            <i class="handoff__laptop"></i>
                            <small>{{ TARGET_DEVICE_SHORT }}</small>
                          </span>
                        </div>

                        <dl class="specs">
                          <div class="specs__row">
                            <dt>移行元</dt>
                            <dd>{{ SOURCE_DEVICE }}</dd>
                          </div>
                          <div class="specs__row">
                            <dt>データ量</dt>
                            <dd>{{ formatBytes(transferableBytes) }}</dd>
                          </div>
                          <div class="specs__row">
                            <dt>接続</dt>
                            <dd>{{ NETWORK_LABEL }}</dd>
                          </div>
                        </dl>

                        <div class="pane__foot">
                          <button type="button" class="button" @click="startTransfer">移行を開始</button>
                          <p class="pane__fine">移行中は、どちらのPCもスリープさせないでください。</p>
                        </div>
                      </div>

                      <!-- ---- transferring ---------------------------- -->
                      <div v-else-if="stage === 'transfer'" class="pane">
                        <p class="pane__eyebrow">データ移行</p>
                        <h1 class="pane__title">{{ headline }}</h1>

                        <div class="gauge">
                          <div
                            class="gauge__track"
                            :class="{ 'gauge__track--indeterminate': phase === 'connect' }"
                            role="progressbar"
                            :aria-valuenow="phase === 'connect' ? undefined : percent"
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            <span :style="{ width: `${percent}%` }"></span>
                          </div>
                          <div class="gauge__legend">
                            <span class="gauge__percent">{{ phase === 'connect' ? '--' : percent }}%</span>
                            <span class="gauge__eta">{{ etaLabel }}</span>
                          </div>
                          <div class="gauge__meta">
                            <span>{{ formatBytes(transferredBytes) }} / {{ formatBytes(transferableBytes) }}</span>
                            <span>{{ rateLabel }}</span>
                          </div>
                        </div>

                        <ul class="items">
                          <li
                            v-for="item in itemViews"
                            :key="item.id"
                            class="items__row"
                            :class="`items__row--${item.state}`"
                          >
                            <span class="items__mark" aria-hidden="true">
                              <svg v-if="item.state === 'done'" viewBox="0 0 24 24" class="items__glyph">
                                <path d="M5.5 12.8l4.2 4.2 8.8-9.6" />
                              </svg>
                              <svg v-else-if="item.state === 'skipped'" viewBox="0 0 24 24" class="items__glyph">
                                <path d="M12 4.8 21 19.6H3L12 4.8Z" />
                                <path d="M12 10.4v4" />
                                <path d="M12 16.6v.7" />
                              </svg>
                              <i v-else-if="item.state === 'active'" class="items__spinner"></i>
                              <i v-else class="items__dot"></i>
                            </span>
                            <strong class="items__label">{{ item.label }}</strong>
                            <span class="items__state">{{ item.note }}</span>
                            <span class="items__size">{{ item.size }}</span>
                          </li>
                        </ul>

                        <p class="pane__fine pane__fine--log">{{ logLine }}</p>
                      </div>

                      <!-- ---- report ---------------------------------- -->
                      <div v-else class="pane">
                        <p class="pane__eyebrow">データ移行</p>
                        <span class="seal" aria-hidden="true">
                          <svg viewBox="0 0 24 24"><path d="M5.5 12.8l4.2 4.2 8.8-9.6" /></svg>
                        </span>
                        <h1 class="pane__title pane__title--center">移行が完了しました</h1>
                        <p class="pane__lead pane__lead--center">{{ doneCount }}項目・{{ formatBytes(transferableBytes) }} を引き継ぎました。</p>

                        <!-- Chips rather than a table: the total is stated just
                             above, and a five-row list is what pushed the button
                             off the bottom of a smaller screen. -->
                        <ul class="summary">
                          <li v-for="item in TRANSFERABLE" :key="item.id">
                            <span class="summary__mark" aria-hidden="true">
                              <svg viewBox="0 0 24 24"><path d="M5.5 12.8l4.2 4.2 8.8-9.6" /></svg>
                            </span>
                            {{ item.label }}
                          </li>
                        </ul>

                        <div class="notice">
                          <span class="notice__mark" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M12 4.8 21 19.6H3L12 4.8Z" />
                              <path d="M12 10.4v4" />
                              <path d="M12 16.6v.7" />
                            </svg>
                          </span>
                          <span class="notice__copy">
                            <strong>引き継げなかった項目</strong>
                            <small>メッセージ履歴（{{ SKIPPED_SIZE }}）は旧PC内にのみ保存されていたため、このPCには移行されていません。</small>
                          </span>
                        </div>

                        <div class="pane__foot">
                          <button type="button" class="button" @click="goHome">続ける</button>
                          <p class="pane__fine">旧PCのデータは削除されていません。</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <!-- ---- the desktop the migration hands over to ------ -->
                  <template v-else>
                    <div class="desktop__icons" aria-hidden="true">
                      <span v-for="icon in DESKTOP_ICONS" :key="icon.label" class="desktop-icon">
                        <span class="desktop-icon__glyph" :style="{ background: icon.tint }">{{ icon.mark }}</span>
                        <span class="desktop-icon__label">{{ icon.label }}</span>
                      </span>
                    </div>

                    <aside class="os-toast" role="status">
                      <span class="os-toast__mark" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="M5.5 12.8l4.2 4.2 8.8-9.6" /></svg>
                      </span>
                      <span class="os-toast__copy">
                        <strong>データ移行が完了しました</strong>
                        <small>メッセージ履歴は引き継がれていません</small>
                      </span>
                    </aside>

                    <p class="desktop__hint" :class="{ 'desktop__hint--in': nudge }">{{ BROWSER_NAME }} を開いて続ける</p>

                    <div class="dock">
                      <button
                        type="button"
                        class="dock__app dock__app--browser"
                        :class="{ 'dock__app--nudge': nudge }"
                        :aria-label="`${BROWSER_NAME} を開く`"
                        @click="openBrowser"
                      >
                        <span class="dock__icon">
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="12" r="8.4" />
                            <path d="M3.6 12h16.8" />
                            <path d="M12 3.6c2.4 2.3 3.6 5.1 3.6 8.4s-1.2 6.1-3.6 8.4c-2.4-2.3-3.6-5.1-3.6-8.4S9.6 5.9 12 3.6Z" />
                          </svg>
                        </span>
                        <span class="dock__label">{{ BROWSER_NAME }}</span>
                      </button>

                      <span v-for="app in DOCK_APPS" :key="app.label" class="dock__app dock__app--dim" aria-hidden="true">
                        <span class="dock__icon" :style="{ background: app.tint }">
                          <span class="dock__mono">{{ app.mark }}</span>
                        </span>
                        <span class="dock__label">{{ app.label }}</span>
                      </span>
                    </div>
                  </template>
                </div>
              </template>

              <div class="machine__glare" aria-hidden="true"></div>
            </div>
          </div>
        </div>

        <!-- The base is what makes it read as the machine on the desk rather
             than a picture of a screen. -->
        <div class="machine__base" aria-hidden="true">
          <span class="machine__hinge"></span>
          <span class="machine__notch"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { NEW_DEVICE, OLD_DEVICE } from '../story/devices.js'
import { STORY_EVENTS } from '../story/events.js'
import { useStoryStore } from '../store/story.js'

// The setup is a beat, not a loading screen: long enough to be believed, short
// enough that nobody waits for it. Reduced-motion players get the same script
// at roughly a third of the length.
const REDUCED = typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
const scale = (ms) => (REDUCED ? Math.round(ms * 0.35) : ms)

const BOOT_MS = scale(1700)
const CONNECT_MS = scale(1900)
const TRANSFER_MS = scale(8200)
const FINALIZE_MS = scale(1100)
const NUDGE_MS = scale(900)

// Flipping the message-history row partway through the transfer, rather than at
// the end, lets the player notice the one thing that will not arrive while the
// rest is still moving.
const SKIP_REVEAL_AT = 0.46

const KB = 1024
const MB = KB * 1024
const GB = MB * 1024

// What the new machine restores, in the order it reports them, with the sizes it
// claims. The chat history is listed too — seeing it refused here is what
// explains the empty thread the player is about to open.
const MIGRATION_ITEMS = Object.freeze([
  Object.freeze({ id: 'account', label: 'アカウント情報', bytes: Math.round(4.6 * MB), note: '引き継ぎ済み' }),
  Object.freeze({ id: 'contacts', label: '連絡先', bytes: Math.round(11.2 * MB), note: '引き継ぎ済み' }),
  Object.freeze({ id: 'apps', label: 'アプリ', bytes: Math.round(268 * MB), note: '引き継ぎ済み' }),
  Object.freeze({ id: 'documents', label: 'ドキュメント', bytes: Math.round(452 * MB), note: '引き継ぎ済み' }),
  Object.freeze({ id: 'settings', label: '基本設定', bytes: Math.round(24.8 * MB), note: '引き継ぎ済み' }),
  Object.freeze({
    id: 'messages',
    label: 'メッセージ履歴',
    bytes: Math.round(1.82 * GB),
    note: '旧PC内にのみ保存',
    skipped: true
  })
])

const OS_NAME = 'RE:OS'
const BROWSER_NAME = 'RE:TRACE Browser'
const SOURCE_DEVICE = OLD_DEVICE.full
const SOURCE_DEVICE_SHORT = OLD_DEVICE.label
const TARGET_DEVICE_SHORT = NEW_DEVICE.label
const NETWORK_LABEL = '有線LAN（同一ネットワーク）'
const CLOCK_LABEL = '5月14日(火) 9:41'
const BATTERY_LEVEL = 84

const DESKTOP_ICONS = Object.freeze([
  Object.freeze({ label: 'ドキュメント', mark: '▤', tint: 'linear-gradient(150deg, #3a4a63, #232c3b)' }),
  Object.freeze({ label: '移行データ', mark: '▧', tint: 'linear-gradient(150deg, #3f4a5c, #262d38)' }),
  Object.freeze({ label: 'ゴミ箱', mark: '▽', tint: 'linear-gradient(150deg, #3c3f47, #24262b)' })
])

const DOCK_APPS = Object.freeze([
  Object.freeze({ label: 'メール', mark: '✉', tint: 'linear-gradient(150deg, #354a68, #212c3d)' }),
  Object.freeze({ label: 'ファイル', mark: '▧', tint: 'linear-gradient(150deg, #35485a, #202a33)' }),
  Object.freeze({ label: '音楽', mark: '♪', tint: 'linear-gradient(150deg, #5a3340, #331e26)' }),
  Object.freeze({ label: 'ターミナル', mark: '›_', tint: 'linear-gradient(150deg, #2c3a34, #1c2420)' }),
  Object.freeze({ label: '設定', mark: '⚙', tint: 'linear-gradient(150deg, #3a4150, #23272f)' })
])

const TRANSFERABLE = MIGRATION_ITEMS.filter((item) => !item.skipped)
const SKIPPED_ITEM = MIGRATION_ITEMS.find((item) => item.skipped)

const story = useStoryStore()

const stage = ref('boot')       // 'boot' | 'intro' | 'transfer' | 'report' | 'home'
const phase = ref('connect')    // within 'transfer': 'connect' | 'copy' | 'finalize'
const fraction = ref(0)         // 0..1 of the transferable payload
const rate = ref(0)             // bytes/sec, smoothed for display
const skipRevealed = ref(false)
const nudge = ref(false)

// Timers and the animation frame are owned by the scene and dropped on unmount,
// so nothing keeps ticking into the browser screen that follows.
const timers = new Set()
let frameId = 0
let handedOver = false

const transferableBytes = TRANSFERABLE.reduce((total, item) => total + item.bytes, 0)
const SKIPPED_SIZE = formatBytes(SKIPPED_ITEM.bytes)

function wait(ms){
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      resolve()
    }, ms)
    timers.add(timer)
  })
}

function clearTimers(){
  for(const timer of timers) clearTimeout(timer)
  timers.clear()
  if(frameId) cancelAnimationFrame(frameId)
  frameId = 0
}

function formatBytes(bytes){
  if(bytes <= 0) return '0 KB'
  if(bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`
  if(bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / KB))} KB`
}

// The sizes above are picked so the three readouts agree with each other: the
// payload divided by TRANSFER_MS lands on a believable wired-LAN rate, which
// keeps the ETA in seconds rather than promising half an hour for a beat that is
// over in eight.
// A real copy is not linear: it opens fast, settles into a steady stretch, and
// hesitates just before the end. The curve stays monotonic so the percentage
// never walks backwards.
function transferCurve(x){
  if(x < 0.12) return x * 1.6
  if(x < 0.82) return 0.192 + (x - 0.12) * 0.94
  if(x < 0.9) return 0.85 + (x - 0.82) * 0.4
  return 0.882 + (x - 0.9) * 1.18
}

// The speed readout is read off the curve rather than measured between frames.
// A measured figure collapses whenever frames are starved — a backgrounded tab
// comes back claiming 0.1 MB/s — which then poisons the remaining-time estimate.
const LOOKAHEAD_MS = 300
const NOMINAL_RATE = transferableBytes / (TRANSFER_MS / 1000)

function rateAt(elapsed){
  const from = transferCurve(Math.min(1, elapsed / TRANSFER_MS))
  const to = transferCurve(Math.min(1, (elapsed + LOOKAHEAD_MS) / TRANSFER_MS))
  const slope = ((to - from) * transferableBytes) / (LOOKAHEAD_MS / 1000)
  // A real meter never sits perfectly still, and the curve is piecewise linear,
  // so the segments get a slow wobble instead of a flat number.
  const wobble = 1 + Math.sin(elapsed / 470) * 0.08
  return Math.max(NOMINAL_RATE * 0.2, slope * wobble)
}

const percent = computed(() => Math.min(100, Math.floor(fraction.value * 100)))
const transferredBytes = computed(() => Math.round(fraction.value * transferableBytes))

// Which item the copy is inside right now, by cumulative bytes rather than by
// step count — that is what makes the big rows sit there for a while.
const cursor = computed(() => {
  let consumed = 0
  const copied = transferredBytes.value
  for(let position = 0; position < TRANSFERABLE.length; position += 1){
    const item = TRANSFERABLE[position]
    if(copied < consumed + item.bytes){
      return { index: position, itemCopied: copied - consumed }
    }
    consumed += item.bytes
  }
  return { index: TRANSFERABLE.length, itemCopied: 0 }
})

const activeItem = computed(() => TRANSFERABLE[cursor.value.index] || null)

const itemViews = computed(() => MIGRATION_ITEMS.map((item) => {
  if(item.skipped){
    const state = skipRevealed.value ? 'skipped' : 'pending'
    return {
      ...item,
      state,
      note: state === 'skipped' ? item.note : '確認中',
      size: state === 'skipped' ? 'スキップ' : formatBytes(item.bytes)
    }
  }
  const position = TRANSFERABLE.indexOf(item)
  const { index, itemCopied } = cursor.value
  if(phase.value === 'connect' || position > index){
    return { ...item, state: 'pending', note: '待機中', size: formatBytes(item.bytes) }
  }
  if(position < index || phase.value === 'finalize'){
    return { ...item, state: 'done', note: item.note, size: formatBytes(item.bytes) }
  }
  return {
    ...item,
    state: 'active',
    note: '受信中',
    size: `${formatBytes(itemCopied)} / ${formatBytes(item.bytes)}`
  }
}))

const doneCount = computed(() => TRANSFERABLE.length)

const windowTitle = computed(() => (stage.value === 'intro' ? 'セットアップアシスタント' : 'データ移行ツール'))

const headline = computed(() => {
  if(phase.value === 'connect') return '旧PCに接続しています……'
  if(phase.value === 'finalize') return '最終処理をしています……'
  return 'データを移行しています……'
})

const rateLabel = computed(() => {
  if(phase.value !== 'copy' || rate.value <= 0) return '—'
  return `${(rate.value / MB).toFixed(1)} MB/s`
})

const etaLabel = computed(() => {
  if(phase.value === 'connect') return '残り時間を計算中'
  if(phase.value === 'finalize') return 'あと少しで完了します'
  const remaining = transferableBytes - transferredBytes.value
  if(rate.value <= 0) return '残り時間を計算中'
  const seconds = Math.max(1, Math.round(remaining / rate.value))
  if(seconds >= 60) return `残り 約${Math.ceil(seconds / 60)}分`
  return `残り 約${seconds}秒`
})

const logLine = computed(() => {
  if(phase.value === 'connect') return `${SOURCE_DEVICE} を確認しています`
  if(phase.value === 'finalize') return '受信したデータをこのPCに書き込んでいます'
  const label = activeItem.value?.label ?? ''
  return `LAN 経由で受信中 — ${label}`
})

// The copy is driven off the clock rather than a step timer, so the bar, the
// byte counter and the speed readout all agree with each other.
function runCopy(){
  return new Promise((resolve) => {
    // The frame only decides when to repaint; how far along the copy is comes
    // from the wall clock. Reading the frame timestamp instead looks tidier but
    // puts it on a different origin than any other clock here, and a negative
    // elapsed walks the whole readout backwards past zero.
    const started = Date.now()
    let lastFraction = 0
    const step = () => {
      const now = Date.now()
      const elapsed = Math.min(TRANSFER_MS, Math.max(0, now - started))
      // Monotonic by construction: the bar and the byte counter may stall, but
      // they never lose ground.
      const next = Math.min(1, Math.max(lastFraction, transferCurve(elapsed / TRANSFER_MS)))
      const expected = rateAt(elapsed)
      rate.value = rate.value > 0 ? rate.value * 0.78 + expected * 0.22 : expected
      lastFraction = next
      fraction.value = next
      if(!skipRevealed.value && next >= SKIP_REVEAL_AT) skipRevealed.value = true
      if(elapsed >= TRANSFER_MS){
        frameId = 0
        resolve()
        return
      }
      frameId = requestAnimationFrame(step)
    }
    frameId = requestAnimationFrame(step)
  })
}

async function startTransfer(){
  stage.value = 'transfer'
  phase.value = 'connect'
  await wait(CONNECT_MS)
  phase.value = 'copy'
  await runCopy()
  phase.value = 'finalize'
  skipRevealed.value = true
  await wait(FINALIZE_MS)
  stage.value = 'report'
}

async function boot(){
  await wait(BOOT_MS)
  stage.value = 'intro'
}

async function goHome(){
  stage.value = 'home'
  nudge.value = false
  await wait(NUDGE_MS)
  nudge.value = true
}

// Opening the browser is what ends the scene — and it is also where the browser
// window the rest of the game happens in comes from. The story decides what that
// means, exactly as the reunion does.
function openBrowser(){
  if(handedOver) return
  handedOver = true
  clearTimers()
  story.dispatch(STORY_EVENTS.DEVICE_MIGRATION_COMPLETE)
}

onMounted(boot)
onBeforeUnmount(clearTimers)
</script>

<style scoped>
/* Absolute, not fixed: the scene fills whatever shell hosts it — the app root
   in the real game, the device frame inside the debug console. */
.setup{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:auto;
  padding:24px 20px;
  background:
    radial-gradient(120% 80% at 50% 4%, rgba(84, 116, 168, 0.16) 0%, rgba(0, 0, 0, 0) 56%),
    radial-gradient(circle at 50% 30%, #141824 0%, #0a0908 70%);
  color:#f4efe8;
  font-family:'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', ui-sans-serif, system-ui, sans-serif;
  animation:setup-fade-in 900ms ease both;
}

@keyframes setup-fade-in{
  from{ opacity:0; }
  to{ opacity:1; }
}

.setup__stage{
  width:min(920px, 100%);
  flex:0 0 auto;
}

/* ---- the machine --------------------------------------------------- */
.machine{
  width:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
}

.machine__lid{
  width:100%;
  padding:12px 12px 14px;
  box-sizing:border-box;
  border-radius:16px 16px 6px 6px;
  background:linear-gradient(150deg, #4b4f5a 0%, #23262e 26%, #171a20 62%, #383c46 100%);
  box-shadow:0 26px 60px rgba(0, 0, 0, 0.55), 0 1px 0 rgba(255, 255, 255, 0.06) inset;
}

.machine__bezel{
  position:relative;
  padding:14px 10px 10px;
  border-radius:10px;
  background:#05070b;
  box-shadow:0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.machine__camera{
  position:absolute;
  top:6px;
  left:50%;
  width:4px;
  height:4px;
  transform:translateX(-50%);
  border-radius:50%;
  background:#1d2430;
  box-shadow:0 0 0 1px rgba(255, 255, 255, 0.05);
}

.machine__screen{
  position:relative;
  aspect-ratio:16 / 10;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  border-radius:4px;
  background:#05070b;
  transition:background 700ms ease;
}

.machine--lit .machine__screen{
  background:#0d1119;
}

/* A faint diagonal sheen sells the glass without washing the UI out. */
.machine__glare{
  position:absolute;
  inset:0;
  pointer-events:none;
  background:linear-gradient(122deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 36%, rgba(255, 255, 255, 0) 68%, rgba(255, 255, 255, 0.028) 100%);
}

.machine__base{
  position:relative;
  width:min(104%, calc(100% + 34px));
  height:15px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:0 0 12px 12px;
  background:linear-gradient(180deg, #3a3e48 0%, #23262d 55%, #14161b 100%);
  box-shadow:0 18px 30px rgba(0, 0, 0, 0.45);
}

.machine__hinge{
  position:absolute;
  top:0;
  left:50%;
  width:34%;
  height:3px;
  transform:translateX(-50%);
  border-radius:0 0 4px 4px;
  background:rgba(10, 12, 16, 0.85);
}

.machine__notch{
  width:78px;
  height:5px;
  margin-top:4px;
  border-radius:0 0 6px 6px;
  background:rgba(12, 14, 18, 0.8);
}

/* ---- power on ------------------------------------------------------ */
.boot{
  flex:1;
  display:grid;
  place-content:center;
  justify-items:center;
  gap:30px;
  animation:boot-in 1100ms ease both;
}

@keyframes boot-in{
  from{ opacity:0; }
  40%{ opacity:1; }
  to{ opacity:1; }
}

.boot__mark svg{
  width:40px;
  fill:none;
  stroke:#dbe4f2;
  stroke-width:1.1;
  stroke-linecap:round;
}

.boot__bar{
  width:120px;
  height:2px;
  overflow:hidden;
  border-radius:999px;
  background:rgba(219, 228, 242, 0.16);
}

.boot__bar i{
  display:block;
  width:40%;
  height:100%;
  border-radius:inherit;
  background:#dbe4f2;
  animation:boot-slide 1300ms ease-in-out infinite;
}

@keyframes boot-slide{
  from{ transform:translateX(-100%); }
  to{ transform:translateX(250%); }
}

/* ---- menu bar ------------------------------------------------------ */
.menubar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:6px 12px;
  background:rgba(10, 14, 21, 0.82);
  color:#c9d5e8;
  font-size:10px;
  letter-spacing:0.02em;
  backdrop-filter:blur(6px);
}

.menubar__left,
.menubar__right{
  display:flex;
  align-items:center;
  gap:12px;
}

.menubar__left strong{
  font-size:10.5px;
  letter-spacing:0.06em;
}

.menubar__left span{
  color:#8b9ab0;
}

.menubar__wifi{
  width:13px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.5;
  stroke-linecap:round;
}

.menubar__battery{
  position:relative;
  width:20px;
  height:10px;
  padding:1.5px;
  border:1px solid rgba(201, 213, 232, 0.5);
  border-radius:3px;
}

.menubar__battery::after{
  content:'';
  position:absolute;
  top:50%;
  right:-3px;
  width:2px;
  height:4px;
  transform:translateY(-50%);
  border-radius:0 2px 2px 0;
  background:rgba(201, 213, 232, 0.5);
}

.menubar__battery i{
  display:block;
  height:100%;
  border-radius:1.5px;
  background:#c9d5e8;
}

.menubar__clock{
  font-variant-numeric:tabular-nums;
}

/* ---- the desk area ------------------------------------------------- */
.desk{
  position:relative;
  flex:1;
  min-height:0;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:14px;
  background:
    radial-gradient(80% 70% at 50% 0%, rgba(70, 106, 168, 0.22), rgba(0, 0, 0, 0) 70%),
    linear-gradient(180deg, #101725 0%, #0a0d14 100%);
}

.desk--home{
  /* Column, not the centred single-window layout: the icons and the system
     notification are pinned, and the hint sits directly over the dock. */
  flex-direction:column;
  align-items:center;
  justify-content:flex-end;
  padding:14px 16px 12px;
  background:
    radial-gradient(70% 60% at 26% 12%, rgba(84, 126, 196, 0.3), rgba(0, 0, 0, 0) 64%),
    radial-gradient(80% 70% at 82% 82%, rgba(126, 84, 140, 0.22), rgba(0, 0, 0, 0) 66%),
    linear-gradient(170deg, #131c2c 0%, #0a0e15 100%);
}

/* ---- the setup window ---------------------------------------------- */
.window{
  width:min(560px, 100%);
  max-height:100%;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  border:1px solid rgba(150, 176, 216, 0.16);
  border-radius:12px;
  background:rgba(13, 17, 26, 0.96);
  box-shadow:0 24px 60px rgba(0, 0, 0, 0.5);
  animation:window-in 420ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

@keyframes window-in{
  from{ opacity:0; transform:translateY(8px) scale(0.99); }
  to{ opacity:1; transform:none; }
}

.window__bar{
  position:relative;
  display:flex;
  align-items:center;
  padding:9px 12px;
  border-bottom:1px solid rgba(150, 176, 216, 0.12);
  background:rgba(19, 24, 35, 0.95);
}

.window__dots{
  display:flex;
  gap:5px;
}

.window__dots i{
  width:8px;
  height:8px;
  border-radius:50%;
  background:#39404d;
}

.window__dots i:first-child{ background:#c4574c; }
.window__dots i:nth-child(2){ background:#c9a24a; }
.window__dots i:last-child{ background:#4f9d5c; }

.window__title{
  position:absolute;
  left:50%;
  transform:translateX(-50%);
  color:#a9b8cd;
  font-size:10.5px;
  font-weight:700;
}

.window__body{
  min-height:0;
  overflow-y:auto;
  scrollbar-width:none;
}

.window__body::-webkit-scrollbar{
  display:none;
}

/* ---- panes --------------------------------------------------------- */
.pane{
  display:flex;
  flex-direction:column;
  padding:20px 22px 16px;
}

.pane__eyebrow{
  margin:0;
  color:#6f8bb5;
  font-size:9px;
  font-weight:800;
  letter-spacing:0.18em;
  text-transform:uppercase;
}

.pane__title{
  margin:9px 0 0;
  font-size:16px;
  font-weight:600;
  line-height:1.6;
  color:#f2f5fa;
}

.pane__title--center{
  text-align:center;
}

.pane__lead{
  margin:10px 0 0;
  color:#93a5c0;
  font-size:11px;
  line-height:1.75;
}

.pane__lead--center{
  text-align:center;
}

.pane__fine{
  margin:10px 0 0;
  color:#65758d;
  font-size:9.5px;
  line-height:1.7;
}

.pane__fine--log{
  margin-top:16px;
  color:#7286a2;
  font-variant-numeric:tabular-nums;
}

/* Sticky, because the window's scrollbar is hidden: on a small stage the pane
   scrolls, and a button that had scrolled out of sight would read as a dead
   end. */
.pane__foot{
  position:sticky;
  bottom:0;
  margin-top:14px;
  padding-top:12px;
  background:linear-gradient(180deg, rgba(13, 17, 26, 0) 0%, rgba(13, 17, 26, 0.96) 36%);
}

.button{
  width:100%;
  padding:11px 18px;
  border:0;
  border-radius:10px;
  background:linear-gradient(180deg, #3179dc, #2461bd);
  color:#fff;
  font:inherit;
  font-size:12.5px;
  font-weight:700;
  cursor:pointer;
  box-shadow:0 10px 24px rgba(30, 82, 160, 0.38);
  transition:filter 180ms ease, transform 120ms ease;
}

.button:hover{ filter:brightness(1.08); }
.button:active{ transform:scale(0.99); }

.button:focus-visible{
  outline:3px solid rgba(103, 166, 255, 0.45);
  outline-offset:3px;
}

/* ---- handoff illustration ----------------------------------------- */
.handoff{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:14px;
  margin:16px 0 0;
}

.handoff__device{
  display:grid;
  justify-items:center;
  gap:8px;
  color:#7c8da7;
  font-size:8.5px;
  letter-spacing:0.08em;
}

/* Two little laptops: a lid on a base, so the picture matches the machine the
   player is looking at. */
.handoff__laptop{
  position:relative;
  width:56px;
  height:34px;
  border:1px solid rgba(150, 176, 216, 0.3);
  border-bottom-width:0;
  border-radius:4px 4px 0 0;
  background:linear-gradient(180deg, rgba(150, 176, 216, 0.12), rgba(150, 176, 216, 0.02));
}

.handoff__laptop::after{
  content:'';
  position:absolute;
  right:-7px;
  bottom:-4px;
  left:-7px;
  height:4px;
  border-radius:0 0 4px 4px;
  background:rgba(150, 176, 216, 0.28);
}

.handoff__device--new .handoff__laptop{
  border-color:rgba(103, 166, 255, 0.55);
  background:linear-gradient(180deg, rgba(49, 121, 220, 0.32), rgba(49, 121, 220, 0.08));
  box-shadow:0 0 18px rgba(49, 121, 220, 0.3);
}

.handoff__device--new .handoff__laptop::after{
  background:rgba(103, 166, 255, 0.5);
}

.handoff__link{
  display:flex;
  align-items:center;
  gap:4px;
}

.handoff__link i{
  width:5px;
  height:5px;
  border-radius:50%;
  background:#4b7fc9;
  animation:handoff-pulse 1400ms ease-in-out infinite;
}

.handoff__link i:nth-child(2){ animation-delay:200ms; }
.handoff__link i:nth-child(3){ animation-delay:400ms; }

@keyframes handoff-pulse{
  0%, 100%{ opacity:0.25; transform:scale(0.85); }
  50%{ opacity:1; transform:scale(1); }
}

/* ---- spec sheet --------------------------------------------------- */
.specs{
  margin:16px 0 0;
  border:1px solid rgba(150, 176, 216, 0.14);
  border-radius:10px;
  background:rgba(150, 176, 216, 0.05);
  overflow:hidden;
}

.specs__row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:9px 12px;
}

.specs__row + .specs__row{
  border-top:1px solid rgba(150, 176, 216, 0.1);
}

.specs dt{
  color:#7f90a9;
  font-size:10px;
}

.specs dd{
  margin:0;
  color:#e7edf6;
  font-size:11px;
  font-weight:600;
  font-variant-numeric:tabular-nums;
}

/* ---- gauge -------------------------------------------------------- */
.gauge{
  margin:16px 0 18px;
}

.gauge__track{
  position:relative;
  height:6px;
  overflow:hidden;
  border-radius:999px;
  background:rgba(150, 176, 216, 0.16);
}

.gauge__track span{
  display:block;
  height:100%;
  border-radius:inherit;
  background:linear-gradient(90deg, #2869c7, #6ea9ff);
  box-shadow:0 0 12px rgba(96, 156, 255, 0.45);
}

/* While the machines are still finding each other there is nothing to measure,
   so the bar sweeps instead of claiming a number. */
.gauge__track--indeterminate::after{
  content:'';
  position:absolute;
  inset:0;
  width:36%;
  border-radius:inherit;
  background:linear-gradient(90deg, rgba(96, 156, 255, 0) 0%, #6ea9ff 50%, rgba(96, 156, 255, 0) 100%);
  animation:gauge-sweep 1500ms ease-in-out infinite;
}

@keyframes gauge-sweep{
  from{ transform:translateX(-100%); }
  to{ transform:translateX(280%); }
}

.gauge__legend{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  margin-top:9px;
}

.gauge__percent{
  color:#eaf1fb;
  font-size:20px;
  font-weight:700;
  letter-spacing:-0.01em;
  font-variant-numeric:tabular-nums;
}

.gauge__eta{
  color:#8496b1;
  font-size:10px;
}

.gauge__meta{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  margin-top:4px;
  color:#66768e;
  font-size:9.5px;
  font-variant-numeric:tabular-nums;
}

/* ---- item list ---------------------------------------------------- */
.items{
  margin:0;
  padding:0;
  list-style:none;
  display:flex;
  flex-direction:column;
}

/* One line per item, like a real migration tool's table: the six rows and the
   log line all have to be visible at once on a 16:10 screen. */
.items__row{
  display:grid;
  grid-template-columns:22px minmax(0, 1fr) auto auto;
  align-items:center;
  gap:10px;
  padding:6px 0;
  transition:opacity 320ms ease;
}

.items__row + .items__row{
  border-top:1px solid rgba(150, 176, 216, 0.08);
}

.items__row--pending{
  opacity:0.4;
}

.items__mark{
  width:22px;
  height:22px;
  display:grid;
  place-items:center;
  flex:0 0 auto;
  border:1px solid rgba(150, 176, 216, 0.24);
  border-radius:50%;
}

.items__glyph{
  width:13px;
  fill:none;
  stroke-width:2;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.items__row--done .items__mark{
  border-color:rgba(103, 166, 255, 0.55);
  background:rgba(40, 105, 199, 0.24);
}

.items__row--done .items__glyph{
  stroke:#a9cbff;
  animation:mark-draw 320ms ease both;
}

@keyframes mark-draw{
  from{ opacity:0; transform:scale(0.7); }
  to{ opacity:1; transform:none; }
}

.items__row--skipped .items__mark{
  border-color:rgba(214, 168, 96, 0.6);
  background:rgba(160, 118, 44, 0.2);
}

.items__row--skipped .items__glyph{
  stroke:#e2b878;
}

.items__row--active .items__mark{
  border-color:rgba(103, 166, 255, 0.3);
}

.items__spinner{
  width:13px;
  height:13px;
  border-radius:50%;
  border:1.6px solid rgba(150, 176, 216, 0.24);
  border-top-color:#7fb2ff;
  animation:spin 720ms linear infinite;
}

@keyframes spin{
  to{ transform:rotate(360deg); }
}

.items__dot{
  width:4px;
  height:4px;
  border-radius:50%;
  background:#5f6f88;
}

.items__label{
  min-width:0;
  overflow:hidden;
  font-size:12px;
  font-weight:600;
  color:#e7edf6;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.items__state{
  color:#7d8ca4;
  font-size:9.5px;
  white-space:nowrap;
}

.items__row--skipped .items__state{
  color:#d6a860;
}

.items__size{
  min-width:104px;
  color:#66768e;
  font-size:9.5px;
  text-align:right;
  font-variant-numeric:tabular-nums;
}

.items__row--skipped .items__size{
  color:#a8813c;
}

/* ---- report ------------------------------------------------------- */
.seal{
  width:40px;
  height:40px;
  margin:14px auto 10px;
  display:grid;
  place-items:center;
  border-radius:50%;
  background:rgba(40, 105, 199, 0.2);
  box-shadow:0 0 0 1px rgba(103, 166, 255, 0.4), 0 0 26px rgba(40, 105, 199, 0.3);
  animation:seal-in 480ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}

.seal svg{
  width:19px;
  fill:none;
  stroke:#a9cbff;
  stroke-width:2;
  stroke-linecap:round;
  stroke-linejoin:round;
}

@keyframes seal-in{
  from{ opacity:0; transform:scale(0.6); }
  to{ opacity:1; transform:none; }
}

.summary{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:6px;
  margin:14px 0 0;
  padding:0;
  list-style:none;
}

.summary li{
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:5px 10px;
  border:1px solid rgba(150, 176, 216, 0.18);
  border-radius:999px;
  background:rgba(150, 176, 216, 0.07);
  color:#dbe4f1;
  font-size:10.5px;
}

.summary__mark svg{
  width:11px;
  fill:none;
  stroke:#7fb2ff;
  stroke-width:2.4;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.notice{
  display:flex;
  align-items:flex-start;
  gap:10px;
  margin:12px 0 0;
  padding:10px 12px;
  border:1px solid rgba(214, 168, 96, 0.32);
  border-radius:10px;
  background:rgba(160, 118, 44, 0.12);
}

.notice__mark svg{
  width:16px;
  fill:none;
  stroke:#e2b878;
  stroke-width:1.8;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.notice__copy{
  display:flex;
  flex-direction:column;
  gap:4px;
}

.notice__copy strong{
  color:#f0dcb8;
  font-size:11px;
  font-weight:700;
}

.notice__copy small{
  color:#c4a675;
  font-size:9.5px;
  line-height:1.6;
}

/* ---- the desktop -------------------------------------------------- */
.desktop__icons{
  position:absolute;
  top:16px;
  left:18px;
  display:flex;
  flex-direction:column;
  gap:14px;
}

.desktop-icon{
  display:grid;
  justify-items:center;
  gap:5px;
  width:64px;
}

.desktop-icon__glyph{
  width:34px;
  height:28px;
  display:grid;
  place-items:center;
  border-radius:5px;
  color:rgba(226, 235, 247, 0.55);
  font-size:13px;
  box-shadow:0 4px 10px rgba(0, 0, 0, 0.3);
}

.desktop-icon__label{
  color:rgba(222, 232, 246, 0.72);
  font-size:8.5px;
  text-align:center;
  text-shadow:0 1px 2px rgba(0, 0, 0, 0.6);
}

.os-toast{
  position:absolute;
  top:14px;
  right:16px;
  display:flex;
  align-items:center;
  gap:9px;
  max-width:230px;
  padding:9px 11px;
  border:1px solid rgba(150, 176, 216, 0.2);
  border-radius:10px;
  background:rgba(17, 22, 33, 0.92);
  box-shadow:0 14px 30px rgba(0, 0, 0, 0.4);
  animation:toast-in 520ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
  backdrop-filter:blur(6px);
}

@keyframes toast-in{
  from{ opacity:0; transform:translateX(12px); }
  to{ opacity:1; transform:none; }
}

.os-toast__mark{
  width:24px;
  height:24px;
  flex:0 0 auto;
  display:grid;
  place-items:center;
  border-radius:50%;
  background:rgba(40, 105, 199, 0.28);
}

.os-toast__mark svg{
  width:13px;
  fill:none;
  stroke:#a9cbff;
  stroke-width:2.2;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.os-toast__copy{
  display:flex;
  flex-direction:column;
  gap:2px;
}

.os-toast__copy strong{
  color:#e9f0fb;
  font-size:10.5px;
}

.os-toast__copy small{
  color:#9aabc4;
  font-size:9px;
}

.desktop__hint{
  flex:0 0 auto;
  margin:0 0 8px;
  color:#a3b6d2;
  font-size:10.5px;
  text-align:center;
  text-shadow:0 1px 3px rgba(0, 0, 0, 0.5);
  opacity:0;
  transition:opacity 700ms ease;
}

.desktop__hint--in{
  opacity:1;
}

.dock{
  flex:0 0 auto;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  gap:12px;
  padding:8px 14px 6px;
  border:1px solid rgba(160, 184, 220, 0.16);
  border-radius:16px;
  background:rgba(146, 172, 212, 0.14);
  backdrop-filter:blur(8px);
}

.dock__app{
  display:flex;
  align-items:center;
  flex-direction:column;
  gap:4px;
  padding:0;
  border:0;
  background:transparent;
  color:#dfe7f3;
  font:inherit;
}

.dock__icon{
  position:relative;
  width:40px;
  height:40px;
  display:grid;
  place-items:center;
  border-radius:10px;
  box-shadow:0 6px 14px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.08) inset;
}

.dock__label{
  font-size:8.5px;
  letter-spacing:0.02em;
  white-space:nowrap;
}

.dock__mono{
  color:rgba(226, 235, 247, 0.6);
  font-size:15px;
  line-height:1;
}

.dock__app--dim{
  opacity:0.42;
}

.dock__app--dim .dock__label{
  opacity:0.8;
}

.dock__app--browser{
  cursor:pointer;
  transition:transform 180ms ease;
}

.dock__app--browser .dock__icon{
  background:linear-gradient(150deg, #3a86e8, #1c4c95);
  box-shadow:0 8px 20px rgba(28, 76, 149, 0.5), 0 1px 0 rgba(255, 255, 255, 0.14) inset;
}

.dock__app--browser .dock__icon svg{
  width:23px;
  fill:none;
  stroke:#fff;
  stroke-width:1.5;
  stroke-linejoin:round;
}

.dock__app--browser:hover{ transform:translateY(-3px); }
.dock__app--browser:active{ transform:scale(0.96); }

.dock__app--browser:focus-visible{
  outline:3px solid rgba(103, 166, 255, 0.45);
  outline-offset:4px;
  border-radius:12px;
}

/* A real desktop has no instructions, so the only prompt is a slow halo around
   the one icon that does anything. */
.dock__app--nudge .dock__icon::after{
  content:'';
  position:absolute;
  inset:-5px;
  border-radius:14px;
  box-shadow:0 0 0 2px rgba(126, 178, 255, 0.5);
  animation:nudge-halo 2200ms ease-out infinite;
}

@keyframes nudge-halo{
  0%{ opacity:0; transform:scale(0.9); }
  35%{ opacity:0.9; }
  100%{ opacity:0; transform:scale(1.12); }
}

@media (max-width:640px){
  .setup{
    padding:16px 12px;
  }

  .window{
    width:100%;
  }

  .pane{
    padding:16px 14px 12px;
  }

  .desktop__icons{
    display:none;
  }

  .os-toast{
    display:none;
  }

  .dock{
    gap:8px;
    padding:6px 8px 4px;
  }

  .dock__icon{
    width:32px;
    height:32px;
  }

  .dock__label{
    display:none;
  }
}

@media (prefers-reduced-motion:reduce){
  .setup,
  .window,
  .seal,
  .boot,
  .os-toast{
    animation:none;
  }

  .handoff__link i,
  .gauge__track--indeterminate::after,
  .dock__app--nudge .dock__icon::after{
    animation:none;
  }

  .boot__bar i{
    width:100%;
    animation:none;
  }
}
</style>
