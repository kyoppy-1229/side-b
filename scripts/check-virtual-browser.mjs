import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'
import { GAME_PHASES, useGameStore } from '../src/store/index.js'
import {
  FIXED_TAB_IDS,
  MESSAGES_URL,
  TRACE_SEARCH_URL,
  VIRTUAL_ERROR_CODE,
  VIRTUAL_PAGE_TYPES,
  VIRTUAL_URLS
} from '../src/virtual-web/constants.js'
import {
  looksLikeVirtualUrl,
  normalizeVirtualUrl,
  resolveAddressInput,
  resolveVirtualUrl,
  virtualWebRoutes
} from '../src/virtual-web/registry.js'
import { useVirtualBrowserStore } from '../src/store/virtualBrowser.js'
import { useStoryStore } from '../src/store/story.js'
import { STORY_CHAPTERS } from '../src/story/chapters.js'

function createMemoryStorage(){
  const values = new Map()
  return {
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

globalThis.window = { localStorage: createMemoryStorage() }

assert.equal(new Set(virtualWebRoutes.map((route) => route.url)).size, virtualWebRoutes.length)
assert.ok(virtualWebRoutes.every((route) => !Object.hasOwn(route, 'component')))
assert.equal(normalizeVirtualUrl('javascript:alert(1)'), null)
assert.equal(looksLikeVirtualUrl('SIDE-B 2015'), false)
assert.equal(looksLikeVirtualUrl('school.archive.local/graduation/2015'), true)

const searchAddress = resolveAddressInput('SIDE-B 2015')
assert.equal(searchAddress.kind, 'search')
assert.equal(searchAddress.normalizedUrl, TRACE_SEARCH_URL)
assert.equal(searchAddress.state.searchQuery, 'SIDE-B 2015')

const missingPage = resolveVirtualUrl('https://outside.example/page')
assert.equal(missingPage.pageType, VIRTUAL_PAGE_TYPES.ERROR)
assert.equal(missingPage.state.errorCode, VIRTUAL_ERROR_CODE)
assert.equal(missingPage.state.requestedUrl, 'https://outside.example/page')

setActivePinia(createPinia())
let browser = useVirtualBrowserStore()
browser.initializeBrowser()

assert.deepEqual(browser.openTabs.map((tab) => tab.id), [
  FIXED_TAB_IDS.MESSAGES,
  FIXED_TAB_IDS.TRACE_SEARCH
])
assert.ok(browser.openTabs.every((tab) => tab.closable === false))
assert.equal(browser.closeTab(FIXED_TAB_IDS.MESSAGES), false)

const archiveTab = browser.openVirtualUrl(VIRTUAL_URLS.SCHOOL_ARCHIVE)
assert.equal(browser.activeTabId, archiveTab.id)
assert.equal(browser.openTabs.length, 3)

const firstBlank = browser.openBlankTab()
const secondBlank = browser.openBlankTab()
assert.notEqual(firstBlank.id, secondBlank.id)
assert.equal(browser.activeTabId, secondBlank.id)

browser.submitAddress('bbs.archive.local/thread/20150307')
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.ERROR)
assert.equal(browser.activeTab.state.privateArchive, true)
useStoryStore().debugSetPosition(STORY_CHAPTERS.CH2_RECORDS_2015, 'search', { syncMilestones: true })
useStoryStore().debugSetPosition(STORY_CHAPTERS.CH2_RECORDS_2015, 'bbs_opened', { syncMilestones: true })
browser.submitAddress('bbs.archive.local/thread/20150307')
assert.equal(browser.activeTab.id, secondBlank.id)
assert.equal(browser.currentUrl, VIRTUAL_URLS.BBS_THREAD)
assert.equal(browser.activeTab.history.length, 3)

browser.submitAddress('outside.example/not-found')
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.ERROR)
assert.equal(browser.activeTab.state.errorCode, VIRTUAL_ERROR_CODE)
assert.equal(browser.activeTab.history.length, 4)
assert.equal(browser.goBack(), true)
assert.equal(browser.currentUrl, VIRTUAL_URLS.BBS_THREAD)
assert.equal(browser.goForward(), true)
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.ERROR)

browser.submitAddress('SIDE-B 2015')
assert.equal(browser.activeTabId, FIXED_TAB_IDS.TRACE_SEARCH)
assert.equal(browser.currentUrl, TRACE_SEARCH_URL)
assert.equal(browser.currentPageState.searchQuery, 'SIDE-B 2015')

