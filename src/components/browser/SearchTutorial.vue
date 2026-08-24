<template>
  <!-- The protagonist talking himself through the browser. It sits over the
       window rather than inside a page, because the thing he is pointing at is
       the search tab, not whatever page is open. -->
  <!-- out-in with an explicit duration: both cards sit in the same spot, so the
       monologue has to be gone before the standing hint arrives, and the swap
       must not depend on a transitionend that a frozen or skipped animation
       would never send. -->
  <Transition name="tutorial" mode="out-in" :duration="320">
    <aside v-if="mode === 'lines'" key="lines" class="tutorial" role="note" :aria-label="`${speaker}の独白`">
      <button type="button" class="tutorial__card" @click="advance">
        <span class="tutorial__speaker">{{ speaker }}</span>
        <span class="tutorial__text">{{ currentLine.text }}</span>
      </button>

      <div class="tutorial__actions">
        <span class="tutorial__progress" aria-hidden="true">{{ index + 1 }} / {{ lines.length }}</span>
        <button type="button" class="tutorial__back" :disabled="isFirstLine" @click="goBack">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
          戻る
        </button>
        <button v-if="!isLastLine" type="button" class="tutorial__next" @click="advance">
          次へ
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </button>
        <button v-else type="button" class="tutorial__next tutorial__next--primary" @click="openSearch">
          TRACE Search を開く
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </button>
      </div>
    </aside>

    <!-- Once he has said his piece, one quiet line stays until the player
         actually searches something. -->
    <aside v-else-if="mode === 'hint'" key="hint" class="tutorial tutorial--hint" role="note">
      <span class="tutorial__hint-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle cx="10.75" cy="10.75" r="6.5" />
          <path d="m15.5 15.5 4.5 4.5" />
        </svg>
      </span>
      <span class="tutorial__hint-text">TRACE Search で「今日の天気」と検索して、WeatherLine を開いてみよう</span>
      <button type="button" class="tutorial__hint-open" @click="emit('open-search')">開く</button>
    </aside>
  </Transition>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import tutorialLines from '../../data/search_tutorial.json'
import { STORY_EVENTS } from '../../story/events.js'
import { useStoryStore } from '../../store/story.js'

const props = defineProps({
  // Whether the monologue still has to be read, or only the standing hint is
  // left. The caller owns that decision because it reads the story position.
  seen: { type: Boolean, default: false }
})

const emit = defineEmits(['open-search'])

// Long enough for the player to look at the freshly signed-in chat home before
// the protagonist starts thinking out loud.
const OPENING_DELAY_MS = 2200

const story = useStoryStore()

const lines = tutorialLines
const index = ref(0)
const opened = ref(false)

let openingTimer = null

const currentLine = computed(() => lines[index.value] || lines[lines.length - 1])
const isFirstLine = computed(() => index.value <= 0)
const isLastLine = computed(() => index.value >= lines.length - 1)
const speaker = computed(() => story.speakerName(currentLine.value.speaker))

const mode = computed(() => {
  if(props.seen) return 'hint'
  return opened.value ? 'lines' : 'none'
})

function advance(){
  if(isLastLine.value){
    finish()
    return
  }
  index.value += 1
}

// There is no skip: the monologue is short and it is the only place the player
// is told what to try, so the way through it is forwards and backwards.
function goBack(){
  if(isFirstLine.value) return
  index.value -= 1
}

// The monologue reports that it has been read; the story decides what that
// means, exactly as the reunion and the phone setup do.
function finish(){
  story.dispatch(STORY_EVENTS.SEARCH_TUTORIAL_COMPLETE)
}

function openSearch(){
  finish()
  emit('open-search')
}

onMounted(() => {
  if(props.seen) return
  openingTimer = setTimeout(() => {
    openingTimer = null
    opened.value = true
  }, OPENING_DELAY_MS)
})

onBeforeUnmount(() => {
  if(openingTimer !== null) clearTimeout(openingTimer)
  openingTimer = null
})
</script>

