<template>
  <WebChrome :site="site" :page="page" variant="retro" :columns="1">
    <template #breadcrumb>
      <WebBreadcrumb :items="breadcrumbs" />
    </template>

    <template v-if="page.kind === 'home'">
      <div class="forum-notice">
        {{ site.homeCopy.lead || '掲示板の利用は投稿ルールに同意したものとみなします。' }}
      </div>

      <section class="forum-boards">
        <h2 class="web-section-title">板一覧</h2>
        <div class="web-table-scroll">
        <table class="forum-table">
          <thead>
            <tr><th>板</th><th class="forum-table__num">スレッド</th><th class="forum-table__num">最終更新</th></tr>
          </thead>
          <tbody>
            <tr v-for="board in boards" :key="board.slug">
              <td>
                <WebLink :to="`/category/${board.slug}`">{{ board.label }}</WebLink>
                <span v-if="board.note" class="forum-table__note">{{ board.note }}</span>
              </td>
              <td class="forum-table__num">{{ board.count }}</td>
              <td class="forum-table__num">{{ formatDate(board.updated, 'slash') }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </section>

      <section class="forum-recent">
        <h2 class="web-section-title">最近書き込みのあったスレッド</h2>
        <ol class="forum-threads">
          <li v-for="thread in threads.slice(0, 12)" :key="thread.path">
            <WebLink :to="thread.path">{{ thread.title }}</WebLink>
            <span>{{ thread.posts.length }}レス</span>
            <span>{{ formatDate(thread.updatedAt, 'slash') }}</span>
          </li>
        </ol>
      </section>
    </template>

    <template v-else-if="page.kind === 'thread'">
      <article class="forum-thread">
        <div v-if="isStoryArchive" class="forum-archive-banner" role="note">
          <strong>非公開保存ログ</strong>
          <span>このページは一般の板・検索・アーカイブには表示されません。</span>
        </div>
        <header class="forum-thread__head">
          <h1 class="forum-thread__title">{{ page.heading }}</h1>
          <p class="forum-thread__meta">
            <span v-if="page.category">{{ page.category }}板</span>
            <span>{{ page.posts.length }}レス</span>
            <span v-if="page.views !== null">閲覧 {{ formatCount(page.views) }}</span>
            <span>最終更新 {{ formatDate(page.updatedAt, 'slash') }}</span>
          </p>
        </header>

        <ol class="forum-posts">
          <li v-for="post in page.posts" :key="post.no" :id="`res${post.no}`">
            <div class="forum-post__head">
              <span class="forum-post__no">{{ post.no }}</span>
              <strong v-if="!isStoryArchive">{{ post.name }}</strong>
              <span>{{ post.date }}</span>
              <span v-if="isStoryArchive">ID:{{ page.data.postIds[post.no - 1] }}</span>
              <span v-if="post.replyTo" class="forum-post__reply">&gt;&gt;{{ post.replyTo }}</span>
            </div>
            <p class="forum-post__text">{{ post.text }}</p>
          </li>
        </ol>

        <div v-if="isStoryArchive" class="forum-story-links">
          <p>保存ログ内で参照されていた記事：</p>
          <WebLink :to="page.data.newsUrl">2015年3月2日の保存ニュース</WebLink>
          <button type="button" class="web-button" @click="returnMessages">Messagesへ戻る（物語を進める）</button>
        </div>

        <div v-if="!isStoryArchive" class="forum-form">
          <p>書き込み</p>
          <textarea rows="3" placeholder="本文（この掲示板は書き込みを受け付けていません）"></textarea>
          <button class="web-button" type="button" @click="posted = true">送信</button>
          <span v-if="posted" role="status">現在この板は書き込みを停止しています。</span>
        </div>

        <nav v-if="sameBoard.length" class="forum-thread__nav">
          <h2 class="web-section-title">同じ板の他のスレッド</h2>
          <ul class="forum-threads">
            <li v-for="thread in sameBoard" :key="thread.path">
              <WebLink :to="thread.path">{{ thread.title }}</WebLink>
              <span>{{ thread.posts.length }}レス</span>
            </li>
          </ul>
        </nav>
      </article>
    </template>

    <template v-else-if="isListing">
      <section class="forum-board">
        <h1 class="web-title">{{ page.heading }}</h1>
        <p class="forum-board__count">{{ (page.listing || []).length }}スレッド</p>
        <div class="web-table-scroll">
        <table class="forum-table">
          <thead>
            <tr><th>スレッドタイトル</th><th class="forum-table__num">レス</th><th class="forum-table__num">更新</th></tr>
          </thead>
          <tbody>
            <tr v-for="thread in page.listing" :key="thread.path">
              <td><WebLink :to="thread.path">{{ thread.title }}</WebLink></td>
              <td class="forum-table__num">{{ thread.posts.length }}</td>
              <td class="forum-table__num">{{ formatDate(thread.updatedAt, 'slash') }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </section>
    </template>

    <WebDefaultBody v-else :site="site" :page="page" :query="query" list-variant="compact" />
  </WebChrome>
</template>

<script setup>
import { computed, ref } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { siteArticles } from '../../../virtual-web/pages.js'
import { formatCount, formatDate } from '../../../virtual-web/format.js'
import WebBreadcrumb from '../parts/WebBreadcrumb.vue'
import WebChrome from '../parts/WebChrome.vue'
import WebDefaultBody from '../parts/WebDefaultBody.vue'
import WebLink from '../parts/WebLink.vue'
import { useWebSite } from '../webSiteContext.js'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) }
})

