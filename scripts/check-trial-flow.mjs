// The trial, played end to end.
//
// Where check-trial.mjs checks the trial's data and its rules one at a time,
// this walks the whole run through the real stores — prologue, the revival
// build, every required memory, the clear screen, 水野's last message, the
// address the player has to find for themselves, the saved log, the restart —
// and renders the screens it adds with the actual components (Vite loads the
// .vue files; there is no DOM, so only setup and the template run).
//
// It finishes by checking that the full game is exactly where it was: its save,
// its archive, its search and its memory layer.
//
// Run with `npm run check:trial-flow`.
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createPinia, setActivePinia } from 'pinia'

function memStorage(){
  const v = new Map()
  return {
    get length(){ return v.size },
    key(i){ return [...v.keys()][i] ?? null },
    getItem(k){ return v.has(k) ? v.get(k) : null },
    setItem(k, x){ v.set(k, String(x)) },
    removeItem(k){ v.delete(k) },
    clear(){ v.clear() }
  }
}
const storage = memStorage()
globalThis.window = { localStorage: storage, location: { hash: '#/trial', pathname: '/side-b/' } }

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const load = (p) => server.ssrLoadModule(p)

const mode = await load('/src/trial/mode.js')
const storageMod = await load('/src/store/storage.js')
const flow = await load('/src/trial/flow.js')
const memories = await load('/src/trial/memories.js')
const events = await load('/src/story/events.js')
const chapters = await load('/src/story/chapters.js')
const storyStore = await load('/src/store/story.js')
const gameSession = await load('/src/store/gameSession.js')
const browserStore = await load('/src/store/virtualBrowser.js')
const editions = await load('/src/game/data/editions.js')
const constants = await load('/src/virtual-web/constants.js')
const searchIndex = await load('/src/virtual-web/searchIndex.js')
const debugStore = await load('/src/store/debug.js')
const GamePage = (await load('/src/components/game/GamePage.vue')).default
const ChatApp = (await load('/src/components/chat/ChatApp.vue')).default
const TrialEndScene = (await load('/src/views/TrialEndScene.vue')).default
const WebSitePage = (await load('/src/components/web/WebSitePage.vue')).default

const { STORY_EVENTS } = events
const { STORY_CHAPTERS } = chapters
const { VIRTUAL_URLS, VIRTUAL_PAGE_TYPES } = constants

// ---- boot as the trial would -------------------------------------------------
mode.setGameMode(mode.GAME_MODES.TRIAL)
storageMod.setStorageScope(mode.TRIAL_STORAGE_SCOPE)
assert.equal(mode.isTrialMode(), true)

const pinia = createPinia()
setActivePinia(pinia)
const story = storyStore.useStoryStore()
const game = gameSession.useGameSessionStore()
const browser = browserStore.useVirtualBrowserStore()
game.hydrate()
browser.initializeBrowser()

// ---- the revival build is not reachable yet ---------------------------------
let tab = browser.openVirtualUrl(VIRTUAL_URLS.GAME_REVIVAL)
assert.equal(tab.pageType, VIRTUAL_PAGE_TYPES.ERROR, '共有前の復刻版は開けない')
browser.closeTab(tab.id)

// ---- the saved log, on the other hand, waits for nobody ---------------------
// Nothing shares its address, so finding it is the puzzle: a player who works it
// out this early may read it, and it still moves no part of the story.
tab = browser.openVirtualUrl(VIRTUAL_URLS.BBS_THREAD)
assert.equal(tab.pageType, VIRTUAL_PAGE_TYPES.WEB_SITE, '住所が分かればいつでも読める')
assert.equal(story.step, 'reunion', '読んでも物語は動かない')
assert.equal(flow.isTrialBbsFound(story), true, '読んだことは記録される')
browser.closeTab(tab.id)
// …and from here the walk follows the ordinary route instead: the note is put
// back so the rest of this file can watch the player find it after 水野's hint.
story.markMilestone(flow.TRIAL_MILESTONES.BBS_FOUND, false)
assert.equal(flow.isTrialBbsFound(story), false)

