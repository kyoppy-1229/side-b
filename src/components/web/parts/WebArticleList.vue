<template>
  <ul v-if="variant === 'headline'" class="web-list web-list--headline">
    <li v-for="item in items" :key="item.path">
      <div class="web-headline" :class="{ 'web-headline--plain': !showArt || !item.art }">
        <WebLink v-if="showArt && item.art" :to="item.path" variant="bare" class="web-headline__thumb">
          <WebArt :kind="item.art" :seed="item.path" :era="item.era" ratio="thumb" />
        </WebLink>
        <div>
          <WebLink :to="item.path" variant="bare">
            <strong class="web-headline__title">{{ item.title }}</strong>
          </WebLink>
          <p v-if="showExcerpt && item.excerpt" class="web-headline__excerpt">{{ item.excerpt }}</p>
          <div class="web-headline__meta">
            <time v-if="item.publishedAt">{{ formatDate(item.publishedAt, dateStyle) }}</time>
            <span v-if="item.category">{{ item.category }}</span>
            <span v-if="item.comments !== null">コメント{{ item.comments }}</span>
          </div>
        </div>
      </div>
    </li>
  </ul>

  <div v-else-if="variant === 'card'" class="web-grid">
    <WebLink v-for="item in items" :key="item.path" :to="item.path" variant="bare" class="web-tile">
      <WebArt v-if="item.art" :kind="item.art" :seed="item.path" :era="item.era" ratio="wide" />
      <span class="web-tile__body">
        <span v-if="item.category" class="web-chip">{{ item.category }}</span>
        <span class="web-tile__title">{{ item.title }}</span>
        <span v-if="showExcerpt && item.excerpt" class="web-tile__excerpt">{{ item.excerpt }}</span>
        <span class="web-tile__meta">{{ formatDate(item.publishedAt, dateStyle) }}</span>
      </span>
    </WebLink>
  </div>

  <div v-else-if="variant === 'photo'" class="web-grid web-grid--tight">
    <WebLink v-for="item in items" :key="item.path" :to="item.path" variant="bare" class="web-tile">
      <WebArt :kind="item.art || 'city'" :seed="item.path" :era="item.era" ratio="square" />
      <span class="web-tile__body">
        <span class="web-tile__title">{{ item.title }}</span>
        <span class="web-tile__meta">{{ formatDate(item.publishedAt, dateStyle) }}</span>
      </span>
    </WebLink>
  </div>

  <ul v-else-if="variant === 'retro'" class="web-retro-list">
    <li v-for="item in items" :key="item.path">
      <span class="web-retro-list__date">{{ formatDate(item.publishedAt, 'slash') }}</span>
      <WebLink :to="item.path">{{ item.title }}</WebLink>
      <span v-if="item.comments !== null" class="web-retro-list__count">({{ item.comments }})</span>
    </li>
  </ul>

  <ul v-else class="web-compact-list">
    <li v-for="item in items" :key="item.path">
      <time v-if="item.publishedAt">{{ formatDate(item.publishedAt, dateStyle) }}</time>
      <WebLink :to="item.path">{{ item.title }}</WebLink>
      <span v-if="item.category" class="web-compact-list__cat">{{ item.category }}</span>
    </li>
  </ul>
</template>

<script setup>
import { formatDate } from '../../../virtual-web/format.js'
import WebArt from './WebArt.vue'
import WebLink from './WebLink.vue'

defineProps({
  items: { type: Array, default: () => [] },
  variant: { type: String, default: 'headline' },
  showArt: { type: Boolean, default: true },
  showExcerpt: { type: Boolean, default: true },
  dateStyle: { type: String, default: 'slash' }
})
</script>

<style scoped>
.web-headline__thumb{
  display:block;
  overflow:hidden;
  border-radius:calc(var(--web-radius) - 3px);
}

.web-tile__excerpt{
  color:var(--web-muted);
  font-size:11px;
  line-height:1.6;
  display:-webkit-box;
  -webkit-line-clamp:3;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.web-retro-list{
  margin:0;
  padding:0;
  list-style:none;
  font-size:12px;
}

.web-retro-list li{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  padding:5px 2px;
  border-bottom:1px dashed var(--web-line);
}

.web-retro-list__date{ color:var(--web-muted); font-family:ui-monospace, monospace; font-size:11px }
.web-retro-list__count{ color:var(--web-muted); font-size:11px }

.web-compact-list{
  margin:0;
  padding:0;
  list-style:none;
}

.web-compact-list li{
  display:flex;
  flex-wrap:wrap;
  align-items:baseline;
  gap:10px;
  padding:10px 0;
  border-bottom:1px solid var(--web-line);
  font-size:12.5px;
}

.web-compact-list time{
  flex:0 0 auto;
  color:var(--web-muted);
  font-size:11px;
  font-variant-numeric:tabular-nums;
}

.web-compact-list__cat{
  padding:1px 7px;
  border:1px solid var(--web-line);
  border-radius:999px;
  color:var(--web-muted);
  font-size:10px;
}

@media (max-width:520px){
  .web-headline{ grid-template-columns:76px minmax(0,1fr) }
}
</style>
