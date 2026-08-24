// Path resolution for the general virtual web.
//
// Site data files only author the pages that carry real content (articles,
// threads, questions, products…). Everything a real site also has — the front
// page, category listings, monthly archives, the about/terms boilerplate — is
// derived from that content here, so 30 sites can cover a few hundred
// reachable URLs without a few hundred hand-written objects.

import { normalizePath } from './sites/kit.js'

const STATIC_PAGE_DEFS = Object.freeze({
  '/about': { kind: 'static-about', title: 'サイトについて' },
  '/privacy': { kind: 'static-privacy', title: 'プライバシーポリシー' },
  '/terms': { kind: 'static-terms', title: '利用規約' },
  '/contact': { kind: 'static-contact', title: 'お問い合わせ' }
})

const LISTING_KINDS = new Set(['article', 'entry', 'thread', 'question', 'review', 'product', 'term', 'wiki', 'notice', 'spot', 'software', 'photo', 'snapshot'])

function isListable(page){
  return LISTING_KINDS.has(page.kind) && !page.noindex
}

function byDateDesc(left, right){
  if(left.publishedAt === right.publishedAt) return left.title.localeCompare(right.title, 'ja')
  return left.publishedAt < right.publishedAt ? 1 : -1
}

export function siteArticles(site){
  return site.pages.filter(isListable).slice().sort(byDateDesc)
}

export function categoryLabel(site, slug){
  return site.categories.find((category) => category.slug === slug)?.label || slug
}

function categoryArticles(site, slug){
  const label = categoryLabel(site, slug)
  return siteArticles(site).filter((page) => page.category === label || page.category === slug)
}

function tagArticles(site, tag){
  return siteArticles(site).filter((page) => page.tags.includes(tag))
}

function monthsOf(site){
  const months = new Map()
  for(const page of siteArticles(site)){
    const month = page.publishedAt.slice(0, 7)
    if(month.length !== 7) continue
    months.set(month, (months.get(month) || 0) + 1)
  }
  return [...months.entries()]
    .sort((left, right) => (left[0] < right[0] ? 1 : -1))
    .map(([month, count]) => ({ month, count, path: `/archive/${month.replace('-', '/')}` }))
}

function yearsOf(site){
  const years = new Map()
  for(const page of siteArticles(site)){
    const year = page.publishedAt.slice(0, 4)
    if(year.length !== 4) continue
    years.set(year, (years.get(year) || 0) + 1)
  }
  return [...years.entries()]
    .sort((left, right) => (left[0] < right[0] ? 1 : -1))
    .map(([year, count]) => ({ year, count, path: `/archive/${year}` }))
}

export function siteMonths(site){
  return monthsOf(site)
}

export function siteYears(site){
  return yearsOf(site)
}

export function siteTags(site){
  const tags = new Map()
  for(const page of siteArticles(site)){
    for(const tag of page.tags) tags.set(tag, (tags.get(tag) || 0) + 1)
  }
  return [...tags.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'ja'))
    .map(([tag, count]) => ({ tag, count, path: `/tags/${encodeURIComponent(tag)}` }))
}

function derivedPage(site, path, definition){
  return Object.freeze({
    id: `${site.id}:${path}`,
    siteId: site.id,
    path,
    url: `https://${site.domain}${path}`,
    derived: true,
    kind: definition.kind,
    title: definition.title,
    heading: definition.heading || definition.title,
    subtitle: definition.subtitle || '',
    publishedAt: definition.publishedAt || '',
    updatedAt: definition.updatedAt || site.lastUpdated || '',
    era: '',
    category: definition.category || '',
    tags: Object.freeze([]),
    author: '',
    keywords: Object.freeze([...(definition.keywords || [])]),
    excerpt: definition.excerpt || '',
    lead: definition.lead || '',
    views: null,
    comments: null,
    art: definition.art || '',
    artSeed: definition.artSeed || path,
    weight: definition.weight ?? 0.6,
    noindex: Boolean(definition.noindex),
    layout: definition.layout || '',
    blocks: Object.freeze([]),
    posts: Object.freeze([]),
    items: Object.freeze([]),
    facts: Object.freeze([]),
    related: Object.freeze([]),
    data: Object.freeze({ ...(definition.data || {}) }),
    charCount: 0,
    listing: Object.freeze(definition.listing || [])
  })
}

function homePage(site){
  const articles = siteArticles(site)
  return derivedPage(site, '/', {
    kind: site.status === 'closed' ? 'closed' : 'home',
    title: site.name,
    heading: site.name,
    subtitle: site.tagline,
    excerpt: site.description,
    updatedAt: articles[0]?.publishedAt || site.lastUpdated || '',
    weight: 1.2,
    listing: articles
  })
}

function staticPage(site, path){
  const definition = STATIC_PAGE_DEFS[path]
  if(!definition) return null
  return derivedPage(site, path, {
    ...definition,
    title: `${definition.title} | ${site.name}`,
    heading: definition.title,
    excerpt: `${site.name}の${definition.title}。`,
    weight: 0.3,
    noindex: path !== '/about'
  })
}

// The site's own 404: a real page on the site, not a browser-level error.
export function notFoundPage(site, rawPath){
  const path = normalizePath(rawPath)
  return derivedPage(site, path, {
    kind: 'not-found',
    title: `ページが見つかりません | ${site.name}`,
    heading: 'ページが見つかりませんでした',
    noindex: true,
    weight: 0
  })
}

