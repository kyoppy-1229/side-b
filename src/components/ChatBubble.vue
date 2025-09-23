<template>
  <div class="chat" :class="{ me: isMe }">
    <div class="avatar">
      <img :src="avatar" :alt="avatarAlt" />
    </div>
    <div class="bubble-wrap">
      <div class="from" v-if="displayName">{{ displayName }}</div>
      <div class="bubble" :class="isMe ? 'me' : 'you'">
        <div v-if="hasText" class="text" v-html="html"></div>
        <figure v-if="imageSrc" class="media">
          <img :src="imageSrc" :alt="imageAlt" />
          <figcaption v-if="imageCaption">{{ imageCaption }}</figcaption>
        </figure>
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
  text: { type: String, default: '' },
  image: { type: Object, default: null },
  me: { type: Boolean, default: false }
})
const rawText = computed(() => props.text || '')
const html = computed(()=>{
  const t = rawText.value
  if(!t) return ''
  // Simple linkify for http(s)
  let linked = t.replace(/(https?:\/\/\S+)/g,'<a class="link" href="$1" target="_blank">$1</a>')
  return linked.replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')
})
const hasText = computed(() => rawText.value.length > 0)
const isMe = computed(()=> props.me || props.from === '主人公')
const displayName = computed(()=> (isMe.value || !props.from) ? '' : props.from)
const avatar = computed(()=> isMe.value ? heroAvatar : mizunoAvatar)
const avatarAlt = computed(()=> isMe.value ? '主人公' : (props.from || '水野ヒロキ'))
const imageSrc = computed(()=> props.image?.src || '')
const imageAlt = computed(()=> props.image?.alt || '共有された画像')
const imageCaption = computed(()=> props.image?.caption || '')
</script>

<style scoped>
.media{
  margin:0;
}
.text + .media{
  margin-top:12px;
}
.media img{
  display:block;
  max-width:100%;
  border-radius:12px;
  box-shadow:0 12px 28px rgba(44,76,149,0.2);
}
.media figcaption{
  margin-top:8px;
  font-size:12px;
  line-height:1.5;
  opacity:0.85;
}
</style>
