<template>
  <div class="card">
    <h2>DM — 水野ヒロキ</h2>
    <div class="hr"></div>
    <div ref="chatRef" class="chatbox">
      <ChatBubble
        v-for="(m,idx) in visible"
        :key="idx"
        :from="m.from"
        :text="m.text"
        :me="m.from==='主人公'"
      />
    </div>
    <div class="toolbar">
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
