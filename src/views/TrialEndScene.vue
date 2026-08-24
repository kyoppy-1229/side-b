<template>
  <!-- The last screen of the trial. It replaces the whole shell, the way the
       reunion and the new PC's setup do, because there is nothing left to be
       inside of: the browser, the thread and the school are all behind it. -->
  <section class="trial-end" aria-labelledby="trial-end-heading">
    <div class="trial-end__inner">
      <p class="trial-end__eyebrow">SIDE-B</p>
      <h1 id="trial-end-heading">体験版はここまでです。</h1>
      <p class="trial-end__note">続きは9月に追加予定です。</p>

      <button type="button" class="trial-end__restart" @click="restart">最初から</button>
      <p class="trial-end__hint">体験版の進行状況は最初に戻ります。</p>
    </div>
  </section>
</template>

<script setup>
import { restartTrial } from '../trial/flow.js'

// 「最初から」 wipes the trial's own save namespace and reboots the tab, so the
// player lands back at the reunion with nothing carried over. The full game's
// save lives in a different namespace and is left alone.
function restart(){
  restartTrial()
}
</script>

<style scoped>
.trial-end{
  position:absolute;
  inset:0;
  display:grid;
  place-items:center;
  padding:32px 24px;
  background:
    radial-gradient(circle at 50% 18%, rgba(224,173,102,.14), transparent 46%),
    linear-gradient(180deg, #14171d 0%, #0b0d12 100%);
  color:#e9e2d4;
  font-family:'Hiragino Sans', ui-sans-serif, system-ui, sans-serif;
}

.trial-end__inner{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:14px;
  max-width:520px;
  text-align:center;
  animation:trial-end-in 900ms ease-out both;
}

.trial-end__eyebrow{
  margin:0;
  color:#9a8b74;
  font:11px/1 ui-monospace, monospace;
  letter-spacing:.34em;
}

.trial-end h1{
  margin:0;
  font:600 clamp(21px, 4vw, 29px)/1.6 'Hiragino Mincho ProN', Georgia, serif;
  letter-spacing:.04em;
}

.trial-end__note{
  margin:0;
  color:#b9ae9b;
  font:15px/1.9 'Hiragino Mincho ProN', Georgia, serif;
}

.trial-end__restart{
  margin-top:18px;
  padding:12px 34px;
  border:1px solid rgba(224,173,102,.5);
  border-radius:4px;
  background:rgba(224,173,102,.1);
  color:#f1e3cb;
  font:13px/1 ui-monospace, monospace;
  letter-spacing:.16em;
  cursor:pointer;
  transition:background 180ms ease, border-color 180ms ease;
}

.trial-end__restart:hover{
  border-color:rgba(224,173,102,.85);
  background:rgba(224,173,102,.2);
}

.trial-end__restart:focus-visible{
  outline:2px solid #e0ad66;
  outline-offset:3px;
}

.trial-end__hint{
  margin:0;
  color:#7d7367;
  font-size:11px;
}

@keyframes trial-end-in{
  from{ opacity:0; transform:translateY(8px) }
  to{ opacity:1; transform:none }
}

@media (prefers-reduced-motion:reduce){
  .trial-end__inner{ animation:none }
}
</style>
