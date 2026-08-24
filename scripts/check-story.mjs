// Covers the global story state machine, the reunion scene's data and wiring,
// and the ambience player that runs underneath it.
//
// The Vue components are not mounted (there is no DOM here), so anything that
// only exists in a template is asserted against the source file. Everything with
// real logic — the store, the reunion progress key, the audio player — is
// exercised for real.

import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { createPinia, setActivePinia } from 'pinia'

function createMemoryStorage(){
  const values = new Map()
  return {
    get length(){ return values.size },
    key(index){ return [...values.keys()][index] ?? null },
    getItem(key){ return values.has(key) ? values.get(key) : null },
    setItem(key, value){ values.set(key, String(value)) },
    removeItem(key){ values.delete(key) },
    clear(){ values.clear() }
  }
}

const storage = createMemoryStorage()
globalThis.window = { localStorage: storage }

const { STORY_CHAPTERS, INITIAL_POSITION, isKnownPosition } = await import('../src/story/chapters.js')
const { STORY_EVENTS } = await import('../src/story/events.js')
const { STORY_MILESTONES, availableEvents, milestonesUpTo } = await import('../src/story/transitions.js')
const {
  REUNION_PROGRESS_STORAGE_KEY,
  clearReunionProgress,
  readReunionProgress,
  writeReunionProgress
} = await import('../src/story/reunionProgress.js')
const {
  STORY_STATE_STORAGE_KEY,
  LEGACY_STORY_PHASE_STORAGE_KEY,
  useStoryStore
} = await import('../src/store/story.js')
const { GAME_PHASES, useGameStore } = await import('../src/store/index.js')
const {
  DEFAULT_PLAYER_NAME,
  PLAYER_NAME_MAX_LENGTH,
  PLAYER_SPEAKER_ID,
  isPlayerSpeaker,
  resolvePlayerName,
  sanitizePlayerName
} = await import('../src/story/player.js')
const { VIRTUAL_URLS } = await import('../src/virtual-web/constants.js')

const url = (path) => new URL(path, import.meta.url)
const readSource = (path) => readFile(url(path), 'utf8')

const reunionScript = JSON.parse(await readSource('../src/data/reunion_prologue.json'))
const prologueDm = JSON.parse(await readSource('../src/data/dm_prologue.json'))
const reunionSceneSource = await readSource('../src/views/ReunionScene.vue')
const appSource = await readSource('../src/App.vue')
const chatAppSource = await readSource('../src/components/chat/ChatApp.vue')
const chatMessagesSource = await readSource('../src/components/chat/ChatMessages.vue')
const chatLoginSource = await readSource('../src/components/chat/ChatLoginGate.vue')
const deviceSetupSource = await readSource('../src/views/DeviceSetupScene.vue')
const audioSource = await readSource('../src/audio/reunionAudio.js')
const audioReadme = await readSource('../src/assets/audio/README.md')
const debugViewSource = await readSource('../src/views/GameDebugView.vue')
const debugStoryPanelSource = await readSource('../src/components/debug/DebugStoryPanel.vue')
const scenariosSource = await readSource('../src/debug/scenarios.js')
const chatHomeSource = await readSource('../src/components/chat/ChatHome.vue')
const chatNameDialogSource = await readSource('../src/components/chat/ChatNameDialog.vue')
const chatSidebarSource = await readSource('../src/components/chat/ChatSidebar.vue')
const chatAvatarsSource = await readSource('../src/components/chat/avatars.js')
const devicesSource = await readSource('../src/story/devices.js')
const searchTutorial = JSON.parse(await readSource('../src/data/search_tutorial.json'))
const searchTutorialSource = await readSource('../src/components/browser/SearchTutorial.vue')
const browserWorkspaceSource = await readSource('../src/views/BrowserWorkspace.vue')
const virtualBrowserSource = await readSource('../src/components/browser/VirtualBrowser.vue')

function freshStore(){
  storage.clear()
  setActivePinia(createPinia())
  return useStoryStore()
}

// ---------------------------------------------------------------------------
// Story store
// ---------------------------------------------------------------------------

// 1. a new save starts at the reunion
let story = freshStore()
assert.equal(story.chapter, STORY_CHAPTERS.PROLOGUE)
assert.equal(story.step, 'reunion')
assert.deepEqual(story.position, INITIAL_POSITION)
assert.equal(story.ending, null)
assert.deepEqual(story.milestones, {})

// 2. REUNION_COMPLETE moves the prologue on to the new phone's setup
assert.equal(story.dispatch(STORY_EVENTS.REUNION_COMPLETE), true)
assert.equal(story.chapter, STORY_CHAPTERS.PROLOGUE)
assert.equal(story.step, 'device_setup')
assert.equal(story.hasMilestone(STORY_MILESTONES.REUNION_COMPLETE), true)

// 3. the same event again is a no-op, not a crash or a double step
assert.equal(story.dispatch(STORY_EVENTS.REUNION_COMPLETE), false)
assert.equal(story.step, 'device_setup')

// 2b. the migration and the chat sign-in are each passed exactly once, in order
assert.equal(story.dispatch(STORY_EVENTS.CHAT_RELOGIN_COMPLETE), false, '移行前にログインはできない')
assert.equal(story.dispatch(STORY_EVENTS.DEVICE_MIGRATION_COMPLETE), true)
assert.equal(story.step, 'chat_login')
assert.equal(story.hasMilestone(STORY_MILESTONES.DEVICE_MIGRATION_COMPLETE), true)
assert.equal(story.dispatch(STORY_EVENTS.DEVICE_MIGRATION_COMPLETE), false)

assert.equal(story.dispatch(STORY_EVENTS.CHAT_RELOGIN_COMPLETE), true)
assert.equal(story.step, 'chat_home', 'ログイン後はDMではなくチャットホーム')
assert.equal(story.hasMilestone(STORY_MILESTONES.CHAT_RELOGIN_COMPLETE), true)
assert.equal(story.dispatch(STORY_EVENTS.CHAT_RELOGIN_COMPLETE), false)

// 2c. the first message is a mark, not a position: it lands while the player is
// on the chat home, and it does not open the thread by itself
assert.equal(story.hasMilestone(STORY_MILESTONES.MIZUNO_FIRST_MESSAGE_RECEIVED), false, 'ログイン直後は未受信')
assert.equal(story.dispatch(STORY_EVENTS.MIZUNO_FIRST_MESSAGE_RECEIVED), true)
assert.equal(story.step, 'chat_home', '初回受信は位置を動かさない')
assert.equal(story.dispatch(STORY_EVENTS.MIZUNO_FIRST_MESSAGE_RECEIVED), false, '受信は一度きり')

