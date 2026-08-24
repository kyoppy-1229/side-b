<template>
  <DebugSection id="web-sites" title="一般Web / サイト" icon="◍" :badge="sites.length">
    <p class="dbg-hint">
      本編と切り離された一般Web（<span class="dbg-mono">src/virtual-web/sites</span>）です。
      ここから開いたページは本編の進行に影響しません。
    </p>

    <dl class="dbg-facts">
      <div><dt>sites</dt><dd>{{ sites.length }}</dd></div>
      <div><dt>pages</dt><dd>{{ stats.authored }}</dd></div>
      <div><dt>urls</dt><dd>{{ stats.urls }}</dd></div>
      <div><dt>index</dt><dd>{{ indexStats.entries }}</dd></div>
      <div><dt>excluded</dt><dd :class="{ 'dbg-warnline': indexStats.excluded > 0 }">{{ indexStats.excluded }}</dd></div>
      <div><dt>closed</dt><dd>{{ stats.closed }}</dd></div>
    </dl>

    <label class="dbg-check">
      <input v-model="sameTab" type="checkbox" />
      同じタブで開く（戻る／進むの確認用）
    </label>

    <p class="dbg-label">テンプレート別に1サイトずつ</p>
    <div class="dbg-btns">
      <button
        v-for="entry in templateSamples"
        :key="entry.template"
        type="button"
        class="dbg-btn dbg-btn--sm"
        :title="entry.site.name"
        @click="openPath(entry.site, '/')"
      >{{ entry.template }}</button>
    </div>

    <p class="dbg-label">サイト一覧</p>
    <input
      v-model.trim="siteFilter"
      class="dbg-input"
      type="text"
      placeholder="サイト名・ドメインで絞り込み"
      @keydown.stop
      @keyup.stop
    />
    <ul class="dbg-list">
      <li
        v-for="site in filteredSites"
        :key="site.id"
        class="dbg-item"
        :class="{ 'is-active': site.id === selectedSiteId }"
      >
        <button type="button" class="dbg-btn dbg-btn--ghost dbg-btn--sm dbg-btn--row" @click="selectSite(site)">
          <span class="dbg-item__text">
            <span class="dbg-item__title">
              {{ site.name }}
              <template v-if="site.status !== 'active'"> [{{ site.status }}]</template>
            </span>
            <span class="dbg-item__sub">{{ site.domain }} · {{ site.template }} · {{ site.pages.length }}p</span>
          </span>
        </button>
        <button type="button" class="dbg-btn dbg-btn--sm dbg-btn--primary" @click="openPath(site, '/')">開く</button>
      </li>
    </ul>
    <p v-if="!filteredSites.length" class="dbg-empty">一致するサイトがありません。</p>
  </DebugSection>

  <DebugSection id="web-pages" title="一般Web / ページ" icon="⌗" :badge="pageEntries.length">
    <select class="dbg-select" :value="selectedSiteId" @change="selectSiteById($event.target.value)">
      <option v-for="site in sites" :key="site.id" :value="site.id">
        {{ site.name }}（{{ site.domain }}）
      </option>
    </select>

    <div class="dbg-row">
      <span class="dbg-chip dbg-chip--accent">{{ selectedSite.template }}</span>
      <span class="dbg-chip">{{ selectedSite.status }}</span>
      <span class="dbg-chip">{{ pageEntries.length }} urls</span>
    </div>

    <div class="dbg-grid-3">
      <button type="button" class="dbg-btn dbg-btn--sm" @click="openPath(selectedSite, '/')">トップ</button>
      <button type="button" class="dbg-btn dbg-btn--sm" @click="openPath(selectedSite, '/archive')">アーカイブ</button>
      <button type="button" class="dbg-btn dbg-btn--sm" @click="openPath(selectedSite, '/about')">サイト情報</button>
    </div>
    <div class="dbg-grid-3">
      <button type="button" class="dbg-btn dbg-btn--sm" @click="openRandom">ランダム</button>
      <button type="button" class="dbg-btn dbg-btn--sm" @click="openOldest">最古の記事</button>
      <button type="button" class="dbg-btn dbg-btn--sm dbg-btn--danger" @click="openPath(selectedSite, '/__missing__')">404</button>
    </div>

    <input
      v-model.trim="pageFilter"
      class="dbg-input"
      type="text"
      placeholder="タイトル・パスで絞り込み"
      @keydown.stop
      @keyup.stop
    />
    <ul class="dbg-list">
      <li v-for="entry in visiblePages" :key="entry.path" class="dbg-item">
        <button type="button" class="dbg-btn dbg-btn--ghost dbg-btn--sm dbg-btn--row" @click="openPath(selectedSite, entry.path)">
          <span class="dbg-item__text">
            <span class="dbg-item__title">{{ entry.title }}</span>
            <span class="dbg-item__sub">{{ entry.kind }}{{ entry.date ? ` · ${entry.date}` : '' }} · {{ entry.path }}</span>
          </span>
        </button>
      </li>
    </ul>
    <p v-if="hiddenPageCount" class="dbg-hint">ほか {{ hiddenPageCount }} 件（絞り込みで表示）</p>
  </DebugSection>

  <DebugSection id="web-search" title="一般Web / 検索" icon="⌕" :badge="report.total">
    <div class="dbg-row">
      <input
        v-model.trim="query"
        class="dbg-input dbg-grow"
        type="text"
        placeholder="検索語（例: 学校 パソコン 2015）"
        @keydown.stop
        @keyup.stop
        @keydown.enter="runSearch"
      />
      <button type="button" class="dbg-btn dbg-btn--primary" @click="runSearch">検索</button>
    </div>

    <p class="dbg-label">検証用クエリ</p>
    <div class="dbg-btns">
      <button
        v-for="preset in PRESET_QUERIES"
        :key="preset"
        type="button"
        class="dbg-btn dbg-btn--sm"
        @click="search(preset)"
      >{{ preset }}</button>
    </div>

    <div class="dbg-row">
      <span class="dbg-chip">全{{ report.total }}件</span>
      <span v-if="report.years.length" class="dbg-chip dbg-chip--warn">年代 {{ report.years.join('・') }}</span>
      <span v-if="report.storyResults.length" class="dbg-chip dbg-chip--accent">本編 {{ report.storyResults.length }}</span>
      <span v-if="report.partialShown" class="dbg-chip">部分一致 {{ report.partialShown }}</span>
    </div>

    <ul v-if="report.results.length" class="dbg-list">
      <li v-for="result in report.results.slice(0, 14)" :key="result.id" class="dbg-item">
        <button type="button" class="dbg-btn dbg-btn--ghost dbg-btn--sm dbg-btn--row" @click="openUrl(result.url)">
          <span class="dbg-item__text">
            <span class="dbg-item__title">
              <template v-if="result.origin === 'story'">［本編］</template>
              <template v-else-if="result.partial">［部分］</template>
              {{ result.title }}
            </span>
            <span class="dbg-item__sub">{{ result.date || '—' }} · {{ result.source }} · score {{ result.score }}</span>
          </span>
        </button>
      </li>
    </ul>
    <p v-else-if="report.query" class="dbg-empty">該当なし（「{{ report.query }}」）。</p>
    <p v-else class="dbg-empty">検索語を入力してください。</p>

    <p class="dbg-label">本編語句の遮断チェック</p>
    <button type="button" class="dbg-btn dbg-btn--wide" @click="runStoryProbe">本編語句で一般Webが反応しないか確認</button>
    <ul v-if="probeRows.length" class="dbg-list">
      <li v-for="row in probeRows" :key="row.query" class="dbg-item">
        <span class="dbg-item__text">
          <span class="dbg-item__title">
            <span :class="row.leaked ? 'dbg-warnline' : ''">{{ row.leaked ? 'NG' : 'OK' }}</span>
            {{ row.query }}
          </span>
          <span class="dbg-item__sub">一般Web {{ row.web }}件 / 本編記録 {{ row.story }}件</span>
        </span>
      </li>
    </ul>
    <p class="dbg-hint">
      一般Web側は <span class="dbg-mono">search/storyExclusion.js</span> の語句を含むページを
      インデックスから除外します。本編記録（BBSログ・学校アーカイブ）は従来どおり検索できます。
    </p>
  </DebugSection>
