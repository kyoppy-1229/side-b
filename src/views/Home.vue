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
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ChatBubble from '../components/ChatBubble.vue'
import RetroButton from '../components/RetroButton.vue'
import dm from '../data/dm_prologue.json'

const router = useRouter()
const idx = ref(0)
const visible = computed(()=> dm.slice(0, idx.value+1) )
const isLast = computed(()=> idx.value >= dm.length - 1 )
const ctaLabel = computed(()=> isLast.value ? '復刻版を起動' : '次へ' )

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
    // 最後のクリックで復刻版へ
    router.push('/revival')
  }
}
</script>
