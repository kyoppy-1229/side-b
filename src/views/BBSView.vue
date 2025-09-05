<template>
  <div class="card">
    <h2>掲示板ミニ謎（当時ログ再現 / 2ch風）</h2>
    <p class="small">※ ダミー版。次ステップで JSON から完全再現に置き換えます。</p>
    <div class="hr"></div>
    <pre class="code">【スレタイ】閉校記念ゲーム「SIDE-B」やってみた
-------------------------------------------------
[2015/03/01 19:12] ID: TWl6dW5v
  → とりあえず完成。3面。閉校までの日数を背景に仕込んだ。ver1.00
...（後続は JSON 化して完全再現予定）...</pre>
    <div class="toolbar">
      <button class="btn btn-primary" @click="backToDM">DMに戻る（物語を進める）</button>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { useGameStore } from '../store'

const router = useRouter()
const store = useGameStore()
function backToDM(){
  store.seenBBS = true
  router.push('/')
}
</script>
