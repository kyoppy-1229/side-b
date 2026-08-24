// Covers the trial edition (#/trial): the mode itself, its storage isolation,
// the required memories behind the revival build's clear condition, the trial's
// own story flow, what it refuses to hand out, and the wording of the screens
// the player reads.
//
// The Vue components are not mounted (there is no DOM here), so anything that
// only exists in a template is asserted against the source file. Everything with
// real logic — the mode, the storage scope, the memory table, the state machine,
// the search filter — is exercised for real.

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
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
globalThis.window = {
  localStorage: storage,
  location: { hash: '', pathname: '/side-b/' }
}

const {
  GAME_MODES,
  TRIAL_PATH,
  TRIAL_STORAGE_SCOPE,
  getGameMode,
  isTrialMode,
  isTrialPath,
  isTrialLocation,
  normalizeTrialLocation,
  applyDefaultEntry,
  TRIAL_IS_DEFAULT_ENTRY,
  resolveGameMode,
  setGameMode
} = await import('../src/trial/mode.js')
const {
  TRIAL_REQUIRED_MEMORIES,
  TRIAL_REQUIRED_MEMORY_IDS,
  isTrialRequiredMemoryId,
  isTrialRevivalComplete,
  trialInteractionText,
  trialMemoryIdFor,
  trialMemoryLocation,
  trialMemoryProgress
} = await import('../src/trial/memories.js')
const {
  TRIAL_BLOCKED_URLS,
  TRIAL_HIDDEN_SEARCH_DOCUMENT_IDS,
  filterTrialSearchDocuments,
  isUrlBlockedInTrial
} = await import('../src/trial/restrictions.js')
const {
  TRIAL_MILESTONES,
  canOpenTrialArchive,
  canOpenTrialRevival,
  completeTrialRevival,
  isTrialAfterRevivalChat,
  isTrialBbsFound,
  isTrialComplete,
  isTrialRevivalCleared,
  markTrialBbsFound,
  markTrialComplete,
  openTrialRevival
} = await import('../src/trial/flow.js')
const { DEBUG_STORAGE_SCOPE } = await import('../src/debug/scope.js')
const {
  clearScope,
  scopeKeys,
  scopedKey,
  setStorageScope
} = await import('../src/store/storage.js')
const { STORY_CHAPTERS } = await import('../src/story/chapters.js')
const { STORY_EVENTS } = await import('../src/story/events.js')
const { STORY_MILESTONES } = await import('../src/story/transitions.js')
const { STORY_STATE_STORAGE_KEY, useStoryStore } = await import('../src/store/story.js')
const { EDITIONS, FLOOR_DEFINITIONS, ROOM_DEFINITIONS } = await import('../src/game/data/school.js')
const {
  MEMORY_DEFINITIONS,
  getInteractionText,
  getMemoryCatalogue,
  getRoomObjects
} = await import('../src/game/data/editions.js')
const { VIRTUAL_URLS } = await import('../src/virtual-web/constants.js')
const { searchStoryDocuments, virtualWebDocuments } = await import('../src/virtual-web/searchIndex.js')

const url = (path) => new URL(path, import.meta.url)
const readSource = (path) => readFile(url(path), 'utf8')

const trialScript = JSON.parse(await readSource('../src/data/trial_dm_after_revival.json'))
const afterBbsScript = JSON.parse(await readSource('../src/data/dm_after_bbs.json'))
const bootSource = await readSource('../src/boot.js')
const routerSource = await readSource('../src/router.js')
const appSource = await readSource('../src/App.vue')
const trialEndSource = await readSource('../src/views/TrialEndScene.vue')
const gamePageSource = await readSource('../src/components/game/GamePage.vue')
const sceneStageSource = await readSource('../src/components/game/SceneStage.vue')
const chatAppSource = await readSource('../src/components/chat/ChatApp.vue')
const browserWorkspaceSource = await readSource('../src/views/BrowserWorkspace.vue')
const virtualBrowserStoreSource = await readSource('../src/store/virtualBrowser.js')
const notFoundSource = await readSource('../public/404.html')

function freshStory(){
  storage.clear()
  setActivePinia(createPinia())
  return useStoryStore()
}

