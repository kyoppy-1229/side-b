<template>
  <main class="blank-page">
    <section class="blank-page__card" :aria-labelledby="titleId">
      <span class="blank-page__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      </span>
      <p class="blank-page__eyebrow">RE:TRACE BROWSER</p>
      <h1 :id="titleId">新しいタブ</h1>
      <p class="blank-page__lead">仮想URLを入力するか、ゲーム内Webを検索してください。</p>

      <form class="blank-page__form" @submit.prevent="navigate">
        <label :for="addressId">URL または検索語</label>
        <span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.25 15.25 4.75 4.75" />
          </svg>
          <input
            :id="addressId"
            ref="addressInput"
            v-model="address"
            type="text"
            placeholder="例: school.archive.local"
            autocomplete="off"
            spellcheck="false"
          />
          <button type="submit" :disabled="!address.trim()">開く</button>
        </span>
      </form>

      <div v-if="suggestedUrls.length" class="blank-page__suggestions">
        <h2>候補</h2>
        <button
          v-for="suggestion in suggestedUrls"
          :key="suggestion.url"
          type="button"
          @click="emit('open-url', suggestion.url)"
        >
          <span>{{ suggestion.title }}</span>
          <small>{{ displayUrl(suggestion.url) }}</small>
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'

defineProps({
  suggestedUrls: { type: Array, default: () => [] }
})

const emit = defineEmits(['navigate', 'open-url'])
const instanceId = Math.random().toString(36).slice(2, 9)
const titleId = `blank-page-title-${instanceId}`
const addressId = `blank-address-${instanceId}`
const address = ref('')
const addressInput = ref(null)

function navigate(){
  const value = address.value.trim()
  if(!value) return
  emit('navigate', value)
}

function displayUrl(url){
  return String(url).replace(/^https?:\/\//, '')
}

onMounted(() => addressInput.value?.focus())
</script>

<style scoped>
.blank-page{
  min-height:100%;
  display:grid;
  place-items:center;
  overflow:auto;
  padding:40px 20px;
  background:
    radial-gradient(circle at 50% 0, rgba(65, 125, 209, 0.1), transparent 42%),
    #f7f9fc;
  color:#26354c;
  font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.blank-page__card{
  width:min(100%, 600px);
  padding:38px;
  border:1px solid #dce4ee;
  border-radius:24px;
  background:rgba(255, 255, 255, 0.94);
  box-shadow:0 20px 54px rgba(39, 58, 87, 0.1);
  text-align:center;
}

.blank-page__icon{
  width:57px;
  height:57px;
  display:grid;
  place-items:center;
  margin:0 auto 17px;
  border-radius:18px;
  background:#e8f0fb;
  color:#3169b3;
}

.blank-page__icon svg{
  width:28px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.6;
  stroke-linecap:round;
}

.blank-page__eyebrow{
  margin:0 0 6px;
  color:#6d80a0;
  font-size:9px;
  font-weight:900;
  letter-spacing:0.14em;
}

.blank-page h1{
  margin:0;
  color:#1e2e46;
  font-size:24px;
}

.blank-page__lead{
  margin:10px 0 25px;
  color:#718096;
  font-size:12px;
  line-height:1.7;
}

.blank-page__form{
  display:flex;
  align-items:stretch;
  flex-direction:column;
  gap:7px;
  text-align:left;
}

.blank-page__form > label{
  padding-left:4px;
  color:#63748b;
  font-size:10px;
  font-weight:800;
}

.blank-page__form > span{
  display:flex;
  align-items:center;
  gap:9px;
  padding:6px 6px 6px 14px;
  border:1px solid #d4dfec;
  border-radius:15px;
  background:#f8fafc;
  transition:border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.blank-page__form > span:focus-within{
  border-color:#6e9cdb;
  background:#fff;
  box-shadow:0 0 0 4px rgba(44, 111, 208, 0.12);
}

.blank-page__form svg{
  width:19px;
  color:#6f7e91;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
}

.blank-page__form input{
  min-width:0;
  flex:1;
  padding:8px 0;
  border:0;
  outline:0;
  background:transparent;
  color:#22324a;
  font:inherit;
  font-size:12px;
}

.blank-page__form button{
  padding:10px 17px;
  border:0;
  border-radius:11px;
  background:#2869c7;
  color:#fff;
  font-size:11px;
  font-weight:800;
  cursor:pointer;
}

.blank-page__form button:disabled{
  background:#bac5d3;
  cursor:not-allowed;
}

.blank-page__form button:focus-visible,
.blank-page__suggestions button:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.27);
  outline-offset:3px;
}

.blank-page__suggestions{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:8px;
  margin-top:26px;
  text-align:left;
}

.blank-page__suggestions h2{
  grid-column:1 / -1;
  margin:0 0 2px;
  color:#758398;
  font-size:10px;
  letter-spacing:0.04em;
}

.blank-page__suggestions button{
  min-width:0;
  display:flex;
  align-items:flex-start;
  flex-direction:column;
  gap:3px;
  padding:11px;
  border:1px solid #e0e6ee;
  border-radius:12px;
  background:#fff;
  color:#34455d;
  text-align:left;
  cursor:pointer;
  transition:border-color 180ms ease, background 180ms ease;
}

.blank-page__suggestions button:hover{
  border-color:#abc0dc;
  background:#f4f8fd;
}

.blank-page__suggestions span,
.blank-page__suggestions small{
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.blank-page__suggestions span{
  font-size:11px;
  font-weight:800;
}

.blank-page__suggestions small{
  color:#738299;
  font-size:8px;
}

@media (max-width:560px){
  .blank-page{
    padding:16px;
  }

  .blank-page__card{
    padding:27px 18px;
    border-radius:19px;
  }

  .blank-page__suggestions{
    grid-template-columns:1fr;
  }
}
</style>
