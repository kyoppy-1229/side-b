// What the trial does not hand out.
//
// The trial stops at "there was a BBS, and it might still be there". Everything
// past that point is the full game's, so the pages that would carry the player
// into it are simply not reachable while the tab is running the trial — not by
// search, not from the new-tab shortcuts, and not by typing the address.
//
// None of this edits the underlying data: the archive, its graduation record and
// the BBS log are all still there, unchanged, for the full game. This is a
// filter that only exists while `isTrialMode()` is true.

import { VIRTUAL_URLS } from '../virtual-web/constants.js'
import { isTrialMode } from './mode.js'

// Story records that must not appear in TRACE Search during the trial. Ids are
// from virtual-web/searchIndex.js (virtualWebDocuments).
export const TRIAL_HIDDEN_SEARCH_DOCUMENT_IDS = Object.freeze([
  'school-archive-home',
  'graduation-2015'
])

// Pages the trial never opens, whatever the player types.
//
//   * 学校アーカイブ and its 2015 record — the full game's chapter 2 material;
//   * the private BBS log — the trial ends before it (the story guard would
//     refuse it anyway, this is the belt to that pair of braces);
//   * the original build — the full game's second half.
export const TRIAL_BLOCKED_URLS = Object.freeze([
  VIRTUAL_URLS.SCHOOL_ARCHIVE,
  VIRTUAL_URLS.SCHOOL_GRADUATION_2015,
  VIRTUAL_URLS.BBS_THREAD,
  VIRTUAL_URLS.GAME_ORIGINAL
])

const HIDDEN_DOCUMENT_IDS = new Set(TRIAL_HIDDEN_SEARCH_DOCUMENT_IDS)
const BLOCKED_URLS = new Set(TRIAL_BLOCKED_URLS)

export function isSearchDocumentHiddenInTrial(document){
  return isTrialMode() && HIDDEN_DOCUMENT_IDS.has(document?.id)
}

export function filterTrialSearchDocuments(documents){
  if(!isTrialMode()) return documents
  return documents.filter((document) => !HIDDEN_DOCUMENT_IDS.has(document?.id))
}

export function isUrlBlockedInTrial(url){
  return isTrialMode() && BLOCKED_URLS.has(url)
}
