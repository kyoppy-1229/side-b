<template>
  <VirtualBrowser>
    <!-- The protagonist thinking his way around the browser: it belongs to the
         window, not to a page, so it lives in the window's overlay slot. -->
    <template v-if="showSearchTutorial" #overlay>
      <SearchTutorial :seen="searchTutorialSeen" @open-search="openSearchTab" />
    </template>

    <template #page="{ tab, active, reloadKey, openUrl, submitAddress, notifyMessage }">
      <ChatApp
        v-if="tab.pageType === PAGE.MESSAGES"
        :key="pageKey(tab, reloadKey)"
        :active="active"
        @open-url="openUrl"
        @notify-message="notifyMessage"
        @location="browser.setMessagesLocation($event)"
      />

      <TraceSearch
        v-else-if="tab.pageType === PAGE.TRACE_SEARCH"
        :key="pageKey(tab, reloadKey)"
        :query="tab.state?.searchQuery || tab.state?.query?.q || ''"
        @open-url="openUrl"
        @search="onSearch(tab.id, $event)"
      />

      <BBSView
        v-else-if="tab.pageType === PAGE.BBS_THREAD"
        :key="pageKey(tab, reloadKey)"
        embedded
        @open-url="openUrl"
        @return-messages="openMessages"
      />

      <SchoolArchivePage
        v-else-if="tab.pageType === PAGE.SCHOOL_ARCHIVE || tab.pageType === PAGE.SCHOOL_GRADUATION"
        :key="pageKey(tab, reloadKey)"
        :page="tab.pageType"
        @open-url="openUrl"
      />

      <NewsArticle
        v-else-if="tab.pageType === PAGE.NEWS"
        :key="pageKey(tab, reloadKey)"
        embedded
        @back="goBackOrClose(tab)"
      />

      <GamePage
        v-else-if="tab.pageType === PAGE.GAME_REVIVAL || tab.pageType === PAGE.GAME_ORIGINAL"
        :key="pageKey(tab, reloadKey)"
        :edition="tab.pageType === PAGE.GAME_ORIGINAL ? 'original' : 'revival'"
        :active="active"
      />

      <WebSitePage
        v-else-if="tab.pageType === PAGE.WEB_SITE"
        :key="pageKey(tab, reloadKey)"
        :site-id="tab.state?.siteId || ''"
        :path="tab.state?.path || '/'"
        :query="tab.state?.query || {}"
        :not-found="Boolean(tab.state?.notFound)"
        :allow-return-messages="!trialEdition"
        @navigate="browser.navigateInTab(tab.id, $event)"
        @open-url="openUrl"
        @return-messages="openMessages"
      />

      <VirtualBlankPage
        v-else-if="tab.pageType === PAGE.BLANK"
        :key="pageKey(tab, reloadKey)"
        :suggested-urls="suggestedUrls"
        @navigate="submitAddress"
        @open-url="openUrl"
      />

      <VirtualErrorPage
        v-else
        :key="pageKey(tab, reloadKey)"
        :url="tab.state?.requestedUrl || tab.currentUrl"
        :code="tab.state?.errorCode"
      />
    </template>
  </VirtualBrowser>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VirtualBrowser from '../components/browser/VirtualBrowser.vue'
import SearchTutorial from '../components/browser/SearchTutorial.vue'
import ChatApp from '../components/chat/ChatApp.vue'
import SchoolArchivePage from '../components/pages/SchoolArchivePage.vue'
import VirtualBlankPage from '../components/pages/VirtualBlankPage.vue'
import VirtualErrorPage from '../components/pages/VirtualErrorPage.vue'
import TraceSearch from '../components/search/TraceSearch.vue'
import WebSitePage from '../components/web/WebSitePage.vue'
import { useStoryStore } from '../store/story.js'
import { useGameStore } from '../store/index.js'
import { useVirtualBrowserStore } from '../store/virtualBrowser.js'
import { STORY_CHAPTERS } from '../story/chapters.js'
import { STORY_EVENTS } from '../story/events.js'
import { STORY_MILESTONES } from '../story/transitions.js'
import { FIXED_TAB_IDS, MESSAGES_URL, TRACE_SEARCH_URL, VIRTUAL_PAGE_TYPES, VIRTUAL_URLS } from '../virtual-web/constants.js'
import { isTrialMode } from '../trial/mode.js'
import { isUrlBlockedInTrial } from '../trial/restrictions.js'
import BBSView from './BBSView.vue'
import GamePage from '../components/game/GamePage.vue'
import NewsArticle from './NewsArticle.vue'

