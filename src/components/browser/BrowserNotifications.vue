<template>
  <div ref="notificationRoot" class="browser-notifications" @keydown.esc="closePanel">
    <button
      ref="bellButton"
      class="notification-button"
      :class="{ 'has-unread': unreadCount > 0 }"
      type="button"
      aria-label="通知を表示"
      aria-haspopup="dialog"
      :aria-expanded="open"
      title="通知"
      @click="emit('toggle')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 16.5h11l-1.2-2V10a4.3 4.3 0 0 0-8.6 0v4.5l-1.2 2Z" />
        <path d="M10 19h4" />
      </svg>
      <span v-if="unreadCount" class="notification-count" :aria-label="`未読${unreadCount}件`">
        {{ unreadLabel }}
      </span>
    </button>

    <Transition name="notification-panel">
      <section
        v-if="open"
        class="notification-panel"
        role="dialog"
        aria-label="通知一覧"
      >
        <header class="notification-header">
          <div>
            <strong>通知</strong>
            <span>{{ unreadCount ? `未読 ${unreadCount}件` : 'すべて確認済み' }}</span>
          </div>
          <button
            v-if="unreadCount"
            class="mark-read-button"
            type="button"
            @click="emit('mark-read')"
          >
            既読にする
          </button>
        </header>

        <button
          v-if="unreadCount"
          class="notification-item"
          type="button"
          @click="emit('open-messages')"
        >
          <span class="item-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 5.5h14v10H9l-4 3v-13Z" />
              <path d="M8 9h8M8 12h5" />
            </svg>
          </span>
          <span class="item-copy">
            <strong>Messages</strong>
            <span>新しいメッセージが届いています</span>
          </span>
          <span class="item-count">{{ unreadLabel }}</span>
        </button>

        <div v-else class="notification-empty">
          <span class="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m6.5 12 3.5 3.5 7.5-8" />
            </svg>
          </span>
          <strong>新しい通知はありません</strong>
          <span>調査を続けると、ここに更新が表示されます。</span>
        </div>
      </section>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  unreadCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle', 'close', 'open-messages', 'mark-read'])
const notificationRoot = ref(null)
const bellButton = ref(null)
const unreadLabel = computed(() => props.unreadCount > 99 ? '99+' : String(Math.max(0, props.unreadCount)))

function handleOutsidePointer(event){
  if(props.open && !notificationRoot.value?.contains(event.target)) emit('close')
}

function closePanel(){
  if(!props.open) return
  emit('close')
  bellButton.value?.focus()
}

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsidePointer))
</script>

<style scoped>
.browser-notifications{
  position:relative;
}

.notification-button{
  position:relative;
  display:grid;
  place-items:center;
  width:34px;
  height:34px;
  padding:0;
  border:1px solid transparent;
  border-radius:11px;
  background:transparent;
  color:#475569;
  transition:color 180ms ease, background 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.notification-button:hover,
.notification-button[aria-expanded='true']{
  border-color:#dbeafe;
  background:#eff6ff;
  color:#1d4ed8;
}

.notification-button:active{
  transform:scale(.93);
}

.notification-button:focus-visible,
.mark-read-button:focus-visible,
.notification-item:focus-visible{
  outline:2px solid var(--browser-primary, #2563eb);
  outline-offset:2px;
}

.notification-button svg{
  width:20px;
  height:20px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.notification-button.has-unread svg{
  animation:bell-arrival 700ms ease 1;
}

.notification-count{
  position:absolute;
  top:-4px;
  right:-5px;
  display:grid;
  place-items:center;
  min-width:18px;
  height:18px;
  padding:0 4px;
  border:2px solid #f8fafc;
  border-radius:999px;
  background:#dc2626;
  color:#fff;
  font-size:9px;
  font-weight:800;
  line-height:1;
}

.notification-panel{
  position:absolute;
  top:42px;
  right:0;
  z-index:40;
  width:min(350px, calc(100vw - 24px));
  overflow:hidden;
  border:1px solid #dbe3ed;
  border-radius:16px;
  background:#fff;
  color:#1e293b;
  box-shadow:0 20px 50px rgba(15,23,42,.2), 0 2px 8px rgba(15,23,42,.08);
  transform-origin:top right;
}

.notification-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  min-height:58px;
  padding:10px 14px;
  border-bottom:1px solid #e2e8f0;
  background:#f8fafc;
}

.notification-header div,
.item-copy{
  display:flex;
  flex-direction:column;
  min-width:0;
}

.notification-header strong{
  font-size:13px;
}

.notification-header span{
  margin-top:2px;
  color:#64748b;
  font-size:10px;
  font-weight:600;
}

.mark-read-button{
  padding:7px 9px;
  border:0;
  border-radius:8px;
  background:transparent;
  color:#2563eb;
  font-size:11px;
  font-weight:700;
  transition:background 180ms ease;
}

.mark-read-button:hover{
  background:#dbeafe;
}

.notification-item{
  display:flex;
  align-items:center;
  gap:11px;
  width:100%;
  padding:13px 14px;
  border:0;
  background:#fff;
  color:#1e293b;
  text-align:left;
  transition:background 180ms ease;
}

.notification-item:hover{
  background:#eff6ff;
}

.item-icon,
.empty-icon{
  display:grid;
  place-items:center;
  width:36px;
  height:36px;
  border-radius:11px;
  background:#dbeafe;
  color:#2563eb;
  flex:0 0 auto;
}

.item-icon svg,
.empty-icon svg{
  width:20px;
  height:20px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.item-copy strong{
  font-size:12px;
}

.item-copy span{
  overflow:hidden;
  margin-top:3px;
  color:#64748b;
  font-size:11px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.item-count{
  display:grid;
  place-items:center;
  min-width:22px;
  height:22px;
  padding:0 6px;
  border-radius:999px;
  background:#2563eb;
  color:#fff;
  font-size:10px;
  font-weight:800;
}

.notification-empty{
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:24px 18px 26px;
  text-align:center;
}

.notification-empty strong{
  margin-top:10px;
  font-size:12px;
}

.notification-empty > span:last-child{
  max-width:240px;
  margin-top:4px;
  color:#64748b;
  font-size:10px;
  line-height:1.5;
}

.notification-panel-enter-active,
.notification-panel-leave-active{
  transition:opacity 180ms ease, transform 180ms ease;
}

.notification-panel-enter-from,
.notification-panel-leave-to{
  opacity:0;
  transform:translateY(-5px) scale(.98);
}

@keyframes bell-arrival{
  0%,100%{transform:rotate(0)}
  25%{transform:rotate(12deg)}
  55%{transform:rotate(-10deg)}
  80%{transform:rotate(5deg)}
}

@media (prefers-reduced-motion:reduce){
  .notification-button,
  .mark-read-button,
  .notification-item,
  .notification-button.has-unread svg,
  .notification-panel-enter-active,
  .notification-panel-leave-active{
    transition:none;
    animation:none;
  }
}
</style>
