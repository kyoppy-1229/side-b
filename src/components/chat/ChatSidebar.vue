<template>
  <aside class="chat-sidebar" aria-label="会話一覧">
    <div class="chat-sidebar__brand">
      <span class="chat-sidebar__brand-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 5.75h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H9l-4.5 3v-3.25A2 2 0 0 1 3 16.25v-8.5a2 2 0 0 1 2-2Z" />
        </svg>
      </span>
      <span class="chat-sidebar__brand-copy">
        <strong>Messages</strong>
        <small>RE:TRACE</small>
      </span>
    </div>

    <label class="chat-sidebar__search">
      <span class="visually-hidden">会話を検索</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <input v-model="filter" type="search" placeholder="会話を検索" />
    </label>

    <!-- The home entry is how the player gets back to their profile — and to
         the name they can change again — once a thread is open. -->
    <nav class="chat-sidebar__nav" aria-label="チャットのナビゲーション">
      <button
        type="button"
        class="chat-sidebar__home"
        :class="{ 'chat-sidebar__home--active': homeActive }"
        :aria-current="homeActive ? 'page' : undefined"
        @click="emit('home')"
      >
        <span class="chat-sidebar__home-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M4.5 10.5 12 4.5l7.5 6" />
            <path d="M6.5 9.8V19h11V9.8" />
          </svg>
        </span>
        <span class="chat-sidebar__home-label">ホーム</span>
      </button>

      <!-- The address book came across with the migration even though the
           history did not, so it is reachable from anywhere in the app. -->
      <button
        type="button"
        class="chat-sidebar__home"
        :class="{ 'chat-sidebar__home--active': contactsActive }"
        :aria-current="contactsActive ? 'page' : undefined"
        @click="emit('contacts')"
      >
        <span class="chat-sidebar__home-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="9.5" r="3.2" />
            <path d="M5.5 19.2c0-3.1 2.9-5 6.5-5s6.5 1.9 6.5 5" />
          </svg>
        </span>
        <span class="chat-sidebar__home-label">連絡先</span>
      </button>
    </nav>

    <div class="chat-sidebar__section-label">最近の会話</div>
    <nav class="chat-sidebar__list" aria-label="最近の会話">
      <button
        v-for="conversation in filteredConversations"
        :key="conversation.id"
        class="conversation"
        :class="{ 'conversation--active': conversation.id === activeId }"
        type="button"
        :aria-current="conversation.id === activeId ? 'page' : undefined"
        @click="emit('select', conversation.id)"
      >
        <span class="conversation__avatar-wrap">
          <img class="conversation__avatar" :src="conversation.avatar" :alt="`${conversation.name}のアイコン`" />
          <span v-if="conversation.online" class="conversation__online" aria-label="オンライン"></span>
        </span>
        <span class="conversation__copy">
          <span class="conversation__topline">
            <strong>{{ conversation.name }}</strong>
            <small>{{ conversation.timeLabel }}</small>
          </span>
          <span class="conversation__preview">{{ conversation.preview }}</span>
        </span>
        <span v-if="conversation.unread" class="conversation__badge" :aria-label="`${conversation.unread}件の未読`">
          {{ conversation.unread }}
        </span>
      </button>
    </nav>

    <p v-if="!conversations.length" class="chat-sidebar__empty">まだ会話がありません</p>
    <p v-else-if="!filteredConversations.length" class="chat-sidebar__empty">一致する会話はありません</p>

    <button type="button" class="chat-sidebar__profile" @click="emit('home')">
      <img :src="playerAvatar" :alt="`${playerName}のプロフィール画像`" />
      <span class="chat-sidebar__profile-copy">
        <strong>{{ playerName }}</strong>
        <small>プロフィール</small>
      </span>
    </button>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  conversations: { type: Array, default: () => [] },
  activeId: { type: String, default: '' },
  homeActive: { type: Boolean, default: false },
  contactsActive: { type: Boolean, default: false },
  playerName: { type: String, default: '' },
  playerAvatar: { type: String, default: '' }
})

const emit = defineEmits(['select', 'home', 'contacts'])
const filter = ref('')

const filteredConversations = computed(() => {
  const query = filter.value.trim().toLocaleLowerCase('ja')
  if(!query) return props.conversations
  return props.conversations.filter(conversation => {
    return `${conversation.name} ${conversation.preview}`.toLocaleLowerCase('ja').includes(query)
  })
})
</script>

<style scoped>
.chat-sidebar{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:14px;
  padding:20px 14px;
  background:#f4f7fb;
  border-right:1px solid #dce4ef;
}

.chat-sidebar__brand{
  display:flex;
  align-items:center;
  gap:11px;
  padding:0 6px 8px;
}

