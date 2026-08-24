<template>
  <div
    class="reunion"
    :class="{ 'reunion--dimmed': outroStage !== '' }"
    role="application"
    aria-label="同窓会"
    @click="onSceneClick"
  >
    <div class="reunion__background" :style="backgroundStyle" aria-hidden="true"></div>
    <div class="reunion__veil" aria-hidden="true"></div>

    <div v-if="!outroStage" class="reunion__controls" @click.stop>
      <button type="button" class="reunion__control" @click="openLog">LOG</button>
      <button type="button" class="reunion__control" @click="openSkip">SKIP</button>
    </div>

    <div v-if="!outroStage" class="reunion__subtitle">
      <p class="reunion__speaker">{{ story.speakerName(currentLine.speaker) }}</p>
      <p class="reunion__text">{{ currentLine.text }}</p>
      <span class="reunion__advance" aria-hidden="true">▶</span>
    </div>

    <div v-if="outroStage === 'timeskip'" class="reunion__timeskip">――同窓会から、数日後。</div>

    <div v-if="logOpen" class="reunion__modal" @click.stop="closeLog">
      <div class="reunion__panel reunion__panel--log" role="dialog" aria-label="これまでの会話" @click.stop>
        <header class="reunion__panel-head">
          <h2>これまでの会話</h2>
          <button type="button" class="reunion__control" @click.stop="closeLog">閉じる</button>
        </header>
        <ol class="reunion__log">
          <li v-for="line in seenLines" :key="line.id">
            <strong>{{ story.speakerName(line.speaker) }}</strong>
            <span>{{ line.text }}</span>
          </li>
        </ol>
      </div>
    </div>

    <div v-if="skipOpen" class="reunion__modal" @click.stop="closeSkip">
      <div class="reunion__panel reunion__panel--confirm" role="dialog" aria-label="スキップの確認" @click.stop>
        <p class="reunion__confirm-text">同窓会シーンをスキップしますか？</p>
        <div class="reunion__confirm-actions">
          <button type="button" class="reunion__control reunion__control--primary" @click.stop="confirmSkip">スキップ</button>
          <button type="button" class="reunion__control" @click.stop="closeSkip">戻る</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import reunionLines from '../data/reunion_prologue.json'
import izakayaBackground from '../photo/居酒屋.png'
import { createReunionAmbience } from '../audio/reunionAudio.js'
import { STORY_EVENTS } from '../story/events.js'
import { clearReunionProgress, readReunionProgress, writeReunionProgress } from '../story/reunionProgress.js'
import { useStoryStore } from '../store/story.js'

// Timings for the closing beat: the last line lands, the room fades out, the
// screen goes dark, and only then does the caption appear over silence. The
// caption hands straight over to the new PC's setup (views/DeviceSetupScene),
// which opens on the same black screen, so nothing flashes in between.
const OUTRO_HOLD_MS = 650
const OUTRO_FADE_MS = 1200
const TIMESKIP_MS = 1600
const AMBIENCE_FADE_IN_MS = 1500
const SKIP_FADE_OUT_MS = 700

const story = useStoryStore()
const ambience = createReunionAmbience()

const lines = reunionLines
const index = ref(resumeIndex())
const logOpen = ref(false)
const skipOpen = ref(false)
const outroStage = ref('')   // '' | 'dim' | 'timeskip'

let finishing = false
let audioBlocked = false
let audioPending = false
const timers = new Set()

const backgroundStyle = Object.freeze({ backgroundImage: `url("${izakayaBackground}")` })

const currentLine = computed(() => lines[index.value] || lines[lines.length - 1])
const seenLines = computed(() => lines.slice(0, index.value + 1))
const isModalOpen = computed(() => logOpen.value || skipOpen.value)

// A saved line that no longer exists (edited script, hand-written storage)
// simply starts the scene over rather than leaving it stuck.
function resumeIndex(){
  const progress = readReunionProgress()
  if(!progress) return 0
  const found = lines.findIndex((line) => line.id === progress.lineId)
  return found >= 0 ? found : 0
}

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
}

