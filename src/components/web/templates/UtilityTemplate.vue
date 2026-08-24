<template>
  <WebChrome :site="site" :page="page" variant="plain" :columns="1">
    <template #header-meta>
      <WebSearchBox :placeholder="site.data.searchPlaceholder || '地名・施設名で検索'" />
    </template>

    <template #breadcrumb>
      <WebBreadcrumb :items="breadcrumbs" />
    </template>

    <template v-if="page.kind === 'home'">
      <section v-if="site.data.now" class="util-now">
        <div class="util-now__art">
          <WebArt :kind="site.data.now.art || 'weather'" :seed="site.id" ratio="banner" />
        </div>
        <div class="util-now__body">
          <p class="util-now__area">{{ site.data.now.area }}</p>
          <p class="util-now__value">{{ site.data.now.value }}</p>
          <p class="util-now__note">{{ site.data.now.note }}</p>
          <ul class="util-now__stats">
            <li v-for="stat in site.data.now.stats || []" :key="stat.label">
              <span>{{ stat.label }}</span>
              <strong>{{ stat.value }}</strong>
            </li>
          </ul>
        </div>
      </section>

      <section v-if="site.data.forecast?.length" class="web-card web-pad util-panel">
        <h2 class="web-section-title">{{ site.data.forecastTitle || '週間予報' }}</h2>
        <div class="util-forecast">
          <div v-for="day in site.data.forecast" :key="day.day" class="util-forecast__day">
            <strong>{{ day.day }}</strong>
            <WebArt :kind="`weather-${day.icon || 'cloudy'}`" :seed="`${site.id}:${day.day}`" ratio="square" />
            <span>{{ day.label }}</span>
            <span class="util-forecast__temp">
              <b>{{ day.high }}</b> / {{ day.low }}
            </span>
          </div>
        </div>
      </section>

      <div class="util-columns">
        <section class="web-card web-pad">
          <h2 class="web-section-title">
            {{ site.data.listTitle || '掲載ページ' }}
            <small>{{ pages.length }}件</small>
          </h2>
          <WebArticleList :items="pages" variant="compact" date-style="slash" />
        </section>

        <aside class="util-side">
          <section v-if="site.data.panels?.length" class="web-widget">
            <h2 class="web-widget__head">{{ site.data.panelTitle || 'お知らせ' }}</h2>
            <div class="web-widget__body">
              <ul class="util-panel-list">
                <li v-for="panel in site.data.panels" :key="panel.label">
                  <strong>{{ panel.label }}</strong>
                  <span>{{ panel.text }}</span>
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
    </template>

    <template v-else-if="page.kind === 'spot' || page.kind === 'data'">
      <article class="util-detail web-card web-pad">
        <h1 class="web-title">{{ page.heading }}</h1>
        <p v-if="page.subtitle" class="util-detail__sub">{{ page.subtitle }}</p>

        <div class="util-detail__top">
          <WebArt :kind="page.art || 'map'" :seed="page.path" ratio="wide" class="util-detail__map" />
          <dl v-if="page.facts.length" class="util-detail__facts">
            <div v-for="fact in page.facts" :key="fact.label">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
        </div>

        <WebBlocks :blocks="page.blocks" :seed="page.path" />

        <section v-if="page.items.length" class="util-nearby">
          <h2 class="web-section-title">{{ page.data.itemsTitle || '周辺の施設' }}</h2>
          <ul>
            <li v-for="(item, index) in page.items" :key="index">
              <strong>{{ item.name || item.title }}</strong>
              <span>{{ item.note }}</span>
            </li>
          </ul>
        </section>

        <section v-if="related.length" class="util-related">
          <h2 class="web-section-title">近くのページ</h2>
          <WebArticleList :items="related" variant="compact" date-style="slash" />
        </section>
      </article>
    </template>

    <WebDefaultBody v-else :site="site" :page="page" :query="query" list-variant="compact" />
  </WebChrome>
