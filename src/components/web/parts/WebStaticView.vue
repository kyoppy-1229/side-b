<template>
  <section class="web-static web-card web-pad">
    <h1 class="web-title">{{ page.heading }}</h1>

    <div v-if="page.kind === 'static-about'" class="web-prose">
      <p>{{ site.description }}</p>
      <p>
        {{ site.name }}は{{ site.established || '開設以来' }}{{ site.established ? 'に開設し' : '' }}、{{ aboutFocus }}を中心に情報を掲載しています。
        掲載内容は{{ site.operator || site.name }}が編集しています。
      </p>
      <h2>沿革</h2>
      <ul v-if="site.history.length">
        <li v-for="entry in site.history" :key="entry.year">{{ entry.year }}年 — {{ entry.text }}</li>
      </ul>
      <p v-else>沿革の記録は残っていません。</p>
      <h2>運営</h2>
      <dl class="web-about-list">
        <div><dt>サイト名</dt><dd>{{ site.name }}</dd></div>
        <div><dt>URL</dt><dd>https://{{ site.domain }}/</dd></div>
        <div><dt>運営</dt><dd>{{ site.operator || site.name }}</dd></div>
        <div><dt>更新状況</dt><dd>{{ statusText }}</dd></div>
      </dl>
      <h2>掲載内容について</h2>
      <p>
        掲載している情報は公開時点のものです。制度や料金、営業時間などは変更される場合があるため、
        重要な事項については各機関の一次情報をご確認ください。
      </p>
    </div>

    <div v-else-if="page.kind === 'static-privacy'" class="web-prose">
      <p>{{ site.name }}（以下「当サイト」）における個人情報および閲覧情報の取り扱いについて説明します。</p>
      <h2>取得する情報</h2>
      <p>
        当サイトでは、閲覧されたページのURL、閲覧日時、参照元、および利用環境の情報をアクセスログとして記録しています。
        これらは統計処理のみに使用し、個人を特定する目的では利用しません。
      </p>
      <h2>お問い合わせの取り扱い</h2>
      <p>
        お問い合わせフォームから送信された内容は、返信および内容確認の目的にのみ使用します。
        返信が完了した記録は、一定期間の経過後に削除します。
      </p>
      <h2>第三者提供</h2>
      <p>法令に基づく場合を除き、取得した情報を第三者へ提供することはありません。</p>
      <h2>改定</h2>
      <p>本方針の内容は予告なく変更される場合があります。変更後の内容は当ページに掲載します。</p>
    </div>

    <div v-else-if="page.kind === 'static-terms'" class="web-prose">
      <h2>第1条（適用）</h2>
      <p>本規約は、{{ site.name }}の利用に関する条件を定めるものです。当サイトを利用した時点で本規約に同意したものとみなします。</p>
      <h2>第2条（著作権）</h2>
      <p>
        当サイトに掲載された文章、写真、図表の著作権は{{ site.operator || site.name }}または各権利者に帰属します。
        引用の範囲を超える転載を行う場合は、事前にご連絡ください。
      </p>
      <h2>第3条（免責）</h2>
      <p>
        掲載内容の正確性には努めていますが、内容の利用によって生じた損害について責任を負うものではありません。
        外部サイトへのリンク先の内容についても同様です。
      </p>
      <h2>第4条（禁止事項）</h2>
      <ul>
        <li>当サイトの運営を妨げる行為</li>
        <li>掲載情報を改変して再配布する行為</li>
        <li>過度な自動アクセスによって負荷をかける行為</li>
      </ul>
    </div>

    <div v-else class="web-prose">
      <p>{{ site.name }}へのお問い合わせは、以下のフォームからお送りください。内容によっては返信までお時間をいただく場合があります。</p>
      <form class="web-contact" @submit.prevent="submitted = true">
        <label>
          お名前
          <input type="text" autocomplete="off" />
        </label>
        <label>
          返信先
          <input type="text" autocomplete="off" />
        </label>
        <label>
          お問い合わせ内容
          <textarea rows="5"></textarea>
        </label>
        <button class="web-button" type="submit">送信する</button>
        <p v-if="submitted" class="web-contact__done" role="status">
          送信は完了しませんでした。このフォームは受付を停止しています。
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  site: { type: Object, required: true },
  page: { type: Object, required: true }
})

const submitted = ref(false)

const aboutFocus = computed(() => props.site.keywords.slice(0, 3).join('・') || props.site.kind)
const statusText = computed(() => {
  if(props.site.status === 'closed') return `${props.site.closedAt || ''}に公開を終了`
  if(props.site.status === 'inactive') return `${props.site.lastUpdated || ''}以降、更新を停止中`
  return '現在も更新中'
})
</script>

<style scoped>
.web-about-list{
  display:grid;
  gap:0;
  margin:0;
  border:1px solid var(--web-line);
  border-radius:var(--web-radius);
  overflow:hidden;
  font-size:12px;
}

.web-about-list > div{ display:grid; grid-template-columns:120px minmax(0,1fr) }
.web-about-list > div + div{ border-top:1px solid var(--web-line) }
.web-about-list dt{ padding:8px 12px; background:var(--web-accent-soft); font-weight:700 }
.web-about-list dd{ margin:0; padding:8px 12px }

.web-contact{
  display:grid;
  gap:12px;
  max-width:460px;
  margin-top:8px;
}

.web-contact label{
  display:grid;
  gap:5px;
  font-size:11px;
  font-weight:700;
}

.web-contact input,
.web-contact textarea{
  padding:8px 10px;
  border:1px solid var(--web-line);
  border-radius:calc(var(--web-radius) - 3px);
  background:var(--web-surface);
  color:inherit;
  font:inherit;
  font-size:12px;
  font-weight:400;
}

.web-contact button{ justify-self:start }
.web-contact__done{ margin:0; color:var(--web-muted); font-size:11px }
</style>
