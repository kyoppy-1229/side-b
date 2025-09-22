<template>
  <div class="card dm-card">
    <header class="dm-header">
      <div class="dm-header-avatar">
        <img :src="mizunoAvatar" alt="水野ヒロキ" />
      </div>
      <div class="dm-header-text">
        <div class="dm-title">水野ヒロキ</div>
        <div class="dm-subtitle">最近のメッセージ</div>
      </div>
      <div class="dm-status">
        <span class="dm-status-dot"></span>
        <span>オンライン</span>
      </div>
    </header>
    <div class="dm-body">
      <div ref="chatRef" class="chatbox dm-chatbox">
        <ChatBubble
          v-for="(m,idx) in visible"
          :key="idx"
          :from="m.from"
          :text="m.text"
          :me="m.from==='主人公'"
        />
      </div>
    </div>
    <div class="toolbar dm-toolbar">
      <div v-if="isWaitingInput" class="dm-inputbar">
        <input
          ref="inputRef"
          v-model="inputValue"
          class="dm-input"
          type="text"
          :placeholder="inputPlaceholder"
          @keyup.enter="sendInput"
        />
        <RetroButton :disabled="isSendDisabled" @click="sendInput">{{ sendLabel }}</RetroButton>
      </div>
      <RetroButton v-else @click="next">{{ ctaLabel }}</RetroButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../store'
import ChatBubble from '../components/ChatBubble.vue'
import RetroButton from '../components/RetroButton.vue'
import dmPrologue from '../data/dm_prologue.json'
import dmAfter from '../data/dm_after_revival.json'
import dmAfterBBS from '../data/dm_after_bbs.json'
import mizunoAvatar from '../photo/solo/水野ヒロキ.png'

const router = useRouter()
const store = useGameStore()

const dm = computed(() => {
  if(!store.revivalCleared) return dmPrologue
  if(!store.seenBBS) return dmAfter
  return dmAfterBBS
})

const script = ref([])
const idx = ref(-1)
const inputIndex = ref(null)
const inputValue = ref('')
const chatRef = ref(null)
const inputRef = ref(null)

watch(
  dm,
  newVal => {
    script.value = newVal.map(entry => {
      const copy = { ...entry }
      if(entry.input){
        copy.input = { ...entry.input }
        copy.text = entry.text || ''
        copy.sent = false
      }
      return copy
    })
    idx.value = -1
    inputIndex.value = null
    inputValue.value = ''
    revealNext()
  },
  { immediate: true }
)

const visible = computed(() => {
  if(idx.value < 0) return []
  return script.value.slice(0, idx.value + 1).filter(entry => !entry.input || entry.sent)
})

const isLast = computed(() => script.value.length > 0 && idx.value >= script.value.length - 1)

const pendingInput = computed(() => (inputIndex.value === null ? null : script.value[inputIndex.value]))
const isWaitingInput = computed(() => !!pendingInput.value)
const inputPlaceholder = computed(() => pendingInput.value?.input?.placeholder || '')
const sendLabel = computed(() => pendingInput.value?.input?.buttonLabel || '送信')
const isSendDisabled = computed(() => {
  if(!isWaitingInput.value) return true
  const value = inputValue.value.trim()
  if(!value) return true
  const expected = pendingInput.value?.input?.expected
  if(!expected) return false
  return value !== expected
})

const ctaLabel = computed(()=>{
  if(!store.revivalCleared) return isLast.value ? '復刻版を起動' : '次へ'
  if(!store.seenBBS) return isLast.value ? '掲示板へ' : '次へ'
  return isLast.value ? '初期版を起動' : '次へ'
})

function scrollToBottom(){
  nextTick(()=>{
    const el = chatRef.value
    if(el){ el.scrollTop = el.scrollHeight }
  })
}

function next(){
  if(isWaitingInput.value) return
  if(idx.value < script.value.length - 1){
    revealNext()
  } else if(script.value.length){
    if(!store.revivalCleared){
      router.push('/revival')
    } else if(!store.seenBBS){
      router.push('/bbs')
    } else {
      store.routeUnlocked = true
      router.push('/initial')
    }
  }
}

function revealNext(){
  if(!script.value.length) return
  if(idx.value >= script.value.length - 1) return
  const nextIdx = idx.value + 1
  const entry = script.value[nextIdx]
  if(entry?.input && !entry.sent){
    openInput(nextIdx)
    return
  }
  idx.value = nextIdx
  scrollToBottom()
}

