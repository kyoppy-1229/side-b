<template>
  <WebChrome :site="site" :page="page" variant="portal" :columns="page.kind === 'home' ? 1 : 2">
    <template #breadcrumb>
      <WebBreadcrumb v-if="page.kind !== 'home'" :items="breadcrumbs" />
    </template>

    <template v-if="page.kind === 'home'">
      <section class="portal-hero">
        <p class="portal-hero__lead">{{ site.homeCopy.lead || site.description }}</p>
        <WebSearchBox :placeholder="site.homeCopy.searchPlaceholder || 'サイト内を検索'" />
        <ul v-if="trending.length" class="portal-trend" aria-label="注目のキーワード">
          <li v-for="(item, index) in trending" :key="item.path">
            <WebLink :to="item.path" class="portal-trend__item">
              <span class="portal-trend__no">{{ index + 1 }}</span>
              {{ item.label }}
            </WebLink>
          </li>
        </ul>
      </section>

      <div class="portal-columns">
        <section class="web-card web-pad">
          <h2 class="web-section-title">
            新着
            <small>{{ articles.length }}件</small>
          </h2>
          <WebArticleList :items="articles.slice(0, 6)" variant="headline" date-style="short" />
        </section>

        <aside class="portal-side">
          <section v-if="site.data.weather" class="web-widget">
            <h2 class="web-widget__head">今日の天気</h2>
            <div class="web-widget__body portal-weather">
              <WebArt :kind="`weather-${site.data.weather.condition}`" :seed="site.id" ratio="banner" />
              <p class="portal-weather__now">
                <strong>{{ site.data.weather.area }}</strong>
                {{ site.data.weather.label }} {{ site.data.weather.high }}℃ / {{ site.data.weather.low }}℃
              </p>
              <WebLink v-if="site.data.weather.link" :to="site.data.weather.link">週間予報</WebLink>
            </div>
          </section>

          <section v-if="site.data.links?.length" class="web-widget">
            <h2 class="web-widget__head">よく使うページ</h2>
            <div class="web-widget__body">
              <ul class="portal-links">
                <li v-for="link in site.data.links" :key="link.path">
                  <WebLink :to="link.path">{{ link.label }}</WebLink>
                  <span>{{ link.note }}</span>
                </li>
              </ul>
            </div>
          </section>

          <div class="web-ad">
            <strong>広告</strong>
            <span>{{ site.sidebar.adText || 'この枠は広告掲載用です。' }}</span>
          </div>
        </aside>
      </div>

      <section v-if="site.categories.length" class="portal-categories web-card web-pad">
        <h2 class="web-section-title">カテゴリから探す</h2>
        <div class="portal-grid">
          <WebLink
            v-for="category in site.categories"
            :key="category.slug"
            :to="`/category/${category.slug}`"
            variant="bare"
            class="portal-cat"
          >
            <strong>{{ category.label }}</strong>
            <span>{{ countIn(category.label) }}件</span>
          </WebLink>
        </div>
      </section>
    </template>

    <WebDefaultBody v-else :site="site" :page="page" :query="query" list-variant="headline" />

    <template v-if="page.kind !== 'home'" #aside>
      <WebSidebar :site="site" />
    </template>
  </WebChrome>
</template>

<script setup>
import { computed } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { siteArticles } from '../../../virtual-web/pages.js'
import WebArt from '../parts/WebArt.vue'
import WebArticleList from '../parts/WebArticleList.vue'
import WebBreadcrumb from '../parts/WebBreadcrumb.vue'
import WebChrome from '../parts/WebChrome.vue'
import WebDefaultBody from '../parts/WebDefaultBody.vue'
import WebLink from '../parts/WebLink.vue'
import WebSearchBox from '../parts/WebSearchBox.vue'
import WebSidebar from '../parts/WebSidebar.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) }
})

const articles = computed(() => siteArticles(props.site))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
const trending = computed(() => props.site.data.trending || [])

function countIn(label){
  return articles.value.filter((article) => article.category === label).length
}
</script>

<style scoped>
.portal-hero{
  padding:26px 0 20px;
  text-align:center;
}

.portal-hero__lead{
  margin:0 0 14px;
  color:var(--web-muted);
  font-size:12.5px;
}

.portal-hero :deep(.web-searchbox){
  max-width:560px;
  margin:0 auto;
}

.portal-hero :deep(.web-searchbox input){
  padding:11px 14px;
  border-radius:999px;
  font-size:13px;
}

.portal-hero :deep(.web-searchbox button){ border-radius:999px; padding:10px 18px }

.portal-trend{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:7px;
  margin:16px 0 0;
  padding:0;
  list-style:none;
}

.portal-trend__item{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:5px 12px 5px 6px;
  border:1px solid var(--web-line);
  border-radius:999px;
  background:var(--web-surface);
  font-size:11px;
  text-decoration:none;
}

.portal-trend__no{
  display:grid;
  place-items:center;
  width:18px;
  height:18px;
  border-radius:50%;
  background:var(--web-accent);
  color:#fff;
  font-size:9px;
  font-weight:800;
}

.portal-columns{
  display:grid;
  grid-template-columns:minmax(0,1fr) 262px;
  gap:18px;
  align-items:start;
}

.portal-side{ display:grid; gap:14px }

.portal-weather__now{
  margin:9px 0 6px;
  font-size:12px;
}

.portal-weather__now strong{ margin-right:7px }

.portal-links{
  margin:0;
  padding:0;
  list-style:none;
  font-size:11.5px;
}

.portal-links li{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:8px;
  padding:6px 0;
  border-bottom:1px dotted var(--web-line);
}

.portal-links span{ color:var(--web-muted); font-size:10px }

.portal-categories{ margin-top:18px }

.portal-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(140px, 1fr));
  gap:10px;
}

.portal-cat{
  display:flex;
  flex-direction:column;
  gap:3px;
  padding:13px 14px;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-page);
  font-size:12px;
}

.portal-cat:hover{ border-color:var(--web-accent) }
.portal-cat span{ color:var(--web-muted); font-size:10px }

@media (max-width:820px){
  .portal-columns{ grid-template-columns:minmax(0,1fr) }
}
</style>