</template>

<script setup>
import { computed, ref } from 'vue'
import DebugSection from './DebugSection.vue'
import { useDebugConsole } from './debugContext.js'
import { virtualWebSites } from '../../virtual-web/sites/index.js'
import { listSitePaths, resolveSitePage, siteArticles } from '../../virtual-web/pages.js'
import { searchVirtualWebDetailed, webIndexStats } from '../../virtual-web/searchIndex.js'

const PAGE_LIST_LIMIT = 24

const PRESET_QUERIES = Object.freeze([
  '学校 パソコン 2015',
  '学校 パソコン',
  '今日の天気',
  'AI ニュース',
  'Windows 7 2015',
  'HTML',
  '朝凪市 ごみ',
  'フリーソフト 2014',
  '2015',
  '地域ニュース'
])

// Typed into the search box, these must reach the story's own saved records and
// nothing from the general web.
const STORY_PROBES = Object.freeze(['SIDE-B', 'SIDE B', 'サイドB', 'アクセスコード', '青い鳥', '復刻版'])

const shell = useDebugConsole()
const browser = shell.browser
const sites = virtualWebSites

const sameTab = ref(false)
const siteFilter = ref('')
const pageFilter = ref('')
const selectedSiteId = ref(sites[0].id)
const query = ref('学校 パソコン 2015')
const submitted = ref('学校 パソコン 2015')
const probeRows = ref([])

