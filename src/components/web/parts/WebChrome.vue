<template>
  <div
    class="web-site"
    :class="`web-site--${variant}`"
    :style="themeStyle"
    :data-web-font="site.theme.font"
    :data-web-width="site.theme.width"
    :data-web-era="era"
  >
    <header class="web-header" :data-variant="variant">
      <div class="web-shell web-header__bar">
        <WebLink to="/" variant="bare" class="web-brand">
          <WebLogo :site="site" :size="variant === 'portal' ? 'lg' : 'md'" />
          <span class="web-brand__text">
            <span class="web-brand__name">{{ site.name }}</span>
            <span v-if="site.tagline" class="web-brand__tagline">{{ site.tagline }}</span>
          </span>
        </WebLink>

        <div class="web-header__meta">
          <slot name="header-meta">
            <span v-if="showDate">{{ headerDate }}</span>
          </slot>
        </div>
      </div>

      <nav v-if="site.nav.length" class="web-nav" aria-label="サイト内メニュー">
        <div class="web-shell">
          <ul class="web-nav__list">
            <li v-for="item in site.nav" :key="item.path">
              <WebLink :to="item.path" variant="nav" :current="isCurrent(item.path)">{{ item.label }}</WebLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>

    <div v-if="notice" class="web-notice">
      <div class="web-shell web-notice__inner">
        <strong>{{ noticeLabel }}</strong>
        <span>{{ notice }}</span>
      </div>
    </div>

    <slot name="hero" />

    <div class="web-shell">
      <slot name="breadcrumb" />
    </div>

    <div class="web-shell web-main" :data-columns="columns">
      <div class="web-column">
        <!-- Front pages whose template has no visible heading of its own still
             need one for the document outline. -->
        <h1 v-if="needsHeading" class="web-visually-hidden">{{ site.name }}</h1>
        <slot />
      </div>
      <slot name="aside" />
    </div>

    <WebFooter :site="site" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate, weekdayOf } from '../../../virtual-web/format.js'
import WebFooter from './WebFooter.vue'
import WebLink from './WebLink.vue'
import WebLogo from './WebLogo.vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true },
  variant: { type: String, default: 'plain' },
  columns: { type: [String, Number], default: 1 },
  showDate: { type: Boolean, default: false },
  // Set by templates that render their own <h1> on the front page.
  ownsHeading: { type: Boolean, default: false }
})

const needsHeading = computed(() => props.page.kind === 'home' && !props.ownsHeading)

// A single old article can render in the 2010s skin even on a site whose front
// page is current (see PCのある生活), which is what page.layout carries.
const era = computed(() => (props.page.layout === '2010s' || props.site.theme.era === '2010s' ? '2010s' : 'modern'))

const themeStyle = computed(() => ({
  '--web-accent': props.site.theme.accent,
  '--web-accent-soft': props.site.theme.accentSoft,
  '--web-ink': props.site.theme.ink,
  '--web-muted': props.site.theme.muted,
  '--web-surface': props.site.theme.surface,
  '--web-page': props.site.theme.page,
  '--web-line': props.site.theme.line
}))

const headerDate = computed(() => {
  const date = props.site.lastUpdated || '2026-08-23'
  const weekday = weekdayOf(date)
  return `${formatDate(date, 'ja')}${weekday ? `（${weekday}）` : ''}`
})

const notice = computed(() => props.site.notice || props.site.homeCopy.notice || '')
const noticeLabel = computed(() => props.site.homeCopy.noticeLabel || 'お知らせ')

function isCurrent(path){
  return props.page.path === path
}
</script>

<style scoped>
.web-site{
  display:flex;
  flex-direction:column;
  min-height:100%;
}

.web-column{ min-width:0 }

/* ---- header variants -------------------------------------------------- */
.web-header[data-variant="news"]{
  border-top:3px solid var(--web-accent);
}

.web-header[data-variant="news"] .web-brand__name{
  font-size:22px;
  letter-spacing:.02em;
}

.web-header[data-variant="portal"]{
  border-bottom:0;
  background:linear-gradient(180deg, var(--web-accent-soft), var(--web-surface));
}

.web-header[data-variant="portal"] .web-header__bar{
  padding:20px 0 14px;
}

.web-header[data-variant="retro"]{
  border-bottom:2px solid var(--web-accent);
  background:linear-gradient(180deg, var(--web-surface), var(--web-accent-soft));
}

.web-header[data-variant="retro"] .web-brand__name{
  font-size:17px;
  letter-spacing:0;
}

.web-header[data-variant="civic"]{
  border-bottom:1px solid var(--web-line);
  border-top:6px solid var(--web-accent);
}

.web-header[data-variant="media"]{
  border-bottom:1px solid rgba(255,255,255,.14);
  background:var(--web-ink);
}

.web-header[data-variant="media"] .web-brand__name{ color:#fff }
.web-header[data-variant="media"] .web-brand__tagline{ color:#b9c0cc }
.web-header[data-variant="media"] .web-header__meta{ color:#b9c0cc }
.web-header[data-variant="media"] .web-nav{
  background:color-mix(in srgb, var(--web-ink) 84%, #fff 16%);
  border-top-color:rgba(255,255,255,.12);
}
.web-header[data-variant="media"] :deep(.web-nav__link){ color:#e6e9f0 }
.web-header[data-variant="media"] :deep(.web-nav__link:hover){ color:#fff }

.web-header[data-variant="shop"] .web-brand__name{ font-weight:900 }

/* ---- notice bar ------------------------------------------------------- */
.web-notice{
  border-bottom:1px solid var(--web-line);
  background:var(--web-accent-soft);
}

.web-notice__inner{
  display:flex;
  flex-wrap:wrap;
  align-items:baseline;
  gap:10px;
  padding:8px 0;
  font-size:11px;
}

.web-notice strong{
  padding:1px 8px;
  border-radius:999px;
  background:var(--web-accent);
  color:#fff;
  font-size:10px;
}

@media (max-width:640px){
  .web-header__bar{ flex-wrap:wrap }
  .web-header__meta{ font-size:9px }
}
</style>