// Walk the shared prologue exactly the way the player does.
function playPrologue(story){
  story.dispatch(STORY_EVENTS.REUNION_COMPLETE)
  story.dispatch(STORY_EVENTS.DEVICE_MIGRATION_COMPLETE)
  story.dispatch(STORY_EVENTS.CHAT_RELOGIN_COMPLETE)
  story.dispatch(STORY_EVENTS.FIRST_SEARCH_PERFORMED)
  story.dispatch(STORY_EVENTS.MIZUNO_FIRST_MESSAGE_RECEIVED)
  story.dispatch(STORY_EVENTS.MIZUNO_THREAD_OPENED)
  story.dispatch(STORY_EVENTS.PROLOGUE_DM_COMPLETE)
  return story
}

// ---------------------------------------------------------------------------
// 1. the mode, and where it comes from
// ---------------------------------------------------------------------------

assert.deepEqual(Object.values(GAME_MODES), ['full', 'trial'])
assert.equal(TRIAL_PATH, '/trial')
// The default is the whole work: a build that never calls setGameMode (SSR, the
// check scripts, the debug console) is the full game.
assert.equal(getGameMode(), GAME_MODES.FULL)
assert.equal(isTrialMode(), false)

for(const path of ['/trial', '/trial/', '/trial?x=1']) assert.equal(isTrialPath(path), true, path)
for(const path of ['/', '/revival', '/debug', '/trials', '/x/trial', '']) assert.equal(isTrialPath(path), false, path)

// Read from the hash first — that is what the router uses …
window.location.hash = '#/trial'
assert.equal(isTrialLocation(), true)
assert.equal(resolveGameMode(), GAME_MODES.TRIAL)
window.location.hash = '#/'
assert.equal(isTrialLocation(), false)
assert.equal(resolveGameMode(), GAME_MODES.FULL)

// … and fall back to the path, which is how `<base>/trial` arrives.
window.location.hash = ''
window.location.pathname = '/side-b/trial'
assert.equal(isTrialLocation(), true)
assert.equal(normalizeTrialLocation(), true)
assert.equal(window.location.hash, TRIAL_PATH, 'ルーターが読む前にハッシュへ移す')
assert.equal(normalizeTrialLocation(), false, 'ハッシュがあるなら触らない')
window.location.hash = ''
window.location.pathname = '/side-b/'
assert.equal(isTrialLocation(), false)
assert.equal(normalizeTrialLocation(), false)

// 【暫定】ハッシュのない入口（`<base>/`）は体験版へ送る。
assert.equal(TRIAL_IS_DEFAULT_ENTRY, true, '公開中の入口は体験版')
window.location.hash = ''
window.location.pathname = '/side-b/'
assert.equal(applyDefaultEntry(), true)
assert.equal(window.location.hash, TRIAL_PATH, '入口は体験版に寄せる')
assert.equal(resolveGameMode(), GAME_MODES.TRIAL)
// ハッシュ付きのアクセスには触らない — 本編もデバッグコンソールもそのまま。
for(const hash of ['#/', '#/debug', '#/bbs']){
  window.location.hash = hash
  assert.equal(applyDefaultEntry(), false, hash)
  assert.equal(window.location.hash, hash, hash)
}
window.location.hash = '#/'
assert.equal(resolveGameMode(), GAME_MODES.FULL, '本編は #/ で開ける')

// The mode is decided once, at boot, and read everywhere else.
assert.ok(bootSource.includes('normalizeTrialLocation()'))
assert.ok(bootSource.includes('applyDefaultEntry()'))
assert.ok(bootSource.includes('setGameMode('))
assert.ok(bootSource.includes('TRIAL_STORAGE_SCOPE'))
assert.ok(bootSource.includes('isDebugLocation()'))
// The debug console always inspects the full game.
assert.ok(bootSource.includes('debug ? GAME_MODES.FULL : resolveGameMode()'))

// Nobody reads the location for themselves.
for(const [name, source] of [
  ['GamePage', gamePageSource],
  ['ChatApp', chatAppSource],
  ['BrowserWorkspace', browserWorkspaceSource],
  ['App', appSource],
  ['TrialEndScene', trialEndSource],
  ['virtualBrowser', virtualBrowserStoreSource]
]){
  assert.ok(!source.includes('location.pathname'), `${name} はURLを直接見ない`)
  assert.ok(!source.includes("includes('/trial')"), `${name} はURLを直接見ない`)
}

// ---------------------------------------------------------------------------
// 2. the route
// ---------------------------------------------------------------------------

