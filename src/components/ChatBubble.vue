<template>
  <div class="chat" :class="{ me: isMe }">
    <div class="avatar">
      <img :src="avatar" :alt="avatarAlt" />
    </div>
    <div class="bubble-wrap">
      <div class="from" v-if="displayName">{{ displayName }}</div>
      <div class="bubble" :class="isMe ? 'me' : 'you'">
        <div class="text" v-html="html"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import mizunoAvatar from '../photo/solo/水野ヒロキ.png'
import heroAvatar from '../photo/犬.png'
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
const isMe = computed(()=> props.me || props.from === '主人公')
const displayName = computed(()=> (isMe.value || !props.from) ? '' : props.from)
const avatar = computed(()=> isMe.value ? heroAvatar : mizunoAvatar)
const avatarAlt = computed(()=> isMe.value ? '主人公' : (props.from || '水野ヒロキ'))
</script>
