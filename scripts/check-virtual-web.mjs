// Checks the general virtual web: the site data, the links between pages, the
// search behaviour, the separation from the SIDE-B story, and that every
// reachable URL actually renders.
//
// Run with `npm run check:virtual-web`.

import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { createServer } from 'vite'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'

import { virtualWebSites, getSiteByDomain, getSiteById } from '../src/virtual-web/sites/index.js'
import { listSitePaths, resolveSitePage, siteArticles } from '../src/virtual-web/pages.js'
import { resolveVirtualUrl } from '../src/virtual-web/registry.js'
import { LEGACY_VIRTUAL_URLS, VIRTUAL_PAGE_TYPES, VIRTUAL_URLS } from '../src/virtual-web/constants.js'
import { searchVirtualWeb, searchVirtualWebDetailed, webIndexStats } from '../src/virtual-web/searchIndex.js'
import { searchSuggestions } from '../src/virtual-web/search/suggestions.js'
import { containsStoryKeyword, isBlockedSuggestion, STORY_KEYWORDS } from '../src/virtual-web/search/storyExclusion.js'
import { ART_KIND_NAMES } from '../src/virtual-web/art/artwork.js'
import { ART_ASSET_KEY_BY_KIND, GENERATED_ART_KEYS, GENERATED_ART_MANIFEST, generatedArtFor } from '../src/virtual-web/art/generated.js'

// The template registry imports .vue files, which Node cannot load directly;
// the names it maps are read from the source instead.
const registrySource = await readFile(new URL('../src/components/web/templates/templateRegistry.js', import.meta.url), 'utf8')
const registryBody = registrySource.slice(registrySource.indexOf('WEB_TEMPLATES'), registrySource.indexOf('export function templateFor'))
const templateNames = new Set([...registryBody.matchAll(/^\s*'?([a-z-]+)'?:\s*[A-Z]/gm)].map((match) => match[1]))

const RENDER = process.argv.includes('--no-render') ? false : true
const problems = []

function check(condition, message){
  if(!condition) problems.push(message)
}

// ---------------------------------------------------------------- sites ------
check(virtualWebSites.length >= 30, `サイト数が30未満: ${virtualWebSites.length}`)
assert.equal(new Set(virtualWebSites.map((site) => site.id)).size, virtualWebSites.length, 'サイトIDが重複しています')
assert.equal(new Set(virtualWebSites.map((site) => site.domain)).size, virtualWebSites.length, 'ドメインが重複しています')

const artKinds = new Set(ART_KIND_NAMES)
const eras = new Set(['', '1990s', '2000s', '2010s', '2020s'])

// Every content-art kind, including template fallbacks, must point at its own
// checked-in bitmap. Site logos remain code-native marks and are not article
// imagery.
const generatedAssetFiles = new Set(await readdir(new URL('../src/assets/web/generated/', import.meta.url)))
const requiredArtKeys = [...new Set(ART_KIND_NAMES)]
for(const artKey of requiredArtKeys){
  const assetKey = ART_ASSET_KEY_BY_KIND[artKey]
  check(Boolean(assetKey), `画像キー ${artKey} にビットマップ割当がありません`)
  check(assetKey === artKey, `画像キー ${artKey} が固有画像へ割り当てられていません: ${assetKey || '(なし)'}`)
  const filename = assetKey ? GENERATED_ART_MANIFEST[assetKey] : ''
  check(Boolean(filename), `画像キー ${artKey} のマニフェストがありません`)
  check(Boolean(filename && generatedAssetFiles.has(filename)), `画像キー ${artKey} の生成済みファイルがありません: ${filename || '(なし)'}`)
  check(Boolean(generatedArtFor(artKey)), `画像キー ${artKey} が画像URLを解決できません`)
}
check(GENERATED_ART_KEYS.every((assetKey) => Boolean(GENERATED_ART_MANIFEST[assetKey])), '生成画像キーとマニフェストが一致していません')

let authoredPages = 0
let totalPaths = 0
let totalChars = 0
let pagesWithArt = 0
const yearsSeen = new Set()

