<template>
  <div
    class="web-site closed-site"
    :style="themeStyle"
    data-web-width="narrow"
  >
    <div class="web-shell closed-shell">
      <header class="closed-head">
        <p class="closed-head__domain">{{ site.domain }}</p>
        <h1 class="closed-head__title">このサイトは公開を終了しました</h1>
      </header>

      <section class="closed-body">
        <p>
          {{ site.name }}は{{ site.closedAt ? formatDate(site.closedAt, 'ja') : '' }}をもって公開を終了しました。
          長年のご利用ありがとうございました。
        </p>
        <p v-if="site.data.closingNote">{{ site.data.closingNote }}</p>

        <dl class="closed-facts">
          <div><dt>サイト名</dt><dd>{{ site.name }}</dd></div>
          <div><dt>開設</dt><dd>{{ site.established || '不明' }}</dd></div>
          <div><dt>公開終了</dt><dd>{{ site.closedAt ? formatDate(site.closedAt, 'ja') : '不明' }}</dd></div>
          <div v-if="site.data.successor"><dt>移転先</dt><dd>{{ site.data.successor }}</dd></div>
        </dl>

        <p v-if="requestedPath !== '/'" class="closed-requested">
          リクエストされたページ <code>{{ requestedPath }}</code> は現在参照できません。
        </p>

        <section v-if="site.data.archives?.length" class="closed-archive">
          <h2>保存されている記事</h2>
          <p class="closed-archive__note">一部の記事は外部の保存サービスから閲覧できます。</p>
          <ul>
            <li v-for="entry in site.data.archives" :key="entry.url">
              <a :href="entry.url" @click.prevent="open(entry.url)">{{ entry.title }}</a>
              <span>{{ entry.date }}</span>
            </li>
          </ul>
        </section>
      </section>

      <footer class="closed-foot">
        <p>© {{ (site.closedAt || '').slice(0, 4) || '2016' }} {{ site.operator || site.name }}</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '../../../virtual-web/format.js'
import { useWebSite } from '../webSiteContext.js'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true }
})

const context = useWebSite()
const requestedPath = computed(() => props.page.path)

const themeStyle = computed(() => ({
  '--web-accent': props.site.theme.accent,
  '--web-accent-soft': props.site.theme.accentSoft,
  '--web-ink': props.site.theme.ink,
  '--web-muted': props.site.theme.muted,
  '--web-surface': props.site.theme.surface,
  '--web-page': props.site.theme.page,
  '--web-line': props.site.theme.line
}))

function open(url){
  context.navigate(url)
}
</script>

<style scoped>
.closed-site{
  display:grid;
  place-items:center;
  min-height:100%;
  padding:40px 0;
  background:var(--web-page);
}

.closed-shell{
  padding:26px 28px 30px;
  border:1px solid var(--web-line);
  background:var(--web-surface);
}

.closed-head{
  padding-bottom:14px;
  border-bottom:2px solid var(--web-line);
}

.closed-head__domain{
  margin:0 0 6px;
  color:var(--web-muted);
  font-family:ui-monospace, monospace;
  font-size:10px;
  letter-spacing:.06em;
}

.closed-head__title{
  margin:0;
  font-size:19px;
  font-weight:700;
  line-height:1.5;
}

.closed-body{ padding-top:16px }
.closed-body p{ margin:0 0 12px; font-size:12.5px; line-height:1.9 }

.closed-facts{
  display:grid;
  gap:0;
  margin:16px 0;
  border:1px solid var(--web-line);
  font-size:11.5px;
}

.closed-facts > div{ display:grid; grid-template-columns:92px minmax(0,1fr) }
.closed-facts > div + div{ border-top:1px solid var(--web-line) }
.closed-facts dt{ padding:7px 10px; background:var(--web-page); font-weight:700 }
.closed-facts dd{ margin:0; padding:7px 10px }

.closed-requested{
  padding:9px 12px;
  border:1px dashed var(--web-line);
  color:var(--web-muted);
  font-size:11px;
}

.closed-requested code{ font-size:10.5px }

.closed-archive{ margin-top:20px }
.closed-archive h2{ margin:0 0 5px; font-size:13px }
.closed-archive__note{ margin:0 0 8px; color:var(--web-muted); font-size:11px }
.closed-archive ul{ margin:0; padding:0; list-style:none }
.closed-archive li{
  display:flex;
  flex-wrap:wrap;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  padding:6px 0;
  border-bottom:1px dotted var(--web-line);
  font-size:12px;
}
.closed-archive a{ color:var(--web-accent) }
.closed-archive span{ color:var(--web-muted); font-size:10px }

.closed-foot{
  margin-top:22px;
  padding-top:12px;
  border-top:1px solid var(--web-line);
  color:var(--web-muted);
  font-size:10px;
}

.closed-foot p{ margin:0 }
</style>
