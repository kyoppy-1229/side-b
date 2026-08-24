<template>
  <section class="messages" aria-label="水野ヒロキとの会話">
    <header class="messages__header">
      <span class="messages__avatar-wrap">
        <img :src="MIZUNO_AVATAR" alt="水野ヒロキ" />
        <span class="messages__online" aria-hidden="true"></span>
      </span>
      <span class="messages__heading">
        <strong>水野ヒロキ</strong>
        <small>オンライン</small>
      </span>
      <span class="messages__secure" title="仮想ネットワーク内の会話">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
        </svg>
        Local session
      </span>
    </header>

    <div ref="scroller" class="messages__scroller" aria-live="polite">
      <div class="messages__day"><span>今日</span></div>

      <!-- The history lived on the old handset, so the thread starts at the
           message that arrived on this one. -->
      <p v-if="freshThread" class="messages__fresh-note">この端末にはメッセージ履歴がありません</p>

      <div
        v-for="(message, index) in messages"
        :key="`${message.from}-${index}`"
        class="message-row"
        :class="{ 'message-row--me': isMine(message) }"
      >
        <img
          class="message-row__avatar"
          :src="isMine(message) ? playerAvatar : MIZUNO_AVATAR"
          :alt="isMine(message) ? `${playerName}のアイコン` : '水野ヒロキのアイコン'"
        />
        <div class="message-row__content">
          <div class="message-row__bubble">
            <p v-if="message.text">{{ message.text }}</p>
            <figure v-if="message.image" class="message-row__media">
              <img :src="message.image.src" :alt="message.image.alt" />
              <figcaption v-if="message.image.caption">{{ message.image.caption }}</figcaption>
            </figure>
          </div>
          <small class="message-row__meta">{{ isMine(message) ? `${playerName}・送信済み` : '受信済み' }}</small>
        </div>
      </div>

      <div v-if="linkCard" class="messages__link-card">
        <ChatLinkCard v-bind="linkCard" @open-url="emit('open-url', $event)" />
      </div>

      <div v-if="!messages.length" class="messages__empty">
        <span aria-hidden="true">•••</span>
        <p>会話を読み込んでいます</p>
      </div>
    </div>

    <footer class="messages__composer">
      <form v-if="waitingInput" class="composer" @submit.prevent="emit('send-input')">
        <label class="composer__field">
          <span v-if="inputConfig.helper" class="composer__helper">{{ inputConfig.helper }}</span>
          <span class="composer__row">
            <input
              ref="inputElement"
              :value="inputValue"
              type="text"
              :placeholder="inputConfig.placeholder || 'メッセージを入力'"
              aria-label="返信メッセージ"
              autocomplete="off"
              @input="emit('update:input-value', $event.target.value)"
            />
            <button type="submit" :disabled="!canSend" :aria-label="inputConfig.buttonLabel || '送信'">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m3.5 4 17 8-17 8 3.25-8L3.5 4Z" />
                <path d="M6.75 12H20" />
              </svg>
            </button>
          </span>
        </label>
      </form>
      <button v-else-if="ctaLabel" class="messages__next" type="button" @click="emit('next')">
        <span>{{ ctaLabel }}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
      <!-- Nothing left to tap: the thread has said everything it is going to. -->
      <p v-else-if="footerNote" class="messages__note">{{ footerNote }}</p>
    </footer>
  </section>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { MIZUNO_AVATAR } from './avatars.js'
import { isPlayerSpeaker } from '../../story/player.js'
import ChatLinkCard from './ChatLinkCard.vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  linkCard: { type: Object, default: null },
  waitingInput: { type: Boolean, default: false },
  inputConfig: { type: Object, default: () => ({}) },
  inputValue: { type: String, default: '' },
  canSend: { type: Boolean, default: false },
  ctaLabel: { type: String, default: '次のメッセージ' },
  // Shown in place of the button when there is nothing left to advance.
  footerNote: { type: String, default: '' },
  // The thread was opened on a handset that never had the history.
  freshThread: { type: Boolean, default: false },
  playerName: { type: String, default: '' },
  playerAvatar: { type: String, default: '' }
})

