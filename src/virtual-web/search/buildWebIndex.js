// Builds the flat search index for the general virtual web.
//
// The index is built once, lazily, on the first search — never at module
// evaluation — and it only keeps the strings the ranker actually reads. Page
// bodies are folded into a single truncated, pre-normalized blob so scoring a
// query never walks the block trees again.

import { virtualWebSites } from '../sites/index.js'
import { resolveSitePage, siteArticles } from '../pages.js'
import { normalizeSearchText } from './text.js'
import { containsStoryKeyword } from './storyExclusion.js'

const BODY_TEXT_LIMIT = 1400

export const PAGE_KIND_LABELS = Object.freeze({
  home: 'サイトトップ',
  article: '記事',
  entry: 'ブログ記事',
  thread: '掲示板スレッド',
  question: 'Q&A',
  review: 'レビュー',
  product: '商品ページ',
  term: '用語解説',
  wiki: '百科事典',
  notice: 'お知らせ',
  spot: '施設案内',
  software: 'ソフトウェア',
  photo: '写真',
  snapshot: '保存ページ',
  guide: 'ガイド',
  data: '資料',
  category: 'カテゴリ',
  closed: '閉鎖サイト',
  'archive-index': 'アーカイブ',
  'static-about': 'サイト情報'
})

function blockText(block){
  if(block.text) return String(block.text)
  if(block.items){
    return block.items
      .map((item) => (typeof item === 'string' ? item : Object.values(item).filter((value) => typeof value === 'string').join(' ')))
      .join(' ')
  }
  if(block.rows) return block.rows.flat().join(' ')
  if(block.caption) return String(block.caption)
  return ''
}

function pageBodyText(page){
  const parts = [
    page.lead,
    page.excerpt,
    ...page.blocks.map(blockText),
    ...page.posts.map((post) => `${post.name} ${post.text}`),
    ...page.items.map((item) => [item.title, item.name, item.text, item.note, item.summary].filter(Boolean).join(' ')),
    ...page.facts.map((fact) => `${fact.label || ''} ${fact.value || ''}`)
  ]
  return parts.filter(Boolean).join(' ').slice(0, BODY_TEXT_LIMIT)
}

function indexEntry(site, page){
  const description = page.excerpt || page.lead || site.description
  const bodyText = pageBodyText(page)
  const keywords = [...page.keywords, ...page.tags]

  return Object.freeze({
    id: `web:${page.id}`,
    url: page.url,
    path: page.path,
    siteId: site.id,
    siteName: site.name,
    domain: site.domain,
    siteKind: site.kind,
    siteStatus: site.status,
    authority: site.authority,
    title: page.title,
    description,
    date: page.publishedAt || page.updatedAt || '',
    era: page.era,
    category: page.category,
    kind: page.kind,
    typeLabel: PAGE_KIND_LABELS[page.kind] || 'ページ',
    keywords: Object.freeze([...keywords]),
    keywordList: Object.freeze(keywords.map(normalizeSearchText)),
    weight: page.weight,
    year: Number(String(page.publishedAt || '').slice(0, 4)) || null,
    titleText: normalizeSearchText(page.title),
    keywordText: normalizeSearchText([...keywords, page.category].join(' ')),
    descriptionText: normalizeSearchText(description),
    bodyText: normalizeSearchText(bodyText),
    categoryText: normalizeSearchText(page.category),
    siteText: normalizeSearchText(`${site.name} ${site.shortName} ${site.domain} ${site.tagline} ${site.keywords.join(' ')}`)
  })
}

// Pages that go into the index: everything authored, plus the front page and the
// category listings (which is what a real crawler would keep). Monthly archives
// and tag pages stay reachable by link but out of the index, so a year query
// surfaces articles rather than列 of listing pages.
function indexablePages(site){
  const pages = site.pages.filter((page) => !page.noindex)
  const derived = [resolveSitePage(site, '/')]
  if(siteArticles(site).length) derived.push(resolveSitePage(site, '/archive'))
  for(const category of site.categories){
    const page = resolveSitePage(site, `/category/${category.slug}`)
    if(page) derived.push(page)
  }
  return [...pages, ...derived.filter(Boolean).filter((page) => !page.noindex)]
}

let cachedIndex = null
let excludedCount = 0

export function buildWebIndex(){
  const entries = []
  excludedCount = 0

  for(const site of virtualWebSites){
    for(const page of indexablePages(site)){
      const entry = indexEntry(site, page)
      // Editorial rule made mechanical: story facts never enter the general
      // index, even if a data file were to slip one in.
      if(containsStoryKeyword(`${entry.title} ${entry.description} ${entry.keywordText} ${entry.bodyText}`)){
        excludedCount += 1
        continue
      }
      entries.push(entry)
    }
  }

  return Object.freeze(entries)
}

export function getWebIndex(){
  if(!cachedIndex) cachedIndex = buildWebIndex()
  return cachedIndex
}

export function webIndexStats(){
  const index = getWebIndex()
  return {
    entries: index.length,
    sites: virtualWebSites.length,
    excluded: excludedCount
  }
}