assert.ok(routerSource.includes("path: '/trial'"))
assert.ok(routerSource.includes("name: 'trial'"))
assert.ok(routerSource.includes('component: BrowserWorkspace'))
// Crossing into or out of the trial reboots the tab, because the storage scope
// is fixed at boot.
assert.ok(routerSource.includes('function storageScopeForPath(path)'))
assert.ok(routerSource.includes('isTrialPath(path)) return TRIAL_STORAGE_SCOPE'))
assert.ok(routerSource.includes('storageScopeForPath(to.path) === storageScopeForPath(from.path)'))
assert.ok(routerSource.includes('requestBoot(to.fullPath)'))
// The full game's routes are untouched.
for(const path of ["path: '/'", "path: '/bbs'", "path: '/revival'", "path: '/original'", "path: '/debug'"]){
  assert.ok(routerSource.includes(path), `既存ルート: ${path}`)
}

// The deployed site answers `<base>/trial` too.
assert.ok(notFoundSource.includes("'#/trial'"))
assert.ok(notFoundSource.includes('location.replace'))

// ---------------------------------------------------------------------------
// 3. save data: three separate namespaces, and 「最初から」
// ---------------------------------------------------------------------------

assert.equal(TRIAL_STORAGE_SCOPE, 'trial')
assert.notEqual(TRIAL_STORAGE_SCOPE, DEBUG_STORAGE_SCOPE)

storage.clear()
setStorageScope('')
storage.setItem(STORY_STATE_STORAGE_KEY, JSON.stringify({ chapter: STORY_CHAPTERS.CH4_ORIGINAL, step: 'unlocked', milestones: {} }))
const fullSave = storage.getItem(STORY_STATE_STORAGE_KEY)

setStorageScope(TRIAL_STORAGE_SCOPE)
assert.equal(scopedKey(STORY_STATE_STORAGE_KEY), `trial:${STORY_STATE_STORAGE_KEY}`)
// A player who has finished the full game still starts the trial at the reunion.
setActivePinia(createPinia())
let story = useStoryStore()
assert.equal(story.chapter, STORY_CHAPTERS.PROLOGUE)
assert.equal(story.step, 'reunion')

// Playing the trial does not touch the full save.
setGameMode(GAME_MODES.TRIAL)
playPrologue(story)
assert.equal(storage.getItem(STORY_STATE_STORAGE_KEY), fullSave, '通常版のセーブは書き換わらない')
assert.ok(storage.getItem(`trial:${STORY_STATE_STORAGE_KEY}`), '体験版は自分の名前空間に保存する')

// 「最初から」 wipes the trial namespace and nothing else.
storage.setItem('trial:side-b:game-session:v2', '{}')
assert.ok(scopeKeys().includes(STORY_STATE_STORAGE_KEY))
assert.ok(clearScope() >= 2)
assert.deepEqual(scopeKeys(), [])
assert.equal(storage.getItem(STORY_STATE_STORAGE_KEY), fullSave, 'リセットは通常版を消さない')
setStorageScope('')
assert.equal(scopeKeys().length >= 1, true)

// ---------------------------------------------------------------------------
// 4. the required memories: one table behind list, progress and clear check
// ---------------------------------------------------------------------------

setGameMode(GAME_MODES.TRIAL)
assert.equal(TRIAL_REQUIRED_MEMORIES.length, 5)
assert.equal(new Set(TRIAL_REQUIRED_MEMORY_IDS).size, TRIAL_REQUIRED_MEMORIES.length)

const requiredFloors = new Set()
for(const entry of TRIAL_REQUIRED_MEMORIES){
  const room = ROOM_DEFINITIONS[entry.roomId]
  assert.ok(room, `${entry.id}: 部屋が存在する`)
  assert.notEqual(room.floor, 'B1', `${entry.id}: 復刻版で入れない階には置かない`)
  requiredFloors.add(room.floor)

  // The object really is there, and really is examinable, in the revival build.
  const objects = getRoomObjects(entry.roomId, EDITIONS.REVIVAL)
  const matches = objects.filter((object) => (object.interactionTextId || object.id) === entry.interactionTextId)
  assert.ok(matches.length >= 1, `${entry.id}: 対象オブジェクトが部屋にある`)
  assert.ok(matches.every((object) => object.interactable), `${entry.id}: 調べられる`)
  // Whichever of the identical desks/PCs the player walks up to records it.
  assert.ok(matches.every((object) => object.memoryId === entry.id), `${entry.id}: どれを調べても記録される`)

  // The catalogue of the full game does not know about them, and must not.
  assert.equal(MEMORY_DEFINITIONS.some((memory) => memory.id === entry.id), false, `${entry.id}: 通常版の一覧には出さない`)
  assert.equal(isTrialRequiredMemoryId(entry.id), true)
}
assert.deepEqual([...requiredFloors].sort(), ['1F', '2F', '3F'], '3つの階に散らす')

