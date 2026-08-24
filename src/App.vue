<template>
  <div class="app-root" :class="{ 'debug-root': route.meta.debugOnly }">
    <!-- The trial's last screen sits in front of everything: once it is
         reached there is nothing further to play until the player restarts. -->
    <TrialEndScene v-if="showTrialEnd" />
    <!-- The reunion and the new PC's setup both happen before the browser
         exists, so they replace the whole shell instead of living inside a
         route. The debug console keeps its own view: it must be able to inspect
         any part of the game from a fresh sandbox, which always starts at the
         reunion. -->
    <ReunionScene v-else-if="showReunion" />
    <DeviceSetupScene v-else-if="showDeviceSetup" />
    <router-view v-else />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DeviceSetupScene from './views/DeviceSetupScene.vue'
import ReunionScene from './views/ReunionScene.vue'
import TrialEndScene from './views/TrialEndScene.vue'
import { GAME_SESSION_STORAGE_KEY, GAME_SYNC_KEY, useGameSessionStore } from './store/gameSession.js'
import { STORY_PHASE_STORAGE_KEY, useGameStore } from './store/index.js'
import { STORY_STATE_STORAGE_KEY, useStoryStore } from './store/story.js'
import { STORY_CHAPTERS } from './story/chapters.js'
import { isSandboxed } from './store/storage.js'
import { isTrialComplete } from './trial/flow.js'

const route = useRoute()
const gameSession = useGameSessionStore()
const story = useGameStore()
const storyState = useStoryStore()

const showReunion = computed(() => (
  !route.meta.debugOnly &&
  storyState.chapter === STORY_CHAPTERS.PROLOGUE &&
  storyState.step === 'reunion'
))

// The trial ends after 水野's message about the BBS; the mark is trial-only, so
// this is always false in the full game (see trial/flow.js).
const showTrialEnd = computed(() => !route.meta.debugOnly && isTrialComplete(storyState))

const showDeviceSetup = computed(() => (
  !route.meta.debugOnly &&
  storyState.chapter === STORY_CHAPTERS.PROLOGUE &&
  storyState.step === 'device_setup'
))

// Live cross-tab sync: when another tab writes new state to localStorage,
// refresh the stores here so an already-open game screen updates its status
// without a reload.
//
// The debug console never joins this channel — it runs in its own storage scope
// and must stay a sealed-off space, both ways.
function onStorage(event){
  const key = event.key
  if(key === null){
    // localStorage.clear()
    gameSession.loadFromStorage()
    story.reload()
    return
  }
  if(key === GAME_SESSION_STORAGE_KEY || key === GAME_SYNC_KEY) gameSession.loadFromStorage()
  if(key === STORY_STATE_STORAGE_KEY || key === STORY_PHASE_STORAGE_KEY || key === GAME_SYNC_KEY) story.reload()
}

onMounted(() => {
  if(typeof window === 'undefined' || isSandboxed()) return
  window.addEventListener('storage', onStorage)
})
onBeforeUnmount(() => {
  if(typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
})
</script>

<style scoped>
.app-root{
  position:relative;
  min-height:100vh;
  min-height:100dvh;
}

/* The debug console lays out its own full-viewport shell. */
.debug-root{
  height:100vh;
  height:100dvh;
  overflow:hidden;
}
</style>
