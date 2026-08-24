<template>
  <div
    class="browser-tab"
    :class="{
      'is-active': active,
      'has-unread': unreadCount > 0 && !active,
      'is-closable': tab.closable
    }"
    role="presentation"
    :data-tab-id="String(tab.id)"
  >
    <button
      class="tab-main"
      type="button"
      role="tab"
      :id="tabButtonId"
      :aria-selected="active"
      :aria-controls="tabPanelId"
      :tabindex="active ? 0 : -1"
      :title="tab.title || '新しいタブ'"
      @click="emit('activate', tab.id)"
      @auxclick.middle="closeTab"
    >
      <span class="tab-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <template v-if="iconType === 'messages'">
            <path d="M5 5.5h14v10H9l-4 3v-13Z" />
            <path d="M8 9h8M8 12h5" />
          </template>
          <template v-else-if="iconType === 'search'">
            <circle cx="10.5" cy="10.5" r="5.5" />
            <path d="m15 15 4 4" />
          </template>
          <template v-else-if="iconType === 'game'">
            <path d="M7 9h10a4 4 0 0 1 3.7 5.5l-1 2.5a2.2 2.2 0 0 1-3.6.7L14.5 16h-5l-1.6 1.7a2.2 2.2 0 0 1-3.6-.7l-1-2.5A4 4 0 0 1 7 9Z" />
            <path d="M8 11.5v3M6.5 13h3M16 12.2h.01M18 14h.01" />
          </template>
          <template v-else-if="iconType === 'document'">
            <path d="M6 3.5h8l4 4V20H6V3.5Z" />
            <path d="M14 3.5V8h4M9 12h6M9 15h6" />
          </template>
          <template v-else-if="iconType === 'error'">
            <path d="M12 3 3.5 19h17L12 3Z" />
            <path d="M12 9v4M12 16h.01" />
          </template>
          <template v-else>
            <circle cx="12" cy="12" r="8" />
            <path d="M4 12h16M12 4a13 13 0 0 1 0 16M12 4a13 13 0 0 0 0 16" />
          </template>
        </svg>
      </span>
      <span class="tab-title">{{ tab.title || '新しいタブ' }}</span>
      <span v-if="unreadCount" class="tab-badge" :aria-label="`未読${unreadCount}件`">
        {{ unreadLabel }}
      </span>
    </button>

    <button
      v-if="tab.closable"
      class="tab-close"
      type="button"
      :aria-label="`${tab.title || 'タブ'}を閉じる`"
      title="タブを閉じる"
      @click.stop="closeTab"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m8 8 8 8M16 8l-8 8" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tab: {
    type: Object,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['activate', 'close'])

const safeTabId = computed(() => String(props.tab.id).replace(/[^a-zA-Z0-9_-]/g, '-'))
const tabButtonId = computed(() => `virtual-tab-${safeTabId.value}`)
const tabPanelId = computed(() => `virtual-panel-${safeTabId.value}`)
const unreadCount = computed(() => Math.max(0, Number(props.tab.unreadCount) || 0))
const unreadLabel = computed(() => unreadCount.value > 99 ? '99+' : String(unreadCount.value))

const iconType = computed(() => {
  const type = String(props.tab.pageType || '').toLowerCase()
  if(type.includes('message') || type.includes('chat')) return 'messages'
  if(type.includes('search')) return 'search'
  if(type.includes('game') || type.includes('revival') || type.includes('initial')) return 'game'
  if(type.includes('error') || type.includes('not-found')) return 'error'
  if(type.includes('archive') || type.includes('document') || type.includes('bbs')) return 'document'
  return 'web'
})

function closeTab(event){
  if(!props.tab.closable) return
  emit('close', { tabId: props.tab.id, focusAfterClose: event?.type === 'click' })
}
</script>

<style scoped>
.browser-tab{
  position:relative;
  display:flex;
  align-items:center;
  min-width:138px;
  max-width:228px;
  height:38px;
  border:1px solid transparent;
  border-radius:11px 11px 5px 5px;
  color:#64748b;
  background:transparent;
  flex:1 1 180px;
  transition:color 180ms ease, background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.browser-tab:hover{
  color:#334155;
  background:rgba(255,255,255,.58);
}

.browser-tab.is-active{
  color:#1e293b;
  border-color:rgba(148,163,184,.5);
  border-bottom-color:#fff;
  background:#fff;
  box-shadow:0 3px 10px rgba(15,23,42,.08);
}

.browser-tab.is-active::after{
  position:absolute;
  right:12px;
  bottom:-1px;
  left:12px;
  height:2px;
  border-radius:2px 2px 0 0;
  background:var(--browser-primary, #2563eb);
  content:'';
}

.tab-main{
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0;
  height:100%;
  padding:0 10px;
  border:0;
  border-radius:10px;
  background:transparent;
  color:inherit;
  flex:1;
  text-align:left;
}

.browser-tab.is-closable .tab-main{
  padding-right:3px;
}

.tab-main:focus-visible,
.tab-close:focus-visible{
  outline:2px solid var(--browser-primary, #2563eb);
  outline-offset:-2px;
}

.tab-icon{
  display:grid;
  place-items:center;
  width:19px;
  height:19px;
  color:#64748b;
  flex:0 0 auto;
}

.is-active .tab-icon{
  color:var(--browser-primary, #2563eb);
}

.tab-icon svg,
.tab-close svg{
  width:100%;
  height:100%;
  fill:none;
  stroke:currentColor;
  stroke-width:1.7;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.tab-title{
  overflow:hidden;
  min-width:0;
  color:inherit;
  font:600 12px/1.2 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-overflow:ellipsis;
  white-space:nowrap;
  flex:1;
}

.tab-badge{
  display:inline-grid;
  place-items:center;
  min-width:18px;
  height:18px;
  padding:0 5px;
  border-radius:999px;
  background:var(--browser-primary, #2563eb);
  color:#fff;
  font-size:10px;
  font-weight:800;
  line-height:1;
  box-shadow:0 2px 5px rgba(37,99,235,.24);
  flex:0 0 auto;
}

.tab-close{
  display:grid;
  place-items:center;
  width:26px;
  height:26px;
  margin-right:5px;
  padding:6px;
  border:0;
  border-radius:8px;
  background:transparent;
  color:#64748b;
  flex:0 0 auto;
  opacity:.72;
  transition:background 180ms ease, color 180ms ease, opacity 180ms ease, transform 180ms ease;
}

.tab-close:hover{
  color:#b91c1c;
  background:#fee2e2;
  opacity:1;
}

.tab-close:active{
  transform:scale(.9);
}

.browser-tab.has-unread{
  border-color:rgba(37,99,235,.18);
  background:rgba(219,234,254,.58);
  animation:unread-pulse 2.2s ease-in-out 2;
}

@keyframes unread-pulse{
  0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0)}
  50%{box-shadow:0 0 0 4px rgba(37,99,235,.12)}
}

@media (prefers-reduced-motion:reduce){
  .browser-tab,
  .tab-close,
  .browser-tab.has-unread{
    transition:none;
    animation:none;
  }
}

@media (max-width:640px){
  .browser-tab{
    min-width:122px;
    max-width:176px;
    flex-basis:152px;
  }
}
</style>