// 「1階・図書室」まで。部屋より細かい情報は文字列に含まれない。
for(const entry of TRIAL_REQUIRED_MEMORIES){
  const location = trialMemoryLocation(entry)
  const room = ROOM_DEFINITIONS[entry.roomId]
  assert.equal(location, `${FLOOR_DEFINITIONS[room.floor].name}・${room.name}`)
  assert.match(location, /^[123]階・.+$/)
  assert.ok(!location.includes(entry.roomId), 'Room IDは見せない')
  // No object, furniture, photo or person can be read out of the hint.
  for(const object of getRoomObjects(entry.roomId, EDITIONS.REVIVAL)){
    assert.ok(!location.includes(object.label), `場所ヒントに物の名前を出さない: ${object.label}`)
  }
}

// Progress: only the required set counts, and only once each.
const emptySession = { memories: [] }
assert.deepEqual(
  trialMemoryProgress(emptySession).entries.map((entry) => entry.recorded),
  [false, false, false, false, false]
)
assert.equal(trialMemoryProgress(emptySession).recorded, 0)
assert.equal(trialMemoryProgress(emptySession).complete, false)

// Optional memories and ordinary objects never move the counter.
const optionalOnly = { memories: ['memory:class-photo', 'memory:school-history', 'memory:school-news', 'memory:class-life'] }
assert.equal(trialMemoryProgress(optionalOnly).recorded, 0, '任意の思い出は進捗に入らない')
assert.equal(trialMemoryProgress(optionalOnly).complete, false)
assert.equal(isTrialRevivalComplete(optionalOnly), false)

const partial = { memories: [TRIAL_REQUIRED_MEMORY_IDS[0], TRIAL_REQUIRED_MEMORY_IDS[0], TRIAL_REQUIRED_MEMORY_IDS[2]] }
assert.equal(trialMemoryProgress(partial).recorded, 2, '同じ思い出は二重に数えない')
assert.equal(trialMemoryProgress(partial).remaining, 3)
assert.equal(trialMemoryProgress(partial).complete, false)

// Every required memory and nothing else: cleared, even with no optional ones.
const cleared = { memories: [...TRIAL_REQUIRED_MEMORY_IDS] }
assert.equal(trialMemoryProgress(cleared).recorded, 5)
assert.equal(trialMemoryProgress(cleared).complete, true)
assert.equal(isTrialRevivalComplete(cleared), true)
// The list and the check are the same numbers.
assert.equal(trialMemoryProgress(cleared).total, TRIAL_REQUIRED_MEMORIES.length)

// ---------------------------------------------------------------------------
// 5. what the player reads while exploring
// ---------------------------------------------------------------------------

const PEOPLE = ['水野', '田中', '山田', '中村', '鈴木', '佐藤', '小川', '本田', '林ミサキ', 'ヒロキ']
const FORBIDDEN_TOPICS = ['青い鳥', '地下', '事件', '20:20', '初期版', '掲示板']

for(const entry of TRIAL_REQUIRED_MEMORIES){
  // 通常描写 → 主人公自身の短い言葉。
  const text = trialInteractionText(entry.roomId, entry.interactionTextId, EDITIONS.REVIVAL)
  assert.ok(text.includes('\n\n'), `${entry.id}: 描写と主人公の言葉を分ける`)
  const [description, voice] = text.split('\n\n')
  assert.equal(description, entry.description)
  assert.equal(voice, entry.voice)
  assert.ok(voice.startsWith('「') && voice.endsWith('」'), `${entry.id}: 主人公の発言だと分かる`)
  assert.ok(voice.length <= 30, `${entry.id}: 主人公の言葉は短く`)
  for(const person of PEOPLE) assert.ok(!text.includes(person), `${entry.id}: 人物名を出さない: ${person}`)
  for(const topic of FORBIDDEN_TOPICS) assert.ok(!text.includes(topic), `${entry.id}: 説明しすぎない: ${topic}`)
}

