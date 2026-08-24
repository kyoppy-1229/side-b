<template>
  <section class="web-notfound web-card web-pad">
    <p class="web-notfound__code">404 Not Found</p>
    <h1 class="web-title">ページが見つかりませんでした</h1>
    <p class="web-notfound__text">
      お探しのページ <code>{{ path }}</code> は見つかりませんでした。
      URLが変更されたか、記事が取り下げられた可能性があります。
    </p>
    <div class="web-notfound__actions">
      <WebLink to="/" variant="button">{{ site.name }}のトップへ</WebLink>
      <WebLink v-if="hasArticles" to="/archive">記事アーカイブを見る</WebLink>
    </div>
    <section v-if="latest.length" class="web-notfound__latest">
      <h2 class="web-section-title">最近の記事</h2>
      <WebArticleList :items="latest" variant="compact" />
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { siteArticles } from '../../../virtual-web/pages.js'
import WebArticleList from './WebArticleList.vue'
import WebLink from './WebLink.vue'

const props = defineProps({
  site: { type: Object, required: true },
  path: { type: String, default: '/' }
})

const articles = computed(() => siteArticles(props.site))
const hasArticles = computed(() => articles.value.length > 0)
const latest = computed(() => articles.value.slice(0, 5))
</script>

<style scoped>
.web-notfound__code{
  margin:0 0 8px;
  color:var(--web-muted);
  font-family:ui-monospace, monospace;
  font-size:11px;
  letter-spacing:.08em;
}

.web-notfound__text{ margin:0 0 16px; font-size:12.5px; line-height:1.8 }
.web-notfound__text code{ padding:1px 6px; border-radius:3px; background:var(--web-page); font-size:11px }

.web-notfound__actions{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:14px;
}

.web-notfound__latest{ margin-top:26px }
</style>