for(const site of virtualWebSites){
  check(templateNames.has(site.template), `${site.id}: 未知のテンプレート "${site.template}"`)
  check(/^[a-z0-9.-]+\.[a-z.]{2,}$/.test(site.domain), `${site.id}: ドメインの形式が不正 "${site.domain}"`)
  check(site.description.length >= 20, `${site.id}: description が短すぎます`)
  check(site.authority >= 0 && site.authority <= 1, `${site.id}: authority が範囲外`)
  check(['active', 'inactive', 'closed'].includes(site.status), `${site.id}: 未知の status "${site.status}"`)
  check(site.theme.accent.startsWith('#'), `${site.id}: theme.accent が色ではありません`)

  const paths = listSitePaths(site)
  totalPaths += paths.length
  authoredPages += site.pages.length
  check(new Set(site.pages.map((page) => page.path)).size === site.pages.length, `${site.id}: パスが重複しています`)

  for(const page of site.pages){
    const label = `${site.domain}${page.path}`
    check(Boolean(page.title && page.title.length >= 2), `${label}: title がありません`)
    check(eras.has(page.era), `${label}: era が不正 "${page.era}"`)
    if(page.art){
      pagesWithArt += 1
      check(artKinds.has(page.art), `${label}: 未知の art "${page.art}"`)
    }
    if(page.publishedAt){
      check(/^\d{4}(-\d{2}(-\d{2})?)?$/.test(page.publishedAt), `${label}: 日付の形式が不正 "${page.publishedAt}"`)
      yearsSeen.add(Number(page.publishedAt.slice(0, 4)))
    }
    totalChars += page.charCount

    // Content quality: no placeholder text, and real bodies on real pages.
    const bodyText = [page.excerpt, page.lead, ...page.blocks.map((block) => block.text || '')].join(' ')
    check(!/lorem ipsum/i.test(bodyText), `${label}: Lorem Ipsum が含まれています`)
    check(!/ここに(文章|テキスト)が入りま/.test(bodyText), `${label}: 仮文章が含まれています`)
    check(!/サンプルの記事/.test(bodyText), `${label}: 仮文章が含まれています`)
    // Closed sites never render their bodies (every path answers with the
    // closure notice), so their old entries only need a title and an excerpt.
    if(site.status !== 'closed' && ['article', 'entry', 'wiki', 'guide', 'review', 'software', 'spot', 'data'].includes(page.kind)){
      check(page.charCount >= 120, `${label}: 本文が短すぎます (${page.charCount}字)`)
      check(Boolean(page.excerpt), `${label}: excerpt がありません`)
    }
    if(['thread', 'question'].includes(page.kind)){
      check(page.posts.length >= 2, `${label}: 書き込み・回答が不足しています`)
    }
  }
}

check(authoredPages >= 150, `記事ページ数が150未満: ${authoredPages}`)
check(totalPaths >= 150, `到達可能なURL数が150未満: ${totalPaths}`)
check(pagesWithArt >= 60, `画像を持つページが少なすぎます: ${pagesWithArt}`)
check([...yearsSeen].some((year) => year <= 2016), '2010年代の記事がありません')
check([...yearsSeen].some((year) => year >= 2025), '2025年以降の記事がありません')

// ------------------------------------------------------------- link graph ---
function resolveInternal(site, target, label){
  const value = String(target ?? '')
  if(!value) return
  if(/^https?:\/\//.test(value)){
    const resolved = resolveVirtualUrl(value)
    check(resolved.pageType === VIRTUAL_PAGE_TYPES.WEB_SITE && !resolved.state.notFound,
      `${label}: 外部リンク先が解決できません ${value}`)
    return
  }
  const page = resolveSitePage(site, value.split('?')[0])
  check(Boolean(page), `${label}: リンク先が存在しません ${site.domain}${value}`)
}