.chat-sidebar__brand-icon{
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

.chat-sidebar__brand-icon svg{
  width:21px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linejoin:round;
}

.chat-sidebar__brand-copy{
  min-width:0;
  display:flex;
  flex-direction:column;
  line-height:1.15;
}

.chat-sidebar__brand-copy strong{
  color:#17253a;
  font-size:16px;
}

.chat-sidebar__brand-copy small{
  margin-top:3px;
  color:#74849a;
  font-size:9px;
  font-weight:800;
  letter-spacing:0.14em;
}

.chat-sidebar__search{
  display:flex;
  align-items:center;
  gap:8px;
  padding:9px 11px;
  border:1px solid transparent;
  border-radius:12px;
  background:#e8eef6;
  color:#6d7f96;
  transition:border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.chat-sidebar__search:focus-within{
  border-color:#6d9cdd;
  background:#fff;
  box-shadow:0 0 0 3px rgba(43, 107, 198, 0.14);
}

.chat-sidebar__search svg{
  width:17px;
  flex:0 0 auto;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
}

.chat-sidebar__search input{
  min-width:0;
  width:100%;
  padding:0;
  border:0;
  outline:0;
  background:transparent;
  color:#24334a;
  font:inherit;
  font-size:12px;
}

.chat-sidebar__nav{
  display:flex;
  flex-direction:column;
  gap:4px;
}

.chat-sidebar__home{
  width:100%;
  display:flex;
  align-items:center;
  gap:10px;
  padding:9px 10px;
  border:1px solid transparent;
  border-radius:12px;
  background:transparent;
  color:#3c4d66;
  font:inherit;
  font-size:12px;
  font-weight:700;
  text-align:left;
  cursor:pointer;
  transition:background 180ms ease, border-color 180ms ease;
}

.chat-sidebar__home:hover{
  background:#e8eff8;
}

.chat-sidebar__home--active{
  border-color:#c9d9ee;
  background:#fff;
  color:#24334a;
  box-shadow:0 6px 16px rgba(43, 67, 99, 0.08);
}

.chat-sidebar__home:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.28);
  outline-offset:2px;
}

.chat-sidebar__home-icon{
  width:30px;
  height:30px;
  flex:0 0 auto;
  display:grid;
  place-items:center;
  border-radius:10px;
  background:#e3ebf6;
  color:#3e6fae;
}

.chat-sidebar__home-icon svg{
  width:16px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.chat-sidebar__profile{
  width:100%;
  display:flex;
  align-items:center;
  gap:10px;
  margin-top:auto;
  padding:9px 10px;
  border:1px solid transparent;
  border-radius:14px;
  background:transparent;
  color:#26344a;
  font:inherit;
  text-align:left;
  cursor:pointer;
  transition:background 180ms ease, border-color 180ms ease;
}

.chat-sidebar__profile:hover{
  border-color:#d5e0ee;
  background:#fff;
}

.chat-sidebar__profile:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.28);
  outline-offset:2px;
}

.chat-sidebar__profile img{
  width:34px;
  height:34px;
  flex:0 0 auto;
  display:block;
  border-radius:50%;
  object-fit:cover;
  background:#d7e0ec;
}

.chat-sidebar__profile-copy{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:1px;
}

.chat-sidebar__profile-copy strong{
  overflow:hidden;
  font-size:12px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.chat-sidebar__profile-copy small{
  color:#8793a4;
  font-size:9px;
}

.chat-sidebar__section-label{
  padding:0 7px;
  color:#78879a;
  font-size:10px;
  font-weight:800;
  letter-spacing:0.08em;
  text-transform:uppercase;
}

.chat-sidebar__list{
  display:flex;
  flex-direction:column;
  gap:5px;
}

.conversation{
  width:100%;
  min-width:0;
  display:grid;
  grid-template-columns:42px minmax(0, 1fr) auto;
  align-items:center;
  gap:10px;
  padding:10px;
  border:1px solid transparent;
  border-radius:14px;
  background:transparent;
  color:#26344a;
  text-align:left;
  cursor:pointer;
  transition:background 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.conversation:hover{
  background:#e8eff8;
}

.conversation--active{
  border-color:#c9d9ee;
  background:#fff;
  box-shadow:0 6px 16px rgba(43, 67, 99, 0.08);
}

.conversation:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.28);
  outline-offset:2px;
}

.conversation__avatar-wrap{
  position:relative;
  width:42px;
  height:42px;
}

.conversation__avatar{
  width:100%;
  height:100%;
  display:block;
  border-radius:50%;
  object-fit:cover;
  background:#d7e0ec;
}

.conversation__online{
  position:absolute;
  right:0;
  bottom:1px;
  width:10px;
  height:10px;
  border:2px solid #fff;
  border-radius:50%;
  background:#31b66b;
}

.conversation__copy{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:3px;
}

.conversation__topline{
  min-width:0;
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:6px;
}

.conversation__topline strong{
  overflow:hidden;
  font-size:13px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.conversation__topline small{
  color:#8793a4;
  font-size:9px;
  white-space:nowrap;
}

.conversation__preview{
  overflow:hidden;
  color:#758398;
  font-size:11px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.conversation__badge{
  min-width:19px;
  height:19px;
  display:grid;
  place-items:center;
  padding:0 5px;
  border-radius:999px;
  background:#2869c7;
  color:#fff;
  font-size:10px;
  font-weight:800;
}

.chat-sidebar__empty{
  margin:8px;
  color:#7b899b;
  font-size:11px;
  line-height:1.5;
}

.visually-hidden{
  position:absolute;
  width:1px;
  height:1px;
  padding:0;
  margin:-1px;
  overflow:hidden;
  clip:rect(0, 0, 0, 0);
  white-space:nowrap;
  border:0;
}

@media (max-width:760px){
  .chat-sidebar{
    align-items:center;
    padding:16px 8px;
  }

  .chat-sidebar__brand{
    padding:0 0 8px;
  }

  .chat-sidebar__brand-copy,
  .chat-sidebar__search,
  .chat-sidebar__section-label,
  .chat-sidebar__home-label,
  .chat-sidebar__profile-copy,
  .conversation__copy,
  .conversation__badge,
  .chat-sidebar__empty{
    display:none;
  }

  .chat-sidebar__home,
  .chat-sidebar__profile{
    width:48px;
    justify-content:center;
    padding:6px;
  }

  .conversation{
    display:block;
    width:48px;
    height:48px;
    padding:3px;
    border-radius:16px;
  }

  .conversation__avatar-wrap{
    width:40px;
    height:40px;
  }
}

@media (max-width:520px){
  .chat-sidebar{
    display:none;
  }
}
</style>
