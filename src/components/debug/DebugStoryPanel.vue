<template>
  <DebugSection id="story" title="物語 / Story State" icon="✉" :badge="positionLabel">
    <p class="dbg-hint">
      本編は <span class="dbg-mono">story.dispatch(EVENT)</span> でしか進みません。
      章／ステップの直接指定はこのコンソール専用です。
    </p>

    <div class="dbg-facts">
      <span class="dbg-chip dbg-chip--accent">{{ story.chapter }}</span>
      <span class="dbg-chip">{{ story.step }}</span>
      <span class="dbg-chip">milestones {{ activeMilestones.length }}</span>
      <span class="dbg-chip" :class="{ 'dbg-chip--on': story.canOpenRevival }">revival {{ story.canOpenRevival ? 'OK' : '—' }}</span>
      <span class="dbg-chip" :class="{ 'dbg-chip--on': story.canOpenOriginal }">original {{ story.canOpenOriginal ? 'OK' : '—' }}</span>
      <span v-if="story.ending" class="dbg-chip dbg-chip--warn">ending {{ story.ending }}</span>
    </div>

    <p class="dbg-label">ここから発火できるEvent</p>
    <div v-if="liveEvents.length" class="dbg-btns">
      <button
        v-for="event in liveEvents"
        :key="event"
        type="button"
        class="dbg-btn dbg-btn--sm dbg-btn--primary"
        @click="dispatch(event)"
      >{{ event }}</button>
    </div>
    <p v-else class="dbg-empty">この位置から進むEventはありません（終端）。</p>

    <p class="dbg-label">記録だけ残すEvent</p>
    <div class="dbg-btns">
      <button
        v-for="event in milestoneEvents"
        :key="event"
        type="button"
        class="dbg-btn dbg-btn--sm"
        @click="dispatch(event)"
      >{{ event }}</button>
    </div>

    <p class="dbg-label">章 / ステップを直接指定</p>
    <select class="dbg-select" :value="story.chapter" @change="selectChapter($event.target.value)">
      <option v-for="chapter in CHAPTER_ORDER" :key="chapter" :value="chapter">{{ chapter }}</option>
    </select>
    <div class="dbg-btns">
      <button
        v-for="step in stepsForChapter"
        :key="step"
        type="button"
        class="dbg-btn dbg-btn--sm"
        :class="{ 'is-active': story.step === step && story.chapter === selectedChapter }"
        @click="jumpTo(selectedChapter, step)"
      >{{ step }}</button>
    </div>
    <p class="dbg-hint">ジャンプ先までに通過するmilestoneは自動で補完されます。</p>

    <p class="dbg-label">Milestones</p>
    <ul v-if="activeMilestones.length" class="dbg-list">
      <li v-for="key in activeMilestones" :key="key" class="dbg-item">
        <span class="dbg-item__text"><span class="dbg-item__title dbg-mono">{{ key }}</span></span>
        <button type="button" class="dbg-btn dbg-btn--sm" @click="toggleMilestone(key, false)">外す</button>
      </li>
    </ul>
    <p v-else class="dbg-empty">milestone なし</p>
    <div class="dbg-btns">
      <button
        v-for="key in inactiveMilestones"
        :key="key"
        type="button"
        class="dbg-btn dbg-btn--sm dbg-btn--ghost"
        @click="toggleMilestone(key, true)"
      >+ {{ key }}</button>
    </div>

    <p class="dbg-label">同窓会シーン</p>
    <p class="dbg-hint">
      再開位置: <span class="dbg-mono">{{ reunionProgressLabel }}</span>
      <template v-if="!isReunion"> ／ 表示するには chapter を <span class="dbg-mono">prologue / reunion</span> にしてください。</template>
    </p>
    <div class="dbg-grid-3">
      <button type="button" class="dbg-btn dbg-btn--sm" @click="startReunion(0)">最初から</button>
      <button type="button" class="dbg-btn dbg-btn--sm" @click="startReunion(lastLineIndex)">最後の台詞</button>
      <button type="button" class="dbg-btn dbg-btn--sm" @click="clearReunion()">保存を消す</button>
    </div>
    <div class="dbg-btns">
      <button
        v-for="beat in REUNION_BEATS"
        :key="beat.id"
        type="button"
        class="dbg-btn dbg-btn--sm"
        @click="startReunion(beat.index)"
      >{{ beat.label }}</button>
    </div>

    <p class="dbg-label">DM スレッド（水野ヒロキ）</p>
    <div class="dbg-grid-3">
      <button type="button" class="dbg-btn" @click="chat('restart', '最初から')">最初から</button>
      <button type="button" class="dbg-btn" @click="chat('step', '1件進めた')">1件進む</button>
      <button type="button" class="dbg-btn" @click="chat('reveal', '全件表示')">全件表示</button>
    </div>
    <label class="dbg-check">
      <input
        type="checkbox"
        :checked="shell.debug.autoRevealChat"
        @change="setAutoReveal($event.target.checked)"
      />
      フェーズ切替時に自動で全件表示
    </label>
    <p class="dbg-hint">
      序章DMに入力ゲートはありません。「全件表示」は掲示板後DMの入力ゲート
      （見つけた / 確認した / QRを読み込んだ / アクセスコードを入力した）を自動回答します。
    </p>

    <div class="dbg-btns">
      <button type="button" class="dbg-btn dbg-btn--sm dbg-btn--danger" @click="resetStory">Story Stateを初期化</button>
    </div>
  </DebugSection>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import DebugSection from './DebugSection.vue'
