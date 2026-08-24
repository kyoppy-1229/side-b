import { getSiteByDomain } from './sites/index.js'
import { resolveSitePage } from './pages.js'
import {
  FIXED_TAB_IDS,
  MESSAGES_ORIGIN,
  MESSAGES_URL,
  TRACE_SEARCH_URL,
  VIRTUAL_ERROR_CODE,
  VIRTUAL_PAGE_TYPES,
  VIRTUAL_URLS,
  LEGACY_VIRTUAL_URLS
} from './constants.js'

function createRoute(route){
  return Object.freeze({
    fixed: false,
    closable: true,
    ...route
  })
}

export const virtualWebRoutes = Object.freeze([
  createRoute({
    id: FIXED_TAB_IDS.MESSAGES,
    title: 'Messages',
    url: MESSAGES_URL,
    pageType: VIRTUAL_PAGE_TYPES.MESSAGES,
    fixed: true,
    closable: false
  }),
  createRoute({
    id: FIXED_TAB_IDS.TRACE_SEARCH,
    title: 'TRACE Search',
    url: TRACE_SEARCH_URL,
    pageType: VIRTUAL_PAGE_TYPES.TRACE_SEARCH,
    fixed: true,
    closable: false
  }),
  createRoute({
    id: 'school-archive',
    title: '学校アーカイブ',
    url: VIRTUAL_URLS.SCHOOL_ARCHIVE,
    pageType: VIRTUAL_PAGE_TYPES.SCHOOL_ARCHIVE
  }),
  createRoute({
    id: 'school-graduation-2015',
    title: '2015年度 卒業記録',
    url: VIRTUAL_URLS.SCHOOL_GRADUATION_2015,
    pageType: VIRTUAL_PAGE_TYPES.SCHOOL_GRADUATION
  }),
  createRoute({
    id: 'game-revival',
    title: 'SIDE-B / REVIVAL',
    url: VIRTUAL_URLS.GAME_REVIVAL,
    pageType: VIRTUAL_PAGE_TYPES.GAME_REVIVAL
  }),
  createRoute({
    id: 'game-original',
    title: 'SIDE-B / START',
    url: VIRTUAL_URLS.GAME_ORIGINAL,
    pageType: VIRTUAL_PAGE_TYPES.GAME_ORIGINAL
  }),
  createRoute({
    id: 'blank',
    title: '新しいタブ',
    url: VIRTUAL_URLS.BLANK,
    pageType: VIRTUAL_PAGE_TYPES.BLANK
  }),
  createRoute({
    id: 'error',
    title: '接続できません',
    url: VIRTUAL_URLS.ERROR,
    pageType: VIRTUAL_PAGE_TYPES.ERROR
  })
])