const posted = ref(false)
const { returnMessages: returnMessagesFromStory } = useWebSite()
const threads = computed(() => siteArticles(props.site))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
const isStoryArchive = computed(() => Boolean(props.page.data?.storyArchive))
const isListing = computed(() => ['category', 'tag', 'archive-index', 'archive-year', 'archive-month'].includes(props.page.kind))

const boards = computed(() => props.site.categories.map((category) => {
  const items = threads.value.filter((thread) => thread.category === category.label)
  return {
    ...category,
    count: items.length,
    updated: items[0]?.updatedAt || ''
  }
}))

const sameBoard = computed(() => threads.value
  .filter((thread) => thread.category === props.page.category && thread.path !== props.page.path)
  .slice(0, 6))

function returnMessages(){
  returnMessagesFromStory?.()
}
</script>

<style scoped>
.forum-notice{
  margin-bottom:14px;
  padding:9px 12px;
  border:1px solid var(--web-line);
  background:#fffef5;
  font-size:11px;
}

.forum-archive-banner{
  display:flex;
  flex-wrap:wrap;
  gap:9px;
  align-items:baseline;
  margin-bottom:12px;
  padding:8px 11px;
  border:1px solid #b99b62;
  background:#fff8df;
  color:#5c4a25;
  font-size:11px;
}

.forum-archive-banner strong{ font-size:12px }

.forum-story-links{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:10px;
  margin-top:15px;
  padding:11px 13px;
  border:1px solid var(--web-line);
  background:var(--web-page);
  font-size:11px;
}

.forum-story-links p{ margin:0; color:var(--web-muted) }

.forum-table{
  width:100%;
  border-collapse:collapse;
  background:var(--web-surface);
  font-size:12px;
}

.forum-table th,
.forum-table td{
  padding:6px 9px;
  border:1px solid var(--web-line);
  text-align:left;
  vertical-align:top;
}

.forum-table th{ background:var(--web-accent-soft); font-size:11px }
.forum-table__num{ width:82px; text-align:right; color:var(--web-muted); font-size:11px; white-space:nowrap }
.forum-table__note{ display:block; color:var(--web-muted); font-size:10px }

.forum-recent{ margin-top:20px }

.forum-threads{
  margin:0;
  padding:0;
  list-style:none;
  font-size:12px;
}

.forum-threads li{
  display:flex;
  flex-wrap:wrap;
  align-items:baseline;
  gap:10px;
  padding:5px 0;
  border-bottom:1px dotted var(--web-line);
}

.forum-threads span{ color:var(--web-muted); font-size:10px }

.forum-thread__head{
  padding:11px 13px;
  border:1px solid var(--web-line);
  background:var(--web-accent-soft);
}

.forum-thread__title{
  margin:0 0 5px;
  font-size:17px;
  font-weight:800;
  line-height:1.45;
}

.forum-thread__meta{
  display:flex;
  flex-wrap:wrap;
  gap:12px;
  margin:0;
  color:var(--web-muted);
  font-size:10.5px;
}

.forum-posts{
  margin:0;
  padding:0;
  list-style:none;
  border:1px solid var(--web-line);
  border-top:0;
  background:var(--web-surface);
}

.forum-posts li{ padding:10px 13px; border-top:1px dotted var(--web-line) }

.forum-post__head{
  display:flex;
  flex-wrap:wrap;
  align-items:baseline;
  gap:8px;
  margin-bottom:4px;
  font-size:11px;
}

.forum-post__no{
  color:var(--web-accent);
  font-family:ui-monospace, monospace;
  font-weight:700;
}

.forum-post__head strong{ color:#166534; font-size:11px }
.forum-post__head span:not(.forum-post__no){ color:var(--web-muted); font-size:10px }
.forum-post__reply{ color:var(--web-accent) !important }

.forum-post__text{
  margin:0;
  padding-left:4px;
  font-size:12.5px;
  line-height:1.85;
  white-space:pre-line;
}

.forum-form{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:9px;
  margin-top:14px;
  padding:11px 13px;
  border:1px solid var(--web-line);
  background:var(--web-page);
  font-size:11px;
}

.forum-form p{ margin:0; font-weight:700 }
.forum-form textarea{
  flex:1 1 260px;
  min-width:0;
  padding:7px 9px;
  border:1px solid var(--web-line);
  background:var(--web-surface);
  font:inherit;
  font-size:11.5px;
}

.forum-form span{ color:var(--web-muted) }
.forum-thread__nav{ margin-top:22px }
.forum-board__count{ margin:0 0 10px; color:var(--web-muted); font-size:11px }
</style>