<style scoped>
.tutorial{
  position:absolute;
  right:0;
  bottom:34px;
  left:0;
  z-index:6;
  width:min(620px, calc(100% - 40px));
  margin:0 auto;
  display:flex;
  flex-direction:column;
  gap:10px;
  padding:16px 18px 14px;
  border:1px solid rgba(148, 176, 216, 0.28);
  border-radius:18px;
  background:linear-gradient(180deg, rgba(17, 22, 33, 0.96), rgba(12, 15, 22, 0.96));
  color:#eef2f9;
  font-family:'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', ui-sans-serif, system-ui, sans-serif;
  box-shadow:0 22px 50px rgba(8, 14, 26, 0.45);
  backdrop-filter:blur(6px);
}

.tutorial__card{
  display:flex;
  flex-direction:column;
  gap:7px;
  padding:0;
  border:0;
  background:transparent;
  color:inherit;
  font:inherit;
  text-align:left;
  cursor:pointer;
}

.tutorial__card:focus-visible{
  outline:3px solid rgba(120, 172, 255, 0.4);
  outline-offset:4px;
  border-radius:10px;
}

.tutorial__speaker{
  color:#8fb2e8;
  font-size:10px;
  font-weight:800;
  letter-spacing:0.08em;
}

.tutorial__text{
  font-size:13.5px;
  line-height:1.85;
}

.tutorial__actions{
  display:flex;
  align-items:center;
  gap:10px;
}

.tutorial__progress{
  margin-right:auto;
  color:#7b8ca6;
  font-size:9.5px;
  font-variant-numeric:tabular-nums;
}

.tutorial__back,
.tutorial__next{
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:8px 13px;
  border:1px solid rgba(148, 176, 216, 0.3);
  border-radius:11px;
  background:transparent;
  color:#c9d7ec;
  font:inherit;
  font-size:11px;
  font-weight:700;
  cursor:pointer;
  transition:background 180ms ease, border-color 180ms ease;
}

.tutorial__back:hover:not(:disabled),
.tutorial__next:hover{
  border-color:rgba(148, 176, 216, 0.5);
  background:rgba(148, 176, 216, 0.12);
}

.tutorial__next--primary{
  border-color:transparent;
  background:#2f6fd0;
  color:#fff;
  box-shadow:0 10px 22px rgba(30, 82, 160, 0.4);
}

.tutorial__next--primary:hover{
  background:#3a7ce0;
}

.tutorial__back:focus-visible,
.tutorial__next:focus-visible,
.tutorial__hint-open:focus-visible{
  outline:3px solid rgba(120, 172, 255, 0.45);
  outline-offset:3px;
}

.tutorial__back svg,
.tutorial__next svg{
  width:13px;
  fill:none;
  stroke:currentColor;
  stroke-width:2;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.tutorial__back:disabled{
  cursor:not-allowed;
  opacity:0.35;
}

/* ---- standing hint -------------------------------------------------- */
.tutorial--hint{
  width:min(430px, calc(100% - 40px));
  flex-direction:row;
  align-items:center;
  gap:10px;
  padding:11px 13px;
  border-radius:999px;
}

.tutorial__hint-mark{
  width:26px;
  height:26px;
  flex:0 0 auto;
  display:grid;
  place-items:center;
  border-radius:50%;
  background:rgba(148, 176, 216, 0.16);
}

.tutorial__hint-mark svg{
  width:14px;
  fill:none;
  stroke:#9dbcea;
  stroke-width:1.9;
  stroke-linecap:round;
}

.tutorial__hint-text{
  flex:1;
  font-size:11.5px;
  line-height:1.6;
}

.tutorial__hint-open{
  flex:0 0 auto;
  padding:6px 12px;
  border:0;
  border-radius:999px;
  background:#2f6fd0;
  color:#fff;
  font:inherit;
  font-size:10.5px;
  font-weight:800;
  cursor:pointer;
}

.tutorial__hint-open:hover{
  background:#3a7ce0;
}

.tutorial-enter-active,
.tutorial-leave-active{
  transition:opacity 320ms ease, transform 320ms ease;
}

.tutorial-enter-from,
.tutorial-leave-to{
  opacity:0;
  transform:translateY(12px);
}

@media (max-width:560px){
  .tutorial{
    bottom:18px;
  }

  .tutorial__progress{
    display:none;
  }
}

@media (prefers-reduced-motion:reduce){
  .tutorial-enter-active,
  .tutorial-leave-active{
    transition:none;
  }
}
</style>
