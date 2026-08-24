<template>
  <WebSitePage
    site-id="tohto-news"
    path="/articles/2015/03/20150302-17"
    @navigate="emit('navigate', $event)"
    @open-url="emit('open-url', $event)"
    @return-messages="emit('return-messages')"
  />
</template>

<script setup>
import WebSitePage from '../components/web/WebSitePage.vue'

defineProps({ embedded: { type: Boolean, default: false } })
const emit = defineEmits(['navigate', 'open-url', 'return-messages', 'back'])
</script>
