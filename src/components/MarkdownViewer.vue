<template>
  <div class="card">
    <h2>完全まとめ（現時点）</h2>
    <div class="hr"></div>
    <div v-html="rendered"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'

const rendered = ref('読み込み中…')
onMounted(async () => {
  const res = await fetch('/docs/complete.md')
  const md = await res.text()
  const mi = new MarkdownIt({ html: true, linkify: true })
  rendered.value = mi.render(md)
})
</script>