const indexStats = computed(() => webIndexStats())
const selectedSite = computed(() => sites.find((site) => site.id === selectedSiteId.value) || sites[0])
const report = computed(() => searchVirtualWebDetailed(submitted.value))

const stats = computed(() => ({
  authored: sites.reduce((total, site) => total + site.pages.length, 0),
  urls: sites.reduce((total, site) => total + listSitePaths(site).length, 0),
  closed: sites.filter((site) => site.status === 'closed').length
}))

// One representative site per template, so every layout is one click away.
const templateSamples = computed(() => {
  const seen = new Map()
  for(const site of sites){
    if(!seen.has(site.template)) seen.set(site.template, site)
  }
  return [...seen.entries()].map(([template, site]) => ({ template, site }))
})

const filteredSites = computed(() => {
  const needle = siteFilter.value.toLowerCase()
  if(!needle) return sites
  return sites.filter((site) => `${site.name} ${site.shortName} ${site.domain} ${site.template}`.toLowerCase().includes(needle))
})

const pageEntries = computed(() => listSitePaths(selectedSite.value)
  .map((path) => {
    const page = resolveSitePage(selectedSite.value, path)
    return page ? { path, title: page.heading || page.title, kind: page.kind, date: page.publishedAt } : null
  })
  .filter(Boolean)
  .sort((left, right) => (left.path === '/' ? -1 : right.path === '/' ? 1 : left.path.localeCompare(right.path))))

const filteredPages = computed(() => {
  const needle = pageFilter.value.toLowerCase()
  if(!needle) return pageEntries.value
  return pageEntries.value.filter((entry) => `${entry.title} ${entry.path} ${entry.kind}`.toLowerCase().includes(needle))
})

const visiblePages = computed(() => filteredPages.value.slice(0, PAGE_LIST_LIMIT))
const hiddenPageCount = computed(() => Math.max(0, filteredPages.value.length - visiblePages.value.length))

function openUrl(url){
  if(sameTab.value && browser.activeTab?.closable) browser.navigateInTab(browser.activeTabId, url)
  else browser.openVirtualUrl(url)
  shell.notify(`開いた: ${url}`)
}

function openPath(site, path){
  openUrl(`https://${site.domain}${path}`)
}

function selectSite(site){
  selectedSiteId.value = site.id
  pageFilter.value = ''
  shell.notify(`選択: ${site.name}`)
}

function selectSiteById(id){
  const site = sites.find((candidate) => candidate.id === id)
  if(site) selectSite(site)
}

function openRandom(){
  const entries = pageEntries.value
  const entry = entries[Math.floor(Math.random() * entries.length)]
  if(entry) openPath(selectedSite.value, entry.path)
}

function openOldest(){
  const articles = siteArticles(selectedSite.value)
  const oldest = articles[articles.length - 1]
  if(!oldest){
    shell.notify('このサイトには記事がありません')
    return
  }
  openPath(selectedSite.value, oldest.path)
}

function search(value){
  query.value = value
  submitted.value = value
  shell.notify(`検索: ${value}`)
}

function runSearch(){
  search(query.value)
}

function runStoryProbe(){
  probeRows.value = STORY_PROBES.map((probe) => {
    const result = searchVirtualWebDetailed(probe)
    const web = result.webResults.filter((entry) => !entry.partial).length
    return { query: probe, web, story: result.storyResults.length, leaked: web > 0 }
  })
  const leaked = probeRows.value.filter((row) => row.leaked).length
  shell.notify(leaked ? `本編語句が一般Webに漏れています（${leaked}件）` : '一般Webは本編語句に反応しません')
}
</script>
