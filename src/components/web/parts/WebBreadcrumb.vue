<template>
  <nav class="web-breadcrumb" aria-label="パンくずリスト">
    <template v-for="(item, index) in items" :key="index">
      <WebLink v-if="item.path" :to="item.path" variant="plain">{{ item.label }}</WebLink>
      <span v-else aria-current="page">{{ item.label }}</span>
      <span v-if="index < items.length - 1" class="web-breadcrumb__sep" aria-hidden="true">›</span>
    </template>
  </nav>
</template>

<script setup>
import WebLink from './WebLink.vue'

defineProps({
  items: { type: Array, default: () => [] }
})
</script>