// Everything else in the school stays an ordinary school memory: no person is
// named, and nothing claims whose memory it is.
let ordinaryTexts = 0
for(const roomId of Object.keys(ROOM_DEFINITIONS)){
  for(const object of getRoomObjects(roomId, EDITIONS.REVIVAL)){
    if(!object.interactable) continue
    const textId = object.interactionTextId || object.id
    if(trialMemoryIdFor(roomId, textId, EDITIONS.REVIVAL)) continue
    const text = getInteractionText(textId, EDITIONS.REVIVAL, { object })
    ordinaryTexts += 1
    for(const person of PEOPLE) assert.ok(!text.includes(person), `${roomId}/${object.id}: 人物名を出さない`)
    assert.ok(!text.includes('「'), `${roomId}/${object.id}: 必須以外に主人公の発言は付けない`)
    assert.ok(!text.includes('青い鳥'), `${roomId}/${object.id}: 青い鳥を出さない`)
  }
}
assert.ok(ordinaryTexts > 100)

// The stage draws the protagonist's line as his own voice.
assert.ok(sceneStageSource.includes('dialogLines'))
assert.ok(sceneStageSource.includes("line.startsWith('「')"))
assert.ok(sceneStageSource.includes("'is-voice'"))

// ---------------------------------------------------------------------------
// 6. the 思い出 list, and the clear screen
// ---------------------------------------------------------------------------

assert.ok(gamePageSource.includes('探索完了条件'))
assert.ok(gamePageSource.includes('必須の思い出をすべて確認する'))
assert.ok(gamePageSource.includes('trialProgress.recorded }} / {{ trialProgress.total'))
assert.ok(gamePageSource.includes('entry.location'))
assert.ok(gamePageSource.includes("entry.recorded ? '確認済み' : '未確認'"))
// The trial's list never draws a title, a source or the text of a memory.
const trialListBlock = gamePageSource.slice(
  gamePageSource.indexOf('<template v-if="isTrial">'),
  gamePageSource.indexOf('<template v-else>')
)
for(const leak of ['memory.title', 'memory.source', 'memory.text', 'memory-source']){
  assert.ok(!trialListBlock.includes(leak), `一覧に出さない: ${leak}`)
}
// The full game's list is still the one it was.
assert.ok(gamePageSource.includes('{{ memory.title }}'))
assert.ok(gamePageSource.includes('「？」のついたものを調べると、ここに残っていく。'))

// The clear screen is quiet, and it is not a score screen.
assert.ok(gamePageSource.includes('校舎を一通り見て回った'))
for(const gamey of ['MISSION COMPLETE', 'コンプリート', 'CLEAR!', '達成率', 'スコア']){
  assert.ok(!gamePageSource.includes(gamey), `演出を派手にしない: ${gamey}`)
}
// 最後の必須思い出 → 少し間 → クリア演出 → そのあと通知。
assert.ok(gamePageSource.includes('const TRIAL_CLEAR_DELAY_MS = 1500'))
assert.ok(gamePageSource.includes('const TRIAL_NOTICE_DELAY_MS = 2600'))
assert.ok(gamePageSource.includes('trialProgress.value.complete'))
assert.ok(gamePageSource.includes('completeTrialRevival(storyState)'))
assert.ok(gamePageSource.includes('openTrialRevival(storyState)'))
assert.ok(gamePageSource.includes('clearTrialTimers()'))
assert.ok(gamePageSource.includes('onBeforeUnmount'))

// ---------------------------------------------------------------------------
// 7. the trial's story flow
// ---------------------------------------------------------------------------

setStorageScope(TRIAL_STORAGE_SCOPE)
setGameMode(GAME_MODES.TRIAL)
story = freshStory()

// The build is not reachable before 水野 has sent it.
assert.equal(canOpenTrialRevival(story), false)
assert.equal(openTrialRevival(story), false)
assert.equal(story.chapter, STORY_CHAPTERS.PROLOGUE)

playPrologue(story)
assert.equal(story.step, 'dm_complete')
assert.equal(canOpenTrialRevival(story), true)

// Opening it walks chapter 1, and doing it twice changes nothing.
assert.equal(openTrialRevival(story), true)
assert.equal(story.chapter, STORY_CHAPTERS.CH1_REVIVAL)
assert.equal(story.step, 'exploring')
assert.equal(openTrialRevival(story), true)
assert.equal(story.step, 'exploring')
assert.equal(isTrialRevivalCleared(story), false)
assert.equal(isTrialAfterRevivalChat(story), false)

// Clearing the build is what makes 水野 write.
assert.equal(canOpenTrialArchive(story), false, '水野が書く前に保存ログは開かない')
assert.equal(completeTrialRevival(story), true)
assert.equal(story.step, 'exploration_complete')
assert.equal(isTrialRevivalCleared(story), true)
assert.equal(isTrialAfterRevivalChat(story), true)
assert.equal(completeTrialRevival(story), false, 'クリアは一度きり')

