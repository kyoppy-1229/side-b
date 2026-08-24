import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createPinia, setActivePinia } from 'pinia'

function createMemoryStorage(){
  const values = new Map()
  return {
    get length(){
      return values.size
    },
    key(index){
      return [...values.keys()][index] ?? null
    },
    getItem(key){
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value){
      values.set(key, String(value))
    },
    removeItem(key){
      values.delete(key)
    },
    clear(){
      values.clear()
    }
  }
}

const storage = createMemoryStorage()
globalThis.window = { localStorage: storage }

const { DEBUG_STORAGE_SCOPE, isDebugPath } = await import('../src/debug/scope.js')
const { clearScope, scopeKeys, scopedKey, setStorageScope, isSandboxed } = await import('../src/store/storage.js')
const { GAME_PHASES, useGameStore } = await import('../src/store/index.js')
const { useStoryStore } = await import('../src/store/story.js')
const { STORY_CHAPTERS } = await import('../src/story/chapters.js')
const { readReunionProgress, writeReunionProgress } = await import('../src/story/reunionProgress.js')
const { useGameSessionStore } = await import('../src/store/gameSession.js')
const { useVirtualBrowserStore } = await import('../src/store/virtualBrowser.js')
const { useDebugStore } = await import('../src/store/debug.js')
const { SCENARIOS, SCENARIO_GROUPS, SCENARIOS_BY_GROUP } = await import('../src/debug/scenarios.js')
const {
  captureState,
  restoreState,
  resetSandboxState,
  saveSnapshot,
  listSnapshots,
  deleteSnapshot
} = await import('../src/debug/sandbox.js')
const { EDITIONS, ROOM_IDS, canAccessBasement } = await import('../src/game/data/school.js')
const { VIRTUAL_PAGE_TYPES } = await import('../src/virtual-web/constants.js')
const { virtualWebSites } = await import('../src/virtual-web/sites/index.js')
const { listSitePaths, resolveSitePage } = await import('../src/virtual-web/pages.js')
const { searchVirtualWebDetailed } = await import('../src/virtual-web/searchIndex.js')

// ---- route → scope mapping ------------------------------------------------
assert.equal(isDebugPath('/debug'), true)
assert.equal(isDebugPath('/__debug/game'), true)
assert.equal(isDebugPath('/'), false)
assert.equal(isDebugPath('/revival'), false)
assert.equal(isSandboxed(), false)

// ---- the real save is written unprefixed ----------------------------------
setActivePinia(createPinia())
const realGame = useGameSessionStore()
realGame.hydrate()
realGame.start(EDITIONS.REVIVAL)
realGame.setStoryFlag('realPlaythrough', true)
const realSave = storage.getItem('side-b:game-session:v2')
assert.ok(realSave, 'the game tab persists under the unprefixed key')

// ---- the debug tab writes only inside its own namespace -------------------
setStorageScope(DEBUG_STORAGE_SCOPE)
assert.equal(isSandboxed(), true)
assert.equal(scopedKey('side-b:game-session:v2'), 'debug:side-b:game-session:v2')

setActivePinia(createPinia())
const story = useGameStore()
const storyState = useStoryStore()
const game = useGameSessionStore()
const browser = useVirtualBrowserStore()
const debug = useDebugStore()
const context = { story, storyState, game, browser, debug }

game.hydrate()
browser.initializeBrowser()

// A fresh sandbox must not inherit the real save.
assert.equal(game.sessions[EDITIONS.REVIVAL].storyFlags.realPlaythrough, undefined)
assert.equal(game.sessions[EDITIONS.REVIVAL].currentScene, 'title')

// ---- every scenario applies cleanly ---------------------------------------
assert.equal(new Set(SCENARIOS.map((scenario) => scenario.id)).size, SCENARIOS.length)
assert.equal(SCENARIOS_BY_GROUP.reduce((total, group) => total + group.scenarios.length, 0), SCENARIOS.length)
for(const scenario of SCENARIOS){
  assert.ok(SCENARIO_GROUPS.some((group) => group.id === scenario.group), `${scenario.id} has a known group`)
  assert.equal(typeof scenario.apply, 'function')
  scenario.apply(context)
  assert.ok(browser.activeTab, `${scenario.id} leaves an active tab`)
}

function applyScenario(id){
  const scenario = SCENARIOS.find((item) => item.id === id)
  assert.ok(scenario, `scenario ${id} exists`)
  scenario.apply(context)
  return scenario
}

// ---- scenarios land where they claim to ------------------------------------
// The reunion runs before the browser exists, so its scenarios are checked on
// the story position and the scene's own resume point.
applyScenario('story-reunion')
assert.equal(storyState.chapter, STORY_CHAPTERS.PROLOGUE)
assert.equal(storyState.step, 'reunion')
assert.equal(readReunionProgress(), null, '最初からは途中保存を持たない')
assert.deepEqual(storyState.milestones, {})