// ---- prologue ---------------------------------------------------------------
for(const event of [
  STORY_EVENTS.REUNION_COMPLETE,
  STORY_EVENTS.DEVICE_MIGRATION_COMPLETE,
  STORY_EVENTS.CHAT_RELOGIN_COMPLETE,
  STORY_EVENTS.FIRST_SEARCH_PERFORMED,
  STORY_EVENTS.MIZUNO_FIRST_MESSAGE_RECEIVED,
  STORY_EVENTS.MIZUNO_THREAD_OPENED,
  STORY_EVENTS.PROLOGUE_DM_COMPLETE
]) story.dispatch(event)
assert.equal(story.step, 'dm_complete')

// ---- open the build ---------------------------------------------------------
tab = browser.openVirtualUrl(VIRTUAL_URLS.GAME_REVIVAL)
assert.equal(tab.pageType, VIRTUAL_PAGE_TYPES.GAME_REVIVAL)
assert.equal(flow.openTrialRevival(story), true)
assert.equal(story.chapter, STORY_CHAPTERS.CH1_REVIVAL)
assert.equal(story.step, 'exploring')

// ---- explore: ordinary objects first, then the required ones ----------------
game.start('revival')
const session = () => game.sessions.revival

// an ordinary object records nothing towards the clear condition
game.enterRoom('F1-01', 'north-main')
for(const object of editions.getRoomObjects('F1-01', 'revival', session())){
  if(!object.interactable) continue
  game.interact(object.id, object.memoryId || null, 'examined', object.interactionTextId)
}
assert.equal(memories.trialMemoryProgress(session()).recorded, 0, '昇降口には必須思い出は無い')
assert.ok(session().memories.length > 0, '通常の思い出は記録される（進捗には入らない）')

// every required memory, whichever copy of the object we walk up to
const required = memories.TRIAL_REQUIRED_MEMORIES
for(const [index, entry] of required.entries()){
  game.enterRoom(entry.roomId, 'north-main')
  const objects = editions.getRoomObjects(entry.roomId, 'revival', session())
    .filter((object) => (object.interactionTextId || object.id) === entry.interactionTextId)
  const target = objects[objects.length - 1]
  const text = editions.getInteractionText(target.interactionTextId || target.id, 'revival', { object: target, session: session() })
  assert.ok(text.includes(entry.voice), `${entry.id}: 主人公の言葉が出る`)
  game.interact(target.id, target.memoryId || null, 'examined', target.interactionTextId)
  // examining it twice must not count twice
  game.interact(target.id, target.memoryId || null, 'examined', target.interactionTextId)
  const progress = memories.trialMemoryProgress(session())
  assert.equal(progress.recorded, index + 1, `${entry.id}: 進捗が1つ増える`)
}
assert.equal(memories.isTrialRevivalComplete(session()), true)

// ---- the clear screen, rendered from the real component ---------------------
// Timers run straight through here so the whole "wait, show, report" chain can
// be observed inside one synchronous render.
window.setTimeout = (fn) => { fn(); return 1 }
window.clearTimeout = () => {}
const clearing = createSSRApp({ render: () => h(GamePage, { edition: 'revival', active: true }) })
clearing.use(pinia)
const clearHtml = await renderToString(clearing)
assert.ok(clearHtml.includes('校舎を一通り見て回った'), 'クリア画面が出る')
assert.ok(clearHtml.includes('思い出はすべて確認した。'))
assert.ok(!/MISSION|COMPLETE|コンプリート/.test(clearHtml), '派手な演出にしない')
// Reaching the clear screen is what tells the story, which is what makes 水野
// write; the component did it on its own timer.
assert.equal(story.step, 'exploration_complete', 'クリアで探索完了が報告される')

// ---- clear → 水野 writes, and stops ----------------------------------------
assert.equal(flow.completeTrialRevival(story), false, '報告は一度きり')
assert.equal(story.step, 'exploration_complete')
assert.equal(flow.isTrialAfterRevivalChat(story), true)
assert.equal(story.chapter, STORY_CHAPTERS.CH1_REVIVAL, '体験版は第2章へ行かない')
assert.equal(flow.canOpenTrialArchive(), true, '保存ログの住所は体験版では常に通る')
assert.equal(flow.isTrialBbsFound(story), false, 'まだ見つけていない')

