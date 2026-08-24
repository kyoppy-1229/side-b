<template>
  <DebugSection id="flags" title="フラグ / 記憶 / 調査済み" icon="⚑" :badge="flagCount">
    <p class="dbg-label">Story flags</p>
    <div class="dbg-row">
      <input v-model.trim="newStoryFlag" class="dbg-input dbg-grow" type="text" placeholder="flag名" @keydown.stop @keyup.stop @keydown.enter="addStoryFlag" />
      <button type="button" class="dbg-btn" @click="addStoryFlag">追加</button>
    </div>
    <div class="dbg-btns">
      <button
        v-for="flag in KNOWN_STORY_FLAGS"
        :key="flag"
        type="button"
        class="dbg-btn dbg-btn--sm"
        :class="{ 'is-active': session.storyFlags[flag] === true }"
        @click="toggleStoryFlag(flag)"
      >{{ flag }}</button>
    </div>
    <ul v-if="storyFlagEntries.length" class="dbg-list">
      <li v-for="[flag, value] in storyFlagEntries" :key="flag" class="dbg-item">
        <span class="dbg-item__title dbg-mono">{{ flag }}</span>
        <span class="dbg-row">
          <button type="button" class="dbg-btn dbg-btn--sm" @click="toggleStoryFlag(flag)">{{ String(value) }}</button>
          <button type="button" class="dbg-btn dbg-btn--sm dbg-btn--danger" @click="removeStoryFlag(flag)">×</button>
        </span>
      </li>
    </ul>
    <p v-else class="dbg-empty">storyFlags なし</p>

    <p class="dbg-label">Puzzle flags</p>
    <div class="dbg-row">
      <input v-model.trim="newPuzzleFlag" class="dbg-input dbg-grow" type="text" placeholder="puzzle flag名" @keydown.stop @keyup.stop @keydown.enter="addPuzzleFlag" />
      <button type="button" class="dbg-btn" @click="addPuzzleFlag">追加</button>
    </div>
    <ul v-if="puzzleFlagEntries.length" class="dbg-list">
      <li v-for="[flag, value] in puzzleFlagEntries" :key="flag" class="dbg-item">
        <span class="dbg-item__title dbg-mono">{{ flag }}</span>
        <span class="dbg-row">
          <button type="button" class="dbg-btn dbg-btn--sm" @click="togglePuzzleFlag(flag)">{{ String(value) }}</button>
          <button type="button" class="dbg-btn dbg-btn--sm dbg-btn--danger" @click="removePuzzleFlag(flag)">×</button>
        </span>
      </li>
    </ul>
    <p v-else class="dbg-empty">puzzleFlags なし</p>

    <p class="dbg-label">訪問済み / 記憶</p>
    <div class="dbg-grid-2">
      <button type="button" class="dbg-btn" @click="visitAll">全部屋を訪問済みに</button>
      <button type="button" class="dbg-btn" @click="clearVisited">訪問記録を消去</button>
      <button type="button" class="dbg-btn" @click="collectAllMemories">全記憶を取得</button>
      <button type="button" class="dbg-btn" @click="clearMemories">記憶を消去</button>
    </div>
    <ul v-if="session.memories.length" class="dbg-list">
      <li v-for="memory in session.memories" :key="memory" class="dbg-item">
        <span class="dbg-item__title dbg-mono">{{ memory }}</span>
        <button type="button" class="dbg-btn dbg-btn--sm dbg-btn--danger" @click="removeMemory(memory)">×</button>
      </li>
    </ul>
    <p v-else class="dbg-empty">memories なし</p>

    <p class="dbg-label">調査済みオブジェクト（{{ objectEntries.length }}）</p>
    <button type="button" class="dbg-btn dbg-btn--wide" @click="clearObjects">objectState を消去</button>
    <ul v-if="objectEntries.length" class="dbg-list">
      <li v-for="[objectId, value] in objectEntries" :key="objectId" class="dbg-item">
        <span class="dbg-item__title dbg-mono">{{ objectId }}</span>
        <span class="dbg-item__sub">{{ value }}</span>
      </li>
    </ul>
  </DebugSection>

  <DebugSection id="snapshots" title="スナップショット" icon="⌸" :badge="snapshots.length">
    <p class="dbg-hint">今の状態（フェーズ・両エディション・タブ構成）をまとめて保存し、あとから戻せます。</p>
    <div class="dbg-row">
      <input v-model.trim="snapshotName" class="dbg-input dbg-grow" type="text" placeholder="名前" @keydown.stop @keyup.stop @keydown.enter="save" />
      <button type="button" class="dbg-btn dbg-btn--primary" @click="save">保存</button>
    </div>
    <ul v-if="snapshots.length" class="dbg-list">
      <li v-for="item in snapshots" :key="item.id" class="dbg-item">
        <span class="dbg-item__text">
          <span class="dbg-item__title">{{ item.name }}</span>
          <span class="dbg-item__sub">{{ formatDate(item.state?.savedAt) }}</span>
        </span>
        <span class="dbg-row">
          <button type="button" class="dbg-btn dbg-btn--sm" @click="restore(item)">復元</button>
          <button type="button" class="dbg-btn dbg-btn--sm dbg-btn--danger" @click="remove(item)">×</button>
        </span>
      </li>
    </ul>
    <p v-else class="dbg-empty">保存されたスナップショットはありません</p>
    <div class="dbg-grid-2">
      <button type="button" class="dbg-btn" @click="exportFile">JSON書き出し</button>
      <button type="button" class="dbg-btn" @click="importOpen = !importOpen">JSON読み込み</button>
    </div>
    <template v-if="importOpen">
      <textarea v-model="importText" class="dbg-textarea" placeholder="captureState の JSON を貼り付け" @keydown.stop @keyup.stop></textarea>
      <button type="button" class="dbg-btn dbg-btn--wide dbg-btn--primary" @click="importJson">この状態を適用</button>
    </template>
  </DebugSection>

  <DebugSection id="state-json" title="State JSON" icon="{}">
    <div class="dbg-grid-3">
      <button type="button" class="dbg-btn" :class="{ 'is-active': jsonView === 'session' }" @click="jsonView = 'session'">session</button>
      <button type="button" class="dbg-btn" :class="{ 'is-active': jsonView === 'browser' }" @click="jsonView = 'browser'">browser</button>
      <button type="button" class="dbg-btn" :class="{ 'is-active': jsonView === 'all' }" @click="jsonView = 'all'">all</button>
    </div>
    <pre class="dbg-json">{{ jsonText }}</pre>
    <button type="button" class="dbg-btn dbg-btn--wide" @click="copyJson">クリップボードにコピー</button>
    <p class="dbg-label">セッションへパッチ適用</p>
    <textarea v-model="patchText" class="dbg-textarea" placeholder='{"anomalyLevel":3,"storyFlags":{"anomalyPhase":true}}' @keydown.stop @keyup.stop></textarea>
    <button type="button" class="dbg-btn dbg-btn--wide dbg-btn--primary" @click="applyPatch">{{ editionLabel }} にパッチ適用</button>
    <p class="dbg-hint">パッチは必ず整合性チェックを通るため、入れない状態（地下ロック中のB1など）は自動で補正されます。</p>
  </DebugSection>

  <DebugSection id="storage" title="サンドボックス / ストレージ" icon="▣" :badge="storageKeys.length">
    <p class="dbg-hint">
      この画面は <b class="dbg-mono">{{ scope || '(なし)' }}</b> スコープで動作しています。
      本編タブ（#/）とはキーが分かれているため、ここでの操作は本編のセーブに一切影響しません。
    </p>
    <ul class="dbg-list">
      <li v-for="entry in storageKeys" :key="entry.storageKey" class="dbg-item">
        <span class="dbg-item__sub">{{ entry.storageKey }}</span>
        <span class="dbg-chip">{{ entry.size }}</span>
      </li>
    </ul>
    <p v-if="!storageKeys.length" class="dbg-empty">まだ何も書き込まれていません</p>
    <div class="dbg-grid-3">
      <button type="button" class="dbg-btn" @click="storageTick += 1">再読込</button>
      <button type="button" class="dbg-btn dbg-btn--danger" @click="resetSandbox">状態を初期化</button>
      <button type="button" class="dbg-btn dbg-btn--danger" @click="wipeStorage">ストレージ全消去</button>
    </div>
    <a class="dbg-btn dbg-btn--wide" href="#/" target="_blank" rel="noopener">本編を別タブで開く</a>
  </DebugSection>
