<template>
  <WebNotFoundView v-if="page.kind === 'not-found'" :site="site" :path="page.path" />

  <WebStaticView v-else-if="page.kind.startsWith('static-')" :site="site" :page="page" />

  <section v-else-if="page.kind === 'site-search'" class="web-card web-pad">
    <h1 class="web-title">サイト内検索</h1>
    <WebSearchBox :initial="searchQuery" />
    <p class="web-sitesearch__count">
      <template v-if="searchQuery">「{{ searchQuery }}」の検索結果 {{ searchResults.length }}件</template>
      <template v-else>キーワードを入力してください。</template>
    </p>
    <WebArticleList v-if="searchResults.length" :items="searchResults" variant="compact" />
    <p v-else-if="searchQuery" class="web-empty">一致するページはありませんでした。</p>
  </section>

  <WebListingView
    v-else-if="isListing"
    :site="site"
    :page="page"
    :items="page.listing || []"
    :variant="listVariant"
    :per-page="perPage"
  />

  <WebArticleView
    v-else
    :site="site"
    :page="page"
    :date-style="dateStyle"
    :hero-ratio="heroRatio"
    :show-share="showShare"
  />
</template>

<script setup>
import { computed } from 'vue'
import { normalizeSearchText } from '../../../virtual-web/search/text.js'
import { siteArticles } from '../../../virtual-web/pages.js'
import WebArticleList from './WebArticleList.vue'
import WebArticleView from './WebArticleView.vue'
import WebListingView from './WebListingView.vue'
import WebNotFoundView from './WebNotFoundView.vue'
import WebSearchBox from './WebSearchBox.vue'
import WebStaticView from './WebStaticView.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) },
  listVariant: { type: String, default: 'headline' },
  perPage: { type: Number, default: 10 },
  dateStyle: { type: String, default: 'ja' },
  heroRatio: { type: String, default: 'wide' },
  showShare: { type: Boolean, default: true }
})

const LISTING_KINDS = ['category', 'tag', 'archive-index', 'archive-year', 'archive-month']
const isListing = computed(() => LISTING_KINDS.includes(props.page.kind))
const searchQuery = computed(() => String(props.query?.q ?? '').trim())

const searchResults = computed(() => {
  const query = normalizeSearchText(searchQuery.value)
  if(!query) return []
  const terms = query.split(' ').filter(Boolean)
  return siteArticles(props.site).filter((article) => {
    const haystack = normalizeSearchText([
      article.title,
      article.excerpt,
      article.category,
      article.keywords.join(' '),
      article.tags.join(' ')
    ].join(' '))
    return terms.every((term) => haystack.includes(term))
  })
})
</script>

<style scoped>
.web-sitesearch__count{
  margin:14px 0 10px;
  color:var(--web-muted);
  font-size:11px;
}
</style>
