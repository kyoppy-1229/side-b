<template>
  <button
    class="link-card"
    type="button"
    :aria-label="`${title}を新しいタブで開く`"
    @click="emit('open-url', url)"
  >
    <span class="link-card__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M8.5 5.5h-2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2m-7-11h8v8m0-8-9 9" />
      </svg>
    </span>
    <span class="link-card__body">
      <span class="link-card__eyebrow">{{ eyebrow }}</span>
      <strong>{{ title }}</strong>
      <span class="link-card__description">{{ description }}</span>
      <span class="link-card__url">{{ displayUrl }}</span>
    </span>
    <span class="link-card__arrow" aria-hidden="true">›</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  url: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  eyebrow: { type: String, default: '共有リンク' }
})

const emit = defineEmits(['open-url'])

const displayUrl = computed(() => props.url.replace(/^https?:\/\//, ''))
</script>

<style scoped>
.link-card{
  width:min(100%, 520px);
  display:grid;
  grid-template-columns:44px minmax(0, 1fr) 20px;
  align-items:center;
  gap:14px;
  padding:16px;
  border:1px solid #d7e2f3;
  border-radius:18px;
  background:linear-gradient(145deg, #fff 0%, #f5f8fd 100%);
  color:#18253b;
  text-align:left;
  cursor:pointer;
  box-shadow:0 8px 22px rgba(27, 55, 94, 0.08);
  transition:transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.link-card:hover{
  transform:translateY(-2px);
  border-color:#9bb7df;
  box-shadow:0 12px 28px rgba(27, 55, 94, 0.14);
}

.link-card:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.3);
  outline-offset:3px;
}

.link-card__icon{
  width:44px;
  height:44px;
  display:grid;
  place-items:center;
  border-radius:14px;
  background:#e6effc;
  color:#245da8;
}

.link-card__icon svg{
  width:21px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.link-card__body{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:4px;
}

.link-card__eyebrow{
  color:#59708f;
  font-size:10px;
  font-weight:800;
  letter-spacing:0.1em;
  text-transform:uppercase;
}

.link-card__body strong{
  font-size:15px;
  line-height:1.4;
}

.link-card__description{
  color:#526178;
  font-size:12px;
  line-height:1.55;
}

.link-card__url{
  overflow:hidden;
  color:#2767bd;
  font-size:11px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.link-card__arrow{
  color:#6480a5;
  font-size:26px;
  line-height:1;
}

@media (max-width:560px){
  .link-card{
    grid-template-columns:38px minmax(0, 1fr);
    gap:10px;
    padding:13px;
  }

  .link-card__icon{
    width:38px;
    height:38px;
    border-radius:12px;
  }

  .link-card__arrow{
    display:none;
  }
}
</style>
