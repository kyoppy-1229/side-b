// Search-box suggestions.
//
// The base list is editorial (things an ordinary 2026 search box would offer),
// widened with keywords actually present in the general web index. Story terms
// are filtered out on both paths, so the box never completes its way toward the
// puzzle.

import { getWebIndex } from './buildWebIndex.js'
import { isBlockedSuggestion } from './storyExclusion.js'
import { normalizeSearchText } from './text.js'

export const BASE_SUGGESTIONS = Object.freeze([
  '今日の天気',
  'AI ニュース',
  'PC おすすめ',
  '学校 パソコン',
  '学校 パソコン 2015',
  'Windows 7',
  'Windows 7 サポート',
  'Windows 7 2015',
  'HTML CSS 入門',
  'JavaScript 入門',
  'フリーソフト 2014',
  '朝凪市 ごみ',
  '朝凪 観光',
  '地域ニュース',
  '映画 レビュー',
  '音楽 アルバム',
  'インターネット掲示板 とは',
  '昔のホームページ',
  '中古PC 選び方',
  '進路 高校 選び方'
])

const SUGGESTION_LIMIT = 8

let keywordPool = null

function buildKeywordPool(){
  const counts = new Map()
  for(const entry of getWebIndex()){
    for(const keyword of entry.keywords){
      const value = String(keyword).trim()
      if(!value || value.length < 2 || /^\d{4}$/.test(value)) continue
      if(isBlockedSuggestion(value)) continue
      counts.set(value, (counts.get(value) || 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'ja'))
    .map(([keyword]) => keyword)
}

function getKeywordPool(){
  if(!keywordPool) keywordPool = buildKeywordPool()
  return keywordPool
}

export function searchSuggestions(input){
  const query = normalizeSearchText(input)
  const pool = [...BASE_SUGGESTIONS, ...getKeywordPool()]
  const seen = new Set()
  const results = []

  for(const candidate of pool){
    if(isBlockedSuggestion(candidate)) continue
    const normalized = normalizeSearchText(candidate)
    if(seen.has(normalized) || normalized === query) continue
    if(query && !normalized.includes(query)) continue
    seen.add(normalized)
    results.push(candidate)
    if(results.length >= SUGGESTION_LIMIT) break
  }

  // With a query typed, offer the year-scoped and plain forms of it too — that
  // is how the era switch in the ranker gets discovered.
  if(query && results.length < SUGGESTION_LIMIT && !/\d{4}/.test(query)){
    const yearForm = `${input.trim()} 2015`
    if(!isBlockedSuggestion(yearForm)) results.push(yearForm)
  }

  return Object.freeze(results.slice(0, SUGGESTION_LIMIT))
}

export const HOME_SUGGESTIONS = Object.freeze([
  '今日の天気',
  'AI ニュース',
  '学校 パソコン 2015',
  'HTML CSS 入門',
  '朝凪 観光',
  'フリーソフト 2014'
])
