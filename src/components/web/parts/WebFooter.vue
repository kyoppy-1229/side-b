<template>
  <footer class="web-footer">
    <div class="web-shell web-footer__inner">
      <div class="web-footer__links">
        <WebLink to="/">トップ</WebLink>
        <WebLink v-if="site.staticPages" to="/about">サイトについて</WebLink>
        <WebLink v-if="site.staticPages" to="/privacy">プライバシーポリシー</WebLink>
        <WebLink v-if="site.staticPages" to="/terms">利用規約</WebLink>
        <WebLink v-if="site.staticPages" to="/contact">お問い合わせ</WebLink>
        <WebLink v-for="link in site.footerLinks" :key="link.path" :to="link.path">{{ link.label }}</WebLink>
      </div>
      <p v-if="site.history.length" class="web-footer__history">
        <span v-for="entry in site.history" :key="entry.year">{{ entry.year }}年 {{ entry.text }}</span>
      </p>
      <p class="web-footer__copy">
        {{ operator }}
        <span v-if="site.established"> ／ {{ site.established }}開設</span>
        <span v-if="site.status === 'inactive'"> ／ 現在は更新を停止しています</span>
      </p>
      <p class="web-footer__copy">© {{ copyrightYear }} {{ operator }} All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import WebLink from './WebLink.vue'

const props = defineProps({
  site: { type: Object, required: true }
})

const operator = computed(() => props.site.operator || props.site.name)
const copyrightYear = computed(() => {
  if(props.site.status === 'closed' && props.site.closedAt) return props.site.closedAt.slice(0, 4)
  if(props.site.status === 'inactive' && props.site.lastUpdated) return props.site.lastUpdated.slice(0, 4)
  return '2026'
})
</script>

<style scoped>
.web-footer__history{
  display:flex;
  flex-wrap:wrap;
  gap:14px;
  margin:0;
  font-size:10px;
  opacity:.85;
}
</style>
