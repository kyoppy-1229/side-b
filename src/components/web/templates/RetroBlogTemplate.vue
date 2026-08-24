<template>
  <WebChrome :site="site" :page="page" variant="retro" :columns="2">
    <template #header-meta>
      <span class="retro-counter" aria-label="アクセスカウンター">
        <span>counter</span>
        <b v-for="(digit, index) in counterDigits" :key="index">{{ digit }}</b>
      </span>
    </template>

    <template #breadcrumb>
      <div class="retro-crumb">
        <WebBreadcrumb :items="breadcrumbs" />
      </div>
    </template>

    <template v-if="page.kind === 'home'">
      <table class="retro-table">
        <tbody>
          <tr>
            <th colspan="2">{{ site.homeCopy.listTitle || '更新履歴' }}</th>
          </tr>
          <tr v-for="item in articles.slice(0, 20)" :key="item.path">
            <td class="retro-table__date">{{ formatDate(item.publishedAt, 'slash') }}</td>
            <td>
              <WebLink :to="item.path">{{ item.title }}</WebLink>
              <span v-if="item.comments !== null" class="retro-table__count">[{{ item.comments }}]</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="site.intro.length" class="retro-box">
        <WebBlocks :blocks="site.intro" :seed="site.id" era="2010s" />
      </div>

      <p v-if="site.status === 'inactive'" class="retro-notice">
        ※このサイトは{{ site.lastUpdated ? formatDate(site.lastUpdated, 'slash') : '' }}で更新を停止しています。
        リンク切れが多く残っていますがご容赦ください。
      </p>
    </template>

    <WebDefaultBody
      v-else
      :site="site"
      :page="page"
      :query="query"
      list-variant="retro"
      date-style="slash"
      hero-ratio="photo"
      :show-share="false"
    />

    <template #aside>
      <aside class="web-aside retro-aside">
        <section class="web-widget">
          <h2 class="web-widget__head">MENU</h2>
          <div class="web-widget__body">
            <ul class="retro-menu">
              <li><WebLink to="/">TOP</WebLink></li>
              <li v-for="category in site.categories" :key="category.slug">
                <WebLink :to="`/category/${category.slug}`">{{ category.label }}</WebLink>
              </li>
              <li><WebLink to="/archive">過去ログ</WebLink></li>
              <li><WebLink to="/about">このサイトについて</WebLink></li>
            </ul>
          </div>
        </section>

        <section class="web-widget">
          <h2 class="web-widget__head">過去ログ</h2>
          <div class="web-widget__body">
            <ul class="retro-menu">
              <li v-for="month in months.slice(0, 14)" :key="month.path">
                <WebLink :to="month.path">{{ month.month.replace('-', '年') }}月（{{ month.count }}）</WebLink>
              </li>
            </ul>
          </div>
        </section>

        <section v-if="site.sidebar.profile" class="web-widget">
          <h2 class="web-widget__head">PROFILE</h2>
          <div class="web-widget__body retro-profile">
            <p><strong>{{ site.sidebar.profileName }}</strong></p>
            <p>{{ site.sidebar.profile }}</p>
          </div>
        </section>

        <section class="web-widget">
          <h2 class="web-widget__head">LINK</h2>
          <div class="web-widget__body">
            <ul class="retro-menu">
              <li v-for="link in site.data.links || []" :key="link.label">
                <span>{{ link.label }}</span>
              </li>
              <li v-if="!(site.data.links || []).length"><span>相互リンク募集中</span></li>
            </ul>
          </div>
        </section>
      </aside>
    </template>
  </WebChrome>
</template>

<script setup>
import { computed } from 'vue'
import { buildBreadcrumbs } from '../../../virtual-web/breadcrumbs.js'
import { siteArticles, siteMonths } from '../../../virtual-web/pages.js'
import { formatDate } from '../../../virtual-web/format.js'
import WebBlocks from '../parts/WebBlocks.vue'
import WebBreadcrumb from '../parts/WebBreadcrumb.vue'
import WebChrome from '../parts/WebChrome.vue'
import WebDefaultBody from '../parts/WebDefaultBody.vue'
import WebLink from '../parts/WebLink.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  query: { type: Object, default: () => ({}) }
})

const articles = computed(() => siteArticles(props.site))
const months = computed(() => siteMonths(props.site))
const breadcrumbs = computed(() => buildBreadcrumbs(props.site, props.page))
// A fixed number per site, the way a real counter image looked mid-life.
const counterDigits = computed(() => String(props.site.data.counter || '0018342').split(''))
</script>

<style scoped>
.retro-counter{
  display:inline-flex;
  align-items:center;
  gap:4px;
  font-family:ui-monospace, monospace;
  font-size:9px;
}

.retro-counter b{
  padding:1px 3px;
  border:1px solid #6b7280;
  background:#111827;
  color:#e5e7eb;
  font-size:10px;
}

.retro-crumb{ font-family:ui-monospace, monospace }

.retro-table{
  width:100%;
  border-collapse:collapse;
  background:var(--web-surface);
  font-size:12px;
}

.retro-table th{
  padding:6px 9px;
  border:1px solid var(--web-line);
  background:var(--web-accent);
  color:#fff;
  text-align:left;
  font-size:11px;
}

.retro-table td{
  padding:5px 9px;
  border:1px solid var(--web-line);
  vertical-align:top;
}

.retro-table__date{
  width:90px;
  color:var(--web-muted);
  font-family:ui-monospace, monospace;
  font-size:11px;
  white-space:nowrap;
}

.retro-table__count{ margin-left:6px; color:var(--web-muted); font-size:10px }

.retro-box{
  margin-top:14px;
  padding:12px 14px;
  border:1px solid var(--web-line);
  background:var(--web-surface);
}

.retro-notice{
  margin:14px 0 0;
  padding:9px 12px;
  border:1px dashed var(--web-line);
  background:#fffdf3;
  color:#7a6a45;
  font-size:11px;
}

.retro-aside :deep(.web-widget__head){
  background:var(--web-accent);
  color:#fff;
  font-size:10px;
  letter-spacing:.06em;
}

.retro-menu{
  margin:0;
  padding:0;
  list-style:none;
  font-size:11.5px;
}

.retro-menu li{
  padding:3px 0;
  border-bottom:1px dotted var(--web-line);
}

.retro-menu li:last-child{ border-bottom:0 }
.retro-profile p{ margin:0 0 6px; font-size:11px; line-height:1.65 }
</style>