// 2d. the thread opens because the player opens it
assert.equal(story.dispatch(STORY_EVENTS.MIZUNO_THREAD_OPENED), true)
assert.equal(story.step, 'dm')
assert.equal(story.hasMilestone(STORY_MILESTONES.MIZUNO_THREAD_OPENED), true)
assert.equal(story.dispatch(STORY_EVENTS.MIZUNO_THREAD_OPENED), false)

// 4. events that do not apply here cannot skip ahead
for(const event of [
  STORY_EVENTS.BBS_COMPLETE,
  STORY_EVENTS.ORIGINAL_UNLOCKED,
  STORY_EVENTS.ENDING_COMPLETE,
  'NOT_AN_EVENT',
  null,
  undefined
]){
  assert.equal(story.dispatch(event), false, `${event} must not advance the story`)
}
assert.equal(story.step, 'dm')
assert.equal(story.canOpenRevival, false)
assert.equal(story.canOpenOriginal, false)
assert.equal(story.hasDiscoveredBasement, false)

// 32. the prologue DM closes exactly once
assert.equal(story.dispatch(STORY_EVENTS.PROLOGUE_DM_COMPLETE), true)
assert.equal(story.dispatch(STORY_EVENTS.PROLOGUE_DM_COMPLETE), false)
assert.equal(story.step, 'dm_complete')
assert.equal(story.hasMilestone(STORY_MILESTONES.PROLOGUE_DM_COMPLETE), true)

// 33. finishing the prologue does not unlock the revival build
assert.equal(story.canOpenRevival, false)
assert.equal(story.hasMilestone(STORY_MILESTONES.REVIVAL_LINK_RECEIVED), false)
assert.equal(story.chapter, STORY_CHAPTERS.PROLOGUE)

// hasReached compares chapters, and chapter + step when asked
assert.equal(story.hasReached(STORY_CHAPTERS.PROLOGUE), true)
assert.equal(story.hasReached(STORY_CHAPTERS.PROLOGUE, 'dm'), true)
assert.equal(story.hasReached(STORY_CHAPTERS.CH1_REVIVAL), false)
assert.equal(story.isChapter(STORY_CHAPTERS.PROLOGUE), true)

// milestone-only events record without moving the position
assert.equal(story.dispatch(STORY_EVENTS.BASEMENT_MENTION_SEEN), true)
assert.equal(story.hasDiscoveredBasement, true)
assert.equal(story.step, 'dm_complete')
assert.equal(story.dispatch(STORY_EVENTS.BASEMENT_MENTION_SEEN), false, '同じ発見は一度きり')

// 5. the state survives a reload (new pinia, same storage)
const persisted = JSON.parse(storage.getItem(STORY_STATE_STORAGE_KEY))
assert.equal(persisted.schemaVersion, 2)
assert.equal(persisted.chapter, STORY_CHAPTERS.PROLOGUE)
assert.equal(persisted.step, 'dm_complete')
setActivePinia(createPinia())
story = useStoryStore()
assert.equal(story.step, 'dm_complete')
assert.equal(story.hasMilestone(STORY_MILESTONES.PROLOGUE_DM_COMPLETE), true)

// resetStory drops everything back to the reunion
story.resetStory()
assert.equal(story.step, 'reunion')
assert.deepEqual(story.milestones, {})

// 6. a corrupted save falls back to the reunion instead of crashing
for(const broken of ['{', 'null', '[]', '"prologue"', '{"chapter":"nope","step":"nope"}', '{"chapter":"prologue"}']){
  storage.clear()
  storage.setItem(STORY_STATE_STORAGE_KEY, broken)
  setActivePinia(createPinia())
  const recovered = useStoryStore()
  assert.equal(recovered.chapter, STORY_CHAPTERS.PROLOGUE, `broken save ${broken}`)
  assert.equal(recovered.step, 'reunion', `broken save ${broken}`)
}

// milestones stay a flat map even when the save says otherwise
storage.clear()
storage.setItem(STORY_STATE_STORAGE_KEY, JSON.stringify({
  chapter: STORY_CHAPTERS.PROLOGUE,
  step: 'dm',
  milestones: { good: true, nested: { no: 1 }, alsoBad: null },
  ending: 42
}))
setActivePinia(createPinia())
story = useStoryStore()
assert.deepEqual(story.milestones, { good: true })
assert.equal(story.ending, null)

// 7. the v1 phase key migrates, and a v2 save wins over it
const MIGRATIONS = [
  ['prologue_dm', STORY_CHAPTERS.PROLOGUE, 'dm'],
  ['bbs', STORY_CHAPTERS.CH2_RECORDS_2015, 'bbs_opened'],
  ['after_bbs_dm', STORY_CHAPTERS.CH3_BLUE_BIRDS, 'bird_prompt']
]
for(const [phase, chapter, step] of MIGRATIONS){
  storage.clear()
  storage.setItem(LEGACY_STORY_PHASE_STORAGE_KEY, phase)
  setActivePinia(createPinia())
  const migrated = useStoryStore()
  assert.equal(migrated.chapter, chapter, `v1 ${phase}`)
  assert.equal(migrated.step, step, `v1 ${phase}`)
  assert.equal(migrated.hasMilestone(STORY_MILESTONES.REUNION_COMPLETE), true, `v1 ${phase} は同窓会を終えている`)
}

storage.clear()
storage.setItem(LEGACY_STORY_PHASE_STORAGE_KEY, 'after_bbs_dm')
storage.setItem(STORY_STATE_STORAGE_KEY, JSON.stringify({
  schemaVersion: 2, chapter: STORY_CHAPTERS.PROLOGUE, step: 'dm', milestones: {}, ending: null
}))
setActivePinia(createPinia())
story = useStoryStore()
assert.equal(story.chapter, STORY_CHAPTERS.PROLOGUE, 'v2 が保存済みなら v2 を優先')
assert.equal(story.step, 'dm')

// nothing writes back to the legacy key
story.dispatch(STORY_EVENTS.PROLOGUE_DM_COMPLETE)
assert.equal(storage.getItem(LEGACY_STORY_PHASE_STORAGE_KEY), 'after_bbs_dm', 'v1 は読み取り専用')

