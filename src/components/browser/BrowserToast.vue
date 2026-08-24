<template>
  <article v-if="toast" class="browser-toast" role="status" aria-live="polite">
    <button class="toast-content" type="button" @click="emit('open')">
      <span class="toast-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 5.5h14v10H9l-4 3v-13Z" />
          <path d="M8 9h8M8 12h5" />
        </svg>
      </span>
      <span class="toast-copy">
        <span class="toast-eyebrow">{{ eyebrow }}</span>
        <strong>{{ heading }}</strong>
        <span v-if="message" class="toast-message">{{ message }}</span>
      </span>
    </button>
    <button class="toast-close" type="button" aria-label="通知を閉じる" @click="emit('dismiss')">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m8 8 8 8M16 8l-8 8" />
      </svg>
    </button>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  toast: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['open', 'dismiss'])

const eyebrow = computed(() => props.toast?.source || props.toast?.sender || 'Messages')
const heading = computed(() => props.toast?.title || props.toast?.heading || '新しいメッセージ')
const message = computed(() => props.toast?.message || props.toast?.preview || props.toast?.body || '')
</script>

<style scoped>
.browser-toast{
  position:absolute;
  top:60px;
  right:16px;
  z-index:50;
  display:flex;
  align-items:flex-start;
  width:min(370px, calc(100% - 24px));
  overflow:hidden;
  border:1px solid rgba(148,163,184,.5);
  border-radius:16px;
  background:rgba(255,255,255,.97);
  color:#1e293b;
  box-shadow:0 22px 55px rgba(15,23,42,.23), 0 2px 7px rgba(15,23,42,.08);
  backdrop-filter:blur(12px);
}

.toast-content{
  display:flex;
  align-items:flex-start;
  gap:11px;
  min-width:0;
  padding:13px 8px 13px 13px;
  border:0;
  background:transparent;
  color:inherit;
  flex:1;
  text-align:left;
}

.toast-content:hover{
  background:#f8fafc;
}

.toast-content:focus-visible,
.toast-close:focus-visible{
  outline:2px solid var(--browser-primary, #2563eb);
  outline-offset:-2px;
}

.toast-icon{
  display:grid;
  place-items:center;
  width:38px;
  height:38px;
  border-radius:12px;
  background:linear-gradient(145deg, #1d4ed8, #3b82f6);
  color:#fff;
  box-shadow:0 6px 16px rgba(37,99,235,.24);
  flex:0 0 auto;
}

.toast-icon svg,
.toast-close svg{
  width:20px;
  height:20px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.toast-copy{
  display:flex;
  flex-direction:column;
  min-width:0;
}

.toast-eyebrow{
  color:#2563eb;
  font-size:9px;
  font-weight:800;
  letter-spacing:.09em;
  line-height:1.2;
  text-transform:uppercase;
}

.toast-copy strong{
  margin-top:3px;
  font-size:12px;
  line-height:1.35;
}

.toast-message{
  display:-webkit-box;
  overflow:hidden;
  margin-top:3px;
  color:#64748b;
  font-size:11px;
  line-height:1.45;
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;
}

.toast-close{
  display:grid;
  place-items:center;
  width:30px;
  height:30px;
  margin:7px 7px 0 0;
  padding:6px;
  border:0;
  border-radius:9px;
  background:transparent;
  color:#64748b;
  flex:0 0 auto;
  transition:background 180ms ease, color 180ms ease, transform 180ms ease;
}

.toast-close:hover{
  color:#b91c1c;
  background:#fee2e2;
}

.toast-close:active{
  transform:scale(.9);
}

@media (prefers-reduced-motion:reduce){
  .toast-close{
    transition:none;
  }
}

@media (max-width:560px){
  .browser-toast{
    top:52px;
    right:8px;
    width:calc(100% - 16px);
    border-radius:13px;
  }
}
</style>