// ---- 水野's last message, rendered from the real thread ---------------------
// The debug store's "reveal the whole thread" switch stands in for the player
// tapping through the lines.
debugStore.useDebugStore().setPref('autoRevealChat', true)
async function renderThread(){
  const thread = createSSRApp({ render: () => h(ChatApp, { active: true }) })
  thread.use(pinia)
  return renderToString(thread)
}
let threadHtml = await renderThread()
assert.ok(threadHtml.includes('復刻版、見終わった？'), '体験版の会話が出る')
assert.ok(threadHtml.includes('掲示板があったんだよ'))
assert.ok(threadHtml.includes('自分で探してみる'), '探すのは player の仕事として終わる')
// Nothing is shared, and nothing of the later chapters is said.
assert.ok(!threadHtml.includes('みんなの掲示板：保存ログ'), '共有リンクは出さない')
assert.ok(!threadHtml.includes('minna-bbs'), 'URLも出さない')
assert.ok(!threadHtml.includes('archive/private'), '住所の一部も出さない')
for(const forbidden of ['青い鳥', 'ぬいぐるみ', '地下', '20:20', '変死']){
  assert.ok(!threadHtml.includes(forbidden), `体験版の画面に出さない: ${forbidden}`)
}
// The conversation is over, and it offers no way to end the trial yet: the last
// page of the trial has not been read.
assert.ok(!threadHtml.includes('体験版を終える'), '読む前に終わらせるボタンは出さない')
assert.ok(threadHtml.includes('掲示板は自分で探すしかない'), '会話が止まったことを言う')

// ---- the trail the player follows on the ordinary web -----------------------
// Two pages that never mention each other: the 管理人's notice thread carries
// the day the log was moved (and that the name is that day's 8 digits), the
// 検索避け article carries the directory. Both are ordinary web pages, so the
// trial hides neither; the log itself is in no index at all.
const noticeUrl = 'https://minna-bbs.net/thread/talk/1130'
const directoryUrl = 'https://web-koubou.jp/entry/2015/noindex-directory'
for(const [query, url] of [['保存ログ', noticeUrl], ['削除依頼', noticeUrl], ['検索避け', directoryUrl], ['robots.txt', directoryUrl]]){
  const found = searchIndex.searchVirtualWebDetailed(query).results.some((result) => result.url === url)
  assert.ok(found, `体験版の検索で辿れる: "${query}" -> ${url}`)
}
for(const query of ['保存ログ', '掲示板', '2015', '削除依頼']){
  const leaked = searchIndex.searchVirtualWebDetailed(query).results.some((result) => result.url === VIRTUAL_URLS.BBS_THREAD)
  assert.equal(leaked, false, `保存ログ自体は検索に出ない: ${query}`)
}

// ---- typing the address the two pages add up to ----------------------------
// A new tab and the address typed into it, the way the player would.
browser.openBlankTab()
const logTab = browser.submitAddress('minna-bbs.net/archive/private/20150307')
assert.equal(logTab.pageType, VIRTUAL_PAGE_TYPES.WEB_SITE, '見つけた住所は開く')
assert.equal(logTab.currentUrl, VIRTUAL_URLS.BBS_THREAD)
assert.equal(flow.isTrialBbsFound(story), true, '読んだことが記録される')
// Reading it moves no chapter: 水野's thread stays exactly where he left it.
assert.equal(story.chapter, STORY_CHAPTERS.CH1_REVIVAL)
assert.equal(story.step, 'exploration_complete')

// ---- the log, rendered the way the trial renders it ------------------------
const logApp = createSSRApp({
  render: () => h(WebSitePage, {
    siteId: 'minna-bbs',
    path: '/archive/private/20150307',
    allowReturnMessages: false
  })
})
logApp.use(pinia)
const logHtml = await renderToString(logApp)
assert.ok(logHtml.includes('非公開保存ログ'), '保存ログとして開く')
assert.ok(logHtml.includes('とりあえず完成'), '書き込みが読める')
assert.ok(!logHtml.includes('Messagesへ戻る'), '物語を進めるボタンは出さない')
assert.ok(logHtml.includes('体験版を終了できます'), '読み終えたあとの行き先だけ書く')