export function resolveSitePage(site, rawPath){
  const path = normalizePath(rawPath)
  const authored = site.pageByPath.get(path)
  if(authored) return authored

  if(path === '/') return homePage(site)

  if(STATIC_PAGE_DEFS[path] && site.staticPages) return staticPage(site, path)

  if(path === '/search'){
    return derivedPage(site, path, {
      kind: 'site-search',
      title: `サイト内検索 | ${site.name}`,
      heading: 'サイト内検索',
      noindex: true,
      listing: siteArticles(site)
    })
  }

  if(path === '/archive'){
    return derivedPage(site, path, {
      kind: 'archive-index',
      title: `アーカイブ | ${site.name}`,
      heading: 'アーカイブ',
      subtitle: '過去の記事を年月別にまとめています。',
      excerpt: `${site.name}の過去記事アーカイブ。`,
      weight: 0.7,
      listing: siteArticles(site)
    })
  }

  const categoryMatch = path.match(/^\/category\/([^/]+)$/)
  if(categoryMatch){
    const slug = decodeURIComponent(categoryMatch[1])
    const known = site.categories.some((category) => category.slug === slug)
    const listing = categoryArticles(site, slug)
    if(!known && !listing.length) return null
    const label = categoryLabel(site, slug)
    return derivedPage(site, path, {
      kind: 'category',
      title: `${label} | ${site.name}`,
      heading: label,
      category: label,
      subtitle: `${label}の記事一覧`,
      excerpt: `${site.name}の「${label}」カテゴリの記事一覧。全${listing.length}件。`,
      keywords: [label, slug],
      weight: 0.8,
      listing
    })
  }

  const tagMatch = path.match(/^\/tags\/([^/]+)$/)
  if(tagMatch){
    const tag = decodeURIComponent(tagMatch[1])
    const listing = tagArticles(site, tag)
    if(!listing.length) return null
    return derivedPage(site, path, {
      kind: 'tag',
      title: `タグ: ${tag} | ${site.name}`,
      heading: `タグ: ${tag}`,
      excerpt: `「${tag}」タグの記事一覧。全${listing.length}件。`,
      keywords: [tag],
      weight: 0.5,
      noindex: true,
      listing
    })
  }

  const monthMatch = path.match(/^\/archive\/(\d{4})\/(\d{2})$/)
  if(monthMatch){
    const [, year, month] = monthMatch
    const listing = siteArticles(site).filter((page) => page.publishedAt.startsWith(`${year}-${month}`))
    if(!listing.length) return null
    return derivedPage(site, path, {
      kind: 'archive-month',
      title: `${year}年${Number(month)}月の記事 | ${site.name}`,
      heading: `${year}年${Number(month)}月の記事`,
      excerpt: `${site.name}の${year}年${Number(month)}月に公開された記事${listing.length}件。`,
      keywords: [year, `${year}年${Number(month)}月`],
      weight: 0.5,
      listing
    })
  }

  const yearMatch = path.match(/^\/archive\/(\d{4})$/)
  if(yearMatch){
    const [, year] = yearMatch
    const listing = siteArticles(site).filter((page) => page.publishedAt.startsWith(year))
    if(!listing.length) return null
    return derivedPage(site, path, {
      kind: 'archive-year',
      title: `${year}年の記事 | ${site.name}`,
      heading: `${year}年の記事`,
      excerpt: `${site.name}の${year}年に公開された記事${listing.length}件。`,
      keywords: [year, `${year}年`],
      weight: 0.6,
      listing
    })
  }

  return null
}

// Every URL the site answers on. Used by the search index builder and by the
// content check script, never by the renderer.
export function listSitePaths(site){
  const paths = new Set(['/'])
  for(const page of site.pages) paths.add(page.path)
  if(site.staticPages) for(const path of Object.keys(STATIC_PAGE_DEFS)) paths.add(path)
  if(siteArticles(site).length){
    paths.add('/archive')
    for(const entry of yearsOf(site)) paths.add(entry.path)
    for(const entry of monthsOf(site)) paths.add(entry.path)
  }
  for(const category of site.categories) paths.add(`/category/${category.slug}`)
  for(const entry of siteTags(site)) paths.add(entry.path)
  return [...paths]
}

export function relatedArticles(site, page, limit = 4){
  const explicit = page.related
    .map((path) => site.pageByPath.get(normalizePath(path)))
    .filter(Boolean)
  if(explicit.length >= limit) return explicit.slice(0, limit)

  const pool = siteArticles(site).filter((candidate) => candidate.path !== page.path && !explicit.includes(candidate))
  const sameCategory = pool.filter((candidate) => candidate.category && candidate.category === page.category)
  const sharedTag = pool.filter((candidate) => candidate.tags.some((tag) => page.tags.includes(tag)) && !sameCategory.includes(candidate))
  return [...explicit, ...sameCategory, ...sharedTag, ...pool]
    .filter((candidate, index, list) => list.indexOf(candidate) === index)
    .slice(0, limit)
}

// Previous / next in publication order inside the same site.
export function articleNeighbours(site, page){
  const articles = siteArticles(site)
  const index = articles.findIndex((candidate) => candidate.path === page.path)
  if(index < 0) return { previous: null, next: null }
  return {
    previous: articles[index + 1] || null,
    next: articles[index - 1] || null
  }
}
