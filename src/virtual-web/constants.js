export const VIRTUAL_BROWSER_NAME = 'RE:TRACE Browser'

export const MESSAGES_ORIGIN = 'https://message.local'

// The chat app has screens of its own, and the address bar follows them the way
// it would on a real site. MESSAGES_URL is the app's front door — the home
// screen — so a player who has not opened a thread yet is not looking at
// someone else's thread URL.
export const MESSAGES_PATHS = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  CONTACTS: '/contacts',
  THREAD: '/thread'
})

export function buildMessagesUrl(path = MESSAGES_PATHS.HOME){
  const suffix = String(path || MESSAGES_PATHS.HOME)
  return `${MESSAGES_ORIGIN}${suffix.startsWith('/') ? suffix : `/${suffix}`}`
}

export const MESSAGES_URL = buildMessagesUrl(MESSAGES_PATHS.HOME)
export const TRACE_SEARCH_URL = 'https://trace.search/'

export const VIRTUAL_URLS = Object.freeze({
  MESSAGES: MESSAGES_URL,
  TRACE_SEARCH: TRACE_SEARCH_URL,
  // The story archive is hosted inside the ordinary forum, but its page is a
  // noindex/private path.  Only the link delivered by Mizuno points here.
  BBS_THREAD: 'https://minna-bbs.net/archive/private/20150307',
  SCHOOL_ARCHIVE: 'https://school.archive.local/',
  SCHOOL_GRADUATION_2015: 'https://school.archive.local/graduation/2015',
  NEWS_20150302: 'https://tohto-news.jp/articles/2015/03/20150302-17',
  GAME_REVIVAL: 'https://side-b.local/revival',
  GAME_ORIGINAL: 'https://side-b.local/original',
  BLANK: 'about:blank',
  ERROR: 'retrace://error'
})

export const LEGACY_VIRTUAL_URLS = Object.freeze({
  BBS_THREAD: 'https://bbs.archive.local/thread/20150307',
  NEWS_20150302: 'https://news.example.jp/20150302-17.html'
})

export const VIRTUAL_PAGE_TYPES = Object.freeze({
  MESSAGES: 'messages',
  TRACE_SEARCH: 'trace-search',
  BBS_THREAD: 'bbs-thread',
  SCHOOL_ARCHIVE: 'school-archive',
  SCHOOL_GRADUATION: 'school-graduation',
  NEWS: 'news',
  GAME_REVIVAL: 'game-revival',
  GAME_ORIGINAL: 'game-original',
  // Every ordinary site of the general virtual web (src/virtual-web/sites)
  // renders through this one page type; which site and which path is in the
  // tab state, not in the type.
  WEB_SITE: 'web-site',
  BLANK: 'blank',
  ERROR: 'error'
})

export const VIRTUAL_BROWSER_STORAGE_KEY = 'side-b:virtual-browser:v1'

export const VIRTUAL_ERROR_CODE = 'ERR_VIRTUAL_HOST_NOT_FOUND'

export const FIXED_TAB_IDS = Object.freeze({
  MESSAGES: 'messages',
  TRACE_SEARCH: 'trace-search'
})