</template>

<script setup>
import { computed, ref } from 'vue'
import DebugSection from './DebugSection.vue'
import { useDebugConsole } from './debugContext.js'
import {
  captureState,
  deleteSnapshot,
  describeScopeKeys,
  downloadJson,
  listSnapshots,
  resetSandboxState,
  restoreState,
  saveSnapshot,
  wipeSandboxStorage
} from '../../debug/sandbox.js'
import { EDITIONS, ROOM_IDS } from '../../game/data/school.js'
import { getStorageScope, readValue } from '../../store/storage.js'

const shell = useDebugConsole()
const game = shell.game

// Flags the game itself reads; offered as one-tap toggles.
const KNOWN_STORY_FLAGS = Object.freeze(['anomalyPhase'])
const ALL_MEMORIES = Object.freeze([
  'memory:school-layout',
  'memory:school-notices',
  'memory:graduation',
  'memory:class-life',
  'memory:school-history',
  'memory:class-photo',
  'memory:school-news',
  'memory:archive-record'
])

const newStoryFlag = ref('')
const newPuzzleFlag = ref('')
const snapshotName = ref('')
const snapshots = ref(listSnapshots())
const importOpen = ref(false)
const importText = ref('')
const patchText = ref('')
const jsonView = ref('session')
const storageTick = ref(0)
const scope = getStorageScope()