applyScenario('story-reunion-memory-gap')
assert.equal(storyState.step, 'reunion')
assert.equal(readReunionProgress().lineId, 'reunion-015')

applyScenario('story-reunion-outro')
assert.equal(readReunionProgress().lineId, 'reunion-030')

applyScenario('story-device-setup')
assert.equal(storyState.step, 'device_setup')
assert.equal(storyState.hasMilestone('reunionComplete'), true)
assert.equal(storyState.hasMilestone('deviceMigrationComplete'), false, '移行はこれから')

applyScenario('story-chat-login')
assert.equal(storyState.step, 'chat_login')
assert.equal(storyState.hasMilestone('deviceMigrationComplete'), true)
assert.equal(storyState.hasMilestone('chatReloginComplete'), false, 'ログインはプレイヤーが押す')

applyScenario('story-chat-home')
assert.equal(storyState.step, 'chat_home', 'ログイン後はチャットホーム')
assert.equal(storyState.hasMilestone('chatReloginComplete'), true)
assert.equal(
  storyState.hasMilestone('mizunoFirstMessageReceived'),
  false,
  '初回メッセージはホーム画面で数秒待ってから届く'
)
assert.equal(storyState.hasMilestone('mizunoThreadOpened'), false, 'スレッドはプレイヤーが開く')
assert.equal(storyState.hasMilestone('searchTutorialSeen'), false, 'チュートリアルはこれから')
assert.equal(storyState.hasMilestone('firstSearchPerformed'), false, '検索もこれから')

applyScenario('story-first-search')
assert.equal(storyState.step, 'chat_home')
assert.equal(storyState.hasMilestone('searchTutorialSeen'), true, 'チュートリアル済み')
assert.equal(storyState.hasMilestone('firstSearchPerformed'), false, '検索するとここから水野が動く')
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.TRACE_SEARCH)

applyScenario('story-prologue')
assert.equal(storyState.step, 'dm')
assert.equal(storyState.hasMilestone('chatReloginComplete'), true)
assert.equal(storyState.hasMilestone('mizunoThreadOpened'), true, '水野のスレッドを開いた状態')
assert.equal(storyState.hasMilestone('reunionComplete'), true, 'ジャンプ先までのmilestoneが補完される')
assert.equal(readReunionProgress(), null, '同窓会を抜けたら途中保存は残さない')

applyScenario('story-prologue-complete')
assert.equal(storyState.step, 'dm_complete')
assert.equal(storyState.hasMilestone('prologueDmComplete'), true)
assert.equal(storyState.canOpenRevival, false, 'デバッグジャンプでも復刻版は解放しない')

applyScenario('story-bbs')
assert.equal(storyState.chapter, STORY_CHAPTERS.CH2_RECORDS_2015)
assert.equal(storyState.step, 'bbs_opened')
assert.equal(story.phase, GAME_PHASES.BBS, '旧フェーズ表示は新しい位置から導出される')
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.WEB_SITE)
assert.equal(browser.activeTab.state.siteId, 'minna-bbs')
assert.equal(browser.activeTab.state.path, '/archive/private/20150307')

applyScenario('story-search')
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.TRACE_SEARCH)
assert.equal(browser.currentPageState.searchQuery, 'SIDE-B 2015')

applyScenario('story-after-bbs-read')
assert.equal(storyState.chapter, STORY_CHAPTERS.CH3_BLUE_BIRDS)
assert.equal(story.phase, GAME_PHASES.AFTER_BBS_DM)
assert.equal(debug.chatCommand, 'reveal')
assert.ok(debug.chatTick > 0)
// The reveal has to survive the stage remount that follows an apply.
assert.equal(debug.autoRevealChat, true)
applyScenario('story-after-bbs')
assert.equal(debug.autoRevealChat, false)
assert.equal(debug.chatCommand, 'restart')

applyScenario('revival-explored')
assert.equal(game.activeEdition, EDITIONS.REVIVAL)
assert.equal(game.sessions[EDITIONS.REVIVAL].visited.length, 18)

applyScenario('revival-basement-denied')
assert.equal(game.sessions[EDITIONS.REVIVAL].basementUnlocked, false, '復刻版は地下を解放できない')
assert.equal(canAccessBasement(game.sessions[EDITIONS.REVIVAL], EDITIONS.REVIVAL), false)

applyScenario('original-basement-access')
assert.equal(game.activeEdition, EDITIONS.ORIGINAL)
assert.equal(game.sessions[EDITIONS.ORIGINAL].currentFloor, 'B1')
assert.equal(game.sessions[EDITIONS.ORIGINAL].currentScene, 'corridor')