// From here the saved log answers — nobody handed the address over, so finding
// it is the player's own work. Opening it is recorded, and it moves no chapter.
assert.equal(canOpenTrialArchive(story), true)
assert.equal(isTrialBbsFound(story), false)
assert.equal(markTrialBbsFound(story), true)
assert.equal(isTrialBbsFound(story), true)
assert.equal(markTrialBbsFound(story), false, '記録は一度きり')
assert.equal(story.chapter, STORY_CHAPTERS.CH1_REVIVAL, '保存ログを読んでも章は動かない')
assert.equal(story.step, 'exploration_complete')
assert.equal(story.hasMilestone(STORY_MILESTONES.BBS_OPENED), false, '本編の章イベントは立たない')

// Reading it is where the trial ends. It never enters the archive chapter.
assert.equal(markTrialComplete(story), true)
assert.equal(isTrialComplete(story), true)
assert.equal(markTrialComplete(story), false)
assert.equal(story.chapter, STORY_CHAPTERS.CH1_REVIVAL, '体験版は第2章へ進まない')
assert.equal(story.hasMilestone(STORY_MILESTONES.BBS_OPENED), false)
assert.equal(story.hasMilestone(STORY_MILESTONES.BBS_COMPLETE), false)
assert.equal(story.hasReached(STORY_CHAPTERS.CH2_RECORDS_2015), false)
assert.equal(story.milestones[TRIAL_MILESTONES.COMPLETE], true)
assert.equal(story.milestones[TRIAL_MILESTONES.BBS_FOUND], true)

// It survives a reload: the mark is saved with the rest of the position.
setActivePinia(createPinia())
story = useStoryStore()
assert.equal(story.step, 'exploration_complete')
assert.equal(isTrialComplete(story), true)

// 「最初から」 puts it all back.
story.resetStory()
assert.equal(story.chapter, STORY_CHAPTERS.PROLOGUE)
assert.equal(story.step, 'reunion')
assert.equal(isTrialComplete(story), false)
assert.equal(isTrialRevivalCleared(story), false)

// None of it exists in the full game.
setGameMode(GAME_MODES.FULL)
story = freshStory()
playPrologue(story)
assert.equal(openTrialRevival(story), false, '通常版の進行は変えない')
assert.equal(story.chapter, STORY_CHAPTERS.PROLOGUE)
assert.equal(story.step, 'dm_complete')
story.dispatch(STORY_EVENTS.REVIVAL_LINK_RECEIVED)
story.dispatch(STORY_EVENTS.REVIVAL_OPENED)
assert.equal(completeTrialRevival(story), false)
assert.equal(isTrialAfterRevivalChat(story), false)
assert.equal(markTrialComplete(story), false)
assert.equal(isTrialComplete(story), false)

// ---------------------------------------------------------------------------
// 8. what the trial does not hand out
// ---------------------------------------------------------------------------

setGameMode(GAME_MODES.TRIAL)
for(const blocked of [
  VIRTUAL_URLS.SCHOOL_ARCHIVE,
  VIRTUAL_URLS.SCHOOL_GRADUATION_2015,
  VIRTUAL_URLS.GAME_ORIGINAL
]){
  assert.equal(isUrlBlockedInTrial(blocked), true, blocked)
  assert.ok(TRIAL_BLOCKED_URLS.includes(blocked))
}
// The revival build and the everyday web are exactly as reachable as before —
// and so is the saved log, which the story guard now opens for the trial once
// 水野 has written. It is not on the withheld list.
for(const allowed of [
  VIRTUAL_URLS.GAME_REVIVAL,
  VIRTUAL_URLS.MESSAGES,
  VIRTUAL_URLS.TRACE_SEARCH,
  VIRTUAL_URLS.NEWS_20150302,
  VIRTUAL_URLS.BBS_THREAD,
  'https://weatherline.jp/'
]){
  assert.equal(isUrlBlockedInTrial(allowed), false, allowed)
}
assert.equal(TRIAL_BLOCKED_URLS.includes(VIRTUAL_URLS.BBS_THREAD), false, '保存ログは体験版の遮断対象ではない')