const route = useRoute()
const router = useRouter()
const browser = useVirtualBrowserStore()
const storyState = useStoryStore()
const PAGE = VIRTUAL_PAGE_TYPES

// The prologue's middle beat: signed in, nothing in the chat, and no idea yet
// that searching is the thing to do. It ends the moment the player searches.
const searchTutorialSeen = computed(() => storyState.hasMilestone(STORY_MILESTONES.SEARCH_TUTORIAL_SEEN))
const hasSearched = computed(() => storyState.hasMilestone(STORY_MILESTONES.FIRST_SEARCH_PERFORMED))
const showSearchTutorial = computed(() => (
  storyState.chapter === STORY_CHAPTERS.PROLOGUE &&
  storyState.step === 'chat_home' &&
  !hasSearched.value
))

// New-tab shortcuts: the two fixed tools, the story's archive, and a few
// ordinary sites so the general web is reachable without knowing a domain.
// The trial drops whatever it does not hand out (trial/restrictions.js), so the
// archive is not offered there either.
const SUGGESTED_URLS = Object.freeze([
  Object.freeze({ title: 'Messages', url: VIRTUAL_URLS.MESSAGES }),
  Object.freeze({ title: 'TRACE Search', url: VIRTUAL_URLS.TRACE_SEARCH }),
  Object.freeze({ title: '学校アーカイブ', url: VIRTUAL_URLS.SCHOOL_ARCHIVE }),
  Object.freeze({ title: 'NaviWeb', url: 'https://naviweb.jp/' }),
  Object.freeze({ title: '東都ニュースオンライン', url: 'https://tohto-news.jp/' }),
  Object.freeze({ title: 'みんなの百科', url: 'https://minna-pedia.jp/' }),
  Object.freeze({ title: 'WeatherLine', url: 'https://weatherline.jp/' })
])

const suggestedUrls = computed(() => SUGGESTED_URLS.filter((entry) => !isUrlBlockedInTrial(entry.url)))

// The trial's last page is the saved log itself: it is read, and no page offers
// a way on from there. The mode is decided at boot and never changes after it.
const trialEdition = isTrialMode()

function pageKey(tab, reloadKey){
  return `${tab.id}:${reloadKey}`
}

function openMessages(){
  // The private archive is the chapter boundary. The event is ignored when
  // the player is already beyond it, so returning from a restored tab is safe.
  storyState.dispatch(STORY_EVENTS.BBS_COMPLETE)
  // Keep the legacy bridge in sync for debug snapshots and older saves.
  const gameStore = useGameStore()
  gameStore.completeBBS()
  browser.openVirtualUrl(MESSAGES_URL)
}

function openSearchTab(){
  browser.openVirtualUrl(TRACE_SEARCH_URL)
}

// A search from the page itself. The tab state is what TRACE Search reads back,
// so it is written here exactly as before; the story is told separately.
function onSearch(tabId, query){
  browser.updateTabState(tabId, { searchQuery: query })
}

// Every way of searching ends up in the search tab's state — the page's own box,
// a suggestion, or plain words typed into the address bar — so the story is told
// from there rather than from each of those places.
watch(
  () => browser.openTabs.find((tab) => tab.id === FIXED_TAB_IDS.TRACE_SEARCH)?.state?.searchQuery || '',
  (query) => {
    if(!query.trim()) return
    storyState.dispatch(STORY_EVENTS.FIRST_SEARCH_PERFORMED)
  }
)

function goBackOrClose(tab){
  if(browser.activeTabId !== tab.id) browser.activateTab(tab.id)
  if(browser.goBack()) return
  browser.closeTab(tab.id)
}

onMounted(() => {
  browser.initializeBrowser()
  const virtualUrl = route.meta?.virtualUrl
  if(!virtualUrl) return
  browser.openVirtualUrl(virtualUrl)
  router.replace('/')
})
</script>
