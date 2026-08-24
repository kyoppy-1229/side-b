<template>
  <section class="dbg-section" :class="{ 'is-open': open }">
    <button
      type="button"
      class="dbg-section__head"
      :aria-expanded="open"
      :aria-controls="bodyId"
      @click="shell.toggleSection(id)"
    >
      <span class="dbg-section__icon" aria-hidden="true">{{ icon }}</span>
      <span class="dbg-section__title">{{ title }}</span>
      <span v-if="badge !== ''" class="dbg-chip">{{ badge }}</span>
      <span class="dbg-section__chevron" aria-hidden="true">{{ open ? '▾' : '▸' }}</span>
    </button>
    <div v-show="open" :id="bodyId" class="dbg-section__body">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useDebugConsole } from './debugContext.js'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  icon: { type: String, default: '·' },
  badge: { type: [String, Number], default: '' }
})

const shell = useDebugConsole()
const open = computed(() => shell.isSectionOpen(props.id))
const bodyId = computed(() => `dbg-section-${props.id}`)
</script>