// Autoplay may be refused before the player has touched anything; that is not an
// error, so the scene just tries again on the first real interaction.
async function startAmbience(){
  if(audioPending || ambience.isPlaying) return
  audioPending = true
  try {
    audioBlocked = !(await ambience.fadeIn(AMBIENCE_FADE_IN_MS))
  } finally {
    audioPending = false
  }
}

function onSceneClick(){
  if(audioBlocked) startAmbience()
  advance()
}

function advance(){
  if(isModalOpen.value || outroStage.value || finishing) return
  if(index.value < lines.length - 1){
    index.value += 1
    writeReunionProgress(currentLine.value.id)
    return
  }
  finish()
}

async function finish(){
  if(finishing) return
  finishing = true
  await wait(OUTRO_HOLD_MS)
  outroStage.value = 'dim'
  await Promise.all([ambience.fadeOut(OUTRO_FADE_MS), wait(OUTRO_FADE_MS)])
  outroStage.value = 'timeskip'
  await wait(TIMESKIP_MS)
  completeReunion()
}

// The scene never sets the story position itself — skipping and playing through
// both go out the same event, so the prologue can only be entered one way.
function completeReunion(){
  clearReunionProgress()
  story.dispatch(STORY_EVENTS.REUNION_COMPLETE)
}

function openLog(){
  if(outroStage.value) return
  skipOpen.value = false
  logOpen.value = true
}

function closeLog(){
  logOpen.value = false
}

function openSkip(){
  if(outroStage.value) return
  logOpen.value = false
  skipOpen.value = true
}

function closeSkip(){
  skipOpen.value = false
}

async function confirmSkip(){
  if(finishing) return
  finishing = true
  skipOpen.value = false
  clearTimers()
  await ambience.fadeOut(SKIP_FADE_OUT_MS)
  completeReunion()
}

const ADVANCE_KEYS = Object.freeze(['Enter', ' ', 'Spacebar', 'ArrowRight'])

function onKeydown(event){
  if(event.key === 'Escape'){
    if(logOpen.value) closeLog()
    else if(skipOpen.value) closeSkip()
    return
  }
  if(isModalOpen.value) return
  if(!ADVANCE_KEYS.includes(event.key)) return
  event.preventDefault()
  if(audioBlocked) startAmbience()
  advance()
}

onMounted(() => {
  if(typeof window !== 'undefined') window.addEventListener('keydown', onKeydown)
  // Reload straight back into the middle of the scene has to sound like the
  // middle of the scene, so the ambience restarts here too.
  startAmbience()
})

onBeforeUnmount(() => {
  if(typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown)
  clearTimers()
  ambience.cleanup()
})
</script>

<style scoped>
/* Absolute, not fixed: the scene fills whatever shell hosts it — the app root
   in the real game, the device frame inside the debug console. */
.reunion{
  position:absolute;
  inset:0;
  overflow:hidden;
  background:#0d0b0a;
  color:#f4efe8;
  font-family:'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', ui-sans-serif, system-ui, sans-serif;
  cursor:pointer;
  user-select:none;
}

.reunion__background{
  position:absolute;
  inset:0;
  background-position:center;
  background-size:cover;
  background-repeat:no-repeat;
  transition:opacity 1200ms ease, filter 1200ms ease;
}

/* Just enough shade for the subtitles to hold up against a bright photo. */
.reunion__veil{
  position:absolute;
  inset:0;
  background:linear-gradient(180deg, rgba(12,10,9,0.28) 0%, rgba(12,10,9,0.06) 34%, rgba(12,10,9,0.52) 100%);
  transition:opacity 1200ms ease;
}

.reunion--dimmed .reunion__background,
.reunion--dimmed .reunion__veil{
  opacity:0;
}

.reunion__controls{
  position:absolute;
  top:16px;
  right:16px;
  display:flex;
  gap:8px;
  z-index:3;
}

