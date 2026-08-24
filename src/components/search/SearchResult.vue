<template>
  <article class="search-result" :class="{ 'search-result--partial': result.partial }">
    <button class="search-result__link" type="button" @click="emit('open-url', result.url)">
      <span class="search-result__source">
        <span class="search-result__favicon" aria-hidden="true">{{ sourceInitial }}</span>
        <span>
          <strong>{{ result.source }}</strong>
          <small>{{ displayUrl }}</small>
        </span>
      </span>
      <span class="search-result__title">{{ result.title }}</span>
    </button>
    <p>
      <time v-if="result.date" class="search-result__date">{{ displayDate }}</time>
      <span v-if="result.date" class="search-result__dash" aria-hidden="true">—</span>
      {{ result.description }}
    </p>
    <footer>
      <span>{{ result.type }}</span>
      <span v-if="result.category" class="search-result__category">{{ result.category }}</span>
      <span v-if="result.siteStatus === 'closed'" class="search-result__closed">サイト閉鎖</span>
      <span v-if="result.siteStatus === 'inactive'" class="search-result__closed">更新停止</span>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '../../virtual-web/format.js'

const props = defineProps({
  result: { type: Object, required: true }
})

const emit = defineEmits(['open-url'])

const displayUrl = computed(() => {
  const withoutScheme = props.result.url.replace(/^https?:\/\//, '')
  return withoutScheme.replace(/\//g, ' › ')
})

const displayDate = computed(() => formatDate(props.result.date, 'ja') || props.result.date)
const sourceInitial = computed(() => props.result.source?.charAt(0) || 'R')
</script>

<style scoped>
.search-result{
  padding:20px 0;
  border-bottom:1px solid #e3e9f0;
}

.search-result--partial{ opacity:.92 }

.search-result__link{
  display:flex;
  align-items:flex-start;
  flex-direction:column;
  gap:9px;
  max-width:100%;
  padding:0;
  border:0;
  background:transparent;
  color:inherit;
  text-align:left;
  cursor:pointer;
}

.search-result__link:focus-visible{
  outline:3px solid rgba(45, 108, 199, 0.26);
  outline-offset:6px;
  border-radius:4px;
}

.search-result__source{
  min-width:0;
  display:flex;
  align-items:center;
  gap:9px;
}

.search-result__favicon{
  width:30px;
  height:30px;
  display:grid;
  place-items:center;
  border-radius:9px;
  background:#e7eef8;
  color:#366aa9;
  font-size:11px;
  font-weight:900;
}

.search-result__source > span:last-child{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:2px;
}

.search-result__source strong{
  color:#334359;
  font-size:10px;
  letter-spacing:0.03em;
}

.search-result__source small{
  overflow:hidden;
  color:#718096;
  font-size:9px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.search-result__title{
  color:#245fae;
  font-size:18px;
  font-weight:700;
  line-height:1.4;
  transition:color 160ms ease;
}

.search-result__link:hover .search-result__title{
  color:#174782;
  text-decoration:underline;
  text-underline-offset:3px;
}

.search-result p{
  max-width:700px;
  margin:8px 0 0;
  color:#56677e;
  font-size:12px;
  line-height:1.7;
}

.search-result__date{ color:#8a97a8 }
.search-result__dash{ margin:0 4px; color:#b6c0cd }

.search-result footer{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:8px;
  margin-top:10px;
  color:#7c899a;
  font-size:9px;
}

.search-result footer span{
  padding:3px 7px;
  border-radius:999px;
  background:#eef2f7;
}

.search-result__closed{
  background:#fdf0ea !important;
  color:#a4552f;
}
</style>