function openInput(index){
  inputIndex.value = index
  const entry = script.value[index]
  const defaultText = entry.input?.prefill ?? ''
  inputValue.value = defaultText
  nextTick(() => {
    const el = inputRef.value
    if(el){
      el.focus()
      if(defaultText && el.setSelectionRange){
        const len = defaultText.length
        el.setSelectionRange(len, len)
      }
    }
  })
}

function sendInput(){
  if(!isWaitingInput.value || isSendDisabled.value) return
  const entry = script.value[inputIndex.value]
  entry.text = inputValue.value.trim()
  entry.sent = true
  idx.value = inputIndex.value
  inputIndex.value = null
  inputValue.value = ''
  scrollToBottom()
}
</script>

<style scoped>
.dm-card{
  padding:0;
  border:none;
  border-radius:24px;
  background:linear-gradient(180deg,#fdfdff 0%,#eef3ff 100%);
  box-shadow:0 20px 40px rgba(36,58,125,0.22);
  overflow:hidden;
}
.dm-header{
  display:flex;
  align-items:center;
  gap:16px;
  padding:24px;
  background:linear-gradient(135deg,#4e7eff 0%,#6fc8ff 100%);
  color:#fff;
}
.dm-header-avatar{
  width:56px;
  height:56px;
  border-radius:50%;
  overflow:hidden;
  box-shadow:0 12px 28px rgba(15,29,84,0.35);
  border:3px solid rgba(255,255,255,0.4);
  flex-shrink:0;
}
.dm-header-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.dm-header-text{flex:1;display:flex;flex-direction:column;gap:4px}
.dm-title{font-size:20px;font-weight:700;letter-spacing:0.3px}
.dm-subtitle{font-size:13px;opacity:0.85}
.dm-status{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;letter-spacing:0.4px}
.dm-status-dot{
  width:10px;
  height:10px;
  border-radius:50%;
  background:#8ff0a4;
  box-shadow:0 0 0 4px rgba(143,240,164,0.24);
}
.dm-body{padding:24px;background:transparent}
.dm-chatbox{
  background:#fff;
  border-radius:20px;
  border:1px solid #e0e7ff;
  box-shadow:0 12px 32px rgba(59,92,166,0.12);
  padding:20px 18px;
}
.dm-toolbar{
  padding:20px 24px 24px;
  background:rgba(246,249,255,0.85);
  justify-content:flex-end;
}
.dm-toolbar :deep(.btn){
  border:none;
  border-radius:999px;
  padding:12px 28px;
  font-weight:600;
  letter-spacing:0.2px;
  background:linear-gradient(135deg,#4e7eff 0%,#6f9dff 100%);
  color:#fff;
  box-shadow:0 14px 28px rgba(78,126,255,0.24);
  transition:transform 0.15s ease,box-shadow 0.15s ease;
}
.dm-toolbar :deep(.btn:hover){
  transform:translateY(-1px);
  box-shadow:0 18px 34px rgba(78,126,255,0.3);
}
.dm-toolbar :deep(.btn:active){
  transform:translateY(0);
  box-shadow:0 10px 24px rgba(78,126,255,0.22);
}
.dm-inputbar{
  flex:1;
  display:flex;
  gap:12px;
  align-items:center;
}
.dm-input{
  flex:1;
  padding:12px 18px;
  border-radius:999px;
  border:1px solid #c9d6ff;
  background:#fff;
  font-size:14px;
  color:#27345c;
  box-shadow:inset 0 8px 20px rgba(78,126,255,0.08);
  transition:border-color 0.15s ease,box-shadow 0.15s ease;
}
.dm-input:focus{
  outline:none;
  border-color:#6f9dff;
  box-shadow:0 0 0 3px rgba(111,157,255,0.22);
}
.dm-toolbar :deep(.btn:disabled){
  opacity:0.6;
  cursor:not-allowed;
  transform:none;
  box-shadow:0 10px 24px rgba(78,126,255,0.18);
}
@media (max-width:640px){
  .dm-header{flex-direction:column;align-items:flex-start;gap:12px}
  .dm-header-text{align-items:flex-start}
  .dm-status{align-self:flex-end}
}
</style>