// ---- read it, and Messages offers the end ----------------------------------
threadHtml = await renderThread()
assert.ok(threadHtml.includes('体験版を終える'), '読んだあとに終了ボタンが出る')
assert.ok(!threadHtml.includes('掲示板は自分で探すしかない'))
assert.ok(!threadHtml.includes('minna-bbs'), '会話には最後までURLを出さない')
debugStore.useDebugStore().setPref('autoRevealChat', false)

assert.equal(flow.markTrialComplete(story), true)
assert.equal(flow.isTrialComplete(story), true)
assert.equal(story.chapter, STORY_CHAPTERS.CH1_REVIVAL, '終わっても第2章へは行かない')

// ---- no back doors ----------------------------------------------------------
for(const url of [VIRTUAL_URLS.SCHOOL_ARCHIVE, VIRTUAL_URLS.SCHOOL_GRADUATION_2015, VIRTUAL_URLS.GAME_ORIGINAL]){
  const blocked = browser.openVirtualUrl(url)
  assert.equal(blocked.pageType, VIRTUAL_PAGE_TYPES.ERROR, `体験版では開けない: ${url}`)
}
// the address bar cannot get around it either, in any spelling
for(const typedUrl of [
  'school.archive.local',
  'https://school.archive.local/',
  'side-b.local/original'
]){
  const typed = browser.submitAddress(typedUrl)
  assert.equal(typed.pageType, VIRTUAL_PAGE_TYPES.ERROR, `アドレス入力でも開けない: ${typedUrl}`)
}
// nor can search
for(const q of ['学校アーカイブ', '卒業式', '青い鳥', '2015']){
  const report = searchIndex.searchVirtualWebDetailed(q)
  assert.deepEqual(report.storyResults, [], `検索に出ない: ${q}`)
  assert.equal(report.results.every((r) => !String(r.url).includes('school.archive.local')), true)
}
// the ordinary web still works
assert.ok(searchIndex.searchVirtualWebDetailed('今日の天気').results.length > 0, '一般Webは普通に検索できる')
const weather = browser.openVirtualUrl('https://weatherline.jp/')
assert.equal(weather.pageType, VIRTUAL_PAGE_TYPES.WEB_SITE)

// ---- SSR: the screens the trial adds ---------------------------------------
const endHtml = await renderToString(createSSRApp({ render: () => h(TrialEndScene) }))
assert.ok(endHtml.includes('体験版はここまでです。'))
assert.ok(endHtml.includes('続きは9月に追加予定です。'))
assert.ok(endHtml.includes('最初から'))

// mid-play: the HUD counts the required set, and no clear screen yet
game.setMemories([required[0].id], 'revival')
game.patchSession({ currentScene: 'room', roomId: 'F1-04', currentFloor: '1F' }, 'revival')
const app2 = createSSRApp({ render: () => h(GamePage, { edition: 'revival', active: true }) })
app2.use(pinia)
const gameHtml = await renderToString(app2)
assert.ok(gameHtml.includes('1/5'), 'HUDは必須思い出の進捗を出す')
assert.ok(!gameHtml.includes('校舎を一通り見て回った'), '未クリアではクリア画面は出ない')
// …and put the finished run back for the reload check below.
game.setMemories([...memories.TRIAL_REQUIRED_MEMORY_IDS], 'revival')