// debugSetPosition only accepts positions that exist
story = freshStore()
assert.equal(story.debugSetPosition(STORY_CHAPTERS.CH5_BASEMENT, 'entered'), true)
assert.equal(story.debugSetPosition(STORY_CHAPTERS.CH5_BASEMENT, 'nowhere'), false)
assert.equal(story.debugSetPosition('ch9', 'entered'), false)
assert.equal(story.step, 'entered')

// the legacy phase facade still reads and writes through the new state
story = freshStore()
const legacy = useGameStore()
assert.equal(legacy.phase, GAME_PHASES.PROLOGUE_DM)
legacy.setPhase(GAME_PHASES.BBS)
assert.equal(story.chapter, STORY_CHAPTERS.CH2_RECORDS_2015)
assert.equal(legacy.phase, GAME_PHASES.BBS)
legacy.completeBBS()
assert.equal(legacy.phase, GAME_PHASES.AFTER_BBS_DM)
legacy.reset()
assert.equal(legacy.phase, GAME_PHASES.PROLOGUE_DM)
assert.equal(story.step, 'dm')

// every declared position is reachable by name
for(const [chapter, steps] of Object.entries((await import('../src/story/chapters.js')).STORY_STEPS)){
  for(const step of steps) assert.equal(isKnownPosition(chapter, step), true, `${chapter}/${step}`)
}

// the milestone walk only claims what is actually on the line to a position
assert.deepEqual(milestonesUpTo(STORY_CHAPTERS.PROLOGUE, 'reunion'), {})
assert.deepEqual(milestonesUpTo(STORY_CHAPTERS.PROLOGUE, 'device_setup'), { [STORY_MILESTONES.REUNION_COMPLETE]: true })
assert.deepEqual(milestonesUpTo(STORY_CHAPTERS.PROLOGUE, 'chat_home'), {
  [STORY_MILESTONES.REUNION_COMPLETE]: true,
  [STORY_MILESTONES.DEVICE_MIGRATION_COMPLETE]: true,
  [STORY_MILESTONES.CHAT_RELOGIN_COMPLETE]: true
})
assert.deepEqual(milestonesUpTo(STORY_CHAPTERS.PROLOGUE, 'dm'), {
  [STORY_MILESTONES.REUNION_COMPLETE]: true,
  [STORY_MILESTONES.DEVICE_MIGRATION_COMPLETE]: true,
  [STORY_MILESTONES.CHAT_RELOGIN_COMPLETE]: true,
  [STORY_MILESTONES.MIZUNO_THREAD_OPENED]: true
})
assert.deepEqual(milestonesUpTo('ch99', 'nowhere'), {}, '到達できない位置は何も主張しない')
// The milestone-only marks (basement mention, search tutorial, first search,
// first message) are not on the line, so the walk collects everything else.
const MILESTONE_ONLY_COUNT = 4
assert.equal(
  Object.keys(milestonesUpTo(STORY_CHAPTERS.COMPLETE, 'done')).length,
  Object.values(STORY_MILESTONES).length - MILESTONE_ONLY_COUNT
)
assert.deepEqual(availableEvents({ chapter: STORY_CHAPTERS.PROLOGUE, step: 'reunion' }), [STORY_EVENTS.REUNION_COMPLETE])
assert.deepEqual(availableEvents({ chapter: 'ch99', step: 'nowhere' }), [])

// a debug jump can back-fill the milestones it passed, and export/import round trips
story = freshStore()
assert.equal(story.debugSetPosition(STORY_CHAPTERS.CH2_RECORDS_2015, 'bbs_opened', { syncMilestones: true }), true)
assert.equal(story.hasMilestone(STORY_MILESTONES.REUNION_COMPLETE), true)
assert.equal(story.hasMilestone(STORY_MILESTONES.BBS_OPENED), true)
assert.equal(story.hasMilestone(STORY_MILESTONES.BBS_COMPLETE), false, '通過していないmilestoneは付けない')
const exported = story.exportState()
story.resetStory()
assert.equal(story.step, 'reunion')
story.importState(exported)
assert.equal(story.step, 'bbs_opened')
assert.equal(story.hasMilestone(STORY_MILESTONES.BBS_OPENED), true)
story.importState({ chapter: 'ch99', step: 'nowhere' })
assert.equal(story.step, 'reunion', '壊れたスナップショットは初期状態へ')

// ---------------------------------------------------------------------------
// Debug console
// ---------------------------------------------------------------------------

// the console stage can show the reunion, on the same condition as the app
assert.ok(debugViewSource.includes('<ReunionScene v-if="showReunion"'))
assert.ok(debugViewSource.includes("storyState.step === 'reunion'"))
assert.ok(debugViewSource.includes('<BrowserWorkspace v-else'))
assert.ok(debugViewSource.includes('context: { story, storyState, game, browser, debug }'))
// the scene is absolutely positioned so it stays inside the console's frame
assert.ok(reunionSceneSource.includes('position:absolute'))
assert.ok(!reunionSceneSource.includes('position:fixed'))
assert.ok(appSource.includes('position:relative'))
assert.ok(debugViewSource.includes('.debug-frame__inner{position:relative'))

// the story panel drives the state through the debug API, never around it
assert.ok(debugStoryPanelSource.includes('story.dispatch(event)'))
assert.ok(debugStoryPanelSource.includes('story.debugSetPosition('))
assert.ok(debugStoryPanelSource.includes('story.availableEvents()'))
assert.ok(debugStoryPanelSource.includes('story.resetStory()'))
assert.ok(debugStoryPanelSource.includes('writeReunionProgress(line.id)'))
assert.ok(debugViewSource.includes('<DebugStoryPanel />'))

// scenarios sit on the story position, not on the legacy phase string
assert.ok(!scenariosSource.includes('GAME_PHASES'))
assert.ok(!scenariosSource.includes('story.setPhase'))
assert.ok(scenariosSource.includes('storyState.debugSetPosition'))
assert.ok(scenariosSource.includes('storyState.resetStory()'))
for(const id of ['story-reunion', 'story-reunion-memory-gap', 'story-reunion-outro', 'story-prologue-complete']){
  assert.ok(scenariosSource.includes(`id: '${id}'`), `scenario ${id}`)
}

// ---------------------------------------------------------------------------
// Reunion scene
// ---------------------------------------------------------------------------

// 8. the reunion replaces the shell only at prologue/reunion, and never in the console
assert.ok(appSource.includes('ReunionScene'))
assert.ok(appSource.includes("storyState.step === 'reunion'"))
assert.ok(appSource.includes('STORY_CHAPTERS.PROLOGUE'))
assert.ok(appSource.includes('!route.meta.debugOnly'))
assert.ok(appSource.includes('<router-view v-else />'))

