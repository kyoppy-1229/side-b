<template>
  <section class="web-listing web-card web-pad">
    <header class="web-listing__head">
      <h1 class="web-title">{{ page.heading }}</h1>
      <p v-if="page.subtitle" class="web-listing__sub">{{ page.subtitle }}</p>
      <p class="web-listing__count">{{ items.length }}件{{ items.length > perPage ? `（${current}/${pageCount}ページ）` : '' }}</p>
    </header>

    <slot name="before-list" />

    <WebArticleList v-if="visible.length" :items="visible" :variant="variant" :date-style="dateStyle" />
    <p v-else class="web-empty">該当する記事はありません。</p>

    <WebPager v-model="current" :total="items.length" :per-page="perPage" />

    <nav v-if="page.kind === 'archive-index'" class="web-listing__years">
      <h2 class="web-section-title">年別</h2>
      <ul class="web-taglist">
        <li v-for="year in years" :key="year.path">
          <WebLink :to="year.path" class="web-meta__tag">{{ year.year }}年（{{ year.count }}）</WebLink>
        </li>
      </ul>
      <h2 class="web-section-title">月別</h2>
      <ul class="web-taglist">
        <li v-for="month in months" :key="month.path">
          <WebLink :to="month.path" class="web-meta__tag">{{ month.month.replace('-', '/') }}（{{ month.count }}）</WebLink>
        </li>
      </ul>
    </nav>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { siteMonths, siteYears } from '../../../virtual-web/pages.js'
import WebArticleList from './WebArticleList.vue'
import WebLink from './WebLink.vue'
import WebPager from './WebPager.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  items: { type: Array, default: () => [] },
  variant: { type: String, default: 'headline' },
  perPage: { type: Number, default: 10 },
  dateStyle: { type: String, default: 'slash' }
})

const current = ref(1)
const pageCount = computed(() => Math.max(1, Math.ceil(props.items.length / props.perPage)))
const visible = computed(() => props.items.slice((current.value - 1) * props.perPage, current.value * props.perPage))
const years = computed(() => siteYears(props.site))
const months = computed(() => siteMonths(props.site))

watch(() => props.page.path, () => { current.value = 1 })
</script>

<style scoped>
.web-listing__head{
  padding-bottom:14px;
  margin-bottom:6px;
  border-bottom:2px solid var(--web-accent);
}

.web-listing__sub{ margin:0 0 6px; color:var(--web-muted); font-size:12px }
.web-listing__count{ margin:0; color:var(--web-muted); font-size:10px }
.web-listing__years{ margin-top:24px }
.web-listing__years ul{ margin:0 0 8px; padding:0; list-style:none }
</style>