.reunion__control{
  padding:6px 14px;
  border:1px solid rgba(244,239,232,0.42);
  border-radius:6px;
  background:rgba(18,16,15,0.52);
  color:#f4efe8;
  font-family:inherit;
  font-size:12px;
  letter-spacing:0.08em;
  cursor:pointer;
  transition:background 160ms ease, border-color 160ms ease;
}

.reunion__control:hover{
  border-color:rgba(244,239,232,0.75);
  background:rgba(18,16,15,0.74);
}

.reunion__control:focus-visible{
  outline:2px solid rgba(244,239,232,0.8);
  outline-offset:2px;
}

.reunion__control--primary{
  border-color:rgba(244,239,232,0.85);
  background:rgba(244,239,232,0.92);
  color:#191614;
}

.reunion__subtitle{
  position:absolute;
  left:50%;
  bottom:clamp(20px, 6vh, 56px);
  width:min(880px, calc(100% - 40px));
  transform:translateX(-50%);
  padding:18px 22px 20px;
  border-radius:10px;
  background:rgba(14,12,11,0.72);
  z-index:2;
}

.reunion__speaker{
  margin:0 0 8px;
  color:#d8cfc2;
  font-size:13px;
  font-weight:600;
  letter-spacing:0.06em;
}

.reunion__text{
  margin:0;
  font-size:clamp(16px, 2.1vw, 21px);
  line-height:1.7;
  color:#f6f2ec;
}

.reunion__advance{
  position:absolute;
  right:16px;
  bottom:10px;
  color:rgba(246,242,236,0.72);
  font-size:12px;
  animation:reunion-blink 1.6s ease-in-out infinite;
}

@keyframes reunion-blink{
  0%, 100%{ opacity:0.25; }
  50%{ opacity:0.9; }
}

.reunion__timeskip{
  position:absolute;
  inset:0;
  display:grid;
  place-items:center;
  color:#efe9e1;
  padding:0 24px;
  font-size:clamp(18px, 2.7vw, 27px);
  letter-spacing:0.28em;
  text-align:center;
  z-index:2;
  animation:reunion-fade-in 520ms ease both;
}

@keyframes reunion-fade-in{
  from{ opacity:0; }
  to{ opacity:1; }
}

.reunion__modal{
  position:absolute;
  inset:0;
  display:grid;
  place-items:center;
  padding:24px;
  background:rgba(8,7,6,0.62);
  z-index:4;
  cursor:default;
}

.reunion__panel{
  width:min(680px, 100%);
  padding:20px 22px;
  border:1px solid rgba(244,239,232,0.22);
  border-radius:12px;
  background:rgba(20,18,17,0.96);
}

.reunion__panel--log{
  max-height:min(70vh, 560px);
  display:flex;
  flex-direction:column;
}

.reunion__panel-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  margin-bottom:14px;
}

.reunion__panel-head h2{
  margin:0;
  font-size:14px;
  font-weight:600;
  letter-spacing:0.1em;
  color:#ded5c8;
}

.reunion__log{
  margin:0;
  padding:0 4px 0 0;
  overflow-y:auto;
  list-style:none;
  display:flex;
  flex-direction:column;
  gap:12px;
}

.reunion__log li{
  display:flex;
  flex-direction:column;
  gap:3px;
}

.reunion__log strong{
  color:#cfc5b6;
  font-size:11px;
  font-weight:600;
  letter-spacing:0.06em;
}

.reunion__log span{
  font-size:14px;
  line-height:1.65;
  color:#f2ede6;
}

.reunion__panel--confirm{
  width:min(420px, 100%);
  text-align:center;
}

.reunion__confirm-text{
  margin:4px 0 18px;
  font-size:15px;
  line-height:1.6;
}

.reunion__confirm-actions{
  display:flex;
  justify-content:center;
  gap:10px;
}

@media (max-width:520px){
  .reunion__subtitle{
    padding:15px 16px 18px;
  }
}
</style>
