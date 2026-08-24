<template>
  <article class="web-article web-card web-pad">
    <div v-if="page.category || page.publishedAt" class="web-article__kicker">
      <WebLink v-if="categorySlug" :to="`/category/${categorySlug}`" class="web-chip">{{ page.category }}</WebLink>
      <span v-else-if="page.category" class="web-chip">{{ page.category }}</span>
      <time v-if="page.publishedAt" :datetime="page.publishedAt">{{ formatDate(page.publishedAt, dateStyle) }}{{ weekday }}</time>
      <span v-if="page.updatedAt && page.updatedAt !== page.publishedAt">最終更新 {{ formatDate(page.updatedAt, dateStyle) }}</span>
    </div>

    <h1 class="web-title">{{ page.heading }}</h1>
    <p v-if="page.subtitle" class="web-article__subtitle">{{ page.subtitle }}</p>

    <div class="web-meta web-article__meta">
      <span v-if="page.author">{{ page.author }}</span>
      <span v-if="page.views !== null">閲覧 {{ formatCount(page.views) }}</span>
      <span v-if="page.comments !== null">コメント {{ page.comments }}</span>
      <span v-if="page.era">{{ eraLabel(page.era) }}の記事</span>
    </div>

    <figure v-if="page.art" class="web-article__hero">
      <WebArt :kind="page.art" :seed="page.path" :era="heroEra" :ratio="heroRatio" />
      <figcaption v-if="page.data.artCaption">{{ page.data.artCaption }}</figcaption>
    </figure>

    <p v-if="page.lead" class="web-article__lead">{{ page.lead }}</p>

    <WebBlocks :blocks="page.blocks" :seed="page.path" :era="heroEra" />

    <div v-if="page.tags.length" class="web-article__tags">
      <span>タグ</span>
      <WebLink v-for="tag in page.tags" :key="tag" :to="`/tags/${encodeURIComponent(tag)}`" class="web-meta__tag">
        {{ tag }}
      </WebLink>
    </div>

    <WebShare v-if="showShare" />

    <section v-if="page.posts.length" class="web-comments">
      <h2 class="web-section-title">コメント<small>{{ page.posts.length }}件</small></h2>
      <ol class="web-comments__list">
        <li v-for="post in page.posts" :key="post.no">
          <div class="web-comments__head">
            <strong>{{ post.name }}</strong>
            <span>{{ post.date }}</span>
          </div>
          <p>{{ post.text }}</p>
        </li>
      </ol>
      <p class="web-comments__closed">コメントの投稿は受け付けを終了しました。</p>
    </section>

    <nav v-if="neighbours.previous || neighbours.next" class="web-neighbours" aria-label="前後の記事">
      <WebLink v-if="neighbours.previous" :to="neighbours.previous.path" variant="bare" class="web-neighbour">
        <small>前の記事</small>
        <strong>{{ neighbours.previous.title }}</strong>
      </WebLink>
      <WebLink v-if="neighbours.next" :to="neighbours.next.path" variant="bare" class="web-neighbour">
        <small>次の記事</small>
        <strong>{{ neighbours.next.title }}</strong>
      </WebLink>
    </nav>

    <section v-if="related.length" class="web-related">
      <h2 class="web-section-title">関連記事</h2>
      <WebArticleList :items="related" variant="compact" />
    </section>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { articleNeighbours, relatedArticles } from '../../../virtual-web/pages.js'
import { eraLabel, formatCount, formatDate, weekdayOf } from '../../../virtual-web/format.js'
import WebArt from './WebArt.vue'
import WebArticleList from './WebArticleList.vue'
import WebBlocks from './WebBlocks.vue'
import WebLink from './WebLink.vue'
import WebShare from './WebShare.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  dateStyle: { type: String, default: 'ja' },
  heroRatio: { type: String, default: 'wide' },
  showShare: { type: Boolean, default: true }
})

const heroEra = computed(() => (props.page.layout === '2010s' || props.site.theme.era === '2010s' ? '2010s' : ''))
const neighbours = computed(() => articleNeighbours(props.site, props.page))
const related = computed(() => relatedArticles(props.site, props.page, 4))
const categorySlug = computed(() => props.site.categories.find((category) => category.label === props.page.category)?.slug || '')
const weekday = computed(() => {
  const day = weekdayOf(props.page.publishedAt)
  return day ? `（${day}）` : ''
})
</script>

<style scoped>
.web-article__kicker{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:10px;
  margin-bottom:11px;
  color:var(--web-muted);
  font-size:11px;
}

.web-article__subtitle{
  margin:0 0 12px;
  color:var(--web-muted);
  font-size:13px;
  line-height:1.7;
}

.web-article__meta{
  padding-bottom:14px;
  border-bottom:1px solid var(--web-line);
}

.web-article__hero{
  margin:18px 0 0;
  border-radius:var(--web-radius);
  overflow:hidden;
}

.web-article__hero figcaption{
  padding-top:6px;
  color:var(--web-muted);
  font-size:10px;
}

.web-article__lead{
  margin:18px 0 0;
  font-size:calc(var(--web-body-size) + 1px);
  font-weight:600;
  line-height:1.85;
}

.web-article :deep(.web-prose){ margin-top:18px }

.web-article__tags{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:7px;
  margin-top:22px;
  color:var(--web-muted);
  font-size:10px;
}

.web-comments{ margin-top:26px }

.web-comments__list{
  margin:0;
  padding:0;
  list-style:none;
}

.web-comments__list li{
  padding:12px 0;
  border-bottom:1px dotted var(--web-line);
}

.web-comments__head{
  display:flex;
  flex-wrap:wrap;
  gap:9px;
  margin-bottom:4px;
  font-size:11px;
}

.web-comments__head span{ color:var(--web-muted); font-size:10px }
.web-comments__list p{ margin:0; font-size:12px; line-height:1.7 }

.web-comments__closed{
  margin:12px 0 0;
  color:var(--web-muted);
  font-size:10px;
}

.web-related{ margin-top:26px }
</style>