// 9. the background is the image that is already in the repository
assert.ok(reunionSceneSource.includes("import izakayaBackground from '../photo/居酒屋.png'"))
assert.ok(reunionSceneSource.includes('background-size:cover'))
assert.ok(reunionSceneSource.includes('background-position:center'))
await stat(url('../src/photo/居酒屋.png'))

// 10. no person is ever drawn: no images, no portraits, no character art
assert.ok(!reunionSceneSource.includes('<img'), '人物画像を含めない')
assert.ok(!/portrait|avatar|silhouette/i.test(reunionSceneSource))
assert.ok(!reunionSceneSource.includes('photo/solo'))
for(const line of reunionScript){
  for(const key of Object.keys(line)){
    assert.ok(
      ['id', 'beat', 'speaker', 'text', 'pauseMs', 'emphasis'].includes(key),
      `reunion_prologue.json に人物画像用フィールドを作らない: ${key}`
    )
  }
}

// 11. the script is ordered, complete and unique
assert.ok(reunionScript.length >= 30)
assert.equal(new Set(reunionScript.map((line) => line.id)).size, reunionScript.length)
reunionScript.forEach((line, position) => {
  assert.equal(line.id, `reunion-${String(position + 1).padStart(3, '0')}`)
  assert.ok(line.beat && line.speaker && line.text)
})
assert.equal(reunionScript[0].text, 'この校舎ももう無くなるんだっけ。')
assert.equal(reunionScript.at(-1).text, 'なんでだよ。')
assert.ok(reunionScript.some((line) => line.text === '私、それやった記憶ないんだけど。'))
assert.deepEqual(
  [...new Set(reunionScript.map((line) => line.beat))],
  ['smalltalk', 'side_b', 'memory_gap', 'origin']
)

// 12. keyboard and pointer both advance the scene
for(const key of ["'Enter'", "' '", "'ArrowRight'"]) assert.ok(reunionSceneSource.includes(key), `key ${key}`)
assert.ok(reunionSceneSource.includes('@click="onSceneClick"'))
assert.ok(reunionSceneSource.includes("window.addEventListener('keydown', onKeydown)"))

// 13. the controls and modals swallow their own clicks
assert.ok(reunionSceneSource.includes('class="reunion__controls" @click.stop>'))
assert.ok(reunionSceneSource.includes('@click.stop="closeLog"'))
assert.ok(reunionSceneSource.includes('@click.stop="confirmSkip"'))
assert.ok(reunionSceneSource.includes('if(isModalOpen.value || outroStage.value || finishing) return'))