import { useDebugConsole } from './debugContext.js'
import reunionScript from '../../data/reunion_prologue.json'
import { CHAPTER_ORDER, STORY_CHAPTERS, STORY_STEPS } from '../../story/chapters.js'
import { STORY_EVENTS } from '../../story/events.js'
import { STORY_MILESTONES, milestoneOnlyFor } from '../../story/transitions.js'
import { clearReunionProgress, readReunionProgress, writeReunionProgress } from '../../story/reunionProgress.js'

const shell = useDebugConsole()
const story = shell.storyState

const MILESTONE_KEYS = Object.freeze(Object.values(STORY_MILESTONES))
const MILESTONE_EVENTS = Object.freeze(Object.values(STORY_EVENTS).filter((event) => milestoneOnlyFor(event)))

// One entry point per beat, so a tester can drop straight into the part they
// want to look at instead of clicking through the whole scene.
const REUNION_BEATS = Object.freeze(
  [...new Set(reunionScript.map((line) => line.beat))].map((beat) => Object.freeze({
    id: beat,
    label: beat,
    index: reunionScript.findIndex((line) => line.beat === beat)
  }))
)
const lastLineIndex = reunionScript.length - 1

const selectedChapter = ref(story.chapter)
// A jump made anywhere else (a scenario, a snapshot) should move the selector too.
watch(() => story.chapter, (chapter) => { selectedChapter.value = chapter })

const positionLabel = computed(() => `${story.chapter} / ${story.step}`)
const stepsForChapter = computed(() => STORY_STEPS[selectedChapter.value] || [])
const liveEvents = computed(() => story.availableEvents())
const milestoneEvents = MILESTONE_EVENTS
const activeMilestones = computed(() => Object.keys(story.milestones).filter((key) => story.milestones[key]))
const inactiveMilestones = computed(() => MILESTONE_KEYS.filter((key) => !story.milestones[key]))
const isReunion = computed(() => story.chapter === STORY_CHAPTERS.PROLOGUE && story.step === 'reunion')
const reunionProgressLabel = computed(() => readReunionProgress()?.lineId || '(なし)')

function dispatch(event){
  const moved = story.dispatch(event)
  shell.notify(moved ? `${event} → ${story.chapter} / ${story.step}` : `${event} はこの位置では何も起きません`)
  if(moved) shell.remountStage()
}

function selectChapter(chapter){
  selectedChapter.value = chapter
}

function jumpTo(chapter, step){
  story.debugSetPosition(chapter, step, { syncMilestones: true })
  shell.notify(`Story State → ${chapter} / ${step}`)
  shell.remountStage()
}

function toggleMilestone(key, value){
  story.markMilestone(key, value)
  shell.notify(`milestone ${key} → ${value}`)
}

function startReunion(index){
  const line = reunionScript[Math.min(Math.max(index, 0), lastLineIndex)]
  if(line) writeReunionProgress(line.id)
  story.debugSetPosition(STORY_CHAPTERS.PROLOGUE, 'reunion', { syncMilestones: true })
  shell.notify(`同窓会シーン → ${line?.id || '先頭'}`)
  shell.remountStage()
}

function clearReunion(){
  clearReunionProgress()
  shell.notify('同窓会の途中保存を削除しました')
  shell.remountStage()
}

function resetStory(){
  story.resetStory()
  shell.notify('Story Stateを初期化しました（prologue / reunion）')
  shell.remountStage()
}

function chat(command, label){
  if(command === 'restart') shell.debug.restartChat()
  if(command === 'step') shell.debug.stepChat()
  if(command === 'reveal') shell.debug.revealChat()
  shell.notify(`DM: ${label}`)
}

function setAutoReveal(value){
  shell.debug.setPref('autoRevealChat', value)
  shell.notify(`DM自動全件表示: ${value ? 'ON' : 'OFF'}`)
}
</script>
