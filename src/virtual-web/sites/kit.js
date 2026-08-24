// Authoring kit for the general virtual web (the "ordinary internet" the player
// can browse from TRACE Search). Site data files stay declarative: this module
// turns the shorthand they use into the normalized shape the renderer, the
// resolver and the search index all read.
//
// Nothing here knows anything about the SIDE-B story. Story pages live in
// registry.js / searchIndex.js and are resolved before these sites are.

const DEFAULT_AUTHORITY = 0.5

function eraOf(dateText){
  const year = Number(String(dateText ?? '').slice(0, 4))
  if(!Number.isFinite(year) || !year) return ''
  if(year >= 2020) return '2020s'
  if(year >= 2010) return '2010s'
  if(year >= 2000) return '2000s'
  return '1990s'
}

function normalizeBlock(block){
  if(typeof block === 'string') return Object.freeze({ type: 'p', text: block })
  if(Array.isArray(block)) return Object.freeze({ type: 'ul', items: Object.freeze([...block]) })
  if(!block || typeof block !== 'object') return Object.freeze({ type: 'p', text: String(block ?? '') })
  if(block.type) return Object.freeze({ ...block })

  const key = Object.keys(block)[0]
  const value = block[key]
  switch(key){
    case 'h': return Object.freeze({ type: 'h', level: 2, text: value })
    case 'h3': return Object.freeze({ type: 'h', level: 3, text: value })
    case 'ul': return Object.freeze({ type: 'ul', items: Object.freeze([...value]) })
    case 'ol': return Object.freeze({ type: 'ol', items: Object.freeze([...value]) })
    case 'quote': return Object.freeze({ type: 'quote', text: value, cite: block.cite || '' })
    case 'note': return Object.freeze({ type: 'note', text: value, label: block.label || '' })
    case 'img': return Object.freeze(typeof value === 'string'
      ? { type: 'img', art: value, caption: block.caption || '' }
      : { type: 'img', ...value })
    case 'code': return Object.freeze({ type: 'code', text: value, lang: block.lang || '' })
    case 'table': return Object.freeze({ type: 'table', head: value.head || [], rows: value.rows || [] })
    case 'dl': return Object.freeze({ type: 'dl', items: Object.freeze([...value]) })
    case 'links': return Object.freeze(Array.isArray(value)
      ? { type: 'links', items: Object.freeze([...value]), label: block.label || '' }
      : { type: 'links', items: Object.freeze([...(value.items || [])]), label: value.label || block.label || '' })
    case 'spec': return Object.freeze({ type: 'spec', items: Object.freeze([...value]) })
    default: return Object.freeze({ type: 'p', text: String(value ?? '') })
  }
}

function blockText(block){
  if(block.text) return String(block.text)
  if(block.items) return block.items.map((item) => (typeof item === 'string' ? item : Object.values(item).join(' '))).join(' ')
  if(block.rows) return block.rows.flat().join(' ')
  if(block.caption) return String(block.caption)
  return ''
}

function normalizePath(path){
  const value = String(path ?? '/').trim()
  if(!value || value === '/') return '/'
  const withSlash = value.startsWith('/') ? value : `/${value}`
  return withSlash.replace(/\/+$/, '') || '/'
}

// Comment/answer/post threads share one shape so the templates can reuse parts.
function normalizePosts(posts){
  return Object.freeze((posts || []).map((post, index) => Object.freeze({
    no: post.no ?? index + 1,
    name: post.name || '名無しさん',
    date: post.date || '',
    text: post.text || '',
    best: Boolean(post.best),
    likes: post.likes ?? null,
    replyTo: post.replyTo ?? null
  })))
}

function normalizePage(page, site){
  const path = normalizePath(page.path)
  const blocks = Object.freeze((page.body || []).map(normalizeBlock))
  const publishedAt = page.date || page.publishedAt || ''
  const bodyText = blocks.map(blockText).join(' ')
  const postsText = (page.posts || []).map((post) => post.text).join(' ')

  return Object.freeze({
    id: `${site.id}${path === '/' ? ':home' : `:${path}`}`,
    siteId: site.id,
    path,
    url: `https://${site.domain}${path === '/' ? '/' : path}`,
    kind: page.kind || 'article',
    title: page.title,
    heading: page.heading || page.title,
    subtitle: page.subtitle || '',
    publishedAt,
    updatedAt: page.updatedAt || publishedAt,
    era: page.era || eraOf(publishedAt),
    category: page.category || '',
    tags: Object.freeze([...(page.tags || [])]),
    author: page.author || site.defaultAuthor || '',
    keywords: Object.freeze([...(page.keywords || [])]),
    excerpt: page.excerpt || '',
    lead: page.lead || '',
    views: page.views ?? null,
    comments: page.comments ?? null,
    art: page.art || '',
    artSeed: page.artSeed || page.title || path,
    weight: page.weight ?? 1,
    noindex: Boolean(page.noindex),
    layout: page.layout || '',
    blocks,
    posts: normalizePosts(page.posts),
    items: Object.freeze([...(page.items || [])]),
    facts: Object.freeze([...(page.facts || [])]),
    related: Object.freeze([...(page.related || [])]),
    // Kind-specific extras (product price, spot info, weather rows…) ride along
    // untouched so a template can read what only it understands.
    data: Object.freeze({ ...(page.data || {}) }),
    charCount: bodyText.length + postsText.length
  })
}

export function defineSite(config){
  const site = {
    id: config.id,
    domain: config.domain,
    name: config.name,
    shortName: config.shortName || config.name,
    kind: config.kind || 'site',
    template: config.template || 'news',
    tagline: config.tagline || '',
    description: config.description || '',
    keywords: Object.freeze([...(config.keywords || [])]),
    authority: config.authority ?? DEFAULT_AUTHORITY,
    status: config.status || 'active',
    established: config.established || '',
    closedAt: config.closedAt || '',
    lastUpdated: config.lastUpdated || '',
    history: Object.freeze([...(config.history || [])]),
    theme: Object.freeze({
      accent: '#2f6fd0',
      accentSoft: '#e8f0fb',
      ink: '#1f2937',
      muted: '#64748b',
      surface: '#ffffff',
      page: '#f4f6fa',
      line: '#dde3ec',
      font: 'sans',
      width: 'normal',
      logo: 'mark',
      era: 'modern',
      ...(config.theme || {})
    }),
    defaultAuthor: config.defaultAuthor || '',
    nav: Object.freeze([...(config.nav || [])]),
    categories: Object.freeze([...(config.categories || [])]),
    intro: Object.freeze((config.intro || []).map(normalizeBlock)),
    notice: config.notice || '',
    sidebar: Object.freeze({ ...(config.sidebar || {}) }),
    footerLinks: Object.freeze([...(config.footerLinks || [])]),
    operator: config.operator || '',
    staticPages: config.staticPages !== false,
    homeLayout: config.homeLayout || '',
    homeCopy: Object.freeze({ ...(config.homeCopy || {}) }),
    data: Object.freeze({ ...(config.data || {}) })
  }

  const pages = Object.freeze((config.pages || []).map((page) => normalizePage(page, site)))
  site.pages = pages
  site.pageByPath = new Map(pages.map((page) => [page.path, page]))
  return Object.freeze(site)
}

export { eraOf, normalizePath }