for(const site of virtualWebSites){
  for(const item of site.nav) resolveInternal(site, item.path, `${site.id} nav`)
  for(const item of site.footerLinks) resolveInternal(site, item.path, `${site.id} footer`)
  for(const category of site.categories) resolveInternal(site, `/category/${category.slug}`, `${site.id} category`)
  for(const key of ['services', 'quickLinks', 'trending', 'links']){
    for(const item of site.data[key] || []) resolveInternal(site, item.path, `${site.id} data.${key}`)
  }
  if(site.data.weather?.link) resolveInternal(site, site.data.weather.link, `${site.id} data.weather`)
  for(const entry of site.data.archives || []) resolveInternal(site, entry.url, `${site.id} data.archives`)

  for(const page of site.pages){
    for(const path of page.related) resolveInternal(site, path, `${site.domain}${page.path} related`)
    for(const block of page.blocks){
      if(block.type !== 'links') continue
      for(const item of block.items) resolveInternal(site, item.path, `${site.domain}${page.path} links`)
    }
  }
}

// ------------------------------------------------------------- resolution ---
const sample = virtualWebSites[0]
assert.equal(resolveVirtualUrl(`https://${sample.domain}/`).pageType, VIRTUAL_PAGE_TYPES.WEB_SITE)
assert.equal(resolveVirtualUrl(sample.domain).state.path, '/')
assert.equal(resolveVirtualUrl(`https://${sample.domain}/no-such-page-xyz`).state.notFound, true)
assert.equal(resolveVirtualUrl('https://no-such-domain-xyz.example/page').pageType, VIRTUAL_PAGE_TYPES.ERROR)
assert.equal(getSiteByDomain('NAVIWEB.JP')?.id, 'naviweb')
assert.equal(getSiteById('naviweb')?.domain, 'naviweb.jp')

// Query strings survive into page state (site-internal search).
const searchPage = resolveVirtualUrl(`https://${sample.domain}/search?q=%E5%AD%A6%E6%A0%A1`)
assert.equal(searchPage.state.path, '/search')
assert.equal(searchPage.state.query.q, '学校')

// Story routes still resolve to their own page types, not to the general web.
assert.equal(resolveVirtualUrl(VIRTUAL_URLS.BBS_THREAD).pageType, VIRTUAL_PAGE_TYPES.WEB_SITE)
assert.equal(resolveVirtualUrl(VIRTUAL_URLS.BBS_THREAD).state.siteId, 'minna-bbs')
assert.equal(resolveVirtualUrl(VIRTUAL_URLS.BBS_THREAD).state.path, '/archive/private/20150307')
assert.equal(resolveVirtualUrl(LEGACY_VIRTUAL_URLS.BBS_THREAD).normalizedUrl, VIRTUAL_URLS.BBS_THREAD)
assert.equal(resolveVirtualUrl(LEGACY_VIRTUAL_URLS.NEWS_20150302).normalizedUrl, VIRTUAL_URLS.NEWS_20150302)
assert.equal(resolveVirtualUrl(VIRTUAL_URLS.SCHOOL_ARCHIVE).pageType, VIRTUAL_PAGE_TYPES.SCHOOL_ARCHIVE)
assert.equal(resolveVirtualUrl(VIRTUAL_URLS.GAME_REVIVAL).pageType, VIRTUAL_PAGE_TYPES.GAME_REVIVAL)
assert.equal(resolveVirtualUrl(VIRTUAL_URLS.MESSAGES).pageType, VIRTUAL_PAGE_TYPES.MESSAGES)

// ----------------------------------------------------------------- search ---
function results(query){
  return searchVirtualWebDetailed(query)
}

for(const query of ['PC', '学校 PC', '学校 PC 2015', 'Windows 7 2015', 'HTML', '地域ニュース', '映画', '音楽', '天気', 'AI ニュース', '今日の天気', '朝凪市 ごみ', 'フリーソフト 2014', '進路 高校', '中古PC 選び方']){
  check(results(query).total > 0, `検索結果が0件: "${query}"`)
}

assert.deepEqual(searchVirtualWeb('登録されていない語句'), [])

// Era handling: a year in the query pulls that era to the top.
const scoped = results('学校 パソコン 2015').results.filter((result) => result.origin === 'web').slice(0, 5)
check(scoped.length > 0, '年代指定検索の結果がありません')
check(scoped.filter((result) => Math.abs(Number(result.date.slice(0, 4)) - 2015) <= 1).length >= 3,
  '「学校 パソコン 2015」の上位に2014〜2016年の記事が並んでいません')

