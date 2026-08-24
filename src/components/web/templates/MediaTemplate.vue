<template>
  <WebChrome :site="site" :page="page" variant="media" :columns="page.kind === 'home' ? 1 : 2">
    <template #breadcrumb>
      <WebBreadcrumb :items="breadcrumbs" />
    </template>

    <template v-if="page.kind === 'home'">
      <section class="media-hero">
        <p class="media-hero__lead">{{ site.homeCopy.lead || site.description }}</p>
      </section>

      <section class="media-featured">
        <h2 class="web-section-title">注目</h2>
        <div class="media-grid" :data-shape="shape">
          <WebLink v-for="item in featured" :key="item.path" :to="item.path" variant="bare" class="media-card">
            <WebArt :kind="item.art || defaultArt" :seed="item.path" :ratio="shape" />
            <span class="media-card__body">
              <span class="media-card__title">{{ item.title }}</span>
              <span class="media-card__meta">{{ item.data.year || formatDate(item.publishedAt, 'slash') }}<template v-if="item.data.maker"> ・{{ item.data.maker }}</template></span>
              <span v-if="item.data.score" class="media-card__score">{{ stars(item.data.score) }} {{ item.data.score }}</span>
            </span>
          </WebLink>
        </div>
      </section>

      <section class="media-list web-card web-pad">
        <h2 class="web-section-title">
          新着レビュー
          <small>{{ reviews.length }}件</small>
        </h2>
        <WebArticleList :items="reviews.slice(0, 8)" variant="headline" date-style="slash" />
      </section>
    </template>

    <template v-else-if="page.kind === 'review'">
      <article class="media-review">
        <div class="web-card web-pad">
          <div class="media-review__top">
            <WebArt :kind="page.art || defaultArt" :seed="page.path" :ratio="shape" class="media-review__art" />
            <div class="media-review__head">
              <p class="media-review__kicker">
                <span v-if="page.category" class="web-chip">{{ page.category }}</span>
                <time>{{ formatDate(page.publishedAt, 'ja') }}</time>
              </p>
              <h1 class="web-title">{{ page.heading }}</h1>
              <p v-if="page.subtitle" class="media-review__sub">{{ page.subtitle }}</p>
              <div v-if="page.data.score" class="media-review__score">
                <strong>{{ page.data.score }}</strong>
                <span>{{ stars(page.data.score) }}</span>
                <small>／ 5.0</small>
              </div>
              <dl v-if="page.facts.length" class="media-review__facts">
                <div v-for="fact in page.facts" :key="fact.label">
                  <dt>{{ fact.label }}</dt>
                  <dd>{{ fact.value }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <p v-if="page.lead" class="media-review__lead">{{ page.lead }}</p>
          <WebBlocks :blocks="page.blocks" :seed="page.path" />

          <section v-if="page.items.length" class="media-tracks">
            <h2 class="web-section-title">{{ page.data.itemsTitle || '収録内容' }}</h2>
            <ol class="media-tracks__list">
              <li v-for="(item, index) in page.items" :key="index">
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <strong>{{ item.title || item.name }}</strong>
                <small v-if="item.note">{{ item.note }}</small>
              </li>
            </ol>
          </section>

          <WebShare />
        </div>

        <section v-if="page.posts.length" class="media-comments web-card web-pad">
          <h2 class="web-section-title">ユーザーの評価<small>{{ page.posts.length }}件</small></h2>
          <ul class="media-comments__list">
            <li v-for="post in page.posts" :key="post.no">
              <div>
                <strong>{{ post.name }}</strong>
                <span v-if="post.likes !== null">{{ stars(post.likes) }}</span>
                <span>{{ post.date }}</span>
              </div>
              <p>{{ post.text }}</p>
            </li>
          </ul>
        </section>

        <section v-if="related.length" class="web-card web-pad">
          <h2 class="web-section-title">関連するレビュー</h2>
          <WebArticleList :items="related" variant="compact" date-style="slash" />
        </section>
      </article>
    </template>

    <WebDefaultBody v-else :site="site" :page="page" :query="query" list-variant="headline" />

    <template v-if="page.kind !== 'home'" #aside>
      <WebSidebar :site="site" />
    </template>
  </WebChrome>
</template>

<script setup>
import { computed } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { relatedArticles, siteArticles } from '../../../virtual-web/pages.js'
import { formatDate } from '../../../virtual-web/format.js'
import WebArt from '../parts/WebArt.vue'
import WebArticleList from '../parts/WebArticleList.vue'
import WebBlocks from '../parts/WebBlocks.vue'
import WebBreadcrumb from '../parts/WebBreadcrumb.vue'
import WebChrome from '../parts/WebChrome.vue'
import WebDefaultBody from '../parts/WebDefaultBody.vue'
import WebLink from '../parts/WebLink.vue'
import WebShare from '../parts/WebShare.vue'
import WebSidebar from '../parts/WebSidebar.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) }
})

