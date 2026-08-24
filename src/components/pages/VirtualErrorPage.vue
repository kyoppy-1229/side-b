<template>
  <main class="error-page" :aria-labelledby="titleId">
    <section class="error-page__content">
      <span class="error-page__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 3 2.8 19h18.4L12 3Z" />
          <path d="M12 9v4.5M12 17h.01" />
        </svg>
      </span>
      <p class="error-page__code">{{ code }}</p>
      <h1 :id="titleId">このページには接続できません</h1>
      <p class="error-page__description">
        入力した仮想URLに対応するページが見つかりませんでした。アドレスを確認してください。
      </p>
      <div v-if="url" class="error-page__url">
        <span>REQUESTED URL</span>
        <code>{{ url }}</code>
      </div>
      <ul>
        <li>URLの綴りを確認する</li>
        <li>TRACE Searchから保存ページを探す</li>
        <li>このブラウザは外部Webへ接続しません</li>
      </ul>
    </section>
  </main>
</template>

<script setup>
import { VIRTUAL_ERROR_CODE } from '../../virtual-web/constants.js'

const titleId = `virtual-error-title-${Math.random().toString(36).slice(2, 9)}`

defineProps({
  url: { type: String, default: '' },
  code: { type: String, default: VIRTUAL_ERROR_CODE }
})
</script>

<style scoped>
.error-page{
  min-height:100%;
  display:grid;
  place-items:center;
  overflow:auto;
  padding:45px 24px;
  background:#f8fafc;
  color:#28374d;
  font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.error-page__content{
  width:min(100%, 590px);
}

.error-page__icon{
  width:60px;
  height:60px;
  display:grid;
  place-items:center;
  margin-bottom:22px;
  border-radius:19px;
  background:#fff1e8;
  color:#bd6033;
}

.error-page__icon svg{
  width:30px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.7;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.error-page__code{
  margin:0 0 8px;
  color:#a94f2a;
  font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size:11px;
  font-weight:800;
  letter-spacing:0.05em;
}

.error-page h1{
  margin:0;
  color:#203047;
  font-size:clamp(23px, 4vw, 32px);
  line-height:1.35;
}

.error-page__description{
  max-width:520px;
  margin:13px 0 24px;
  color:#697a90;
  font-size:13px;
  line-height:1.75;
}

.error-page__url{
  display:flex;
  flex-direction:column;
  gap:5px;
  padding:13px 15px;
  border:1px solid #dde4ed;
  border-radius:13px;
  background:#fff;
}

.error-page__url span{
  color:#8794a5;
  font-size:8px;
  font-weight:900;
  letter-spacing:0.12em;
}

.error-page__url code{
  overflow:hidden;
  color:#40516a;
  font-size:11px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.error-page ul{
  margin:22px 0 0;
  padding-left:19px;
  color:#758399;
  font-size:11px;
  line-height:1.9;
}
</style>