const unscoped = results('学校 パソコン').results.filter((result) => result.origin === 'web').slice(0, 3)
check(unscoped.some((result) => Number(result.date.slice(0, 4)) >= 2025) || unscoped.length === 0
  || unscoped.some((result) => Number(result.date.slice(0, 4)) >= 2015),
  '年代指定なし検索の結果が空です')

const yearOnly = results('2015').results.filter((result) => result.origin === 'web')
check(yearOnly.length > 0, '「2015」の検索結果がありません')
check(yearOnly.every((result) => Math.abs(Number(result.date.slice(0, 4)) - 2015) <= 2),
  '「2015」の結果に離れた年の記事が含まれています')

// ------------------------------------------------- story / general web split --
for(const query of ['SIDE-B', 'SIDE B', 'サイドB', 'side-b 復刻版', 'アクセスコード']){
  const web = results(query).webResults.filter((result) => !result.partial)
  check(web.length === 0, `一般Webが本編語句に反応しています: "${query}" -> ${web.map((r) => r.url).join(', ')}`)
}

for(const keyword of STORY_KEYWORDS){
  check(!virtualWebSites.some((site) => containsStoryKeyword(`${site.name} ${site.description} ${site.keywords.join(' ')}`)),
    `サイト定義に本編語句が含まれています: ${keyword}`)
}

for(const suggestion of searchSuggestions('')){
  check(!isBlockedSuggestion(suggestion), `サジェストに本編語句が含まれています: ${suggestion}`)
}
check(searchSuggestions('windows').length > 0, 'サジェストが機能していません')
check(searchSuggestions('side').every((suggestion) => !isBlockedSuggestion(suggestion)), 'side でのサジェストが遮断されていません')

// The story's own records must still be findable — the plot depends on it.
check(!searchVirtualWeb('SIDE-B 2015').some((result) => result.url.includes('minna-bbs.net/archive/private')), '非公開BBSログが検索に露出しています')
const privateArchive = getSiteByDomain('minna-bbs.net').pageByPath.get('/archive/private/20150307')
assert.equal(privateArchive.noindex, true)
assert.equal(privateArchive.posts.length, 95)
check(!siteArticles(getSiteByDomain('minna-bbs.net')).some((page) => page.path === privateArchive.path), '非公開BBSログが一般一覧に露出しています')
check(!searchVirtualWeb('保存ログ').some((result) => result.url === VIRTUAL_URLS.BBS_THREAD), '非公開BBSログが保存ログ検索に露出しています')

// The way into that log: two ordinary pages that add up to its address, and
// neither of them carries the whole thing. The trial depends on this pair
// (see src/trial/flow.js), so it is checked here with the rest of the data.
const noticeThread = getSiteByDomain('minna-bbs.net').pageByPath.get('/thread/talk/1130')
const directoryEntry = getSiteByDomain('web-koubou.jp').pageByPath.get('/entry/2015/noindex-directory')
check(Boolean(noticeThread), '管理人の案内スレがありません')
check(Boolean(directoryEntry), '検索避けの記事がありません')
const noticeText = (noticeThread?.posts || []).map((post) => post.text).join('\n')
check(noticeText.includes('8桁'), '案内スレがページ名の規則を書いていません')
check((noticeThread?.posts || []).some((post) => post.date.startsWith('2015/03/07')), '案内スレに保存した日がありません')
check(!noticeText.includes('archive/private'), '案内スレが置き場所まで書いています')
const directoryText = (directoryEntry?.blocks || []).map((block) => block.text || '').join('\n')
check(directoryText.includes('/archive/private/'), '検索避けの記事に置き場所がありません')
check(directoryText.includes('minna-bbs.net'), '検索避けの記事が相談元の掲示板を示していません')
check(!directoryText.includes('20150307'), '検索避けの記事が日付まで書いています')
check(searchVirtualWeb('保存ログ').some((result) => result.url === noticeThread?.url), '案内スレが検索で辿れません')
check(searchVirtualWeb('検索避け').some((result) => result.url === directoryEntry?.url), '検索避けの記事が検索で辿れません')
const robots = getSiteByDomain('minna-bbs.net').pageByPath.get('/robots.txt')
check(Boolean(robots) && robots.noindex, 'robots.txt が検索避けになっていません')
const savedNews = getSiteByDomain('tohto-news.jp').pageByPath.get('/articles/2015/03/20150302-17')
assert.equal(savedNews.publishedAt, '2015-03-02')
check(savedNews.excerpt.includes('1日午後9時半'), '保存ニュースの発見日が掲載日と整合していません')
check(savedNews.lead.includes('1日午後9時半'), '保存ニュースの本文日付が整合していません')
check(savedNews.blocks.some((block) => block.text?.includes('20時20分')), '保存ニュースの死亡推定時刻が保持されていません')
check(savedNews.blocks.some((block) => block.text?.includes('2日にも司法解剖')), '保存ニュースの掲載日と今後の予定が整合していません')
check(searchVirtualWeb('卒業式 青い鳥').some((result) => result.url === VIRTUAL_URLS.SCHOOL_GRADUATION_2015), '本編の卒業記録が検索できません')