const reviews = computed(() => siteArticles(props.site))
const featured = computed(() => reviews.value.slice(0, 6))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
const related = computed(() => relatedArticles(props.site, props.page, 5))
// jackets are square, posters are tall, everything else is a wide still
const shape = computed(() => props.site.data.shape || 'poster')
const defaultArt = computed(() => props.site.data.defaultArt || 'poster')

function stars(score){
  const value = Math.max(0, Math.min(5, Math.round(Number(score) || 0)))
  return '★'.repeat(value) + '☆'.repeat(5 - value)
}
</script>

<style scoped>
.media-hero__lead{
  margin:0 0 16px;
  color:var(--web-muted);
  font-size:12.5px;
}

.media-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(148px, 1fr));
  gap:14px;
}

.media-grid[data-shape="square"]{ grid-template-columns:repeat(auto-fill, minmax(136px, 1fr)) }

.media-card{
  display:flex;
  flex-direction:column;
  gap:8px;
  overflow:hidden;
  border-radius:var(--web-radius);
}

.media-card :deep(.web-art){
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
}

.media-card:hover :deep(.web-art){ border-color:var(--web-accent) }
.media-card__body{ display:flex; flex-direction:column; gap:3px }
.media-card__title{ font-size:12px; font-weight:700; line-height:1.5 }
.media-card__meta{ color:var(--web-muted); font-size:10px }
.media-card__score{ color:#c47a1a; font-size:10px; letter-spacing:.06em }

.media-list{ margin-top:20px }

.media-review__top{
  display:grid;
  grid-template-columns:190px minmax(0,1fr);
  gap:20px;
  align-items:start;
}

.media-review__art{
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  overflow:hidden;
}

.media-review__kicker{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:9px;
  margin:0 0 8px;
  color:var(--web-muted);
  font-size:10.5px;
}

.media-review__sub{ margin:0 0 10px; color:var(--web-muted); font-size:12px }

.media-review__score{
  display:flex;
  align-items:baseline;
  gap:8px;
  margin-bottom:12px;
}

.media-review__score strong{ font-size:26px; font-weight:800 }
.media-review__score span{ color:#c47a1a; font-size:14px; letter-spacing:.08em }
.media-review__score small{ color:var(--web-muted); font-size:10px }

.media-review__facts{
  display:grid;
  gap:0;
  margin:0;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  overflow:hidden;
  font-size:11px;
}

.media-review__facts > div{ display:grid; grid-template-columns:88px minmax(0,1fr) }
.media-review__facts > div + div{ border-top:1px solid var(--web-line) }
.media-review__facts dt{ padding:6px 10px; background:var(--web-page); font-weight:700 }
.media-review__facts dd{ margin:0; padding:6px 10px }

.media-review__lead{ margin:20px 0 0; font-size:13px; font-weight:600; line-height:1.85 }
.media-tracks{ margin-top:24px }

.media-tracks__list{ margin:0; padding:0; list-style:none; font-size:12px }
.media-tracks__list li{
  display:flex;
  align-items:baseline;
  gap:11px;
  padding:7px 0;
  border-bottom:1px dotted var(--web-line);
}
.media-tracks__list span{ color:var(--web-muted); font-family:ui-monospace, monospace; font-size:10px }
.media-tracks__list small{ margin-left:auto; color:var(--web-muted); font-size:10px }

.media-comments{ margin-top:16px }
.media-comments__list{ margin:0; padding:0; list-style:none }
.media-comments__list li{ padding:11px 0; border-bottom:1px dotted var(--web-line) }
.media-comments__list li > div{ display:flex; flex-wrap:wrap; gap:9px; align-items:baseline; margin-bottom:4px; font-size:11px }
.media-comments__list span{ color:var(--web-muted); font-size:10px }
.media-comments__list span:first-of-type{ color:#c47a1a }
.media-comments__list p{ margin:0; font-size:12px; line-height:1.75 }

@media (max-width:640px){
  .media-review__top{ grid-template-columns:minmax(0,1fr) }
  .media-review__art{ max-width:220px }
}
</style>
