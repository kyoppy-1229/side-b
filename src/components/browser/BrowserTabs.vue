<template>
  <div class="browser-tabs">
    <div
      ref="tabStrip"
      class="tab-strip"
      role="tablist"
      aria-label="開いているページ"
      @keydown="handleTabKeydown"
    >
      <BrowserTab
        v-for="tab in tabs"
        :key="tab.id"
        :tab="tab"
        :active="tab.id === activeTabId"
        @activate="emit('activate', $event)"
        @close="emit('close', $event)"
      />
    </div>

    <button
      class="new-tab-button"
      type="button"
      aria-label="新しいタブを開く"
      title="新しいタブ"
      @click="emit('new-tab')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import BrowserTab from './BrowserTab.vue'

const props = defineProps({
  tabs: {
    type: Array,
    default: () => []
  },
  activeTabId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['activate', 'close', 'new-tab'])
const tabStrip = ref(null)

watch(() => props.activeTabId, async (activeTabId) => {
  await nextTick()
  const activeElement = Array.from(tabStrip.value?.children || [])
    .find((element) => element.dataset.tabId === String(activeTabId))
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  activeElement?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' })
}, { flush: 'post' })

function handleTabKeydown(event){
  const supportedKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
  if(!supportedKeys.includes(event.key) || !props.tabs.length) return

  event.preventDefault()
  const activeIndex = Math.max(0, props.tabs.findIndex((tab) => tab.id === props.activeTabId))
  let nextIndex = activeIndex

  if(event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + props.tabs.length) % props.tabs.length
  if(event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % props.tabs.length
  if(event.key === 'Home') nextIndex = 0
  if(event.key === 'End') nextIndex = props.tabs.length - 1

  emit('activate', props.tabs[nextIndex].id)
  nextTick(() => {
    const tabButtons = tabStrip.value?.querySelectorAll('[role="tab"]')
    tabButtons?.[nextIndex]?.focus()
  })
}
</script>

<style scoped>
.browser-tabs{
  display:flex;
  align-items:flex-end;
  gap:6px;
  min-height:45px;
  padding:6px 10px 0;
  border-bottom:1px solid var(--browser-line, #cbd5e1);
  background:linear-gradient(180deg, #eaf0f7 0%, #e2e8f0 100%);
}

.tab-strip{
  display:flex;
  align-items:flex-end;
  gap:5px;
  min-width:0;
  overflow-x:auto;
  overflow-y:hidden;
  scrollbar-color:#94a3b8 transparent;
  scrollbar-width:thin;
  flex:1;
  scroll-behavior:smooth;
}

.tab-strip::-webkit-scrollbar{
  height:4px;
}

.tab-strip::-webkit-scrollbar-thumb{
  border-radius:999px;
  background:#94a3b8;
}

.new-tab-button{
  display:grid;
  place-items:center;
  width:34px;
  height:34px;
  margin-bottom:3px;
  padding:0;
  border:0;
  border-radius:10px;
  background:transparent;
  color:#475569;
  flex:0 0 auto;
  transition:background 180ms ease, color 180ms ease, transform 180ms ease;
}

.new-tab-button:hover{
  color:#1d4ed8;
  background:rgba(255,255,255,.75);
}

.new-tab-button:active{
  transform:scale(.92);
}

.new-tab-button:focus-visible{
  outline:2px solid var(--browser-primary, #2563eb);
  outline-offset:2px;
}

.new-tab-button svg{
  width:20px;
  height:20px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
}

@media (prefers-reduced-motion:reduce){
  .tab-strip{
    scroll-behavior:auto;
  }

  .new-tab-button{
    transition:none;
  }
}

@media (max-width:560px){
  .browser-tabs{
    min-height:42px;
    padding-right:6px;
    padding-left:6px;
  }
}
</style>
