<template>
  <form class="web-searchbox" role="search" @submit.prevent="submit">
    <label class="web-visually-hidden" :for="inputId">{{ site.site.name }}内を検索</label>
    <input :id="inputId" v-model="draft" type="search" :placeholder="placeholder" autocomplete="off" spellcheck="false" />
    <button class="web-button" type="submit">検索</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useWebSite } from '../webSiteContext.js'

const props = defineProps({
  placeholder: { type: String, default: 'サイト内検索' },
  initial: { type: String, default: '' }
})

const site = useWebSite()
const draft = ref(props.initial)
const inputId = `web-site-search-${Math.random().toString(36).slice(2, 8)}`

function submit(){
  const query = draft.value.trim()
  site.navigate(site.toUrl(query ? `/search?q=${encodeURIComponent(query)}` : '/search'))
}
</script>
