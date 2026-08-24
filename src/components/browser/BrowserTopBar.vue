<template>
  <header class="browser-top-bar">
    <div class="browser-identity">
      <span class="browser-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32">
          <path d="M7 22.5c2.4-7.8 5.5-12 9.2-12 3.3 0 5.6 3.3 8.8 10.5" />
          <path d="M7 10.5h8.2c3.7 0 6.4 2.3 8.8 7" />
          <circle cx="7" cy="10.5" r="2.5" />
          <circle cx="7" cy="22.5" r="2.5" />
          <circle cx="25" cy="21" r="2.5" />
        </svg>
      </span>
      <div class="identity-copy">
        <strong>{{ appName }}</strong>
        <span v-if="activeTitle">{{ activeTitle }}</span>
      </div>
    </div>

    <div class="top-bar-actions">
      <div class="session-chip" title="ローカル仮想ネットワークセッション">
        <span class="session-dot" aria-hidden="true"></span>
        <span class="session-copy">{{ sessionLabel }}</span>
      </div>
      <slot name="notifications" />
    </div>
  </header>
</template>

<script setup>
import { VIRTUAL_BROWSER_NAME } from './browserContext.js'

defineProps({
  appName: {
    type: String,
    default: VIRTUAL_BROWSER_NAME
  },
  activeTitle: {
    type: String,
    default: ''
  },
  sessionLabel: {
    type: String,
    default: '調査セッション'
  }
})
</script>

<style scoped>
.browser-top-bar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  min-height:50px;
  padding:7px 12px 7px 14px;
  border-bottom:1px solid rgba(148,163,184,.52);
  background:linear-gradient(135deg, #f8fafc 0%, #eef3f9 100%);
  color:var(--browser-text, #172033);
}

.browser-identity{
  display:flex;
  align-items:center;
  gap:10px;
  min-width:0;
}

.browser-mark{
  display:grid;
  place-items:center;
  width:34px;
  height:34px;
  border-radius:11px;
  background:linear-gradient(145deg, #1d4ed8 0%, #2563eb 56%, #38bdf8 100%);
  color:#fff;
  box-shadow:0 5px 14px rgba(37,99,235,.24);
  flex:0 0 auto;
}

.browser-mark svg{
  width:24px;
  height:24px;
  fill:none;
  stroke:currentColor;
  stroke-width:2;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.identity-copy{
  display:flex;
  flex-direction:column;
  min-width:0;
}

.identity-copy strong{
  overflow:hidden;
  font:750 13px/1.3 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing:.02em;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.identity-copy span{
  overflow:hidden;
  max-width:40vw;
  color:#64748b;
  font-size:10px;
  font-weight:600;
  line-height:1.25;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.top-bar-actions{
  display:flex;
  align-items:center;
  gap:8px;
  flex:0 0 auto;
}

.session-chip{
  display:flex;
  align-items:center;
  gap:7px;
  min-height:30px;
  padding:0 11px;
  border:1px solid #dbe3ed;
  border-radius:999px;
  background:rgba(255,255,255,.75);
  color:#475569;
  font-size:11px;
  font-weight:650;
  box-shadow:0 1px 2px rgba(15,23,42,.04);
}

.session-dot{
  width:7px;
  height:7px;
  border:2px solid #bbf7d0;
  border-radius:50%;
  background:#16a34a;
  box-sizing:content-box;
}

@media (max-width:560px){
  .browser-top-bar{
    min-height:46px;
    padding:6px 8px;
  }

  .browser-mark{
    width:32px;
    height:32px;
    border-radius:10px;
  }

  .identity-copy span,
  .session-copy{
    display:none;
  }

  .session-chip{
    min-width:30px;
    padding:0 9px;
  }
}
</style>
