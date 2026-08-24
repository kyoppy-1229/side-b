<template>
  <form class="address-form" role="search" @submit.prevent="submit">
    <span class="network-indicator" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <rect x="5" y="10" width="14" height="10" rx="3" />
      </svg>
    </span>

    <label class="visually-hidden" :for="inputId">仮想URLまたは検索語</label>
    <input
      :id="inputId"
      ref="addressInput"
      v-model="draft"
      class="address-input"
      type="text"
      inputmode="url"
      autocomplete="off"
      autocapitalize="none"
      spellcheck="false"
      aria-label="仮想URLまたは検索語"
      placeholder="仮想URLを入力、またはTRACE Searchで検索"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown.esc="restoreAddress"
    />

    <button
      v-if="isFocused && draft"
      class="address-action"
      type="button"
      aria-label="入力内容を消去"
      title="入力内容を消去"
      @mousedown.prevent
      @click="clearAddress"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m8 8 8 8M16 8l-8 8" />
      </svg>
    </button>

    <button
      class="address-action address-submit"
      type="submit"
      aria-label="このアドレスを開く"
      title="開く"
      :disabled="!draft.trim()"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h13m-5-5 5 5-5 5" />
      </svg>
    </button>
  </form>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  url: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit'])

const inputId = `virtual-address-${Math.random().toString(36).slice(2, 9)}`
const addressInput = ref(null)
const draft = ref(props.url)
const isFocused = ref(false)

watch(() => props.url, (url) => {
  draft.value = url || ''
})

function submit(){
  const value = draft.value.trim()
  if(!value) return
  emit('submit', value)
  addressInput.value?.blur()
}

function restoreAddress(){
  draft.value = props.url || ''
  addressInput.value?.blur()
}

async function clearAddress(){
  draft.value = ''
  await nextTick()
  addressInput.value?.focus()
}

defineExpose({
  focus: () => addressInput.value?.focus()
})
</script>

<style scoped>
.address-form{
  display:flex;
  align-items:center;
  flex:1;
  min-width:0;
  height:38px;
  padding:0 6px 0 12px;
  border:1px solid var(--browser-line, #cbd5e1);
  border-radius:12px;
  background:var(--browser-surface, #fff);
  box-shadow:0 1px 2px rgba(15,23,42,.04) inset;
  transition:border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.address-form:focus-within{
  border-color:var(--browser-primary, #2563eb);
  background:#fff;
  box-shadow:0 0 0 3px rgba(37,99,235,.14);
}

.network-indicator{
  display:grid;
  place-items:center;
  width:22px;
  height:22px;
  margin-right:7px;
  color:#64748b;
  flex:0 0 auto;
}

.network-indicator svg,
.address-action svg{
  width:17px;
  height:17px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.address-input{
  width:100%;
  min-width:0;
  height:100%;
  padding:0;
  border:0;
  outline:0;
  background:transparent;
  color:var(--browser-text, #172033);
  font:500 13px/1.4 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing:.01em;
}

.address-input::placeholder{
  color:#94a3b8;
  font-weight:400;
}

.address-action{
  display:grid;
  place-items:center;
  width:30px;
  height:30px;
  padding:0;
  border:0;
  border-radius:8px;
  background:transparent;
  color:#64748b;
  flex:0 0 auto;
  transition:color 180ms ease, background 180ms ease, transform 180ms ease;
}

.address-action:hover:not(:disabled){
  color:#1e40af;
  background:#eff6ff;
}

.address-action:active:not(:disabled){
  transform:scale(.94);
}

.address-action:focus-visible{
  outline:2px solid var(--browser-primary, #2563eb);
  outline-offset:1px;
}

.address-action:disabled{
  opacity:.35;
  cursor:default;
}

.address-submit{
  color:var(--browser-primary, #2563eb);
}

.visually-hidden{
  position:absolute;
  width:1px;
  height:1px;
  padding:0;
  margin:-1px;
  overflow:hidden;
  clip:rect(0,0,0,0);
  white-space:nowrap;
  border:0;
}

@media (max-width:560px){
  .address-form{
    height:36px;
    border-radius:10px;
  }

  .network-indicator{
    display:none;
  }

  .address-input{
    font-size:12px;
  }
}
</style>