// 学校アーカイブ never appears in a search, whatever the query.
assert.deepEqual(TRIAL_HIDDEN_SEARCH_DOCUMENT_IDS, ['school-archive-home', 'graduation-2015'])
assert.deepEqual(filterTrialSearchDocuments(virtualWebDocuments), [])
for(const query of ['学校アーカイブ', '学校 アーカイブ', 'アーカイブ', '卒業式', '2015 卒業', '青い鳥', '記録', '学校']){
  assert.deepEqual(searchStoryDocuments(query), [], `体験版の検索に出さない: ${query}`)
}

// And it is all still there for the full game.
setGameMode(GAME_MODES.FULL)
assert.equal(filterTrialSearchDocuments(virtualWebDocuments).length, virtualWebDocuments.length)
assert.ok(searchStoryDocuments('学校 アーカイブ').some((document) => document.url === VIRTUAL_URLS.SCHOOL_ARCHIVE))
assert.ok(searchStoryDocuments('卒業式 青い鳥').some((document) => document.url === VIRTUAL_URLS.SCHOOL_GRADUATION_2015))
for(const url of TRIAL_BLOCKED_URLS) assert.equal(isUrlBlockedInTrial(url), false, `通常版では通す: ${url}`)

// The browser refuses those addresses rather than rendering them, and the
// revival build only opens once it has been shared.
assert.ok(virtualBrowserStoreSource.includes('function guardTrialEdition(resolved)'))
assert.ok(virtualBrowserStoreSource.includes('isUrlBlockedInTrial(resolved.normalizedUrl)'))
assert.ok(virtualBrowserStoreSource.includes('canOpenTrialRevival(useStoryStore())'))
assert.ok(virtualBrowserStoreSource.includes('guardTrialEdition(guardPrivateStoryArchive(resolved))'))
// The BBS keeps its own, older guard, with the trial's own way in beside it.
assert.ok(virtualBrowserStoreSource.includes('function canOpenPrivateStoryArchive()'))
assert.ok(virtualBrowserStoreSource.includes('STORY_MILESTONES.BBS_OPENED'))
assert.ok(virtualBrowserStoreSource.includes('isTrialMode() && canOpenTrialArchive(story)'))
assert.ok(virtualBrowserStoreSource.includes('function noteTrialArchiveVisit(resolved)'))
assert.ok(virtualBrowserStoreSource.includes('markTrialBbsFound(useStoryStore())'))
// The new-tab shortcuts drop what the trial does not hand out.
assert.ok(browserWorkspaceSource.includes('SUGGESTED_URLS.filter((entry) => !isUrlBlockedInTrial(entry.url))'))

// The BBS's own data and search behaviour were not touched by any of this.
assert.equal(VIRTUAL_URLS.BBS_THREAD, 'https://minna-bbs.net/archive/private/20150307')
assert.equal(virtualWebDocuments.length, 2)
assert.equal(virtualWebDocuments.some((document) => document.url === VIRTUAL_URLS.BBS_THREAD), false, '掲示板は元から検索に載らない')

// ---------------------------------------------------------------------------
// 9. 水野 after the revival build: the BBS, and nothing else
// ---------------------------------------------------------------------------

assert.ok(trialScript.length >= 8)
assert.equal(new Set(trialScript.map((line) => line.id)).size, trialScript.length)
trialScript.forEach((line, position) => {
  assert.equal(line.id, `trial-after-revival-${String(position + 1).padStart(3, '0')}`)
  assert.ok(line.text, `${line.id}: 本文がある`)
  assert.ok(['水野', '主人公'].includes(line.from))
  assert.equal(Object.hasOwn(line, 'image'), false, '画像は出さない')
  assert.equal(Object.hasOwn(line, 'input'), false, '入力ゲートは無い')
})
const trialText = trialScript.map((line) => line.text).join('\n')
// It is about the revival build, and then about the BBS existing.
assert.ok(trialText.includes('復刻版'))
assert.ok(trialText.includes('掲示板'))
assert.ok(trialText.includes('残ってる'))
assert.equal(trialScript.at(-1).from, '主人公', '主人公が続きに興味を持って終わる')
// Everything the trial must not say.
for(const forbidden of [
  '青い鳥', 'ぬいぐるみ', '地下', '事件', '変死', '20:20', '初期版', 'アクセスコード',
  '学校アーカイブ', 'アーカイブ', 'http', 'URL', '時計', '死'
]){
  assert.ok(!trialText.includes(forbidden), `体験版の会話に出さない: ${forbidden}`)
}
// The full game's own after-BBS thread is untouched, and stays unreachable here.
assert.ok(afterBbsScript.some((line) => (line.text || '').includes('青い鳥')), '通常版の台本はそのまま')

