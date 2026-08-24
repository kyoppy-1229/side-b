// Shared text normalization for every search surface (TRACE Search, per-site
// search boxes, suggestions). Japanese input arrives in mixed width and case,
// so everything is folded to NFKC lower case with runs of separators collapsed.
export function normalizeSearchText(value){
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('ja')
    .replace(/[\s　_・/]+/g, ' ')
    .trim()
}

export function tokenizeQuery(value){
  const normalized = normalizeSearchText(value)
  if(!normalized) return []
  return normalized.split(' ').filter(Boolean)
}

const YEAR_PATTERN = /^(?:(19|20)\d{2})(?:年|年度)?$/

// "2015" / "2015年" / "2015年度" all mean "scope this to that year".
export function yearOfTerm(term){
  const match = term.match(YEAR_PATTERN)
  if(!match) return null
  return Number(term.slice(0, 4))
}

// Years mentioned inside a longer term ("windows7発売2015" and the like).
export function embeddedYears(term){
  return [...term.matchAll(/(?:19|20)\d{2}/g)].map((match) => Number(match[0]))
}

// A term carries no signal on its own when it is a single latin letter or digit
// ("b", "7"): it substring-matches half the index. Single CJK characters are
// kept, since one kanji is a real query in Japanese.
export function isMeaningfulTerm(term){
  if(term.length >= 2) return true
  return !/^[a-z0-9]$/i.test(term)
}

// Rough segmentation at script boundaries, used as a fallback when a compound
// term matches nothing: "地域ニュース" -> ["地域", "ニュース"].
export function segmentTerm(term){
  const matched = term.match(/[\u4e00-\u9fff々]+|[\u30a0-\u30ff\u30fc]+|[\u3040-\u309f]+|[a-z0-9.+#-]+/gi)
  if(!matched || matched.length < 2) return [term]
  return matched.filter(isMeaningfulTerm)
}
