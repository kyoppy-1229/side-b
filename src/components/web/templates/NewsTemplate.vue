<template>
  <WebChrome owns-heading :site="site" :page="page" variant="news" :columns="2" show-date>
    <template #header-meta>
      <span>{{ headerDate }}</span>
      <WebSearchBox placeholder="記事を検索" />
    </template>

    <template #breadcrumb>
      <WebBreadcrumb :items="breadcrumbs" />
    </template>

    <template v-if="page.kind === 'home'">
      <section v-if="lead" class="news-lead">
        <WebLink :to="lead.path" variant="bare" class="news-lead__art">
          <WebArt :kind="lead.art || 'city'" :seed="lead.path" ratio="banner" />
        </WebLink>
        <div class="news-lead__body">
          <div class="web-meta">
            <span class="web-chip">{{ lead.category }}</span>
            <time>{{ formatDate(lead.publishedAt, 'ja') }}</time>
          </div>
          <WebLink :to="lead.path" variant="bare">
            <h1 class="news-lead__title">{{ lead.title }}</h1>
          </WebLink>
          <p class="news-lead__excerpt">{{ lead.excerpt }}</p>
        </div>
      </section>

      <section v-if="secondary.length" class="news-secondary">
        <WebArticleList :items="secondary" variant="card" />
      </section>

      <section class="news-latest web-card web-pad">
        <h2 class="web-section-title">
          最新ニュース
          <small>{{ articles.length }}件</small>
        </h2>
        <WebArticleList :items="latestPage" variant="headline" date-style="slash" />
        <WebPager v-model="latestPageNumber" :total="rest.length" :per-page="8" />
      </section>

      <section v-for="group in categoryGroups" :key="group.slug" class="news-category web-card web-pad">
        <h2 class="web-section-title">
          <WebLink :to="`/category/${group.slug}`" variant="plain">{{ group.label }}</WebLink>
          <small><WebLink :to="`/category/${group.slug}`">もっと見る</WebLink></small>
        </h2>
        <WebArticleList :items="group.items" variant="compact" date-style="slash" />
      </section>
    </template>

    <WebDefaultBody v-else :site="site" :page="page" :query="query" list-variant="headline" />

    <template #aside>
      <WebSidebar :site="site" />
    </template>
  </WebChrome>
</template>

<script setup>
import { computed, ref } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { siteArticles } from '../../../virtual-web/pages.js'
import { formatDate, weekdayOf } from '../../../virtual-web/format.js'
import WebArt from '../parts/WebArt.vue'
import WebArticleList from '../parts/WebArticleList.vue'
import WebBreadcrumb from '../parts/WebBreadcrumb.vue'
import WebChrome from '../parts/WebChrome.vue'
import WebDefaultBody from '../parts/WebDefaultBody.vue'
import WebLink from '../parts/WebLink.vue'
import WebPager from '../parts/WebPager.vue'
import WebSearchBox from '../parts/WebSearchBox.vue'
import WebSidebar from '../parts/WebSidebar.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) }
})

const latestPageNumber = ref(1)
const articles = computed(() => siteArticles(props.site))
const lead = computed(() => articles.value[0] || null)
const secondary = computed(() => articles.value.slice(1, 4))
const rest = computed(() => articles.value.slice(4))
const latestPage = computed(() => rest.value.slice((latestPageNumber.value - 1) * 8, latestPageNumber.value * 8))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))

const headerDate = computed(() => {
  const date = props.site.lastUpdated || '2026-08-23'
  const weekday = weekdayOf(date)
  return `${formatDate(date, 'ja')}${weekday ? `（${weekday}）` : ''}`
})

const categoryGroups = computed(() => props.site.categories
  .map((category) => ({
    ...category,
    items: articles.value.filter((article) => article.category === category.label).slice(0, 4)
  }))
  .filter((group) => group.items.length))
</script>

<style scoped>
.news-lead{
  display:grid;
  gap:0;
  overflow:hidden;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-surface);
}

.news-lead__art{ display:block }

.news-lead__body{ padding:16px 18px 18px }

.news-lead__title{
  margin:8px 0 8px;
  font-family:var(--web-heading-font);
  font-size:24px;
  font-weight:800;
  line-height:1.42;
}

.news-lead__excerpt{
  margin:0;
  color:var(--web-muted);
  font-size:12.5px;
  line-height:1.8;
}

.news-secondary{ margin-top:18px }
.news-latest,
.news-category{ margin-top:18px }

@media (max-width:620px){
  .news-lead__title{ font-size:19px }
}
</style>
