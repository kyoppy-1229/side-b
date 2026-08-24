<template>
  <div class="browser-navigation" aria-label="ブラウザーナビゲーション">
    <div class="navigation-actions">
      <button
        class="navigation-button"
        type="button"
        aria-label="前のページに戻る"
        title="戻る"
        :disabled="!canGoBack"
        @click="emit('back')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m14 6-6 6 6 6" />
        </svg>
      </button>
      <button
        class="navigation-button"
        type="button"
        aria-label="次のページに進む"
        title="進む"
        :disabled="!canGoForward"
        @click="emit('forward')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m10 6 6 6-6 6" />
        </svg>
      </button>
      <button
        class="navigation-button"
        :class="{ 'is-reloading': reloading }"
        type="button"
        aria-label="現在のページを再読み込み"
        title="再読み込み"
        @click="emit('reload')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 8a7.5 7.5 0 1 0 .2 7.5" />
          <path d="M19 3v5h-5" />
        </svg>
      </button>
    </div>

    <BrowserAddressBar ref="addressBar" :url="url" @submit="emit('submit-address', $event)" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BrowserAddressBar from './BrowserAddressBar.vue'

defineProps({
  url: {
    type: String,
    default: ''
  },
  canGoBack: {
    type: Boolean,
    default: false
  },
  canGoForward: {
    type: Boolean,
    default: false
  },
  reloading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['back', 'forward', 'reload', 'submit-address'])
const addressBar = ref(null)

defineExpose({
  focusAddress: () => addressBar.value?.focus()
})
</script>

<style scoped>
.browser-navigation{
  display:flex;
  align-items:center;
  gap:10px;
  min-height:54px;
  padding:8px 12px;
  border-bottom:1px solid var(--browser-line, #cbd5e1);
  background:var(--browser-surface-raised, #f8fafc);
}

.navigation-actions{
  display:flex;
  align-items:center;
  gap:3px;
  flex:0 0 auto;
}

.navigation-button{
  display:grid;
  place-items:center;
  width:34px;
  height:34px;
  padding:0;
  border:0;
  border-radius:10px;
  background:transparent;
  color:#475569;
  transition:background 180ms ease, color 180ms ease, transform 180ms ease;
}

.navigation-button:hover:not(:disabled){
  background:#e2e8f0;
  color:#1e3a8a;
}

.navigation-button:active:not(:disabled){
  transform:scale(.92);
}

.navigation-button:focus-visible{
  outline:2px solid var(--browser-primary, #2563eb);
  outline-offset:2px;
}

.navigation-button:disabled{
  color:#cbd5e1;
  cursor:default;
}

.navigation-button svg{
  width:20px;
  height:20px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.9;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.navigation-button.is-reloading svg{
  animation:browser-spin 700ms linear infinite;
}

@keyframes browser-spin{
  to{transform:rotate(360deg)}
}

@media (prefers-reduced-motion:reduce){
  .navigation-button,
  .navigation-button.is-reloading svg{
    transition:none;
    animation:none;
  }
}

@media (max-width:560px){
  .browser-navigation{
    gap:5px;
    min-height:48px;
    padding:6px 8px;
  }

  .navigation-actions{
    gap:0;
  }

  .navigation-button{
    width:30px;
    height:32px;
    border-radius:8px;
  }

}
</style>