// --------------------------------------------------------------- rendering ---
let rendered = 0
if(RENDER){
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  const generatedModule = await server.transformRequest('/src/virtual-web/art/generated.js')
  check(Boolean(generatedModule?.code), '生成画像モジュールをViteで変換できません')
  check(!generatedModule?.code.includes('?import&url'), '生成画像のglobがVite devで画像本体をJSモジュールとして読み込んでいます')
  const { default: WebSitePage } = await server.ssrLoadModule('/src/components/web/WebSitePage.vue')

  for(const site of virtualWebSites){
    for(const path of listSitePaths(site)){
      const app = createSSRApp({ render: () => h(WebSitePage, { siteId: site.id, path }) })
      app.config.warnHandler = (message) => problems.push(`${site.domain}${path}: Vue警告 ${message}`)
      let html = ''
      try {
        html = await renderToString(app)
      } catch (error) {
        problems.push(`${site.domain}${path}: 描画に失敗 ${error.message}`)
        continue
      }
      check(html.length > 400, `${site.domain}${path}: 描画結果が短すぎます`)
      for(const match of html.matchAll(/<img\s+src="([^"]+)"\s+alt="([^"]+)"/g)){
        const imageUrl = new URL(match[1], 'https://side-b.invalid')
        const filename = imageUrl.pathname.split('/').pop()
        if(imageUrl.pathname.includes('/src/assets/web/generated/')){
          check(generatedAssetFiles.has(filename), `${site.domain}${path}: 画像ファイルが見つかりません ${match[1]}`)
        }else if(imageUrl.pathname.includes('/assets/web/generated/')){
          check(false, `${site.domain}${path}: Viteで配信されない生成画像URLです ${match[1]}`)
        }
      }
      rendered += 1
    }
  }

  // The site's own 404 renders too.
  const notFound = createSSRApp({ render: () => h(WebSitePage, { siteId: sample.id, path: '/definitely-missing', notFound: true }) })
  const notFoundHtml = await renderToString(notFound)
  check(notFoundHtml.includes('404'), '404ページが描画されていません')

  await server.close()
}

// ------------------------------------------------------------------ report ---
if(problems.length){
  console.error(`Virtual web NG: ${problems.length}件`)
  for(const problem of problems.slice(0, 40)) console.error(`  - ${problem}`)
  process.exit(1)
}

const stats = webIndexStats()
const articleTotal = virtualWebSites.reduce((total, site) => total + siteArticles(site).length, 0)
console.log([
  `Virtual web OK: ${virtualWebSites.length} sites`,
  `${authoredPages} authored pages (${articleTotal} listed)`,
  `${totalPaths} reachable URLs`,
  `${stats.entries} index entries`,
  `${Math.round(totalChars / 1000)}k chars`,
  RENDER ? `${rendered} rendered` : 'render skipped'
].join(', '))