// Whose side of the thread a line belongs to. The speaker id in the script never
// changes; only the name drawn next to it does.
function isMine(message){
  return isPlayerSpeaker(message?.from)
}

const emit = defineEmits([
  'update:input-value',
  'send-input',
  'next',
  'open-url'
])

const scroller = ref(null)
const inputElement = ref(null)

function scrollToLatest(){
  nextTick(() => {
    if(scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
  })
}

watch(() => [props.messages.length, props.waitingInput, props.linkCard?.url], scrollToLatest)
watch(() => props.waitingInput, value => {
  if(value) nextTick(() => inputElement.value?.focus())
})
</script>

<style scoped>
.messages{
  min-width:0;
  min-height:0;
  display:grid;
  grid-template-rows:auto minmax(0, 1fr) auto;
  background:#fff;
}

.messages__header{
  min-width:0;
  display:flex;
  align-items:center;
  gap:12px;
  padding:15px 20px;
  border-bottom:1px solid #e1e7ef;
  background:rgba(255, 255, 255, 0.96);
  z-index:2;
}

.messages__avatar-wrap{
  position:relative;
  width:42px;
  height:42px;
  flex:0 0 auto;
}

.messages__avatar-wrap img{
  width:100%;
  height:100%;
  display:block;
  border-radius:50%;
  object-fit:cover;
}

.messages__online{
  position:absolute;
  right:0;
  bottom:0;
  width:10px;
  height:10px;
  border:2px solid #fff;
  border-radius:50%;
  background:#31b66b;
}

.messages__heading{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:2px;
  flex:1;
}

.messages__heading strong{
  overflow:hidden;
  color:#1b293f;
  font-size:14px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.messages__heading small{
  color:#36a469;
  font-size:10px;
  font-weight:700;
}

.messages__secure{
  display:flex;
  align-items:center;
  gap:5px;
  color:#7a8799;
  font-size:10px;
  font-weight:700;
}

.messages__secure svg{
  width:15px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.7;
}

.messages__scroller{
  min-height:0;
  overflow:auto;
  padding:18px clamp(14px, 3vw, 38px) 24px;
  background:
    radial-gradient(circle at 0 0, rgba(54, 119, 211, 0.045), transparent 33%),
    #fbfcfe;
  scrollbar-color:#c7d2e2 transparent;
}

.messages__day{
  display:flex;
  align-items:center;
  gap:10px;
  margin:2px 0 20px;
  color:#8a96a6;
  font-size:10px;
  font-weight:700;
}

.messages__day::before,
.messages__day::after{
  height:1px;
  background:#e4e9f0;
  content:'';
  flex:1;
}

.message-row{
  max-width:78%;
  display:flex;
  align-items:flex-end;
  gap:8px;
  margin:0 auto 13px 0;
}

.message-row--me{
  /* Reversed rather than reordered: the player's own picture belongs on their
     own side of the thread. */
  flex-direction:row-reverse;
  justify-content:flex-start;
  margin-right:0;
  margin-left:auto;
}

.message-row__avatar{
  width:27px;
  height:27px;
  display:block;
  border-radius:50%;
  object-fit:cover;
  flex:0 0 auto;
}

.message-row__content{
  min-width:0;
  display:flex;
  align-items:flex-start;
  flex-direction:column;
  gap:4px;
}

.message-row--me .message-row__content{
  align-items:flex-end;
}

.message-row__bubble{
  max-width:100%;
  padding:10px 13px;
  border:1px solid #dde5ef;
  border-radius:6px 17px 17px 17px;
  background:#fff;
  color:#25334a;
  box-shadow:0 3px 9px rgba(31, 52, 83, 0.05);
}

.message-row--me .message-row__bubble{
  border-color:#2c6cc6;
  border-radius:17px 6px 17px 17px;
  background:#2c6cc6;
  color:#fff;
}

.message-row__bubble p{
  margin:0;
  font-size:13px;
  line-height:1.65;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
}

.message-row__meta{
  color:#98a2b1;
  font-size:8px;
}

.message-row__media{
  width:min(330px, 100%);
  margin:0;
}

.message-row__media img{
  max-width:100%;
  display:block;
  border-radius:12px;
}

.message-row__media figcaption{
  margin-top:7px;
  font-size:10px;
  line-height:1.5;
  opacity:0.8;
}

.messages__link-card{
  max-width:78%;
  margin:4px 0 16px 35px;
}

.messages__empty{
  display:flex;
  align-items:center;
  justify-content:center;
  flex-direction:column;
  min-height:220px;
  color:#8491a3;
}

.messages__empty span{
  font-size:27px;
  letter-spacing:0.15em;
}

.messages__empty p{
  margin:8px 0 0;
  font-size:12px;
}

.messages__fresh-note{
  width:fit-content;
  max-width:100%;
  margin:0 auto 18px;
  padding:6px 14px;
  border-radius:999px;
  background:#eef2f8;
  color:#7b8899;
  font-size:10px;
  line-height:1.6;
  text-align:center;
}

.messages__composer{
  display:flex;
  justify-content:flex-end;
  padding:13px 18px 16px;
  border-top:1px solid #e2e8f0;
  background:#fff;
}

.composer{
  width:100%;
}

.composer__field{
  display:flex;
  flex-direction:column;
  gap:7px;
}

.composer__helper{
  padding-left:10px;
  color:#64758c;
  font-size:10px;
}

.composer__row{
  display:flex;
  align-items:center;
  gap:8px;
  padding:5px 5px 5px 15px;
  border:1px solid #d8e0eb;
  border-radius:999px;
  background:#f5f7fa;
  transition:border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.composer__row:focus-within{
  border-color:#6d9cdd;
  background:#fff;
  box-shadow:0 0 0 3px rgba(43, 107, 198, 0.13);
}

.composer__row input{
  min-width:0;
  flex:1;
  padding:7px 0;
  border:0;
  outline:0;
  background:transparent;
  color:#24334a;
  font:inherit;
  font-size:13px;
}

.composer__row button{
  width:37px;
  height:37px;
  display:grid;
  place-items:center;
  border:0;
  border-radius:50%;
  background:#2869c7;
  color:#fff;
  cursor:pointer;
  transition:background 180ms ease, transform 180ms ease;
}

.composer__row button:hover:not(:disabled){
  background:#1c57a9;
  transform:scale(1.04);
}

.composer__row button:disabled{
  background:#b8c4d3;
  cursor:not-allowed;
}

.composer__row button:focus-visible,
.messages__next:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.28);
  outline-offset:3px;
}

.composer__row svg{
  width:18px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.7;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.messages__next{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  min-width:150px;
  padding:10px 17px;
  border:0;
  border-radius:999px;
  background:#2869c7;
  color:#fff;
  font-size:12px;
  font-weight:800;
  cursor:pointer;
  box-shadow:0 8px 18px rgba(40, 105, 199, 0.2);
  transition:background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
}

.messages__next:hover{
  background:#1f5cad;
  transform:translateY(-1px);
  box-shadow:0 11px 22px rgba(40, 105, 199, 0.25);
}

.messages__note{
  margin:0;
  padding:3px 2px;
  color:#7c8798;
  font-size:11.5px;
  line-height:1.7;
  text-align:right;
}

.messages__next svg{
  width:16px;
  fill:none;
  stroke:currentColor;
  stroke-width:2;
  stroke-linecap:round;
  stroke-linejoin:round;
}

@media (max-width:620px){
  .messages__header{
    padding:11px 14px;
  }

  .messages__secure{
    display:none;
  }

  .message-row,
  .messages__link-card{
    max-width:91%;
  }

  .messages__link-card{
    margin-left:0;
  }

  .messages__composer{
    padding:10px 11px;
  }
}
</style>