const edition = computed(() => shell.edition.value)
const editionLabel = computed(() => (edition.value === EDITIONS.ORIGINAL ? '初期版' : '復刻版'))
const session = computed(() => game.sessions[edition.value])
const storyFlagEntries = computed(() => Object.entries(session.value.storyFlags))
const puzzleFlagEntries = computed(() => Object.entries(session.value.puzzleFlags))
const objectEntries = computed(() => Object.entries(session.value.objectState))
const flagCount = computed(() => storyFlagEntries.value.length + puzzleFlagEntries.value.length)

const jsonText = computed(() => {
  if(jsonView.value === 'session') return JSON.stringify(session.value, null, 2)
  if(jsonView.value === 'browser') return JSON.stringify(shell.browser.exportState(), null, 2)
  return JSON.stringify(captureState(shell.context), null, 2)
})

const storageKeys = computed(() => {
  // Re-read whenever this panel writes, or the sandbox state moves underneath us.
  storageTick.value
  shell.storyState.chapter
  shell.storyState.step
  shell.game.activeEdition
  shell.browser.activeTabId
  return describeScopeKeys().map((entry) => ({
    ...entry,
    size: `${((readValue(entry.key) || '').length / 1024).toFixed(1)} KB`
  }))
})

function withEdition(action, label){
  game.selectEdition(edition.value)
  action()
  storageTick.value += 1
  if(label) shell.notify(label)
}