browser.activateTab(archiveTab.id)
const revivalReloadKey = browser.activeTab.reloadKey
browser.reloadActive()
assert.equal(browser.activeTab.reloadKey, revivalReloadKey + 1)
const activeBeforeMessage = browser.activeTabId
const toast = browser.notifyMessage({ id: 'message-1', text: '新しいメッセージ' })
assert.equal(browser.activeTabId, activeBeforeMessage)
assert.equal(browser.unreadMessageCount, 1)
assert.equal(browser.openTabs.find((tab) => tab.id === FIXED_TAB_IDS.MESSAGES).unreadCount, 1)
assert.equal(toast.messageId, 'message-1')
browser.notifyMessage({ id: 'message-1', text: '重複イベント' })
assert.equal(browser.unreadMessageCount, 1)

browser.activateTab(FIXED_TAB_IDS.MESSAGES)
assert.equal(browser.unreadMessageCount, 0)
assert.equal(browser.lastReadMessage, 'message-1')
assert.equal(browser.openTabs.find((tab) => tab.id === FIXED_TAB_IDS.MESSAGES).unreadCount, 0)

const reloadKey = browser.activeTab.reloadKey
assert.equal(browser.reloadActive(), true)
assert.equal(browser.activeTab.reloadKey, reloadKey + 1)

const archiveSelectionTab = browser.openVirtualUrl(VIRTUAL_URLS.SCHOOL_ARCHIVE, {
  state: {
    component: () => null,
    selection: 'graduation'
  }
})
assert.equal(Object.hasOwn(archiveSelectionTab.state, 'component'), false)

browser.notifyMessage({ id: 'message-2', preview: '保存対象' })
const storedActiveId = browser.activeTabId

setActivePinia(createPinia())
browser = useVirtualBrowserStore()
browser.initializeBrowser()
assert.equal(browser.activeTabId, storedActiveId)
assert.equal(browser.unreadMessageCount, 1)
assert.equal(browser.lastMessageId, 'message-2')
assert.equal(browser.openTabs[0].url, MESSAGES_URL)
assert.equal(browser.openTabs[1].url, TRACE_SEARCH_URL)

// ---- general virtual web in the browser shell -------------------------------
const webTab = browser.openBlankTab()
browser.submitAddress('naviweb.jp')
assert.equal(browser.activeTab.id, webTab.id)
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.WEB_SITE)
assert.equal(browser.activeTab.state.siteId, 'naviweb')
assert.equal(browser.activeTab.state.path, '/')

// Following a link stays in the same tab and adds history.
const historyBefore = browser.activeTab.history.length
browser.navigateInTab(webTab.id, 'https://naviweb.jp/news/2026/used-pc-guide')
assert.equal(browser.activeTab.id, webTab.id)
assert.equal(browser.activeTab.state.path, '/news/2026/used-pc-guide')
assert.equal(browser.activeTab.history.length, historyBefore + 1)
assert.equal(browser.goBack(), true)
assert.equal(browser.currentUrl, 'https://naviweb.jp/')
assert.equal(browser.goForward(), true)
assert.equal(browser.activeTab.state.path, '/news/2026/used-pc-guide')

// An unknown path on a known domain is the site's own 404, not a dead browser.
browser.navigateInTab(webTab.id, 'https://naviweb.jp/nothing-here')
assert.equal(browser.activeTab.pageType, VIRTUAL_PAGE_TYPES.WEB_SITE)
assert.equal(browser.activeTab.state.notFound, true)

// A link followed from a fixed tab opens a new tab instead of replacing it.
const tabsBefore = browser.openTabs.length
browser.navigateInTab(FIXED_TAB_IDS.TRACE_SEARCH, 'https://minna-pedia.jp/entry/windows-7')
assert.equal(browser.openTabs.length, tabsBefore + 1)
assert.equal(browser.activeTab.state.siteId, 'minna-pedia')
assert.notEqual(browser.activeTabId, FIXED_TAB_IDS.TRACE_SEARCH)
browser.closeTab(browser.activeTabId)
browser.closeTab(webTab.id)

const game = useGameStore()
game.openBBS()
assert.equal(game.phase, GAME_PHASES.BBS)
game.completeBBS()
assert.equal(game.phase, GAME_PHASES.AFTER_BBS_DM)
game.reset()
assert.equal(game.phase, GAME_PHASES.PROLOGUE_DM)

console.log(`Virtual browser OK: ${virtualWebRoutes.length} routes, ${browser.openTabs.length} restored tabs`)
