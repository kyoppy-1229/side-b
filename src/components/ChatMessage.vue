<template>
  <div class="chat-row" :class="{ me }">
    <AvatarIni :name="from || (me ? '主人公' : '相手')" />
    <div style="display:flex;flex-direction:column;align-items:flex-start;">
      <div class="name" v-if="!me">{{ from }}</div>
      <div class="bubble2" v-html="html"></div>
    </div>
    <div class="time" v-if="time">{{ time }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AvatarIni from './AvatarIni.vue'
const props = defineProps({
  from: String,
  text: { type: String, required: true },
  me: { type: Boolean, default: false },
  time: String
})
const html = computed(()=>{
  let t = props.text.replace(/(https?:\/\/\S+)/g,'<a class="link" href="$1" target="_blank">$1</a>')
  return t.replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')
})
</script>
