import { defineStore } from 'pinia'
import { readJson, writeJson } from './storage.js'
import {
  buildMessagesUrl,
  FIXED_TAB_IDS,
  MESSAGES_PATHS,
  MESSAGES_URL,
  TRACE_SEARCH_URL,
  VIRTUAL_BROWSER_STORAGE_KEY,
  VIRTUAL_PAGE_TYPES,
  VIRTUAL_URLS
} from '../virtual-web/constants.js'
import {
  resolveAddressInput,
  resolveVirtualUrl
} from '../virtual-web/registry.js'
import { useStoryStore } from './story.js'
import { STORY_CHAPTERS } from '../story/chapters.js'
import { STORY_MILESTONES } from '../story/transitions.js'
import { isTrialMode } from '../trial/mode.js'
import { canOpenTrialRevival } from '../trial/flow.js'
import { isUrlBlockedInTrial } from '../trial/restrictions.js'

const MAX_HISTORY_LENGTH = 50
let tabSequence = 0

function nextTabId(prefix = 'tab'){
  tabSequence += 1
  return `${prefix}-${Date.now().toString(36)}-${tabSequence.toString(36)}`
}

function sanitizeValue(value, seen = new WeakSet()){
  if(value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if(typeof value === 'number') return Number.isFinite(value) ? value : null
  if(typeof value !== 'object') return undefined
  if(seen.has(value)) return undefined

  seen.add(value)
  if(Array.isArray(value)){
    const result = value
      .map((item) => sanitizeValue(item, seen))
      .filter((item) => item !== undefined)
    seen.delete(value)
    return result
  }

  const result = {}
  for(const [key, item] of Object.entries(value)){
    if(key === 'component') continue
    const sanitized = sanitizeValue(item, seen)
    if(sanitized !== undefined) result[key] = sanitized
  }
  seen.delete(value)
  return result
}

function sanitizePageState(value){
  const state = sanitizeValue(value)
  return state && !Array.isArray(state) && typeof state === 'object' ? state : {}
}

function createHistoryEntry(resolved, state = resolved.state){
  return {
    routeId: resolved.id,
    title: resolved.title,
    url: resolved.normalizedUrl,
    pageType: resolved.pageType,
    state: sanitizePageState(state)
  }
}

function syncTabWithEntry(tab, entry){
  tab.routeId = entry.routeId
  tab.title = entry.title
  tab.url = entry.url
  tab.currentUrl = entry.url
  tab.pageType = entry.pageType
  tab.state = sanitizePageState(entry.state)
}

function createTab(resolved, options = {}){
  const state = {
    ...sanitizePageState(resolved.state),
    ...sanitizePageState(options.state)
  }
  const entry = createHistoryEntry(resolved, state)
  const fixedId = resolved.fixed ? resolved.id : null

  return {
    id: fixedId || nextTabId(resolved.id),
    routeId: resolved.id,
    title: options.title || resolved.title,
    url: entry.url,
    currentUrl: entry.url,
    pageType: entry.pageType,
    closable: fixedId ? false : options.closable !== false,
    unreadCount: 0,
    state: entry.state,
    history: [entry],
    historyIndex: 0,
    reloadKey: 0
  }
}

function createInitialTabs(){
  return [
    createTab(resolveVirtualUrl(MESSAGES_URL)),
    createTab(resolveVirtualUrl(TRACE_SEARCH_URL))
  ]
}

function canOpenPrivateStoryArchive(){
  const story = useStoryStore()
  return story.hasMilestone(STORY_MILESTONES.BBS_OPENED)
    || story.hasReached(STORY_CHAPTERS.CH2_RECORDS_2015, 'bbs_opened')
}

// A page the player is not allowed here, rendered as the browser failing to
// find it rather than as a message about the story.
function refuse(resolved, state = {}){
  const error = resolveVirtualUrl(VIRTUAL_URLS.ERROR)
  return {
    ...error,
    found: false,
    normalizedUrl: resolved.normalizedUrl,
    requestedUrl: resolved.requestedUrl,
    state: {
      ...error.state,
      requestedUrl: resolved.requestedUrl,
      ...state
    }
  }
}

function guardPrivateStoryArchive(resolved){
  if(resolved.normalizedUrl !== VIRTUAL_URLS.BBS_THREAD || canOpenPrivateStoryArchive()) return resolved
  return refuse(resolved, { privateArchive: true })
}

// The trial's ceiling. Everything past "there was a BBS" belongs to the full
// game, so the archive, the private log and the original build stay unreachable
// however the player asks for them — and the revival build only opens once 水野
// has actually sent it. Outside the trial this is a no-op.
function guardTrialEdition(resolved){
  if(!isTrialMode()) return resolved
  if(isUrlBlockedInTrial(resolved.normalizedUrl)) return refuse(resolved, { trialLimited: true })
  if(resolved.normalizedUrl === VIRTUAL_URLS.GAME_REVIVAL && !canOpenTrialRevival(useStoryStore())){
    return refuse(resolved, { trialLimited: true })
  }
  return resolved
}

// Every route into a tab goes through this pair.
function guardResolvedUrl(resolved){
  return guardTrialEdition(guardPrivateStoryArchive(resolved))
}

function readStoredBrowser(){
  return readJson(VIRTUAL_BROWSER_STORAGE_KEY)
}

function browserSnapshot(state){
  return {
    version: 1,
    openTabs: state.openTabs,
    activeTabId: state.activeTabId,
    unreadMessageCount: state.unreadMessageCount,
    lastReadMessage: state.lastReadMessage,
    lastMessageId: state.lastMessageId
  }
}

function writeStoredBrowser(state){
  // The browser remains usable in memory when storage is unavailable.
  writeJson(VIRTUAL_BROWSER_STORAGE_KEY, browserSnapshot(state))
}

function sanitizeStoredEntry(value){
  if(!value || typeof value !== 'object') return null
  const resolved = guardResolvedUrl(resolveVirtualUrl(value.url))
  return createHistoryEntry(resolved, {
    ...sanitizePageState(resolved.state),
    ...sanitizePageState(value.state)
  })
}

function sanitizeStoredHistory(storedTab, fixedRouteId = null){
  const source = Array.isArray(storedTab.history) ? storedTab.history : []
  const history = source
    .slice(-MAX_HISTORY_LENGTH)
    .map(sanitizeStoredEntry)
    .filter((entry) => {
      if(!entry) return false
      if(fixedRouteId) return entry.routeId === fixedRouteId
      return entry.routeId !== FIXED_TAB_IDS.MESSAGES && entry.routeId !== FIXED_TAB_IDS.TRACE_SEARCH
    })

  if(history.length) return history
  const fallback = sanitizeStoredEntry({
    url: storedTab.currentUrl || storedTab.url,
    state: storedTab.state
  })
  if(!fallback) return []
  if(fixedRouteId && fallback.routeId !== fixedRouteId) return []
  if(!fixedRouteId && (fallback.routeId === FIXED_TAB_IDS.MESSAGES || fallback.routeId === FIXED_TAB_IDS.TRACE_SEARCH)) return []
  return [fallback]
}

function restoreFixedTab(storedTabs, url){
  const resolved = resolveVirtualUrl(url)
  const saved = storedTabs.find((tab) => tab?.id === resolved.id)
  const tab = createTab(resolved)
  if(!saved) return tab

  const history = sanitizeStoredHistory(saved, resolved.id)
  if(!history.length) return tab
  tab.history = history
  tab.historyIndex = Math.min(
    Math.max(Number(saved.historyIndex) || 0, 0),
    history.length - 1
  )
  tab.reloadKey = Math.max(Number(saved.reloadKey) || 0, 0)
  syncTabWithEntry(tab, history[tab.historyIndex])
  return tab
}

function restoreDynamicTab(storedTab){
  if(!storedTab || typeof storedTab !== 'object' || typeof storedTab.id !== 'string') return null
  if(storedTab.id === FIXED_TAB_IDS.MESSAGES || storedTab.id === FIXED_TAB_IDS.TRACE_SEARCH) return null

  const history = sanitizeStoredHistory(storedTab)
  if(!history.length) return null
  const historyIndex = Math.min(
    Math.max(Number(storedTab.historyIndex) || 0, 0),
    history.length - 1
  )
  const entry = history[historyIndex]

  return {
    id: storedTab.id,
    routeId: entry.routeId,
    title: entry.title,
    url: entry.url,
    currentUrl: entry.url,
    pageType: entry.pageType,
    closable: true,
    unreadCount: 0,
    state: sanitizePageState(entry.state),
    history,
    historyIndex,
    reloadKey: Math.max(Number(storedTab.reloadKey) || 0, 0)
  }
}

function restoreTabs(stored){
  const storedTabs = Array.isArray(stored?.openTabs) ? stored.openTabs : []
  const fixedTabs = [
    restoreFixedTab(storedTabs, MESSAGES_URL),
    restoreFixedTab(storedTabs, TRACE_SEARCH_URL)
  ]
  const dynamicTabs = storedTabs
    .map(restoreDynamicTab)
    .filter(Boolean)
    .filter((tab, index, tabs) => {
      if(tab.pageType === VIRTUAL_PAGE_TYPES.BLANK) return true
      return tabs.findIndex((candidate) => candidate.url === tab.url) === index
    })

  return [...fixedTabs, ...dynamicTabs]
}

function sameEntry(first, second){
  return first.url === second.url && JSON.stringify(first.state) === JSON.stringify(second.state)
}

function navigateTab(tab, resolved, state = resolved.state){
  const entry = createHistoryEntry(resolved, state)
  const current = tab.history[tab.historyIndex]
  if(current && sameEntry(current, entry)){
    syncTabWithEntry(tab, entry)
    return
  }

  tab.history = tab.history.slice(0, tab.historyIndex + 1)
  tab.history.push(entry)
  if(tab.history.length > MAX_HISTORY_LENGTH) tab.history.shift()
  tab.historyIndex = tab.history.length - 1
  syncTabWithEntry(tab, entry)
}

export const useVirtualBrowserStore = defineStore('virtual-browser', {
  state: () => {
    const openTabs = createInitialTabs()
    return {
      initialized: false,
      openTabs,
      activeTabId: FIXED_TAB_IDS.MESSAGES,
      unreadMessageCount: 0,
      lastReadMessage: null,
      lastMessageId: null,
      toast: null
    }
  },
  getters: {
    activeTab: (state) => state.openTabs.find((tab) => tab.id === state.activeTabId) || null,
    currentUrl(){
      return this.activeTab?.currentUrl || VIRTUAL_URLS.BLANK
    },
    currentPageState(){
      return this.activeTab?.state || {}
    },
    tabHistory(){
      return this.activeTab?.history || []
    },
    canGoBack(){
      return Boolean(this.activeTab && this.activeTab.historyIndex > 0)
    },
    canGoForward(){
      return Boolean(this.activeTab && this.activeTab.historyIndex < this.activeTab.history.length - 1)
    }
  },
  actions: {
    initializeBrowser(){
      if(this.initialized) return this.activeTab

      const stored = readStoredBrowser()
      if(stored){
        this.openTabs = restoreTabs(stored)
        this.unreadMessageCount = Math.max(Number(stored.unreadMessageCount) || 0, 0)
        this.lastReadMessage = stored.lastReadMessage ?? null
        this.lastMessageId = stored.lastMessageId ?? null
        this.activeTabId = this.openTabs.some((tab) => tab.id === stored.activeTabId)
          ? stored.activeTabId
          : FIXED_TAB_IDS.MESSAGES
      }

      this.initialized = true
      this.syncMessagesUnread()
      if(this.activeTab?.pageType === VIRTUAL_PAGE_TYPES.MESSAGES) this.markMessagesRead()
      else this.persistBrowser()
      return this.activeTab
    },
    persistBrowser(){
      writeStoredBrowser(this)
    },
    // The chat app tells the browser which of its screens is open, and the
    // address bar and the tab label follow. Only the displayed location moves:
    // the tab keeps the fixed url everything else looks it up by, so a link to
    // Messages still finds this tab instead of opening a second one.
    setMessagesLocation(location = {}){
      const tab = this.openTabs.find((candidate) => candidate.id === FIXED_TAB_IDS.MESSAGES)
      if(!tab) return null

      const url = buildMessagesUrl(location.path || MESSAGES_PATHS.HOME)
      const title = location.title || 'Messages'
      if(tab.currentUrl === url && tab.title === title) return tab

      tab.currentUrl = url
      tab.title = title
      this.persistBrowser()
      return tab
    },
    syncMessagesUnread(){
      const messagesTab = this.openTabs.find((tab) => tab.id === FIXED_TAB_IDS.MESSAGES)
      if(messagesTab) messagesTab.unreadCount = this.unreadMessageCount
    },
    openVirtualUrl(url, options = {}){
      const resolved = guardResolvedUrl(resolveVirtualUrl(url))
      if(resolved.pageType === VIRTUAL_PAGE_TYPES.BLANK) return this.openBlankTab(options)

      const existing = this.openTabs.find((tab) => tab.url === resolved.normalizedUrl)
      if(existing){
        if(Object.keys(resolved.state || {}).length) navigateTab(existing, resolved, resolved.state)
        this.activateTab(existing.id)
        return existing
      }

      const tab = createTab(resolved, options)
      this.openTabs.push(tab)
      this.activeTabId = tab.id
      this.persistBrowser()
      return tab
    },
    submitAddress(value){
      let resolved = resolveAddressInput(value)

      if(resolved.kind === 'search'){
        const traceTab = this.openTabs.find((tab) => tab.id === FIXED_TAB_IDS.TRACE_SEARCH)
        navigateTab(traceTab, resolved, resolved.state)
        this.activeTabId = traceTab.id
        this.persistBrowser()
        return traceTab
      }

      if(resolved.pageType === VIRTUAL_PAGE_TYPES.BLANK){
        if(this.activeTab?.closable){
          navigateTab(this.activeTab, resolved, resolved.state)
          this.persistBrowser()
          return this.activeTab
        }
        return this.openBlankTab()
      }

      resolved = guardResolvedUrl(resolved)

      const existing = this.openTabs.find((tab) => tab.url === resolved.normalizedUrl)
      if(existing){
        if(Object.keys(resolved.state || {}).length) navigateTab(existing, resolved, resolved.state)
        this.activateTab(existing.id)
        return existing
      }

      if(this.activeTab?.closable){
        navigateTab(this.activeTab, resolved, resolved.state)
        this.persistBrowser()
        return this.activeTab
      }

      return this.openVirtualUrl(resolved.normalizedUrl)
    },
    // Following a link inside a rendered page: the tab keeps its identity and
    // gains a history entry, which is what makes back/forward behave. Fixed
    // tabs (Messages / TRACE Search) never navigate away from their own page,
    // so a link there opens a tab instead.
    navigateInTab(tabId, url, options = {}){
      const tab = this.openTabs.find((candidate) => candidate.id === tabId)
      if(!tab) return this.openVirtualUrl(url, options)
      if(!tab.closable) return this.openVirtualUrl(url, options)

      const resolved = guardResolvedUrl(resolveVirtualUrl(url))
      if(resolved.pageType === VIRTUAL_PAGE_TYPES.BLANK) return this.openBlankTab(options)

      navigateTab(tab, resolved, { ...resolved.state, ...sanitizePageState(options.state) })
      this.activeTabId = tab.id
      this.persistBrowser()
      return tab
    },
    activateTab(tabId){
      const tab = this.openTabs.find((candidate) => candidate.id === tabId)
      if(!tab) return null

      this.activeTabId = tab.id
      if(tab.pageType === VIRTUAL_PAGE_TYPES.MESSAGES) this.markMessagesRead()
      else this.persistBrowser()
      return tab
    },
    closeTab(tabId){
      const index = this.openTabs.findIndex((tab) => tab.id === tabId)
      const tab = this.openTabs[index]
      if(index < 0 || !tab?.closable) return false

      const wasActive = tab.id === this.activeTabId
      this.openTabs.splice(index, 1)
      if(wasActive){
        const fallbackIndex = Math.min(index, this.openTabs.length - 1)
        this.activeTabId = this.openTabs[fallbackIndex]?.id || FIXED_TAB_IDS.MESSAGES
        if(this.activeTab?.pageType === VIRTUAL_PAGE_TYPES.MESSAGES){
          this.markMessagesRead()
          return true
        }
      }
      this.persistBrowser()
      return true
    },
    openBlankTab(options = {}){
      const tab = createTab(resolveVirtualUrl(VIRTUAL_URLS.BLANK), options)
      this.openTabs.push(tab)
      this.activeTabId = tab.id
      this.persistBrowser()
      return tab
    },
    goBack(){
      const tab = this.activeTab
      if(!tab || tab.historyIndex <= 0) return false

      tab.historyIndex -= 1
      syncTabWithEntry(tab, tab.history[tab.historyIndex])
      if(tab.pageType === VIRTUAL_PAGE_TYPES.MESSAGES) this.markMessagesRead()
      else this.persistBrowser()
      return true
    },
    goForward(){
      const tab = this.activeTab
      if(!tab || tab.historyIndex >= tab.history.length - 1) return false

      tab.historyIndex += 1
      syncTabWithEntry(tab, tab.history[tab.historyIndex])
      if(tab.pageType === VIRTUAL_PAGE_TYPES.MESSAGES) this.markMessagesRead()
      else this.persistBrowser()
      return true
    },
    reloadActive(){
      if(!this.activeTab) return false
      this.activeTab.reloadKey += 1
      this.persistBrowser()
      return true
    },
    updateTabState(tabId, patch = {}){
      const tab = this.openTabs.find((candidate) => candidate.id === tabId)
      if(!tab) return null

      tab.state = {
        ...sanitizePageState(tab.state),
        ...sanitizePageState(patch)
      }
      const current = tab.history[tab.historyIndex]
      if(current) current.state = sanitizePageState(tab.state)
      this.persistBrowser()
      return tab.state
    },
    notifyMessage(message = {}){
      const payload = typeof message === 'string' ? { text: message } : sanitizePageState(message)
      const messageId = payload.id || nextTabId('message')
      const messagesAreActive = this.activeTab?.pageType === VIRTUAL_PAGE_TYPES.MESSAGES
      if(messageId === this.lastMessageId) return this.toast

      this.lastMessageId = messageId
      if(messagesAreActive){
        this.unreadMessageCount = 0
        this.lastReadMessage = messageId
        this.toast = null
      }else{
        this.unreadMessageCount += 1
        this.toast = {
          id: nextTabId('toast'),
          messageId,
          sender: payload.sender || 'Messages',
          title: payload.title || '新しいメッセージ',
          preview: payload.preview || payload.text || ''
        }
      }

      this.syncMessagesUnread()
      this.persistBrowser()
      return this.toast
    },
    dismissToast(toastId = null){
      if(toastId && this.toast?.id !== toastId) return false
      if(!this.toast) return false
      this.toast = null
      return true
    },
    markMessagesRead(messageId = this.lastMessageId){
      this.unreadMessageCount = 0
      if(messageId !== null && messageId !== undefined) this.lastReadMessage = messageId
      this.toast = null
      this.syncMessagesUnread()
      this.persistBrowser()
    },
    // ---- debug console helpers -------------------------------------------
    setUnreadCount(count){
      this.unreadMessageCount = Math.max(0, Number(count) || 0)
      this.syncMessagesUnread()
      this.persistBrowser()
      return this.unreadMessageCount
    },
    closeExtraTabs(){
      const closed = this.openTabs.filter((tab) => tab.closable).length
      this.openTabs = this.openTabs.filter((tab) => !tab.closable)
      this.activeTabId = FIXED_TAB_IDS.MESSAGES
      this.persistBrowser()
      return closed
    },
    exportState(){
      return JSON.parse(JSON.stringify(browserSnapshot(this)))
    },
    // Restore tabs from a snapshot (or, with no payload, from the two fixed tabs).
    importState(payload = null){
      this.openTabs = payload ? restoreTabs(payload) : createInitialTabs()
      this.unreadMessageCount = Math.max(Number(payload?.unreadMessageCount) || 0, 0)
      this.lastReadMessage = payload?.lastReadMessage ?? null
      this.lastMessageId = payload?.lastMessageId ?? null
      this.activeTabId = this.openTabs.some((tab) => tab.id === payload?.activeTabId)
        ? payload.activeTabId
        : FIXED_TAB_IDS.MESSAGES
      this.toast = null
      this.initialized = true
      this.syncMessagesUnread()
      this.persistBrowser()
      return this.activeTab
    },
    resetBrowser(){
      return this.importState(null)
    }
  }
})
