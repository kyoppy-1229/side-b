<template>
  <WebChrome :site="site" :page="page" variant="civic" :columns="page.kind === 'home' ? 1 : 2">
    <template #header-meta>
      <span class="civic-tools">
        <button type="button" @click="fontLarge = !fontLarge">文字サイズ{{ fontLarge ? '標準' : '拡大' }}</button>
        <WebSearchBox placeholder="ページを検索" />
      </span>
    </template>

    <template #breadcrumb>
      <WebBreadcrumb :items="breadcrumbs" />
    </template>

    <div :class="{ 'civic-large': fontLarge }">
      <template v-if="page.kind === 'home'">
        <section v-if="site.data.alert" class="civic-alert">
          <strong>{{ site.data.alert.label || '注意情報' }}</strong>
          <span>{{ site.data.alert.text }}</span>
        </section>

        <section class="civic-services">
          <h2 class="web-section-title">目的から探す</h2>
          <div class="civic-grid">
            <WebLink
              v-for="service in site.data.services || []"
              :key="service.path"
              :to="service.path"
              variant="bare"
              class="civic-service"
            >
              <span class="civic-service__icon" aria-hidden="true">{{ service.mark || '■' }}</span>
              <strong>{{ service.label }}</strong>
              <span class="civic-service__note">{{ service.note }}</span>
            </WebLink>
          </div>
        </section>

        <div class="civic-columns">
          <section class="web-card web-pad">
            <h2 class="web-section-title">
              お知らせ
              <small><WebLink to="/archive">一覧</WebLink></small>
            </h2>
            <WebArticleList :items="notices.slice(0, 8)" variant="compact" date-style="slash" />
          </section>

          <aside class="civic-side">
            <section class="web-widget">
              <h2 class="web-widget__head">窓口の案内</h2>
              <div class="web-widget__body">
                <ul class="civic-info">
                  <li v-for="row in site.data.desk || []" :key="row.label">
                    <span>{{ row.label }}</span>
                    <strong>{{ row.value }}</strong>
                  </li>
                </ul>
              </div>
            </section>
            <section v-if="site.data.quickLinks?.length" class="web-widget">
              <h2 class="web-widget__head">よく見られているページ</h2>
              <div class="web-widget__body">
                <ul class="civic-links">
                  <li v-for="link in site.data.quickLinks" :key="link.path">
                    <WebLink :to="link.path">{{ link.label }}</WebLink>
                  </li>
                </ul>
              </div>
            </section>
          </aside>
        </div>
      </template>

      <template v-else-if="page.kind === 'guide' || page.kind === 'notice' || page.kind === 'data'">
        <article class="civic-page web-card web-pad">
          <h1 class="web-title">{{ page.heading }}</h1>
          <p class="civic-page__meta">
            <span v-if="page.publishedAt">掲載日 {{ formatDate(page.publishedAt, 'ja') }}</span>
            <span v-if="page.updatedAt && page.updatedAt !== page.publishedAt">更新日 {{ formatDate(page.updatedAt, 'ja') }}</span>
            <span v-if="page.data.department">担当 {{ page.data.department }}</span>
          </p>
          <p v-if="page.lead" class="civic-page__lead">{{ page.lead }}</p>
          <WebBlocks :blocks="page.blocks" :seed="page.path" />
          <section v-if="page.data.contact" class="civic-contact">
            <h2>このページに関するお問い合わせ</h2>
            <p>{{ page.data.contact }}</p>
          </section>
          <section v-if="related.length" class="civic-related">
            <h2 class="web-section-title">関連するページ</h2>
            <WebArticleList :items="related" variant="compact" date-style="slash" />
          </section>
        </article>
      </template>

      <WebDefaultBody v-else :site="site" :page="page" :query="query" list-variant="compact" />
    </div>

    <template v-if="page.kind !== 'home'" #aside>
      <WebSidebar :site="site" />
    </template>
  </WebChrome>
</template>

<script setup>
import { computed, ref } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { relatedArticles, siteArticles } from '../../../virtual-web/pages.js'
import { formatDate } from '../../../virtual-web/format.js'
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

const fontLarge = ref(false)
const notices = computed(() => siteArticles(props.site))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
const related = computed(() => relatedArticles(props.site, props.page, 5))
</script>

<style scoped>
.civic-tools{
  display:flex;
  align-items:center;
  gap:9px;
}

.civic-tools button{
  padding:5px 9px;
  border:1px solid var(--web-line);
  border-radius:3px;
  background:var(--web-surface);
  color:var(--web-ink);
  font-size:10px;
  cursor:pointer;
}

.civic-large{ font-size:calc(var(--web-body-size) + 2px) }

.civic-alert{
  display:flex;
  flex-wrap:wrap;
  align-items:baseline;
  gap:10px;
  margin-bottom:16px;
  padding:11px 14px;
  border:1px solid #d9a13f;
  border-left:6px solid #d9a13f;
  border-radius:var(--web-radius);
  background:#fdf6e7;
  font-size:12px;
}

.civic-alert strong{ color:#9a6a15 }

.civic-services{ margin-bottom:18px }

.civic-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(148px, 1fr));
  gap:10px;
}

.civic-service{
  display:grid;
  gap:4px;
  padding:13px 14px;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-surface);
  font-size:12px;
}

.civic-service:hover{ border-color:var(--web-accent); background:var(--web-accent-soft) }

.civic-service__icon{
  display:grid;
  place-items:center;
  width:26px;
  height:26px;
  border-radius:6px;
  background:var(--web-accent-soft);
  color:var(--web-accent);
  font-size:12px;
}

.civic-service__note{ color:var(--web-muted); font-size:10px; line-height:1.55 }

.civic-columns{
  display:grid;
  grid-template-columns:minmax(0,1fr) 258px;
  gap:16px;
  align-items:start;
}

.civic-side{ display:grid; gap:14px }

.civic-info{ margin:0; padding:0; list-style:none; font-size:11.5px }
.civic-info li{
  display:flex;
  justify-content:space-between;
  gap:10px;
  padding:5px 0;
  border-bottom:1px dotted var(--web-line);
}
.civic-info span{ color:var(--web-muted) }

.civic-links{ margin:0; padding:0 0 0 1.1em; font-size:11.5px }
.civic-links li{ padding:3px 0 }

.civic-page__meta{
  display:flex;
  flex-wrap:wrap;
  gap:14px;
  margin:0 0 14px;
  padding-bottom:12px;
  border-bottom:1px solid var(--web-line);
  color:var(--web-muted);
  font-size:10.5px;
}

.civic-page__lead{ margin:0 0 4px; font-size:13px; font-weight:600; line-height:1.85 }

.civic-contact{
  margin-top:24px;
  padding:13px 15px;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-page);
}

.civic-contact h2{ margin:0 0 5px; font-size:12px }
.civic-contact p{ margin:0; font-size:11.5px; line-height:1.7 }
.civic-related{ margin-top:22px }

@media (max-width:820px){
  .civic-columns{ grid-template-columns:minmax(0,1fr) }
}
</style>
