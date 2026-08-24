<template>
  <WebChrome :site="site" :page="page" variant="plain" :columns="2">
    <template #breadcrumb>
      <WebBreadcrumb :items="breadcrumbs" />
    </template>

    <template v-if="page.kind === 'home'">
      <section v-if="site.intro.length" class="blog-intro web-card web-pad">
        <WebBlocks :blocks="site.intro" :seed="site.id" />
      </section>

      <p v-if="site.status === 'inactive'" class="blog-inactive">
        このブログは{{ site.lastUpdated ? formatDate(site.lastUpdated, 'ja') : '' }}以降、更新を停止しています。過去の記事はそのまま公開しています。
      </p>

      <section class="web-card web-pad">
        <h2 class="web-section-title">
          {{ site.homeCopy.listTitle || '最近の記事' }}
          <small>全{{ articles.length }}件</small>
        </h2>
        <WebArticleList
          :items="visible"
          :variant="site.homeLayout === 'photo' ? 'photo' : 'headline'"
          date-style="slash"
        />
        <WebPager v-model="current" :total="articles.length" :per-page="perPage" />
      </section>
    </template>

    <WebDefaultBody
      v-else
      :site="site"
      :page="page"
      :query="query"
      :list-variant="site.homeLayout === 'photo' ? 'photo' : 'headline'"
      hero-ratio="photo"
    />

    <template #aside>
      <WebSidebar :site="site" />
    </template>
  </WebChrome>
</template>

<script setup>
import { computed, ref } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { siteArticles } from '../../../virtual-web/pages.js'
import { formatDate } from '../../../virtual-web/format.js'
import WebArticleList from '../parts/WebArticleList.vue'
import WebBlocks from '../parts/WebBlocks.vue'
import WebBreadcrumb from '../parts/WebBreadcrumb.vue'
import WebChrome from '../parts/WebChrome.vue'
import WebDefaultBody from '../parts/WebDefaultBody.vue'
import WebPager from '../parts/WebPager.vue'
import WebSidebar from '../parts/WebSidebar.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) }
})

const perPage = 8
const current = ref(1)
const articles = computed(() => siteArticles(props.site))
const visible = computed(() => articles.value.slice((current.value - 1) * perPage, current.value * perPage))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
</script>

<style scoped>
.blog-intro{ margin-bottom:16px }

.blog-inactive{
  margin:0 0 16px;
  padding:11px 14px;
  border:1px solid var(--web-line);
  border-left:4px solid var(--web-muted);
  border-radius:var(--web-radius);
  background:var(--web-surface);
  color:var(--web-muted);
  font-size:11.5px;
}
</style>