</template>

<script setup>
import { computed } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { relatedArticles, siteArticles } from '../../../virtual-web/pages.js'
import WebArt from '../parts/WebArt.vue'
import WebArticleList from '../parts/WebArticleList.vue'
import WebBlocks from '../parts/WebBlocks.vue'
import WebBreadcrumb from '../parts/WebBreadcrumb.vue'
import WebChrome from '../parts/WebChrome.vue'
import WebDefaultBody from '../parts/WebDefaultBody.vue'
import WebSearchBox from '../parts/WebSearchBox.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) }
})

const pages = computed(() => siteArticles(props.site))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
const related = computed(() => relatedArticles(props.site, props.page, 5))
</script>

<style scoped>
.util-now{
  display:grid;
  grid-template-columns:minmax(0,1fr) 300px;
  gap:0;
  overflow:hidden;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-surface);
}

.util-now__body{ padding:16px 18px }
.util-now__area{ margin:0 0 4px; color:var(--web-muted); font-size:11px }
.util-now__value{ margin:0; font-size:30px; font-weight:800; line-height:1.2 }
.util-now__note{ margin:4px 0 10px; color:var(--web-muted); font-size:11.5px }

.util-now__stats{
  margin:0;
  padding:0;
  list-style:none;
  font-size:11px;
}

.util-now__stats li{
  display:flex;
  justify-content:space-between;
  gap:10px;
  padding:4px 0;
  border-top:1px dotted var(--web-line);
}

.util-now__stats span{ color:var(--web-muted) }

.util-panel{ margin-top:16px }

.util-forecast{
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(84px, 1fr));
  gap:9px;
}

.util-forecast__day{
  display:grid;
  gap:5px;
  justify-items:center;
  padding:10px 6px;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-page);
  font-size:10.5px;
  text-align:center;
}

.util-forecast__day :deep(.web-art){ width:44px; border-radius:6px }
.util-forecast__temp b{ color:#c0392b }

.util-columns{
  display:grid;
  grid-template-columns:minmax(0,1fr) 262px;
  gap:16px;
  align-items:start;
  margin-top:16px;
}

.util-side{ display:grid; gap:14px }

.util-panel-list{ margin:0; padding:0; list-style:none; font-size:11px }
.util-panel-list li{ padding:7px 0; border-bottom:1px dotted var(--web-line) }
.util-panel-list strong{ display:block; margin-bottom:2px; font-size:11px }
.util-panel-list span{ color:var(--web-muted); line-height:1.6 }

.util-detail__sub{ margin:0 0 14px; color:var(--web-muted); font-size:12px }

.util-detail__top{
  display:grid;
  grid-template-columns:minmax(0,1fr) 262px;
  gap:16px;
  align-items:start;
  margin-bottom:18px;
}

.util-detail__map{ border:1px solid var(--web-line); border-radius:var(--web-radius); overflow:hidden }

.util-detail__facts{
  display:grid;
  gap:0;
  margin:0;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  overflow:hidden;
  font-size:11px;
}

.util-detail__facts > div{ display:grid; grid-template-columns:76px minmax(0,1fr) }
.util-detail__facts > div + div{ border-top:1px solid var(--web-line) }
.util-detail__facts dt{ padding:6px 9px; background:var(--web-accent-soft); font-weight:700 }
.util-detail__facts dd{ margin:0; padding:6px 9px }

.util-nearby{ margin-top:22px }
.util-nearby ul{ margin:0; padding:0; list-style:none }
.util-nearby li{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  padding:7px 0;
  border-bottom:1px dotted var(--web-line);
  font-size:11.5px;
}
.util-nearby span{ color:var(--web-muted) }
.util-related{ margin-top:20px }

@media (max-width:800px){
  .util-now,
  .util-columns,
  .util-detail__top{ grid-template-columns:minmax(0,1fr) }
}
</style>
