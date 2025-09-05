<template>
  <div class="chat" :class="{ me: me }">
    <div class="bubble" :class="me? 'me':'you'">
      <div class="from" v-if="from && !me">{{ from }}</div>
      <div class="text" v-html="html"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  from: String,
  text: { type: String, required: true },
  me: { type: Boolean, default: false }
})
const html = computed(()=>{
  // Simple linkify for http(s)
  let t = props.text.replace(/(https?:\/\/\S+)/g,'<a class="link" href="$1" target="_blank">$1</a>')
  return t.replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')
})
</script>