function addStoryFlag(){
  if(!newStoryFlag.value) return
  withEdition(() => game.setStoryFlag(newStoryFlag.value, true), `storyFlag 追加: ${newStoryFlag.value}`)
  newStoryFlag.value = ''
}
function toggleStoryFlag(flag){
  withEdition(() => game.setStoryFlag(flag, !session.value.storyFlags[flag]), `storyFlag ${flag} → ${!session.value.storyFlags[flag]}`)
}
function removeStoryFlag(flag){
  withEdition(() => game.removeStoryFlag(flag), `storyFlag 削除: ${flag}`)
}
function addPuzzleFlag(){
  if(!newPuzzleFlag.value) return
  withEdition(() => game.setPuzzleFlag(newPuzzleFlag.value, true), `puzzleFlag 追加: ${newPuzzleFlag.value}`)
  newPuzzleFlag.value = ''
}
function togglePuzzleFlag(flag){
  withEdition(() => game.setPuzzleFlag(flag, !session.value.puzzleFlags[flag]), `puzzleFlag ${flag} を切替`)
}
function removePuzzleFlag(flag){
  withEdition(() => game.removePuzzleFlag(flag), `puzzleFlag 削除: ${flag}`)
}

function visitAll(){
  withEdition(() => game.setVisitedRooms(ROOM_IDS, edition.value), '全部屋を訪問済みにした')
}
function clearVisited(){
  withEdition(() => game.setVisitedRooms([], edition.value), '訪問記録を消去')
}
function collectAllMemories(){
  withEdition(() => game.setMemories(ALL_MEMORIES, edition.value), '全記憶を取得')
}
function clearMemories(){
  withEdition(() => game.setMemories([], edition.value), '記憶を消去')
}
function removeMemory(memory){
  withEdition(() => game.removeMemory(memory, edition.value), `記憶を削除: ${memory}`)
}
function clearObjects(){
  withEdition(() => game.clearObjectState(), 'objectState を消去')
}

function formatDate(value){
  if(!value) return ''
  try {
    return new Date(value).toLocaleString('ja-JP')
  } catch {
    return value
  }
}

function save(){
  const entry = saveSnapshot(snapshotName.value, captureState(shell.context))
  snapshots.value = listSnapshots()
  snapshotName.value = ''
  storageTick.value += 1
  shell.notify(`スナップショット保存: ${entry.name}`)
}
function restore(item){
  restoreState(item.state, shell.context)
  shell.remountStage()
  shell.notify(`復元: ${item.name}`)
}
function remove(item){
  snapshots.value = deleteSnapshot(item.id)
  storageTick.value += 1
  shell.notify(`削除: ${item.name}`)
}

function exportFile(){
  downloadJson(`side-b-debug-${Date.now()}.json`, captureState(shell.context))
  shell.notify('JSONを書き出しました')
}
function importJson(){
  try {
    restoreState(JSON.parse(importText.value), shell.context)
    shell.remountStage()
    shell.notify('JSONを適用しました')
  } catch {
    shell.notify('JSONを解釈できませんでした')
  }
}

function copyJson(){
  if(typeof navigator === 'undefined' || !navigator.clipboard){
    shell.notify('このブラウザではコピーできません')
    return
  }
  navigator.clipboard.writeText(jsonText.value)
    .then(() => shell.notify('コピーしました'))
    .catch(() => shell.notify('コピーに失敗しました'))
}

function applyPatch(){
  try {
    game.patchSession(JSON.parse(patchText.value), edition.value)
    storageTick.value += 1
    shell.notify(`${editionLabel.value} にパッチを適用`)
  } catch {
    shell.notify('パッチJSONを解釈できませんでした')
  }
}

function resetSandbox(){
  if(typeof window !== 'undefined' && !window.confirm('サンドボックスの状態を初期化しますか？（本編のセーブには影響しません）')) return
  resetSandboxState(shell.context)
  shell.debug.restartChat()
  shell.remountStage()
  storageTick.value += 1
  shell.notify('サンドボックスを初期化しました')
}

function wipeStorage(){
  if(typeof window !== 'undefined' && !window.confirm('このサンドボックスの localStorage を全消去しますか？')) return
  const removed = wipeSandboxStorage()
  snapshots.value = []
  storageTick.value += 1
  shell.notify(`${removed} 件のキーを削除しました。リロードで完全に初期化されます。`)
}
</script>
