<template>
  <aside class="web-aside" aria-label="サイドバー">
    <section v-if="site.sidebar.profile" class="web-widget">
      <h2 class="web-widget__head">プロフィール</h2>
      <div class="web-widget__body web-profile">
        <WebArt :kind="site.sidebar.profileArt || 'abstract'" :seed="site.id" ratio="square" class="web-profile__icon" />
        <div>
          <strong>{{ site.sidebar.profileName || site.operator || site.name }}</strong>
          <p>{{ site.sidebar.profile }}</p>
        </div>
      </div>
    </section>

    <section v-if="showSearch" class="web-widget">
      <h2 class="web-widget__head">サイト内検索</h2>
      <div class="web-widget__body">
        <WebSearchBox />
      </div>
    </section>

    <section v-if="site.categories.length" class="web-widget">
      <h2 class="web-widget__head">カテゴリ</h2>
      <div class="web-widget__body">
        <ul class="web-widget__links">
          <li v-for="category in site.categories" :key="category.slug">
            <WebLink :to="`/category/${category.slug}`">{{ category.label }}</WebLink>
            <span>{{ countIn(category.label) }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section v-if="site.sidebar.ranking && ranking.length" class="web-widget">
      <h2 class="web-widget__head">よく読まれている記事</h2>
      <div class="web-widget__body">
        <ol class="web-rank">
          <li v-for="(item, index) in ranking" :key="item.path">
            <span class="web-rank__no">{{ index + 1 }}</span>
            <WebLink :to="item.path">{{ item.title }}</WebLink>
          </li>
        </ol>
      </div>
    </section>

    <section v-if="site.sidebar.archiveList && months.length" class="web-widget">
      <h2 class="web-widget__head">月別アーカイブ</h2>
      <div class="web-widget__body">
        <ul class="web-widget__links">
          <li v-for="month in months.slice(0, 12)" :key="month.path">
            <WebLink :to="month.path">{{ month.month.replace('-', '年') }}月</WebLink>
            <span>{{ month.count }}</span>
          </li>
        </ul>
        <WebLink to="/archive">すべてのアーカイブ</WebLink>
      </div>
    </section>

    <section v-if="site.sidebar.tags && tags.length" class="web-widget">
      <h2 class="web-widget__head">タグ</h2>
      <div class="web-widget__body">
        <div class="web-taglist">
          <WebLink v-for="tag in tags.slice(0, 14)" :key="tag.path" :to="tag.path" class="web-meta__tag">
            {{ tag.tag }}
          </WebLink>
        </div>
      </div>
    </section>

    <section v-if="site.sidebar.aboutText" class="web-widget">
      <h2 class="web-widget__head">このサイトについて</h2>
      <div class="web-widget__body">
        <p>{{ site.sidebar.aboutText }}</p>
        <WebLink to="/about">詳しく</WebLink>
      </div>
    </section>

    <div v-if="site.sidebar.ad !== false" class="web-ad" role="complementary" aria-label="広告枠">
      <strong>広告</strong>
      <span>{{ adText }}</span>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { siteArticles, siteMonths, siteTags } from '../../../virtual-web/pages.js'
import WebArt from './WebArt.vue'
import WebLink from './WebLink.vue'
import WebSearchBox from './WebSearchBox.vue'

const props = defineProps({
  site: { type: Object, required: true },
  showSearch: { type: Boolean, default: true }
})

const articles = computed(() => siteArticles(props.site))
const months = computed(() => siteMonths(props.site))
const tags = computed(() => siteTags(props.site))

const ranking = computed(() => articles.value
  .slice()
  .sort((left, right) => (right.views || 0) - (left.views || 0))
  .slice(0, 5))

const adText = computed(() => props.site.sidebar.adText || 'この枠にはサイト内のお知らせが表示されます。')

function countIn(label){
  return articles.value.filter((article) => article.category === label).length
}
</script>

<style scoped>
.web-profile{
  display:grid;
  grid-template-columns:56px minmax(0,1fr);
  gap:11px;
  align-items:start;
}

.web-profile__icon{
  border-radius:50%;
  overflow:hidden;
}

.web-profile strong{ display:block; margin-bottom:4px; font-size:12px }
.web-profile p{ margin:0; color:var(--web-muted); font-size:11px; line-height:1.6 }

.web-widget__links{
  margin:0;
  padding:0;
  list-style:none;
}

.web-widget__links li{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:8px;
  padding:6px 0;
  border-bottom:1px dotted var(--web-line);
}

.web-widget__links li:last-child{ border-bottom:0 }
.web-widget__links span{ color:var(--web-muted); font-size:10px }
</style>