applyScenario('original-basement-room')
assert.equal(game.sessions[EDITIONS.ORIGINAL].roomId, 'B1-03')

applyScenario('original-anomaly-max')
assert.equal(game.sessions[EDITIONS.ORIGINAL].anomalyLevel, 4)
assert.equal(game.sessions[EDITIONS.ORIGINAL].storyFlags.anomalyPhase, true)
assert.equal(game.sessions[EDITIONS.ORIGINAL].clockState['clock-2f-hall'], 'stopped')

applyScenario('original-basement-locked')
assert.equal(game.sessions[EDITIONS.ORIGINAL].currentFloor, '1F', '地下が閉じたらB1から追い出される')

applyScenario('web-error')
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.ERROR)

// ---- 一般Web -----------------------------------------------------------
applyScenario('gweb-portal')
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.WEB_SITE)
assert.equal(browser.activeTab.state.siteId, 'naviweb')
assert.equal(browser.activeTab.state.path, '/')

applyScenario('gweb-news-2015')
assert.equal(browser.activeTab.state.siteId, 'houkago-log')
assert.ok(browser.openTabs.some((tab) => tab.state?.path === '/articles/2015/school-windows7'))

applyScenario('gweb-templates')
const templateTabs = new Set(browser.openTabs.map((tab) => tab.state?.siteId).filter(Boolean))
assert.ok(templateTabs.size >= 7, '一般Webのテンプレート確認タブが揃う')

applyScenario('gweb-search-era')
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.TRACE_SEARCH)
assert.equal(browser.currentPageState.searchQuery, '学校 パソコン 2015')

applyScenario('gweb-search-story')
assert.equal(browser.currentPageState.searchQuery, 'SIDE-B')
const storyProbe = searchVirtualWebDetailed('SIDE-B')
assert.equal(storyProbe.webResults.filter((result) => !result.partial).length, 0, '一般Webは本編語句に反応しない')
assert.equal(storyProbe.storyResults.length, 0, '非公開BBSはSIDE-B検索からも到達できない')
assert.ok(searchVirtualWebDetailed('卒業式 青い鳥').storyResults.length > 0, '公開対象の本編保存記録は検索できる')

applyScenario('gweb-closed')
assert.equal(browser.activeTab.state.siteId, 'web-keeper')
assert.ok(browser.openTabs.some((tab) => tab.state?.siteId === 'yozora-note'))

applyScenario('gweb-notfound')
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.ERROR)
assert.ok(
  browser.openTabs.some((tab) => tab.pageType === VIRTUAL_PAGE_TYPES.WEB_SITE && tab.state?.notFound),
  '既知ドメインの存在しないパスはサイト側の404で開く'
)

applyScenario('gweb-archive')
assert.equal(browser.activeTab.state.path, '/search')
assert.equal(browser.activeTab.state.query.q, '学校')
browser.closeExtraTabs()

// ---- the general-web panel reads the same data the pages resolve from -------
const panelSites = virtualWebSites.filter((site) => listSitePaths(site).length > 0)
assert.equal(panelSites.length, virtualWebSites.length, 'すべてのサイトがページ一覧を返す')
for(const site of virtualWebSites.slice(0, 5)){
  for(const path of listSitePaths(site).slice(0, 6)){
    assert.ok(resolveSitePage(site, path), `${site.domain}${path} が解決できる`)
  }
}

applyScenario('web-many-tabs')
assert.ok(browser.openTabs.length >= 8)
browser.closeExtraTabs()
assert.equal(browser.openTabs.length, 2)

// ---- patches stay inside the rules ----------------------------------------
game.selectEdition(EDITIONS.REVIVAL)
game.patchSession({ currentScene: 'room', roomId: 'B1-01', anomalyLevel: 9 }, EDITIONS.REVIVAL)
assert.notEqual(game.sessions[EDITIONS.REVIVAL].roomId, 'B1-01', '入れない部屋へのパッチは補正される')
assert.equal(game.sessions[EDITIONS.REVIVAL].anomalyLevel, 4)
game.setVisitedRooms([...ROOM_IDS, 'NOPE'], EDITIONS.REVIVAL)
assert.equal(game.sessions[EDITIONS.REVIVAL].visited.length, ROOM_IDS.length)

// ---- snapshot round trip ---------------------------------------------------
applyScenario('original-basement-room')
const snapshot = captureState(context)
assert.equal(snapshot.story.chapter, STORY_CHAPTERS.CH3_BLUE_BIRDS)
assert.ok(snapshot.story.milestones.bbsComplete)
const saved = saveSnapshot('地下', snapshot)
assert.equal(listSnapshots().length, 1)

