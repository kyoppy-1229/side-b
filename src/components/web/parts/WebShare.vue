<template>
  <div class="web-share">
    <span>この記事を共有</span>
    <button type="button" @click="flash('リンクをコピーしました')">リンクをコピー</button>
    <button type="button" @click="flash('共有機能はこのブラウザーでは利用できません')">共有</button>
    <button type="button" @click="flash('あとで読む一覧に追加しました')">あとで読む</button>
    <span v-if="message" class="web-share__flash" role="status">{{ message }}</span>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'

const message = ref('')
let timer = 0

// Nothing leaves the virtual browser: the buttons only acknowledge the click.
function flash(text){
  message.value = text
  window.clearTimeout(timer)
  timer = window.setTimeout(() => { message.value = '' }, 2200)
}

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<style scoped>
.web-share__flash{
  color:var(--web-accent);
  font-size:10px;
  font-weight:700;
}
</style>
