<template>
  <WebChrome :site="site" :page="page" variant="retro" :columns="2">
    <template #header-meta>
      <WebSearchBox placeholder="ソフトを検索" />
    </template>

    <template #breadcrumb>
      <WebBreadcrumb :items="breadcrumbs" />
    </template>

    <template v-if="page.kind === 'home'">
      <section v-if="site.intro.length" class="soft-intro web-card web-pad">
        <WebBlocks :blocks="site.intro" :seed="site.id" />
      </section>

      <section class="web-card web-pad">
        <h2 class="web-section-title">
          新着・更新
          <small>{{ items.length }}件</small>
        </h2>
        <div class="web-table-scroll">
        <table class="soft-table">
          <thead>
            <tr>
              <th>ソフト名</th>
              <th>種別</th>
              <th>バージョン</th>
              <th>更新日</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.path">
              <td>
                <WebLink :to="item.path">{{ item.title }}</WebLink>
                <span class="soft-table__note">{{ item.excerpt }}</span>
              </td>
              <td>{{ item.category }}</td>
              <td class="soft-table__mono">{{ item.data.version || '—' }}</td>
              <td class="soft-table__mono">{{ formatDate(item.updatedAt || item.publishedAt, 'slash') }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </section>
    </template>

    <template v-else-if="page.kind === 'software'">
      <article class="soft-page">
        <div class="web-card web-pad">
          <h1 class="web-title">{{ page.heading }}</h1>
          <p v-if="page.subtitle" class="soft-page__sub">{{ page.subtitle }}</p>

          <div class="soft-page__top">
            <WebArt :kind="page.art || 'screenshot'" :seed="page.path" :era="era" ratio="wide" class="soft-page__shot" />
            <div class="soft-download">
              <p class="soft-download__label">ダウンロード</p>
              <p class="soft-download__file">{{ page.data.file || 'setup.zip' }}</p>
              <p class="soft-download__size">{{ page.data.size || '—' }}</p>
              <button class="web-button" type="button" @click="downloaded = true">ダウンロード</button>
              <p v-if="downloaded" class="soft-download__flash" role="status">
                このブラウザーではファイルの保存はできません。
              </p>
              <ul class="soft-download__meta">
                <li><span>バージョン</span><strong>{{ page.data.version || '—' }}</strong></li>
                <li><span>ライセンス</span><strong>{{ page.data.license || 'フリーソフト' }}</strong></li>
                <li><span>対応OS</span><strong>{{ (page.data.os || []).join(' / ') || '—' }}</strong></li>
                <li><span>公開</span><strong>{{ formatDate(page.publishedAt, 'slash') }}</strong></li>
                <li v-if="page.data.downloads"><span>累計</span><strong>{{ formatCount(page.data.downloads) }}回</strong></li>
              </ul>
            </div>
          </div>

          <WebBlocks :blocks="page.blocks" :seed="page.path" :era="era" />

          <section v-if="page.items.length" class="soft-history">
            <h2 class="web-section-title">更新履歴</h2>
            <ul>
              <li v-for="(item, index) in page.items" :key="index">
                <span>{{ item.version }}</span>
                <time>{{ item.date }}</time>
                <p>{{ item.text }}</p>
              </li>
            </ul>
          </section>
        </div>

        <section v-if="related.length" class="web-card web-pad soft-related">
          <h2 class="web-section-title">同じ分類のソフト</h2>
          <WebArticleList :items="related" variant="compact" date-style="slash" />
        </section>
      </article>
    </template>

    <WebDefaultBody v-else :site="site" :page="page" :query="query" list-variant="compact" />

    <template #aside>
      <WebSidebar :site="site" />
    </template>
  </WebChrome>
</template>

<script setup>
import { computed, ref } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { relatedArticles, siteArticles } from '../../../virtual-web/pages.js'
import { formatCount, formatDate } from '../../../virtual-web/format.js'
import WebArt from '../parts/WebArt.vue'
import WebArticleList from '../parts/WebArticleList.vue'
import WebBlocks from '../parts/WebBlocks.vue'
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

const downloaded = ref(false)
const items = computed(() => siteArticles(props.site))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
const related = computed(() => relatedArticles(props.site, props.page, 5))
const era = computed(() => (props.page.layout === '2010s' || props.site.theme.era === '2010s' ? '2010s' : ''))
</script>

<style scoped>
.soft-intro{ margin-bottom:16px }

.soft-table{
  width:100%;
  border-collapse:collapse;
  font-size:12px;
}

.soft-table th,
.soft-table td{
  padding:7px 9px;
  border:1px solid var(--web-line);
  text-align:left;
  vertical-align:top;
}

.soft-table th{ background:var(--web-accent-soft); font-size:11px }
.soft-table__note{ display:block; margin-top:3px; color:var(--web-muted); font-size:10px; line-height:1.55 }
.soft-table__mono{ font-family:ui-monospace, monospace; font-size:11px; white-space:nowrap }

.soft-page__sub{ margin:0 0 14px; color:var(--web-muted); font-size:12px }

.soft-page__top{
  display:grid;
  grid-template-columns:minmax(0,1fr) 216px;
  gap:16px;
  align-items:start;
  margin-bottom:18px;
}

.soft-page__shot{ border:1px solid var(--web-line) }

.soft-download{
  padding:13px 14px;
  border:1px solid var(--web-accent);
  border-radius:var(--web-radius);
  background:var(--web-accent-soft);
}

.soft-download__label{ margin:0 0 4px; font-size:10px; font-weight:800; color:var(--web-accent) }
.soft-download__file{ margin:0; font-family:ui-monospace, monospace; font-size:12px }
.soft-download__size{ margin:2px 0 9px; color:var(--web-muted); font-size:10px }
.soft-download__flash{ margin:8px 0 0; color:var(--web-muted); font-size:10px }

.soft-download__meta{
  margin:12px 0 0;
  padding:0;
  list-style:none;
  font-size:11px;
}

.soft-download__meta li{
  display:flex;
  justify-content:space-between;
  gap:9px;
  padding:4px 0;
  border-top:1px dotted var(--web-line);
}

.soft-download__meta span{ color:var(--web-muted) }

.soft-history{ margin-top:22px }
.soft-history ul{ margin:0; padding:0; list-style:none }
.soft-history li{
  display:grid;
  grid-template-columns:76px 92px minmax(0,1fr);
  gap:10px;
  padding:7px 0;
  border-bottom:1px dotted var(--web-line);
  font-size:11.5px;
}
.soft-history span{ font-family:ui-monospace, monospace; color:var(--web-accent) }
.soft-history time{ color:var(--web-muted); font-size:10.5px }
.soft-history p{ margin:0 }

.soft-related{ margin-top:16px }

@media (max-width:720px){
  .soft-page__top{ grid-template-columns:minmax(0,1fr) }
  .soft-history li{ grid-template-columns:70px minmax(0,1fr) }
  .soft-history time{ grid-column:2 }
  .soft-history p{ grid-column:1 / -1 }
}
</style>
