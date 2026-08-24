// Second line of defence for the SIDE-B story.
//
// The primary rule is editorial: the general web (src/virtual-web/sites) never
// contains story facts in the first place. This module makes that rule
// enforceable — buildWebIndex drops any page whose text trips it, the check
// script fails the build, and suggestions never complete a story term.
//
// It intentionally does NOT block the player from typing these words. Typing
// "SIDE-B" into TRACE Search still reaches the story's own saved records
// (searchIndex.js); it just never reaches the ordinary internet.

import { normalizeSearchText } from './text.js'

// Terms that must never appear in general-web content.
export const STORY_KEYWORDS = Object.freeze([
  'side-b',
  'side b',
  'sideb',
  'サイドb',
  'さいどb',
  'revival',
  '復刻版',
  '青い鳥',
  'アクセスコード',
  '20:20',
  '地下解放',
  '水野ヒロキ',
  '田中シン',
  '山田アヤ',
  '中村ユイ',
  'side-b.local',
  'bbs.archive.local',
  'school.archive.local'
])

// Story-adjacent words that are fine as ordinary vocabulary but must not be
// offered as a suggestion — the search box should never hint at the puzzle.
export const SUGGESTION_BLOCKLIST = Object.freeze([
  ...STORY_KEYWORDS,
  '閉校記念',
  '卒業記念品',
  'ぬいぐるみ 写真',
  '学校 アーカイブ',
  '地下'
])

const normalizedStoryKeywords = STORY_KEYWORDS.map(normalizeSearchText)
const normalizedSuggestionBlocklist = SUGGESTION_BLOCKLIST.map(normalizeSearchText)

export function containsStoryKeyword(value){
  const text = normalizeSearchText(value)
  if(!text) return false
  return normalizedStoryKeywords.some((keyword) => text.includes(keyword))
}

export function isBlockedSuggestion(value){
  const text = normalizeSearchText(value)
  if(!text) return false
  return normalizedSuggestionBlocklist.some((keyword) => text.includes(keyword))
}