applyScenario('story-prologue')
assert.equal(story.phase, GAME_PHASES.PROLOGUE_DM)
assert.equal(storyState.step, 'dm')
assert.equal(game.sessions[EDITIONS.ORIGINAL].currentScene, 'title')

restoreState(snapshot, context)
assert.equal(storyState.chapter, STORY_CHAPTERS.CH3_BLUE_BIRDS)
assert.equal(storyState.step, 'bird_prompt')
assert.equal(storyState.hasMilestone('bbsComplete'), true, 'milestoneごと戻る')
assert.equal(game.activeEdition, EDITIONS.ORIGINAL)
assert.equal(game.sessions[EDITIONS.ORIGINAL].roomId, 'B1-03')
assert.equal(deleteSnapshot(saved.id).length, 0)

// a mid-reunion snapshot reopens on the same line
applyScenario('story-reunion-memory-gap')
const reunionSnapshot = captureState(context)
assert.equal(reunionSnapshot.reunionProgress.lineId, 'reunion-015')
applyScenario('story-prologue')
assert.equal(readReunionProgress(), null)
restoreState(reunionSnapshot, context)
assert.equal(storyState.step, 'reunion')
assert.equal(readReunionProgress().lineId, 'reunion-015')

// v1 snapshots, which only carried the old phase string, still restore
restoreState({ version: 1, phase: GAME_PHASES.BBS }, context)
assert.equal(storyState.chapter, STORY_CHAPTERS.CH2_RECORDS_2015)
assert.equal(storyState.hasMilestone('bbsOpened'), true)
assert.equal(readReunionProgress(), null, '同窓会を含まないスナップショットは途中保存を消す')

// a snapshot describing a position that no longer exists restores as a fresh story
restoreState({ version: 2, story: { chapter: 'ch99', step: 'nowhere' } }, context)
assert.equal(storyState.chapter, STORY_CHAPTERS.PROLOGUE)
assert.equal(storyState.step, 'reunion')

// the console can drive the story by event, and cannot skip with a wrong one
storyState.resetStory()
assert.equal(storyState.availableEvents().length, 1)
assert.equal(storyState.dispatch(storyState.availableEvents()[0]), true)
assert.equal(storyState.step, 'device_setup')
assert.equal(storyState.dispatch('BBS_COMPLETE'), false)
assert.equal(storyState.step, 'device_setup')

// resetting the sandbox clears the reunion's own progress key too
writeReunionProgress('reunion-007')
resetSandboxState(context)
assert.equal(storyState.step, 'reunion')
assert.equal(readReunionProgress(), null)

// ---- isolation, verified from the storage layer ----------------------------
const sandboxKeys = scopeKeys()
assert.ok(sandboxKeys.includes('side-b:game-session:v2'))
assert.ok(sandboxKeys.every((key) => storage.getItem(`debug:${key}`) !== null))
assert.equal(storage.getItem('side-b:game-session:v2'), realSave, '本編のセーブはデバッグ操作で書き換わらない')

const removed = clearScope()
assert.ok(removed >= 3)
assert.equal(scopeKeys().length, 0)
assert.equal(storage.getItem('side-b:game-session:v2'), realSave, 'サンドボックス消去は本編を消さない')

setStorageScope('')
assert.deepEqual(scopeKeys(), ['side-b:game-session:v2'])

// ---- rail entries and panel sections stay in sync ---------------------------
const debugView = await readFile(new URL('../src/views/GameDebugView.vue', import.meta.url), 'utf8')
const panelSources = await Promise.all([
  'DebugScenarioPanel',
  'DebugStoryPanel',
  'DebugBrowserPanel',
  'DebugWebPanel',
  'DebugGamePanel',
  'DebugStatePanel'
].map(async (name) => {
  assert.ok(debugView.includes(`<${name} />`), `${name} が sidebar に配置されている`)
  return readFile(new URL(`../src/components/debug/${name}.vue`, import.meta.url), 'utf8')
}))

const panelSectionIds = new Set(panelSources.flatMap((source) => [...source.matchAll(/<DebugSection\s+id="([^"]+)"/g)].map((match) => match[1])))
const railIds = [...debugView.matchAll(/\{ id: '([^']+)', icon:/g)].map((match) => match[1])
assert.ok(railIds.length >= panelSectionIds.size, 'サイドメニューの項目がパネルより少なくない')
for(const id of railIds) assert.ok(panelSectionIds.has(id), `サイドメニューの ${id} に対応するセクションがある`)
for(const id of panelSectionIds) assert.ok(railIds.includes(id), `セクション ${id} がサイドメニューに載っている`)

console.log(`Debug console OK: ${SCENARIOS.length} scenarios across ${SCENARIO_GROUPS.length} groups, ${railIds.length} sections, sandbox isolation verified`)