const routeByUrl = new Map(virtualWebRoutes.map((route) => [route.url, route]))
const legacyUrlAliases = new Map([
  [LEGACY_VIRTUAL_URLS.BBS_THREAD, VIRTUAL_URLS.BBS_THREAD],
  [LEGACY_VIRTUAL_URLS.NEWS_20150302, VIRTUAL_URLS.NEWS_20150302]
])
const MESSAGES_HOSTNAME = new URL(MESSAGES_ORIGIN).hostname
const domainPattern = /^[a-z\d](?:[a-z\d-]*[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]*[a-z\d])?)+(?:\:\d+)?(?:[/?#]|$)/i
const schemePattern = /^[a-z][a-z\d+.-]*:/i

function trimTrailingSlash(pathname){
  if(pathname === '/') return pathname
  return pathname.replace(/\/+$/, '') || '/'
}

export function looksLikeVirtualUrl(value){
  const input = String(value ?? '').trim()
  if(!input || /\s/.test(input)) return false
  if(input === VIRTUAL_URLS.BLANK || input === VIRTUAL_URLS.ERROR) return true
  return schemePattern.test(input) || input.startsWith('//') || domainPattern.test(input)
}

export function normalizeVirtualUrl(value){
  const input = String(value ?? '').trim()
  if(!input) return VIRTUAL_URLS.BLANK
  if(input === VIRTUAL_URLS.BLANK || input === VIRTUAL_URLS.ERROR) return input

  let candidate = input
  if(candidate.startsWith('//')) candidate = `https:${candidate}`
  else if(!schemePattern.test(candidate)) candidate = `https://${candidate}`

  try {
    const parsed = new URL(candidate)
    if(parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    parsed.protocol = 'https:'
    parsed.username = ''
    parsed.password = ''
    parsed.hostname = parsed.hostname.toLowerCase()
    parsed.pathname = trimTrailingSlash(parsed.pathname)
    parsed.hash = ''
    return parsed.toString()
  } catch {
    return null
  }
}

function routeLookupUrl(normalizedUrl){
  if(normalizedUrl === VIRTUAL_URLS.BLANK || normalizedUrl === VIRTUAL_URLS.ERROR) return normalizedUrl

  try {
    const parsed = new URL(normalizedUrl)
    parsed.search = ''
    parsed.hash = ''
    return parsed.toString()
  } catch {
    return normalizedUrl
  }
}

function queryState(normalizedUrl){
  try {
    const parsed = new URL(normalizedUrl)
    return parsed.search
      ? { query: Object.fromEntries(parsed.searchParams.entries()) }
      : {}
  } catch {
    return {}
  }
}

// The general virtual web is resolved by domain + path instead of by an entry
// in virtualWebRoutes: 30-plus sites answer on a few hundred paths, and listing
// each one as a route would only duplicate the site data.
function resolveWebSiteUrl(normalizedUrl){
  let parsed
  try {
    parsed = new URL(normalizedUrl)
  } catch {
    return null
  }

  const site = getSiteByDomain(parsed.hostname)
  if(!site) return null

  const path = trimTrailingSlash(parsed.pathname)
  const page = resolveSitePage(site, path)
  const query = parsed.search ? Object.fromEntries(parsed.searchParams.entries()) : {}

  return {
    id: `web:${site.id}:${page ? page.path : path}`,
    title: page ? page.title : `ページが見つかりません | ${site.name}`,
    url: normalizedUrl,
    pageType: VIRTUAL_PAGE_TYPES.WEB_SITE,
    fixed: false,
    closable: true,
    found: true,
    normalizedUrl,
    requestedUrl: normalizedUrl,
    state: {
      siteId: site.id,
      path,
      notFound: !page,
      ...(Object.keys(query).length ? { query } : {})
    }
  }
}

// Every path under the chat app's own host belongs to the Messages tab: the
// screens there (home, contacts, a thread) are the app's business, so an
// address typed into the bar lands on the app rather than on the error page.
function resolveMessagesUrl(normalizedUrl){
  let parsed
  try {
    parsed = new URL(normalizedUrl)
  } catch {
    return null
  }
  if(parsed.hostname !== MESSAGES_HOSTNAME) return null

  const route = routeByUrl.get(MESSAGES_URL)
  return {
    ...route,
    found: true,
    normalizedUrl: route.url,
    requestedUrl: normalizedUrl,
    state: queryState(normalizedUrl)
  }
}

export function resolveVirtualUrl(value){
  const rawValue = String(value ?? '').trim()
  const requestedNormalizedUrl = normalizeVirtualUrl(rawValue)
  const normalizedUrl = requestedNormalizedUrl
    ? (legacyUrlAliases.get(requestedNormalizedUrl) || requestedNormalizedUrl)
    : requestedNormalizedUrl
  const route = normalizedUrl ? routeByUrl.get(routeLookupUrl(normalizedUrl)) : null

  if(route && route.pageType !== VIRTUAL_PAGE_TYPES.ERROR){
    return {
      ...route,
      found: true,
      normalizedUrl: route.url,
      requestedUrl: normalizedUrl,
      state: queryState(normalizedUrl)
    }
  }

  const messages = normalizedUrl ? resolveMessagesUrl(normalizedUrl) : null
  if(messages) return messages

  const webSite = normalizedUrl ? resolveWebSiteUrl(normalizedUrl) : null
  if(webSite) return webSite

  const errorRoute = routeByUrl.get(VIRTUAL_URLS.ERROR)
  const requestedUrl = normalizedUrl || rawValue
  return {
    ...errorRoute,
    found: false,
    normalizedUrl: requestedUrl || VIRTUAL_URLS.ERROR,
    requestedUrl,
    state: {
      errorCode: VIRTUAL_ERROR_CODE,
      requestedUrl
    }
  }
}

export function resolveAddressInput(value){
  const input = String(value ?? '').trim()
  if(!input){
    return {
      kind: 'blank',
      ...resolveVirtualUrl(VIRTUAL_URLS.BLANK)
    }
  }

  if(!looksLikeVirtualUrl(input)){
    const traceRoute = resolveVirtualUrl(TRACE_SEARCH_URL)
    return {
      ...traceRoute,
      kind: 'search',
      normalizedUrl: TRACE_SEARCH_URL,
      requestedUrl: TRACE_SEARCH_URL,
      state: { searchQuery: input },
      searchQuery: input
    }
  }

  return {
    kind: 'url',
    ...resolveVirtualUrl(input)
  }
}

export function getVirtualRoute(url){
  const resolved = resolveVirtualUrl(url)
  return resolved.found ? resolved : null
}

export function isKnownVirtualUrl(url){
  return Boolean(getVirtualRoute(url))
}