// 14 + 15. the skip confirmation, and both exits going through the same event
assert.ok(reunionSceneSource.includes('同窓会シーンをスキップしますか？'))
assert.ok(reunionSceneSource.includes('>スキップ<'))
assert.ok(reunionSceneSource.includes('>戻る<'))
assert.ok(reunionSceneSource.includes('story.dispatch(STORY_EVENTS.REUNION_COMPLETE)'))
assert.ok(!reunionSceneSource.includes('debugSetPosition'), 'シーンから位置を直接書き換えない')
assert.equal((reunionSceneSource.match(/story\.dispatch\(/g) || []).length, 1, '完了経路はひとつ')

// 16 + 17. progress is saved per line, and cleared when the scene is over
storage.clear()
assert.equal(readReunionProgress(), null)
assert.equal(writeReunionProgress('reunion-014'), true)
assert.equal(readReunionProgress().lineId, 'reunion-014')
assert.equal(writeReunionProgress(''), false)
assert.ok(storage.getItem(REUNION_PROGRESS_STORAGE_KEY))
clearReunionProgress()
assert.equal(readReunionProgress(), null)

storage.setItem(REUNION_PROGRESS_STORAGE_KEY, '{ broken')
assert.equal(readReunionProgress(), null, '壊れた保存は最初から扱い')
storage.setItem(REUNION_PROGRESS_STORAGE_KEY, JSON.stringify({ lineId: 'reunion-999' }))
assert.equal(reunionScript.findIndex((line) => line.id === readReunionProgress().lineId), -1)
assert.ok(reunionSceneSource.includes('return found >= 0 ? found : 0'), '存在しないlineIdは先頭から')

// resetStory removes the reunion progress too
writeReunionProgress('reunion-005')
setActivePinia(createPinia())
useStoryStore().resetStory()
assert.equal(readReunionProgress(), null)

assert.ok(reunionSceneSource.includes('writeReunionProgress(currentLine.value.id)'))
assert.ok(reunionSceneSource.includes('clearReunionProgress()'))

// 18. the closing beat: hold, fade, dim, caption, then the new phone
assert.ok(reunionSceneSource.includes('――同窓会から、数日後。'))
assert.ok(reunionSceneSource.includes('OUTRO_HOLD_MS'))
assert.ok(reunionSceneSource.includes("outroStage.value = 'timeskip'"))
const outroOrder = reunionSceneSource.indexOf('ambience.fadeOut(OUTRO_FADE_MS)')
assert.ok(outroOrder > 0 && outroOrder < reunionSceneSource.indexOf("outroStage.value = 'timeskip'"), '暗転前に音を落とす')
assert.ok(reunionSceneSource.indexOf("outroStage.value = 'timeskip'") < reunionSceneSource.indexOf('completeReunion()'))

// ---------------------------------------------------------------------------
// New phone: data migration, chat sign-in, the first message
// ---------------------------------------------------------------------------

// 34. the setup scene replaces the shell at prologue/device_setup, in the game
// and on the console stage, exactly the way the reunion does
assert.ok(appSource.includes('<DeviceSetupScene v-else-if="showDeviceSetup" />'))
assert.ok(appSource.includes("storyState.step === 'device_setup'"))
assert.ok(debugViewSource.includes('<DeviceSetupScene v-else-if="showDeviceSetup"'))
assert.ok(debugViewSource.includes("storyState.step === 'device_setup'"))
assert.ok(deviceSetupSource.includes('position:absolute'))
assert.ok(!deviceSetupSource.includes('position:fixed'))

// 35. it is a phone setting itself up, not a form: no credentials anywhere
for(const forbidden of ['type="password"', 'type="email"', 'パスワード', 'ID入力', 'ユーザー名']){
  assert.ok(!deviceSetupSource.includes(forbidden), `セットアップに認証入力を作らない: ${forbidden}`)
  assert.ok(!chatLoginSource.includes(forbidden), `再ログインに認証入力を作らない: ${forbidden}`)
}
assert.ok(!/<input/.test(deviceSetupSource))
assert.ok(!/<input/.test(chatLoginSource))

// 35b. it is a PC being set up, not a phone: the browser window the rest of the
// game happens in has to come from the machine the player just watched boot, so
// the framing must not drift back to a handset
assert.ok(deviceSetupSource.includes('新しいPCのセットアップ'))
for(const pcOnly of ['旧PC', 'このPC', 'RE:TRACE Browser', 'menubar', 'class="dock"', 'machine__lid']){
  assert.ok(deviceSetupSource.includes(pcOnly), `PCとして描く: ${pcOnly}`)
}
for(const handset of ['phone__', 'スマホ', '端末を近くに', 'app__badge']){
  assert.ok(!deviceSetupSource.includes(handset), `携帯の名残を残さない: ${handset}`)
}
// The scene hands over by opening the browser, which is where the window that
// follows comes from.
assert.ok(deviceSetupSource.includes('function openBrowser()'))
assert.ok(deviceSetupSource.includes('を開いて続ける'))

// 35c. both machines are named in one place, so the setup and the chat app can
// never disagree about what the player is sitting in front of
assert.ok(devicesSource.includes('OLD_DEVICE') && devicesSource.includes('NEW_DEVICE'))
assert.ok(deviceSetupSource.includes("from '../story/devices.js'"))
assert.ok(chatHomeSource.includes("from '../../story/devices.js'"))
assert.ok(!chatHomeSource.includes('RE-12（このPC）'), '端末名を画面側に書かない')

// 36. the account and the settings come across; the history does not
assert.ok(deviceSetupSource.includes('アカウント情報'))
assert.ok(deviceSetupSource.includes('基本設定'))
assert.ok(deviceSetupSource.includes('メッセージ履歴'))
assert.ok(deviceSetupSource.includes('skipped: true'), '履歴だけは移行されない')

// 37. both scenes report what happened and let the story decide, and both clear
// their own timers on the way out
assert.ok(deviceSetupSource.includes('story.dispatch(STORY_EVENTS.DEVICE_MIGRATION_COMPLETE)'))
assert.equal((deviceSetupSource.match(/story\.dispatch\(/g) || []).length, 1, '完了経路はひとつ')
assert.ok(!deviceSetupSource.includes('debugSetPosition'))
assert.ok(deviceSetupSource.includes('onBeforeUnmount(clearTimers)'))
assert.ok(chatLoginSource.includes('onBeforeUnmount(clearTimer)'))
assert.ok(chatLoginSource.includes('このアカウントでログイン'))
assert.ok(chatLoginSource.includes('アカウント情報を復元しています'))
assert.ok(chatLoginSource.includes('ログインしました'))
assert.ok(chatAppSource.includes('storyState.dispatch(STORY_EVENTS.CHAT_RELOGIN_COMPLETE)'))

// 38. the sign-in gate and the pending arrival are both read off the story, so
// neither replays on a reload and neither can run twice
assert.ok(chatAppSource.includes("storyState.step === 'chat_login'"))
assert.ok(chatAppSource.includes('STORY_MILESTONES.MIZUNO_FIRST_MESSAGE_RECEIVED'))
assert.ok(chatAppSource.includes('const FIRST_MESSAGE_DELAY_MS = 4200'), '検索の直後に届く')
assert.ok(chatAppSource.includes('clearTimeout(firstMessageTimer)'))
assert.ok(chatAppSource.includes('onBeforeUnmount(clearFirstMessageTimer)'))
assert.ok(chatAppSource.includes('storyState.dispatch(STORY_EVENTS.MIZUNO_FIRST_MESSAGE_RECEIVED)'))
assert.ok(chatMessagesSource.includes('この端末にはメッセージ履歴がありません'))

// 39. the thread itself is untouched: the first message is the one already in
// the script, revealed late rather than rewritten
assert.equal(prologueDm[0].from, '水野')
assert.ok(chatAppSource.includes('revealNext()'))

// ---------------------------------------------------------------------------
// Chat home: the protagonist's profile, the display name, 水野 arriving
// ---------------------------------------------------------------------------

// 40. the name is one value in the save data, with a default
assert.equal(DEFAULT_PLAYER_NAME, '主人公')
assert.equal(PLAYER_SPEAKER_ID, '主人公')
assert.equal(PLAYER_NAME_MAX_LENGTH, 20)
story = freshStore()
assert.equal(story.playerName, '主人公')
assert.equal(story.playerDisplayName, '主人公')

// 41. it is trimmed, flattened, capped, and refuses to become nothing
assert.equal(story.setPlayerName('  山田  '), true)
assert.equal(story.playerName, '山田')
assert.equal(story.setPlayerName('山田'), false, '同じ名前は書き込まない')
for(const rejected of ['', '   ', '\n', '\t\n ', null, undefined, 42, {}]){
  assert.equal(story.setPlayerName(rejected), false, `保存できない名前: ${JSON.stringify(rejected)}`)
  assert.equal(story.playerName, '山田', '拒否しても既存の名前は壊れない')
}
assert.equal(story.setPlayerName('山田\n太郎'), true)
assert.equal(story.playerName, '山田 太郎', '改行は含めない')
assert.ok(!/[\r\n]/.test(story.playerName))
assert.equal(story.setPlayerName('あ'.repeat(30)), true)
assert.equal(Array.from(story.playerName).length, PLAYER_NAME_MAX_LENGTH, '長すぎる名前は切る')
assert.equal(sanitizePlayerName('  \n  '), '')
assert.equal(resolvePlayerName(''), DEFAULT_PLAYER_NAME)
assert.equal(resolvePlayerName(null), DEFAULT_PLAYER_NAME)

// 42. only the player's own lines are renamed; every other speaker is untouched
story.setPlayerName('山田')
assert.equal(story.speakerName(PLAYER_SPEAKER_ID), '山田')
assert.equal(story.speakerName('水野'), '水野')
assert.equal(story.speakerName('中村ユイ'), '中村ユイ')
assert.equal(isPlayerSpeaker('水野'), false)
assert.equal(isPlayerSpeaker(PLAYER_SPEAKER_ID), true)

// 43. the name is saved where the story is saved — no second mechanism — and it
// survives a reload, a snapshot round trip and a damaged field
assert.equal(JSON.parse(storage.getItem(STORY_STATE_STORAGE_KEY)).playerName, '山田')
setActivePinia(createPinia())
story = useStoryStore()
assert.equal(story.playerName, '山田', 'リロードしても名前は残る')
const namedSnapshot = story.exportState()
assert.equal(namedSnapshot.playerName, '山田')
story.resetStory()
assert.equal(story.playerName, DEFAULT_PLAYER_NAME, 'リセットは既定名に戻す')
story.importState(namedSnapshot)
assert.equal(story.playerName, '山田')
storage.clear()
storage.setItem(STORY_STATE_STORAGE_KEY, JSON.stringify({
  chapter: STORY_CHAPTERS.PROLOGUE, step: 'chat_home', playerName: '   ', milestones: {}, ending: null
}))
setActivePinia(createPinia())
assert.equal(useStoryStore().playerName, DEFAULT_PLAYER_NAME, '壊れた名前は既定名として読む')

// 44. the protagonist's picture is one setting, not a path repeated per screen
assert.ok(chatAvatarsSource.includes("import playerAvatar from '../../photo/犬.png'"))
assert.ok(chatAvatarsSource.includes('export const PLAYER_AVATAR'))
await stat(url('../src/photo/犬.png'))
for(const [name, source] of [
  ['ChatApp', chatAppSource],
  ['ChatMessages', chatMessagesSource],
  ['ChatHome', chatHomeSource]
]){
  assert.ok(!source.includes('photo/犬.png'), `${name} は画像パスを直接持たない`)
}
assert.ok(chatAppSource.includes("import { MIZUNO_AVATAR, PLAYER_AVATAR } from './avatars.js'"))
assert.ok(chatAppSource.includes(':player-avatar="PLAYER_AVATAR"'))

// 45. signing in opens the home screen, and the home screen is what the story
// position says it is
assert.ok(chatAppSource.includes("storyState.step === 'chat_home'"))
assert.ok(chatAppSource.includes('<ChatHome'))
assert.ok(chatAppSource.includes('v-if="showHome"'))
assert.ok(chatHomeSource.includes('名前を変更'))
assert.ok(chatHomeSource.includes('最近の会話'))
assert.ok(chatHomeSource.includes('まだ会話がありません'))
assert.ok(chatHomeSource.includes('この端末には引き継がれていません'))
assert.ok(chatSidebarSource.includes('>ホーム<') || chatSidebarSource.includes('ホーム</span>'), 'ホームへ戻れる')

// 46. 水野 is in 最近の会話 only after he has written, and the arrival never
// navigates on the player's behalf
assert.ok(chatAppSource.includes('if(!mizunoVisible.value) return []'), '受信前は会話一覧が空')
const receiveBlock = chatAppSource.slice(
  chatAppSource.indexOf('function receiveFirstMessage()'),
  chatAppSource.indexOf('function scheduleFirstMessage()')
)
assert.ok(receiveBlock.includes('playChatNotification()'), '受信は通知する')
assert.ok(receiveBlock.includes("emit('notify-message'"))
assert.ok(!receiveBlock.includes('MIZUNO_THREAD_OPENED'), '受信でDMへ強制遷移しない')
assert.ok(chatAppSource.includes('storyState.dispatch(STORY_EVENTS.MIZUNO_THREAD_OPENED)'))
assert.ok(chatAppSource.includes('storyState.setPlayerName(name)'))

// 47. the rename dialog explains itself without threatening the player
assert.ok(chatNameDialogSource.includes('表示名を変更'))
assert.ok(chatNameDialogSource.includes(':maxlength="PLAYER_NAME_MAX_LENGTH"'))
assert.ok(chatNameDialogSource.includes('sanitizePlayerName'))
assert.ok(chatNameDialogSource.includes(':disabled="!canSave"'), '空文字は保存できない')
assert.ok(chatNameDialogSource.includes('>キャンセル<'))
assert.ok(chatNameDialogSource.includes('>変更する<'))
assert.ok(chatNameDialogSource.includes('以降の会話や一部のゲーム内表示に使用されます'))
for(const scary of ['取り返しがつきません', '本当に変更しますか', '警告', 'セーブデータに影響']){
  assert.ok(!chatNameDialogSource.includes(scary), `強い警告表現を使わない: ${scary}`)
}

// 48. the display name is drawn from the store, never compared as a literal
assert.ok(chatMessagesSource.includes('isPlayerSpeaker(message?.from)'))
assert.ok(!chatMessagesSource.includes("=== '主人公'"), '固定文字列で自分の発言を判定しない')
assert.ok(chatMessagesSource.includes('playerName'))
assert.ok(reunionSceneSource.includes('story.speakerName(currentLine.speaker)'))
assert.ok(reunionSceneSource.includes('story.speakerName(line.speaker)'))

// 49. 水野's script is untouched: same lines, same order, same link
assert.equal(prologueDm.length, 22)
assert.equal(prologueDm[0].text, '起きてる？')
assert.equal(prologueDm.at(-1).id, 'prologue-dm-022')
assert.equal(prologueDm.at(-1).text, 'これ')
for(const entry of prologueDm) assert.ok([PLAYER_SPEAKER_ID, '水野'].includes(entry.from))
assert.equal(VIRTUAL_URLS.GAME_REVIVAL, 'https://side-b.local/revival')
assert.ok(chatAppSource.includes('url: VIRTUAL_URLS.GAME_REVIVAL'))

// ---------------------------------------------------------------------------
// The search tutorial, and 水野 answering the player's first search
// ---------------------------------------------------------------------------

// 50. the monologue is the protagonist's own voice, and it teaches the search
assert.equal(searchTutorial.length, 7)
assert.equal(new Set(searchTutorial.map((line) => line.id)).size, searchTutorial.length)
searchTutorial.forEach((line, position) => {
  assert.equal(line.id, `tutorial-${String(position + 1).padStart(3, '0')}`)
  assert.equal(line.speaker, PLAYER_SPEAKER_ID, '語っているのは主人公')
  assert.ok(line.text)
  assert.ok(!/[\r\n]/.test(line.text))
})
const tutorialText = searchTutorial.map((line) => line.text).join('\n')
// It teaches the browser on an errand the player could have any day, and it
// names the exact search and the exact site, so nobody is left guessing what
// would move the story on.
for(const taught of ['TRACE Search', '検索欄', '候補', '今日の天気', 'WeatherLine', '戻る矢印']){
  assert.ok(tutorialText.includes(taught), `チュートリアルが触れる: ${taught}`)
}
assert.ok(!tutorialText.includes('SIDE-B'), '最初の検索は日常の調べ物にする')
assert.ok(searchTutorial.at(-1).text.includes('今日の天気'), '最後の行が次の一手を示す')
assert.ok(searchTutorialSource.includes('story.speakerName(currentLine.value.speaker)'), '名前は動的')

// 51. it plays once, cleans up after itself, and can be skipped
assert.ok(searchTutorialSource.includes('story.dispatch(STORY_EVENTS.SEARCH_TUTORIAL_COMPLETE)'))
assert.equal((searchTutorialSource.match(/story\.dispatch\(/g) || []).length, 1, '完了経路はひとつ')
assert.ok(!searchTutorialSource.includes('debugSetPosition'))
assert.ok(searchTutorialSource.includes('clearTimeout(openingTimer)'))
assert.ok(searchTutorialSource.includes('onBeforeUnmount'))
// Forwards and backwards, no skip: the monologue is the only place the player is
// told what to try.
assert.ok(!searchTutorialSource.includes('スキップ'))
assert.ok(searchTutorialSource.includes('戻る'))
assert.ok(searchTutorialSource.includes('次へ'))
assert.ok(searchTutorialSource.includes(':disabled="isFirstLine"'), '1行目では戻れない')
assert.ok(searchTutorialSource.includes('function goBack()'))
assert.ok(searchTutorialSource.includes('WeatherLine を開いてみよう'), 'ヒントも具体的')
// The chat home says the same thing, so a player who never leaves the Messages
// tab is still told where to go.
assert.ok(chatHomeSource.includes('v-if="searchingPhase"'))
assert.ok(chatHomeSource.includes('「今日の天気」'), 'ホームも最初の一手を示す')
// The home is a real app screen rather than a card floating in white space: two
// columns, so the window has no bare strip down the right-hand side.
assert.ok(chatHomeSource.includes('grid-template-columns:minmax(0, 1fr) minmax(232px, 268px)'))
for(const built of ['この端末', 'セキュリティ', '連絡先', 'オンライン', '移行で引き継がれた項目']){
  assert.ok(chatHomeSource.includes(built), `ホームに載せる: ${built}`)
}
assert.ok(chatAppSource.includes(':searching-phase="beforeFirstSearch"'))
// It sits over a browser the player is typing into, so it must not listen for
// keys globally: that would swallow the search box's own input.
assert.ok(!searchTutorialSource.includes('addEventListener'), 'キー入力を横取りしない')

// 52. the story marks both beats without moving the position
story = freshStore()
assert.equal(story.debugSetPosition(STORY_CHAPTERS.PROLOGUE, 'chat_home', { syncMilestones: true }), true)
assert.equal(story.hasMilestone(STORY_MILESTONES.SEARCH_TUTORIAL_SEEN), false)
assert.equal(story.dispatch(STORY_EVENTS.SEARCH_TUTORIAL_COMPLETE), true)
assert.equal(story.step, 'chat_home', 'チュートリアルは位置を動かさない')
assert.equal(story.dispatch(STORY_EVENTS.SEARCH_TUTORIAL_COMPLETE), false, '一度きり')
assert.equal(story.hasMilestone(STORY_MILESTONES.FIRST_SEARCH_PERFORMED), false)
assert.equal(story.dispatch(STORY_EVENTS.FIRST_SEARCH_PERFORMED), true)
assert.equal(story.step, 'chat_home', '検索は位置を動かさない')
assert.equal(story.dispatch(STORY_EVENTS.FIRST_SEARCH_PERFORMED), false, '初回は一度きり')

// 53. the overlay belongs to the browser window, and only while it applies
assert.ok(virtualBrowserSource.includes('<slot name="overlay" />'))
assert.ok(browserWorkspaceSource.includes('<SearchTutorial :seen="searchTutorialSeen"'))
assert.ok(browserWorkspaceSource.includes("storyState.step === 'chat_home'"))
assert.ok(browserWorkspaceSource.includes('!hasSearched.value'), '検索後は消える')

// 54. every way of searching counts, told from one place
assert.ok(browserWorkspaceSource.includes('STORY_EVENTS.FIRST_SEARCH_PERFORMED'))
assert.equal(
  (browserWorkspaceSource.match(/dispatch\(STORY_EVENTS\.FIRST_SEARCH_PERFORMED\)/g) || []).length,
  1,
  '検索の報告口はひとつ'
)
assert.ok(browserWorkspaceSource.includes('FIXED_TAB_IDS.TRACE_SEARCH'))
assert.ok(browserWorkspaceSource.includes('state?.searchQuery'))
assert.ok(browserWorkspaceSource.includes('if(!query.trim()) return'), '空の検索は数えない')

// 55. 水野 answers the search, not the clock
assert.ok(
  chatAppSource.includes('storyState.hasMilestone(STORY_MILESTONES.FIRST_SEARCH_PERFORMED)'),
  '検索前は待たない'
)
const awaitingBlock = chatAppSource.slice(
  chatAppSource.indexOf('const awaitingFirstMessage = computed('),
  chatAppSource.indexOf('// Received but not opened yet')
)
assert.ok(awaitingBlock.includes('FIRST_SEARCH_PERFORMED'))
assert.ok(awaitingBlock.includes('!storyState.hasMilestone(STORY_MILESTONES.MIZUNO_FIRST_MESSAGE_RECEIVED)'))

// ---------------------------------------------------------------------------
// Ambience
// ---------------------------------------------------------------------------

// 19. the file is in the repository
const AMBIENCE_PATH = '../src/assets/audio/reunion/restaurant_ambience.ogg'
const ambienceFile = await stat(url(AMBIENCE_PATH))
assert.ok(ambienceFile.size > 100_000, '実ファイルが同梱されている')
const header = (await readFile(url(AMBIENCE_PATH))).subarray(0, 4).toString('latin1')
assert.equal(header, 'OggS', 'Ogg コンテナ')

// 20 + 21. the licence is recorded next to it
assert.ok(audioReadme.includes('Public domain'))
assert.ok(audioReadme.includes('https://commons.wikimedia.org/wiki/File:Restaurant_ambience.ogg'))
assert.ok(audioReadme.includes('Attribution required'))
assert.ok(audioReadme.includes('Retrieved'))

// 22-29. the player itself, driven against a stub Audio element
class StubAudio {
  static instances = []
  static blocked = false
  constructor(src){
    this.src = src
    this.paused = true
    this.loop = false
    this.volume = 1
    this.currentTime = 20
    this.duration = 76.25
    this.playCalls = 0
    StubAudio.instances.push(this)
  }
  play(){
    this.playCalls += 1
    if(StubAudio.blocked) return Promise.reject(new Error('NotAllowedError'))
    this.paused = false
    return Promise.resolve()
  }
  pause(){ this.paused = true }
  load(){}
  removeAttribute(){}
}
globalThis.Audio = StubAudio

// The module imports the .ogg through Vite, which node cannot resolve, so the
// asset import is swapped for a stand-in URL and the rest runs untouched.
const patchedAudio = audioSource.replace(
  /^import ambienceUrl from .*$/m,
  "const ambienceUrl = 'stub://restaurant_ambience.ogg'"
)
assert.ok(!patchedAudio.includes('import ambienceUrl'))
const { createReunionAmbience, REUNION_AMBIENCE_VOLUME } = await import(
  `data:text/javascript;base64,${Buffer.from(patchedAudio).toString('base64')}`
)

assert.ok(REUNION_AMBIENCE_VOLUME >= 0.2 && REUNION_AMBIENCE_VOLUME <= 0.3, '初期音量 0.20〜0.30')

// 22 + 23 + 24. it plays, it loops, and it never starts twice
StubAudio.instances = []
let ambience = createReunionAmbience()
assert.equal(await ambience.fadeIn(80), true)
const element = StubAudio.instances.at(-1)
assert.equal(StubAudio.instances.length, 1)
assert.equal(element.loop, true, '短い音源なのでループする')
assert.equal(element.paused, false)
assert.ok(element.volume > 0 && element.volume <= REUNION_AMBIENCE_VOLUME, `音量 ${element.volume}`)
assert.ok(element.volume < 1, '最大音量で再生しない')

assert.equal(await ambience.fadeIn(80), true)
assert.equal(StubAudio.instances.length, 1, '二重に生成しない')
assert.equal(element.playCalls, 1, '再生中に play を呼び直さない')

// 25 + 26. the scene ending and the skip both silence it
assert.equal(await ambience.fadeOut(80), true)
assert.equal(element.paused, true)
assert.equal(element.volume, 0)

// 27 + 28. unmount tears it down and nothing survives into the browser screen
await ambience.fadeIn(40)
ambience.cleanup()
assert.equal(element.paused, true)
assert.equal(ambience.isPlaying, false)
assert.equal(await ambience.play(), false, '破棄後は再生しない')
assert.equal(StubAudio.instances.length, 1)

// 29. a browser that refuses autoplay must not break the scene
StubAudio.blocked = true
StubAudio.instances = []
ambience = createReunionAmbience()
assert.equal(await ambience.fadeIn(40), false)
assert.equal(ambience.isPlaying, false)
StubAudio.blocked = false
assert.equal(await ambience.fadeIn(40), true, '最初の操作のあとに開始できる')
assert.equal(StubAudio.instances.length, 1)
ambience.cleanup()

// no Audio at all (SSR, locked-down browser) is survivable too
delete globalThis.Audio
const silent = createReunionAmbience()
assert.equal(await silent.fadeIn(20), false)
assert.equal(await silent.fadeOut(20), false)
silent.stop()
silent.cleanup()

// the scene hands the player back a way to start it after a refusal
assert.ok(reunionSceneSource.includes('if(audioBlocked) startAmbience()'))
assert.ok(reunionSceneSource.includes('ambience.cleanup()'))
assert.ok(reunionSceneSource.includes('onBeforeUnmount'))

// none of the sounds the reunion is not allowed to make
for(const forbidden of ['bgm', 'chime', 'clock', 'glitch', 'heartbeat', 'drone', 'noise']){
  assert.ok(!new RegExp(forbidden, 'i').test(reunionSceneSource), `禁止音: ${forbidden}`)
}

// ---------------------------------------------------------------------------
// Prologue DM
// ---------------------------------------------------------------------------

// 30. the old script is gone
const dmText = JSON.stringify(prologueDm)
for(const removed of [
  '3面', '横スクロール', '呪い', 'ニュース', '掲示板', '閉校', '卒業式', '集合写真',
  '地下', '初期版', '時計', '書き込み', '翌朝', '都市伝説', 'アイコン', '卒アル'
]){
  assert.ok(!dmText.includes(removed), `旧台本の語が残っている: ${removed}`)
}

// 31. the 22 new lines, in order
assert.equal(prologueDm.length, 22)
prologueDm.forEach((entry, position) => {
  assert.equal(entry.id, `prologue-dm-${String(position + 1).padStart(3, '0')}`)
  assert.ok(entry.text)
  assert.ok(['水野', '主人公'].includes(entry.from))
  assert.equal(Object.hasOwn(entry, 'input'), false, '序章に入力ゲートは無い')
})
assert.equal(prologueDm[0].text, '起きてる？')
assert.equal(prologueDm.at(-1).text, 'これ')
assert.ok(prologueDm.some((entry) => entry.text === 'なんとなく気になって、あとで調べてたんだけど'))
assert.ok(prologueDm.some((entry) => entry.text === 'それっぽいの見つけた'))

// 22. how 水野 found the URL stays unexplained
for(const invented of ['TRACE', 'Google', 'ググ', '検索し', 'ブックマーク', '送られて', '自分で作', '自分で復刻']){
  assert.ok(!dmText.includes(invented), `入手経路を作らない: ${invented}`)
}

// 32 + 33. the thread reports completion, and opens nothing on its own
assert.ok(chatAppSource.includes("const PROLOGUE_DM_LAST_ID = 'prologue-dm-022'"))
assert.ok(chatAppSource.includes('storyState.dispatch(STORY_EVENTS.PROLOGUE_DM_COMPLETE)'))
// The link 水野 sends is the revival build, and it is the URL the virtual
// browser resolves — no second spelling of it lives in the thread.
assert.ok(chatAppSource.includes('url: VIRTUAL_URLS.GAME_REVIVAL'))
assert.ok(!/https:\/\/side-b\.local/.test(chatAppSource), 'URLは constants.js の一箇所だけ')
// Opening it still does not move the story: chapter 1 is wired separately.
assert.ok(!chatAppSource.includes('REVIVAL_LINK_RECEIVED'))
assert.ok(!chatAppSource.includes('REVIVAL_OPENED'))

console.log(
  `Story OK: ${reunionScript.length} reunion lines, ${prologueDm.length} prologue DM lines, ` +
  `state machine + reunion progress + ambience verified`
)
