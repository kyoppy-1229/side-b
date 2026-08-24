<template>
  <div ref="root" class="web-site-frame">
    <component
      :is="template"
      v-if="site"
      :site="site"
      :page="page"
      :query="query"
    />
    <p v-else class="web-site-frame__missing">このサイトのデータが見つかりませんでした。</p>
  </div>
</template>

<script setup>
import { computed, provide, ref, watch } from 'vue'
import { getSiteById } from '../../virtual-web/sites/index.js'
import { notFoundPage, resolveSitePage } from '../../virtual-web/pages.js'
import { WEB_SITE_KEY } from './webSiteContext.js'
import { templateFor } from './templates/templateRegistry.js'
import '../../assets/web/base.css'

const props = defineProps({
  siteId: { type: String, required: true },
  path: { type: String, default: '/' },
  query: { type: Object, default: () => ({}) },
  notFound: { type: Boolean, default: false }
})

const emit = defineEmits(['navigate', 'open-url', 'return-messages'])

const root = ref(null)
const site = computed(() => getSiteById(props.siteId))
const page = computed(() => {
  if(!site.value) return null
  const resolved = props.notFound ? null : resolveSitePage(site.value, props.path)
  return resolved || notFoundPage(site.value, props.path)
})
const template = computed(() => (site.value ? templateFor(site.value) : null))

function toUrl(target){
  const value = String(target ?? '').trim()
  if(!value) return `https://${site.value?.domain || 'example.jp'}/`
  if(/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//')) return value
  const path = value.startsWith('/') ? value : `/${value}`
  return `https://${site.value?.domain || 'example.jp'}${path}`
}

provide(WEB_SITE_KEY, {
  site,
  page,
  toUrl,
  navigate: (url) => emit('navigate', toUrl(url)),
  openInNewTab: (url) => emit('open-url', toUrl(url)),
  returnMessages: () => emit('return-messages')
})

// Following a link inside a site should start the new page at the top, the way
// a real browser does. The scroll container is the browser's page panel.
watch(() => `${props.siteId}${props.path}`, () => {
  const panel = root.value?.closest('.browser-page-panel')
  if(panel) panel.scrollTop = 0
})
</script>

<style scoped>
.web-site-frame{
  min-height:100%;
  background:#fff;
  /* Lets the rendered site respond to the browser panel's width rather than
     the window's. Scoped to this element so nothing in SIDE-B's own screens is
     affected by the containment. */
  container-type:inline-size;
}

.web-site-frame__missing{
  padding:48px 24px;
  color:#64748b;
  font-size:13px;
  text-align:center;
}
</style>
