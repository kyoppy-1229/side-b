// Ranking for the general virtual web.
//
// score = titleScore + keywordScore + bodyScore + categoryScore + siteScore
//       + yearScore + siteAuthority + pageWeight + freshnessScore
//
// Two rules shape the feel of it:
//   * a query with a year in it ("学校 パソコン 2015") is read as "show me that
//     era", so pages from that year win and current pages are pushed down;
//   * a query without a year is read as "show me now", so 2025-2026 pages get a
//     small freshness bonus while the archive stays reachable below.

import { getWebIndex } from './buildWebIndex.js'
import { embeddedYears, isMeaningfulTerm, segmentTerm, tokenizeQuery, yearOfTerm } from './text.js'

const CURRENT_YEAR = 2026

function termScore(entry, term){
  let score = 0

  if(entry.titleText === term) score += 30
  else if(entry.titleText.includes(term)) score += 14

  if(entry.keywordList.includes(term)) score += 12
  else if(entry.keywordText.includes(term)) score += 7

  if(entry.categoryText && entry.categoryText === term) score += 8
  else if(entry.categoryText.includes(term)) score += 4

  if(entry.descriptionText.includes(term)) score += 5
  if(entry.bodyText.includes(term)) score += 3
  if(entry.siteText.includes(term)) score += 6

  return score
}

function yearScore(entry, years){
  if(!years.length) return 0
  if(!entry.year) return -6

  const distance = Math.min(...years.map((year) => Math.abs(entry.year - year)))
  if(distance === 0) return 28
  if(distance === 1) return 15
  if(distance === 2) return 7
  if(distance <= 4) return 0
  return -12
}

function freshnessScore(entry, years){
  if(years.length || !entry.year) return 0
  return Math.min(Math.max(entry.year - 2012, 0) * 0.9, 12)
}

function statusScore(entry){
  if(entry.siteStatus === 'closed') return -5
  if(entry.siteStatus === 'inactive') return -2
  return 0
}

function scoreEntry(entry, textTerms, years){
  let score = 0
  const matchedTerms = []

  for(const term of textTerms){
    const termTotal = termScore(entry, term)
    if(termTotal > 0){
      matchedTerms.push(term)
      score += termTotal
    }
  }

  if(textTerms.length > 1 && textTerms.every((term) => entry.titleText.includes(term))) score += 10

  score += yearScore(entry, years)
  score += freshnessScore(entry, years)
  score += entry.authority * 8
  score += entry.weight * 5
  score += statusScore(entry)

  return { score, matchedTerms }
}

function toResult(entry, score, matchedTerms, partial){
  return {
    id: entry.id,
    origin: 'web',
    url: entry.url,
    title: entry.title,
    description: entry.description,
    source: entry.siteName,
    domain: entry.domain,
    siteId: entry.siteId,
    siteStatus: entry.siteStatus,
    date: entry.date,
    era: entry.era,
    category: entry.category,
    type: entry.typeLabel,
    kind: entry.kind,
    score: Math.round(score * 100) / 100,
    matchedTerms,
    partial
  }
}

export function parseQuery(query){
  const terms = tokenizeQuery(query)
  const years = []
  const textTerms = []

  for(const term of terms){
    const exactYear = yearOfTerm(term)
    if(exactYear){
      years.push(exactYear)
      continue
    }
    if(isMeaningfulTerm(term)) textTerms.push(term)
    for(const year of embeddedYears(term)) years.push(year)
  }

  return {
    terms,
    textTerms,
    years: [...new Set(years)].filter((year) => year >= 1990 && year <= CURRENT_YEAR + 1)
  }
}

function collect(index, textTerms, years){
  const full = []
  const partial = []

  for(const entry of index){
    const { score, matchedTerms } = scoreEntry(entry, textTerms, years)

    // A year-only query ("2015") matches on the date alone.
    if(!textTerms.length){
      if(years.length && entry.year && Math.min(...years.map((year) => Math.abs(entry.year - year))) <= 2){
        full.push(toResult(entry, score, [], false))
      }
      continue
    }

    if(matchedTerms.length === textTerms.length){
      full.push(toResult(entry, score, matchedTerms, false))
      continue
    }
    // Real search engines still show "one of your terms matched" rows; they just
    // sit below everything that matched fully.
    if(matchedTerms.length) partial.push(toResult(entry, score, matchedTerms, true))
  }

  const byScore = (left, right) => right.score - left.score
    || (right.date || '').localeCompare(left.date || '')
    || left.title.localeCompare(right.title, 'ja')

  full.sort(byScore)
  partial.sort(byScore)
  return { full, partial }
}

export function searchWeb(query){
  const { terms, textTerms, years } = parseQuery(query)
  if(!terms.length) return { terms, years, results: [], full: 0, partial: 0, partialTotal: 0 }

  const index = getWebIndex()
  let { full, partial } = collect(index, textTerms, years)

  // Nothing matched a compound term as written ("地域ニュース"): try again with
  // the term split at script boundaries, the way a real engine would.
  if(!full.length && textTerms.length){
    const segmented = textTerms.flatMap(segmentTerm)
    if(segmented.length !== textTerms.length){
      const retry = collect(index, segmented, years)
      if(retry.full.length) ({ full, partial } = retry)
    }
  }

  // Partial rows are only worth showing when the full-match list is thin.
  const partialShown = full.length >= 8 ? [] : partial.slice(0, Math.max(0, 8 - full.length) + 4)

  return {
    terms,
    years,
    results: [...full, ...partialShown],
    full: full.length,
    partial: partialShown.length,
    partialTotal: partial.length
  }
}
