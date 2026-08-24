// TRACE Search's index.
//
// Two layers live behind one search box:
//   1. the story's own saved records (this file's virtualWebDocuments) — the
//      pages SIDE-B's plot hands the player;
//   2. the general virtual web (src/virtual-web/sites) — an ordinary 2026
//      internet with an archive going back to the 2000s.
//
// The general layer never contains story facts (see search/storyExclusion.js),
// so searching the open web cannot solve the game. The story layer is matched
// first and shown first, exactly as before.

import { VIRTUAL_URLS } from './constants.js'
import { filterTrialSearchDocuments } from '../trial/restrictions.js'
import { normalizeSearchText } from './search/text.js'
import { searchWeb } from './search/webSearch.js'
import { webIndexStats } from './search/buildWebIndex.js'
import { HOME_SUGGESTIONS, searchSuggestions } from './search/suggestions.js'

export const virtualWebDocuments = Object.freeze([
  Object.freeze({
    id: 'school-archive-home',
    title: '学校アーカイブ',
    url: VIRTUAL_URLS.SCHOOL_ARCHIVE,
    source: 'SCHOOL ARCHIVE',
    date: '',
    description: '卒業式と学校にまつわる保存記録を閲覧できるアーカイブ。',
    keywords: ['学校', 'アーカイブ', '閉校', '記録', '卒業式', '青い鳥'],
    type: '学校資料'
  }),
  Object.freeze({
    id: 'graduation-2015',
    title: '2015年度 卒業記録',
    url: VIRTUAL_URLS.SCHOOL_GRADUATION_2015,
    source: 'SCHOOL ARCHIVE',
    date: '2015',
    description: '卒業式で配られた青い鳥と集合写真についての保存記録。',
    keywords: ['2015', '卒業', '卒業式', '青い鳥', 'ぬいぐるみ', '集合写真', '学校'],
    type: '卒業記録'
  }),
])

function searchableText(document){
  return normalizeSearchText([
    document.title,
    document.description,
    document.source,
    document.date,
    document.type,
    ...document.keywords
  ].join(' '))
}

function termScore(document, normalizedTerm){
  const title = normalizeSearchText(document.title)
  const description = normalizeSearchText(document.description)
  const keywords = document.keywords.map(normalizeSearchText)
  const allText = searchableText(document)
  let score = 0

  if(title === normalizedTerm) score += 20
  else if(title.includes(normalizedTerm)) score += 10
  if(keywords.some(keyword => keyword === normalizedTerm)) score += 8
  else if(keywords.some(keyword => keyword.includes(normalizedTerm))) score += 5
  if(description.includes(normalizedTerm)) score += 3
  if(allText.includes(normalizedTerm)) score += 1
  return score
}

// The story's own records. Kept as a strict AND match over every term, which is
// what the plot's search steps rely on.
//
// The trial searches the same index with the archive's records filtered out (see
// trial/restrictions.js): they belong to a chapter it does not reach, so no
// wording of the query may surface them. The data itself is untouched, and the
// full game still finds every record exactly as before.
export function searchStoryDocuments(query){
  const normalizedQuery = normalizeSearchText(query)
  if(!normalizedQuery) return []

  const terms = normalizedQuery.split(' ').filter(Boolean)
  return filterTrialSearchDocuments(virtualWebDocuments)
    .map(document => ({
      ...document,
      origin: 'story',
      score: terms.reduce((total, term) => total + termScore(document, term), 0),
      matchedTerms: terms.filter(term => searchableText(document).includes(term))
    }))
    .filter(document => document.matchedTerms.length === terms.length)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, 'ja'))
}

// The whole index: story records first, then the ordinary web.
export function searchVirtualWeb(query){
  const story = searchStoryDocuments(query)
  const web = searchWeb(query)
  return [...story, ...web.results]
}

// Same search, with the extra facts the results screen shows (counts, the years
// the query was read as, whether partial matches had to be used).
export function searchVirtualWebDetailed(query){
  const story = searchStoryDocuments(query)
  const web = searchWeb(query)
  return {
    query: String(query ?? '').trim(),
    terms: web.terms,
    years: web.years,
    storyResults: story,
    webResults: web.results,
    results: [...story, ...web.results],
    total: story.length + web.full,
    partialShown: web.partial,
    partialTotal: web.partialTotal ?? 0
  }
}

export const TRACE_SEARCH_SUGGESTIONS = Object.freeze([
  '今日の天気',
  'ニュース',
  '新聞'
])

export { HOME_SUGGESTIONS, searchSuggestions, webIndexStats }
