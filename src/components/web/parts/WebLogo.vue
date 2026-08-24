<template>
  <span class="web-logo" :class="`web-logo--${size}`">
    <span v-html="logo" />
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { buildLogo } from '../../../virtual-web/art/artwork.js'

const props = defineProps({
  site: { type: Object, required: true },
  size: { type: String, default: 'md' }
})

const logo = computed(() => buildLogo(props.site))
</script>

<style scoped>
.web-logo{
  display:block;
  flex:0 0 auto;
  line-height:0;
}

.web-logo :deep(svg){ display:block; width:100%; height:100% }
.web-logo--sm{ width:22px; height:22px }
.web-logo--md{ width:32px; height:32px }
.web-logo--lg{ width:44px; height:44px }
</style>
