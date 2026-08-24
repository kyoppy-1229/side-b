<template>
  <section class="login" aria-label="チャットへの再ログイン">
    <div class="login__card">
      <div class="login__brand">
        <span class="login__brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 5.75h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H9l-4.5 3v-3.25A2 2 0 0 1 3 16.25v-8.5a2 2 0 0 1 2-2Z" />
          </svg>
        </span>
        <span class="login__brand-copy">
          <strong>Chat</strong>
          <small>RE:TRACE</small>
        </span>
      </div>

      <!-- ---- signed out ---------------------------------------------- -->
      <template v-if="stage === 'idle'">
        <h1 class="login__title">端末が変更されたため<br />再ログインが必要です。</h1>
        <p class="login__lead">移行データからアカウント情報が見つかりました。</p>

        <div class="login__account">
          <span class="login__account-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="9" r="3.4" />
              <path d="M5.5 19.2a6.9 6.9 0 0 1 13 0" />
            </svg>
          </span>
          <span class="login__account-copy">
            <strong>移行データ内のアカウント</strong>
            <small>Chat ID ●●●●●●●●</small>
          </span>
          <span class="login__account-mark" aria-hidden="true">✓</span>
        </div>

        <button type="button" class="login__button" @click="signIn">このアカウントでログイン</button>
        <p class="login__note">メッセージ履歴は旧端末に保存されていたため、この端末には引き継がれていません。</p>
      </template>

      <!-- ---- signing in ---------------------------------------------- -->
      <template v-else>
        <p class="login__status" role="status" aria-live="polite">
          <span v-if="stage === 'restoring'" class="login__spinner" aria-hidden="true"></span>
          <span v-else class="login__done" aria-hidden="true">✓</span>
          {{ stage === 'restoring' ? 'アカウント情報を復元しています……' : 'ログインしました' }}
        </p>
      </template>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'

// Long enough to read the two states, short enough not to be a wait.
const RESTORE_MS = 1400
const CONFIRM_MS = 900

const emit = defineEmits(['login'])

const stage = ref('idle')   // 'idle' | 'restoring' | 'signed-in'

// One timer at a time, cleared on unmount, so leaving the tab mid-sign-in
// cannot fire the completion into a component that no longer exists.
let timer = null

function clearTimer(){
  if(timer === null) return
  clearTimeout(timer)
  timer = null
}

function later(ms, run){
  clearTimer()
  timer = setTimeout(() => {
    timer = null
    run()
  }, ms)
}

function signIn(){
  if(stage.value !== 'idle') return
  stage.value = 'restoring'
  later(RESTORE_MS, () => {
    stage.value = 'signed-in'
    later(CONFIRM_MS, () => emit('login'))
  })
}

onBeforeUnmount(clearTimer)
</script>

<style scoped>
.login{
  width:100%;
  height:100%;
  min-height:480px;
  display:grid;
  place-items:center;
  padding:28px 18px;
  background:
    radial-gradient(circle at 50% 0, rgba(54, 119, 211, 0.07), transparent 46%),
    #f6f8fc;
  color:#223048;
  font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.login__card{
  width:min(380px, 100%);
  display:flex;
  flex-direction:column;
  padding:28px 26px 24px;
  border:1px solid #dce4ef;
  border-radius:20px;
  background:#fff;
  box-shadow:0 18px 44px rgba(31, 52, 83, 0.09);
}

.login__brand{
  display:flex;
  align-items:center;
  gap:11px;
  margin-bottom:22px;
}

.login__brand-icon{
  width:38px;
  height:38px;
  display:grid;
  place-items:center;
  border-radius:12px;
  background:#2869c7;
  color:#fff;
  box-shadow:0 7px 16px rgba(40, 105, 199, 0.24);
  flex:0 0 auto;
}

.login__brand-icon svg{
  width:21px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linejoin:round;
}

.login__brand-copy{
  display:flex;
  flex-direction:column;
  line-height:1.15;
}

.login__brand-copy strong{
  font-size:14px;
}

.login__brand-copy small{
  color:#8290a3;
  font-size:9px;
  font-weight:800;
  letter-spacing:0.12em;
}

.login__title{
  margin:0 0 10px;
  font-size:15px;
  font-weight:700;
  line-height:1.7;
  color:#1b293f;
}

.login__lead{
  margin:0 0 18px;
  color:#5c6b81;
  font-size:12px;
  line-height:1.7;
}

.login__account{
  display:flex;
  align-items:center;
  gap:11px;
  padding:12px;
  border:1px solid #d8e2f0;
  border-radius:14px;
  background:#f7fafd;
}

.login__account-avatar{
  width:36px;
  height:36px;
  display:grid;
  place-items:center;
  border-radius:50%;
  background:#e6effc;
  color:#3e6fae;
  flex:0 0 auto;
}

.login__account-avatar svg{
  width:20px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.6;
  stroke-linecap:round;
}

.login__account-copy{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:3px;
  flex:1;
}

.login__account-copy strong{
  font-size:12px;
}

.login__account-copy small{
  color:#7e8c9e;
  font-size:10px;
  letter-spacing:0.06em;
}

.login__account-mark{
  color:#31b66b;
  font-size:14px;
  font-weight:800;
}

.login__button{
  margin-top:18px;
  padding:12px 18px;
  border:0;
  border-radius:999px;
  background:#2869c7;
  color:#fff;
  font:inherit;
  font-size:13px;
  font-weight:800;
  box-shadow:0 8px 18px rgba(40, 105, 199, 0.22);
  transition:background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
}

.login__button:hover{
  background:#1f5cad;
  transform:translateY(-1px);
  box-shadow:0 11px 22px rgba(40, 105, 199, 0.26);
}

.login__button:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.28);
  outline-offset:3px;
}

.login__note{
  margin:14px 0 0;
  color:#8290a3;
  font-size:10px;
  line-height:1.7;
}

.login__status{
  display:flex;
  align-items:center;
  gap:10px;
  min-height:96px;
  margin:0;
  color:#3d4d64;
  font-size:13px;
}

.login__spinner{
  width:16px;
  height:16px;
  border:2px solid #d5e0ef;
  border-top-color:#2869c7;
  border-radius:50%;
  flex:0 0 auto;
  animation:login-spin 720ms linear infinite;
}

@keyframes login-spin{
  to{ transform:rotate(360deg); }
}

.login__done{
  width:18px;
  height:18px;
  display:grid;
  place-items:center;
  border-radius:50%;
  background:#31b66b;
  color:#fff;
  font-size:11px;
  font-weight:800;
  flex:0 0 auto;
}
</style>