// ---- a reload in the middle of the trial ------------------------------------
// Everything came from the trial's namespace, so a fresh boot picks the run back
// up: the story position, the revival session, and the tabs — with the build
// still allowed and the blocked pages still blocked.
setActivePinia(createPinia())
const reloadedStory = storyStore.useStoryStore()
const reloadedGame = gameSession.useGameSessionStore()
const reloadedBrowser = browserStore.useVirtualBrowserStore()
reloadedGame.hydrate()
reloadedBrowser.initializeBrowser()
assert.equal(reloadedStory.step, 'exploration_complete', 'リロードで進行は失われない')
assert.equal(flow.isTrialComplete(reloadedStory), true)
assert.equal(memories.isTrialRevivalComplete(reloadedGame.sessions.revival), true)
const restoredRevival = reloadedBrowser.openTabs.find((t) => t.url === VIRTUAL_URLS.GAME_REVIVAL)
assert.ok(restoredRevival, '復刻版のタブが復元される')
assert.equal(restoredRevival.pageType, VIRTUAL_PAGE_TYPES.GAME_REVIVAL)
for(const url of [VIRTUAL_URLS.SCHOOL_ARCHIVE, VIRTUAL_URLS.GAME_ORIGINAL]){
  const restored = reloadedBrowser.openTabs.find((t) => t.url === url)
  if(restored) assert.equal(restored.pageType, VIRTUAL_PAGE_TYPES.ERROR, `復元後も開けない: ${url}`)
}

// ---- 「最初から」 -----------------------------------------------------------
const before = storage.getItem('trial:side-b:story-state:v2')
assert.ok(before)
storageMod.clearScope()
assert.equal(storage.getItem('trial:side-b:story-state:v2'), null)
setActivePinia(createPinia())
const fresh = storyStore.useStoryStore()
assert.equal(fresh.step, 'reunion', '最初からで導入に戻る')

// ---- full mode is untouched -------------------------------------------------
mode.setGameMode(mode.GAME_MODES.FULL)
storageMod.setStorageScope('')
setActivePinia(createPinia())
const fullStory = storyStore.useStoryStore()
const fullBrowser = browserStore.useVirtualBrowserStore()
fullBrowser.initializeBrowser()
assert.equal(fullStory.step, 'reunion', '通常版のセーブは体験版に汚染されていない')
const archive = fullBrowser.openVirtualUrl(VIRTUAL_URLS.SCHOOL_ARCHIVE)
assert.equal(archive.pageType, VIRTUAL_PAGE_TYPES.SCHOOL_ARCHIVE, '通常版の学校アーカイブは開ける')
assert.ok(searchIndex.searchVirtualWebDetailed('学校 アーカイブ').storyResults.length > 0)
const originalTab = fullBrowser.openVirtualUrl(VIRTUAL_URLS.GAME_ORIGINAL)
assert.equal(originalTab.pageType, VIRTUAL_PAGE_TYPES.GAME_ORIGINAL, '通常版の初期版は開ける')
const bbs = fullBrowser.openVirtualUrl(VIRTUAL_URLS.BBS_THREAD)
assert.equal(bbs.pageType, VIRTUAL_PAGE_TYPES.ERROR, '通常版でも未到達の掲示板は従来通り閉じている')
fullStory.debugSetPosition(STORY_CHAPTERS.CH2_RECORDS_2015, 'bbs_opened', { syncMilestones: true })
const bbsOpen = fullBrowser.openVirtualUrl(VIRTUAL_URLS.BBS_THREAD)
// The private log is a noindex page of the ordinary forum site, so it renders
// through the web-site page type — unchanged by any of this.
assert.equal(bbsOpen.pageType, VIRTUAL_PAGE_TYPES.WEB_SITE, '通常版の掲示板は従来通り開く')
assert.equal(bbsOpen.currentUrl, VIRTUAL_URLS.BBS_THREAD)

// full mode: no trial memories anywhere
const fullGame = gameSession.useGameSessionStore()
fullGame.hydrate()
for(const entry of required){
  const objects = editions.getRoomObjects(entry.roomId, 'revival', fullGame.sessions.revival)
    .filter((o) => (o.interactionTextId || o.id) === entry.interactionTextId)
  assert.equal(objects.every((o) => o.memoryId === null), true, '通常版に体験版の思い出は生えない')
}

await server.close()
console.log(
  `Trial flow OK: ${required.length} required memories examined, clear screen + 水野 + 終了画面 rendered, ` +
  '通常版は無変更'
)
