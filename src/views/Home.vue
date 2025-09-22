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
      <RetroButton @click="next">{{ ctaLabel }}</RetroButton>
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
import mizunoAvatar from '../photo/solo/水野ヒロキ.png'

const router = useRouter()
const store = useGameStore()

const dm = computed(() => {
  if(!store.revivalCleared) return dmPrologue
  if(!store.seenBBS) return dmAfter
  return [{ from: '主人公', text: '（ここから先は未実装）' }]
})

const idx = ref(0)
watch(dm, () => { idx.value = 0 })

const visible = computed(()=> dm.value.slice(0, idx.value+1) )
const isLast = computed(()=> idx.value >= dm.value.length - 1 )

const ctaLabel = computed(()=>{
  if(!store.revivalCleared) return isLast.value ? '復刻版を起動' : '次へ'
  if(!store.seenBBS) return isLast.value ? '掲示板へ' : '次へ'
  return '…'
})

const chatRef = ref(null)
function scrollToBottom(){
  nextTick(()=>{
    const el = chatRef.value
    if(el){ el.scrollTop = el.scrollHeight }
  })
}

function next(){
  if(!isLast.value){
    idx.value++
    scrollToBottom()
  } else {
    if(!store.revivalCleared){
      router.push('/revival')
    } else if(!store.seenBBS){
      router.push('/bbs')
    }
  }
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
@media (max-width:640px){
  .dm-header{flex-direction:column;align-items:flex-start;gap:12px}
  .dm-header-text{align-items:flex-start}
  .dm-status{align-self:flex-end}
}
</style>
