<template>
  <WebChrome owns-heading :site="site" :page="page" variant="plain" :columns="2">
    <template #header-meta>
      <WebSearchBox placeholder="項目を検索" />
    </template>

    <template #breadcrumb>
      <WebBreadcrumb :items="breadcrumbs" />
    </template>

    <template v-if="page.kind === 'home'">
      <section class="wiki-hero web-card web-pad">
        <h1 class="web-title">{{ site.name }}</h1>
        <p class="wiki-hero__lead">{{ site.description }}</p>
        <p class="wiki-hero__count">現在 {{ entries.length }} 項目を収録しています。</p>
      </section>

      <section class="web-card web-pad wiki-index">
        <h2 class="web-section-title">項目一覧</h2>
        <div class="wiki-index__grid">
          <div v-for="group in grouped" :key="group.label">
            <h3>{{ group.label }}</h3>
            <ul>
              <li v-for="entry in group.items" :key="entry.path">
                <WebLink :to="entry.path">{{ entry.title }}</WebLink>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </template>

    <template v-else-if="page.kind === 'wiki' || page.kind === 'term'">
      <article class="wiki-article web-card web-pad">
        <h1 class="wiki-article__title">{{ page.heading }}</h1>
        <p class="wiki-article__meta">
          <span>最終更新 {{ formatDate(page.updatedAt || page.publishedAt, 'ja') }}</span>
          <span v-if="page.category">分類: {{ page.category }}</span>
          <span v-if="page.views !== null">閲覧 {{ formatCount(page.views) }}</span>
        </p>

        <aside v-if="page.facts.length" class="wiki-infobox">
          <h2>{{ page.data.infoboxTitle || page.heading }}</h2>
          <WebArt v-if="page.art" :kind="page.art" :seed="page.path" ratio="photo" />
          <dl>
            <div v-for="fact in page.facts" :key="fact.label">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
        </aside>

        <nav v-if="toc.length" class="wiki-toc" aria-label="目次">
          <strong>目次</strong>
          <ol>
            <li v-for="(item, index) in toc" :key="index">{{ index + 1 }}. {{ item }}</li>
          </ol>
        </nav>

        <p v-if="page.lead" class="wiki-article__lead">{{ page.lead }}</p>
        <WebBlocks :blocks="page.blocks" :seed="page.path" />

        <section v-if="page.data.references?.length" class="wiki-refs">
          <h2 class="web-section-title">参考</h2>
          <ol>
            <li v-for="(reference, index) in page.data.references" :key="index">{{ reference }}</li>
          </ol>
        </section>

        <section v-if="related.length" class="wiki-related">
          <h2 class="web-section-title">関連項目</h2>
          <ul class="web-taglist">
            <li v-for="item in related" :key="item.path">
              <WebLink :to="item.path" class="web-meta__tag">{{ item.title }}</WebLink>
            </li>
          </ul>
        </section>
      </article>
    </template>

    <WebDefaultBody v-else :site="site" :page="page" :query="query" list-variant="compact" />

    <template #aside>
      <aside class="web-aside">
        <section class="web-widget">
          <h2 class="web-widget__head">案内</h2>
          <div class="web-widget__body">
            <ul class="wiki-menu">
              <li><WebLink to="/">メインページ</WebLink></li>
              <li v-for="category in site.categories" :key="category.slug">
                <WebLink :to="`/category/${category.slug}`">{{ category.label }}</WebLink>
              </li>
              <li><WebLink to="/about">この事典について</WebLink></li>
            </ul>
          </div>
        </section>
        <section class="web-widget">
          <h2 class="web-widget__head">最近更新された項目</h2>
          <div class="web-widget__body">
            <ul class="wiki-menu">
              <li v-for="entry in recent" :key="entry.path">
                <WebLink :to="entry.path">{{ entry.title }}</WebLink>
              </li>
            </ul>
          </div>
        </section>
        <div class="web-ad">
          <strong>寄付のお願い</strong>
          <span>この事典は利用者の協力で運営されています。</span>
        </div>
      </aside>
    </template>
  </WebChrome>
