<template>
  <WebChrome owns-heading :site="site" :page="page" variant="plain" :columns="2">
    <template #header-meta>
      <WebSearchBox placeholder="質問を検索" />
    </template>

    <template #breadcrumb>
      <WebBreadcrumb :items="breadcrumbs" />
    </template>

    <template v-if="page.kind === 'home'">
      <section class="qa-hero web-card web-pad">
        <h1 class="web-title">{{ site.homeCopy.title || '質問と回答' }}</h1>
        <p class="qa-hero__lead">{{ site.homeCopy.lead || site.description }}</p>
        <div class="qa-hero__stats">
          <span><strong>{{ questions.length }}</strong>件の質問</span>
          <span><strong>{{ answerCount }}</strong>件の回答</span>
          <span><strong>{{ solvedCount }}</strong>件が解決済み</span>
        </div>
      </section>

      <section class="web-card web-pad qa-list-card">
        <h2 class="web-section-title">新しい質問</h2>
        <ul class="qa-list">
          <li v-for="question in questions.slice(0, 10)" :key="question.path">
            <span class="qa-list__status" :data-solved="question.data.status === '解決済み'">
              {{ question.data.status || '受付中' }}
            </span>
            <div>
              <WebLink :to="question.path" variant="bare"><strong>{{ question.title }}</strong></WebLink>
              <p>{{ question.excerpt }}</p>
              <div class="qa-list__meta">
                <span v-if="question.category">{{ question.category }}</span>
                <span>回答{{ question.posts.length }}件</span>
                <span>{{ formatDate(question.publishedAt, 'slash') }}</span>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <template v-else-if="page.kind === 'question'">
      <article class="qa-question">
        <div class="web-card web-pad">
          <div class="qa-question__top">
            <span class="qa-list__status" :data-solved="page.data.status === '解決済み'">
              {{ page.data.status || '受付中' }}
            </span>
            <span v-if="page.category" class="web-chip">{{ page.category }}</span>
            <time>{{ formatDate(page.publishedAt, 'ja') }}</time>
          </div>
          <h1 class="web-title">{{ page.heading }}</h1>
          <div class="web-meta">
            <span>{{ page.data.asker || '質問者' }}</span>
            <span v-if="page.views !== null">閲覧 {{ formatCount(page.views) }}</span>
            <span>回答 {{ page.posts.length }}件</span>
          </div>
          <WebBlocks :blocks="page.blocks" :seed="page.path" />
        </div>

        <section class="qa-answers">
          <h2 class="web-section-title">回答<small>{{ page.posts.length }}件</small></h2>
          <ol class="qa-answer-list">
            <li v-for="post in sortedAnswers" :key="post.no" :class="{ 'qa-answer--best': post.best }">
              <div class="qa-answer__head">
                <span v-if="post.best" class="qa-answer__badge">ベストアンサー</span>
                <strong>{{ post.name }}</strong>
                <span>{{ post.date }}</span>
                <span v-if="post.likes !== null" class="qa-answer__likes">役に立った {{ post.likes }}</span>
              </div>
              <p>{{ post.text }}</p>
            </li>
          </ol>
        </section>

        <section v-if="related.length" class="web-card web-pad qa-related">
          <h2 class="web-section-title">似ている質問</h2>
          <WebArticleList :items="related" variant="compact" date-style="slash" />
        </section>
      </article>
    </template>

    <WebDefaultBody v-else :site="site" :page="page" :query="query" list-variant="compact" />

    <template #aside>
      <WebSidebar :site="site" />
    </template>
  </WebChrome>
</template>

<script setup>
import { computed } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { relatedArticles, siteArticles } from '../../../virtual-web/pages.js'
import { formatCount, formatDate } from '../../../virtual-web/format.js'
import WebArticleList from '../parts/WebArticleList.vue'
import WebBlocks from '../parts/WebBlocks.vue'
import WebBreadcrumb from '../parts/WebBreadcrumb.vue'
import WebChrome from '../parts/WebChrome.vue'
import WebDefaultBody from '../parts/WebDefaultBody.vue'
import WebLink from '../parts/WebLink.vue'
import WebSearchBox from '../parts/WebSearchBox.vue'
import WebSidebar from '../parts/WebSidebar.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) }
})

const questions = computed(() => siteArticles(props.site))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
const answerCount = computed(() => questions.value.reduce((total, question) => total + question.posts.length, 0))
const solvedCount = computed(() => questions.value.filter((question) => question.data.status === '解決済み').length)
const sortedAnswers = computed(() => [...props.page.posts].sort((left, right) => Number(right.best) - Number(left.best)))
const related = computed(() => relatedArticles(props.site, props.page, 5))
</script>

<style scoped>
.qa-hero__lead{ margin:0 0 12px; color:var(--web-muted); font-size:12px; line-height:1.75 }

.qa-hero__stats{
  display:flex;
  flex-wrap:wrap;
  gap:16px;
  padding-top:12px;
  border-top:1px solid var(--web-line);
  color:var(--web-muted);
  font-size:11px;
}

.qa-hero__stats strong{ color:var(--web-accent); font-size:15px; margin-right:3px }

.qa-list-card{ margin-top:16px }

.qa-list{ margin:0; padding:0; list-style:none }

.qa-list li{
  display:grid;
  grid-template-columns:74px minmax(0,1fr);
  gap:12px;
  padding:14px 0;
  border-bottom:1px solid var(--web-line);
}

.qa-list li:last-child{ border-bottom:0 }
.qa-list strong{ font-size:13px; font-weight:700; line-height:1.55 }
.qa-list p{
  margin:5px 0 0;
  color:var(--web-muted);
  font-size:11.5px;
  line-height:1.65;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.qa-list__meta{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:6px;
  color:var(--web-muted);
  font-size:10px;
}

.qa-list__status{
  align-self:start;
  padding:4px 0;
  border-radius:4px;
  background:var(--web-page);
  color:var(--web-muted);
  font-size:10px;
  font-weight:800;
  text-align:center;
}

.qa-list__status[data-solved="true"]{
  background:#e8f5ee;
  color:#1f7a4d;
}

.qa-question__top{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:9px;
  margin-bottom:10px;
  color:var(--web-muted);
  font-size:10.5px;
}

.qa-question__top .qa-list__status{ padding:3px 9px }
.qa-question :deep(.web-prose){ margin-top:14px }

.qa-answers{ margin-top:18px }

.qa-answer-list{ margin:0; padding:0; list-style:none; display:grid; gap:11px }

.qa-answer-list li{
  padding:13px 15px;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  background:var(--web-surface);
}

.qa-answer--best{
  border-color:#7fbf9a;
  background:#f4fbf7;
}

.qa-answer__head{
  display:flex;
  flex-wrap:wrap;
  align-items:baseline;
  gap:9px;
  margin-bottom:6px;
  font-size:11px;
}

.qa-answer__head span{ color:var(--web-muted); font-size:10px }

.qa-answer__badge{
  padding:2px 8px;
  border-radius:999px;
  background:#1f7a4d;
  color:#fff !important;
  font-size:9px;
  font-weight:800;
}

.qa-answer__likes{ margin-left:auto }
.qa-answer-list p{ margin:0; font-size:12.5px; line-height:1.85; white-space:pre-line }
.qa-related{ margin-top:18px }

@media (max-width:560px){
  .qa-list li{ grid-template-columns:minmax(0,1fr) }
  .qa-list__status{ justify-self:start; padding:3px 10px }
}
</style>
