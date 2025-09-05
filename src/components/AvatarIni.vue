<template>
  <div class="avatar" :title="name">
    <span class="ini">{{ initials }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  name: { type: String, required: true }
})
const initials = computed(()=>{
  const t = props.name.trim()
  if(!t) return '?'
  // pick up to 2 initials from Japanese or romaji
  const parts = t.split(/\s+/)
  const a = parts[0].charAt(0)
  const b = (parts[1]||'').charAt(0)
  return (a + b).toUpperCase()
})
</script>