</template>

<script setup>
import { computed } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { relatedArticles, siteArticles } from '../../../virtual-web/pages.js'
import { formatCount, formatDate } from '../../../virtual-web/format.js'
import WebArt from '../parts/WebArt.vue'
import WebBlocks from '../parts/WebBlocks.vue'
import WebBreadcrumb from '../parts/WebBreadcrumb.vue'
import WebChrome from '../parts/WebChrome.vue'
import WebDefaultBody from '../parts/WebDefaultBody.vue'
import WebLink from '../parts/WebLink.vue'
import WebSearchBox from '../parts/WebSearchBox.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) }
})

const entries = computed(() => siteArticles(props.site))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
const toc = computed(() => props.page.blocks.filter((block) => block.type === 'h' && block.level !== 3).map((block) => block.text))
const related = computed(() => relatedArticles(props.site, props.page, 6))
const recent = computed(() => entries.value.slice(0, 6))

const grouped = computed(() => props.site.categories
  .map((category) => ({
    label: category.label,
    items: entries.value.filter((entry) => entry.category === category.label)
  }))
  .filter((group) => group.items.length))
</script>

<style scoped>
.wiki-hero__lead{ margin:0 0 8px; font-size:12.5px; line-height:1.8 }
.wiki-hero__count{ margin:0; color:var(--web-muted); font-size:11px }

.wiki-index{ margin-top:16px }

.wiki-index__grid{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));
  gap:16px;
}

.wiki-index__grid h3{
  margin:0 0 6px;
  padding-bottom:4px;
  border-bottom:1px solid var(--web-line);
  font-size:12px;
}

.wiki-index__grid ul{ margin:0; padding-left:1.2em; font-size:12px }
.wiki-index__grid li{ padding:2px 0 }

.wiki-article__title{
  margin:0 0 6px;
  padding-bottom:8px;
  border-bottom:1px solid var(--web-line);
  font-family:var(--web-heading-font);
  font-size:27px;
  font-weight:400;
}

.wiki-article__meta{
  display:flex;
  flex-wrap:wrap;
  gap:12px;
  margin:0 0 14px;
  color:var(--web-muted);
  font-size:10.5px;
}

.wiki-infobox{
  float:right;
  width:min(258px, 100%);
  margin:0 0 14px 18px;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-page);
  overflow:hidden;
}

.wiki-infobox h2{
  margin:0;
  padding:8px 11px;
  background:var(--web-accent-soft);
  font-size:11.5px;
  text-align:center;
}

.wiki-infobox dl{ margin:0; padding:0; font-size:11px }
.wiki-infobox dl > div{ display:grid; grid-template-columns:78px minmax(0,1fr); border-top:1px solid var(--web-line) }
.wiki-infobox dt{ padding:6px 9px; font-weight:700 }
.wiki-infobox dd{ margin:0; padding:6px 9px }

.wiki-toc{
  display:inline-block;
  min-width:190px;
  margin:0 0 14px;
  padding:10px 14px;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-page);
  font-size:11.5px;
}

.wiki-toc strong{ display:block; margin-bottom:5px; text-align:center; font-size:11px }
.wiki-toc ol{ margin:0; padding:0; list-style:none }
.wiki-toc li{ padding:2px 0; color:var(--web-accent) }

.wiki-article__lead{ margin:0 0 4px; font-size:13px; line-height:1.9 }
.wiki-refs{ margin-top:24px; clear:both }
.wiki-refs ol{ margin:0; padding-left:1.4em; color:var(--web-muted); font-size:11px }
.wiki-refs li{ padding:2px 0 }
.wiki-related{ margin-top:20px; clear:both }
.wiki-related ul{ margin:0; padding:0; list-style:none }

.wiki-menu{ margin:0; padding:0; list-style:none; font-size:11.5px }
.wiki-menu li{ padding:3px 0; border-bottom:1px dotted var(--web-line) }
.wiki-menu li:last-child{ border-bottom:0 }

@media (max-width:640px){
  .wiki-infobox{ float:none; width:100%; margin:0 0 14px }
}
</style>
