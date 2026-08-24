<template>
  <div class="web-art" :class="`web-art--${ratio}`" :data-era="era || undefined">
    <img :src="generatedArt" :alt="kind" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { generatedArtFor } from '../../../virtual-web/art/generated.js'

const props = defineProps({
  kind: { type: String, default: 'abstract' },
  seed: { type: String, default: '' },
  era: { type: String, default: '' },
  ratio: { type: String, default: 'wide' }
})

const generatedArt = computed(() => generatedArtFor(props.kind))
</script>

<style scoped>
.web-art{
  overflow:hidden;
  border-radius:inherit;
  background:#e8ecf1;
  line-height:0;
}

.web-art img{
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;
}

.web-art--wide{ aspect-ratio:16 / 9 }
.web-art--photo{ aspect-ratio:4 / 3 }
.web-art--square{ aspect-ratio:1 / 1 }
.web-art--poster{ aspect-ratio:5 / 7 }
.web-art--banner{ aspect-ratio:21 / 9 }
.web-art--thumb{ aspect-ratio:4 / 3 }

.web-art[data-era="2010s"]{
  image-rendering:pixelated;
  border-radius:0;
}
</style>