// The thread shares nothing, and it only offers the end of the trial once the
// saved log has been read.
assert.ok(chatAppSource.includes('const trialThread = computed(() => isTrialAfterRevivalChat(storyState))'))
assert.ok(chatAppSource.includes('trial_dm_after_revival.json'))
assert.ok(chatAppSource.includes('if(!isComplete.value || trialThread.value) return null'), '共有リンクは出さない')
assert.ok(chatAppSource.includes('if(trialThread.value) return cards'))
assert.ok(chatAppSource.includes("return trialBbsFound.value ? '体験版を終える' : ''"))
assert.ok(chatAppSource.includes('if(trialBbsFound.value) markTrialComplete(storyState)'))
assert.ok(chatAppSource.includes('会話はここで止まっている。掲示板は自分で探すしかない。'))
// Opening the BBS is still the full game's business, and only from its own card.
assert.ok(chatAppSource.includes('storyState.dispatch(STORY_EVENTS.BBS_OPENED)'))

// ---------------------------------------------------------------------------
// 10. the last screen
// ---------------------------------------------------------------------------

assert.ok(appSource.includes('<TrialEndScene v-if="showTrialEnd" />'))
assert.ok(appSource.includes('isTrialComplete(storyState)'))
assert.ok(appSource.includes('<ReunionScene v-else-if="showReunion" />'))
assert.ok(appSource.includes('<DeviceSetupScene v-else-if="showDeviceSetup" />'))
assert.ok(appSource.includes('<router-view v-else />'))

assert.ok(trialEndSource.includes('体験版はここまでです。'))
assert.ok(trialEndSource.includes('続きは9月に追加予定です。'))
assert.ok(trialEndSource.includes('>最初から<'))
assert.ok(trialEndSource.includes('restartTrial()'))
// No date the brief did not give.
for(const invented of ['2026年9月', '2025年9月', '9月1日', '9月中旬', '来月']){
  assert.ok(!trialEndSource.includes(invented), `勝手な日付を書かない: ${invented}`)
}
// It replaces the shell like the other full-screen scenes do.
assert.ok(trialEndSource.includes('position:absolute'))
assert.ok(!trialEndSource.includes('position:fixed'))

// 「最初から」 clears the trial's namespace and reboots — one path, no partial
// resets to forget a store.
const flowSource = await readSource('../src/trial/flow.js')
assert.ok(flowSource.includes('clearScope()'))
assert.ok(flowSource.includes('window.location.reload()'))
assert.ok(flowSource.includes('window.location.hash = TRIAL_PATH'))

// ---------------------------------------------------------------------------
// 11. the full game's memory catalogue is exactly what it was
// ---------------------------------------------------------------------------

setGameMode(GAME_MODES.FULL)
assert.equal(MEMORY_DEFINITIONS.length, 8)
const fullCatalogue = getMemoryCatalogue(EDITIONS.REVIVAL, { memories: [] })
assert.equal(fullCatalogue.length, MEMORY_DEFINITIONS.length)
assert.equal(fullCatalogue.every((entry) => !entry.recorded && entry.text === ''), true)
for(const entry of TRIAL_REQUIRED_MEMORIES){
  assert.equal(trialMemoryIdFor(entry.roomId, entry.interactionTextId, EDITIONS.REVIVAL), null, '通常版では記録されない')
  assert.equal(trialInteractionText(entry.roomId, entry.interactionTextId, EDITIONS.REVIVAL), '')
  const objects = getRoomObjects(entry.roomId, EDITIONS.REVIVAL)
    .filter((object) => (object.interactionTextId || object.id) === entry.interactionTextId)
  assert.equal(objects.every((object) => object.memoryId === null), true, '通常版の思い出付与は変わらない')
}
// The original build never gets the trial's memories, even inside the trial.
setGameMode(GAME_MODES.TRIAL)
for(const entry of TRIAL_REQUIRED_MEMORIES){
  assert.equal(trialMemoryIdFor(entry.roomId, entry.interactionTextId, EDITIONS.ORIGINAL), null)
}
setGameMode(GAME_MODES.FULL)

console.log(
  `Trial OK: ${TRIAL_REQUIRED_MEMORIES.length} required memories across ${[...requiredFloors].length} floors, ` +
  `${trialScript.length} DM lines, ${TRIAL_BLOCKED_URLS.length} blocked URLs, storage isolation verified`
)
