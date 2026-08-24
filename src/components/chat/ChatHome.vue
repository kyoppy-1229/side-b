<template>
  <section class="home" aria-label="チャットのホーム">
    <header class="home__header">
      <span class="home__heading">
        <small>HOME</small>
        <strong>ホーム</strong>
      </span>
      <span class="home__device" :title="`${NEW_DEVICE.full} で使用中`">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="11.5" rx="1.6" />
          <path d="M1.5 19.5h21" />
        </svg>
        {{ NEW_DEVICE.full }}
      </span>
    </header>

    <div class="home__body">
      <!-- The profile is the only thing the player owns on this machine: the
           account came across from the old PC, the history did not. -->
      <section class="profile">
        <span class="profile__avatar-wrap">
          <img class="profile__avatar" :src="playerAvatar" :alt="`${playerName}のプロフィール画像`" />
          <span class="profile__online" aria-hidden="true"></span>
        </span>
        <span class="profile__copy">
          <small class="profile__eyebrow">この端末のアカウント</small>
          <strong class="profile__name">{{ playerName }}</strong>
          <span class="profile__meta">
            <span class="profile__badge">オンライン</span>
            <span class="profile__id">Chat ID ●●●●●●●●</span>
          </span>
        </span>
        <button type="button" class="profile__rename" @click="dialogOpen = true">名前を変更</button>
      </section>

      <div class="home__grid">
        <div class="home__main">
          <div class="stats">
            <div class="stat">
              <small>会話</small>
              <strong>{{ conversations.length }}</strong>
            </div>
            <div class="stat" :class="{ 'stat--accent': unreadCount > 0 }">
              <small>未読</small>
              <strong>{{ unreadCount }}</strong>
            </div>
            <!-- The contacts came across with the migration, so this is the
                 one tile with something behind it: it opens the address book. -->
            <button type="button" class="stat stat--action" @click="emit('contacts')">
              <small>連絡先</small>
              <strong>{{ CONTACT_COUNT }}</strong>
              <span class="stat__action">一覧を見る</span>
            </button>
          </div>

          <button
            v-if="unreadConversation"
            type="button"
            class="alert"
            @click="emit('select', unreadConversation.id)"
          >
            <span class="alert__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 5.75h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H9l-4.5 3v-3.25A2 2 0 0 1 3 16.25v-8.5a2 2 0 0 1 2-2Z" />
              </svg>
            </span>
            <span class="alert__copy">
              <strong>{{ unreadConversation.name }} から新着メッセージ</strong>
              <small>{{ unreadConversation.preview }}</small>
            </span>
            <span class="alert__open" aria-hidden="true">開く</span>
          </button>

          <section class="recent">
            <header class="recent__head">
              <h2 class="recent__title">最近の会話</h2>
              <span class="recent__count">{{ conversations.length }}件</span>
            </header>

            <nav v-if="conversations.length" class="recent__list" aria-label="最近の会話">
              <button
                v-for="conversation in conversations"
                :key="conversation.id"
                type="button"
                class="recent__row"
                :class="{ 'recent__row--unread': conversation.unread }"
                @click="emit('select', conversation.id)"
              >
                <span class="recent__avatar-wrap">
                  <img :src="conversation.avatar" :alt="`${conversation.name}のアイコン`" />
                  <span v-if="conversation.online" class="recent__online" aria-hidden="true"></span>
                </span>
                <span class="recent__copy">
                  <span class="recent__topline">
                    <strong>{{ conversation.name }}</strong>
                    <small>{{ conversation.timeLabel }}</small>
                  </span>
                  <span class="recent__preview">{{ conversation.unread ? '新着メッセージ' : conversation.preview }}</span>
                </span>
                <span v-if="conversation.unread" class="recent__badge" :aria-label="`${conversation.unread}件の未読`">
                  {{ conversation.unread }}
                </span>
              </button>
            </nav>

            <!-- Nothing here yet, and that is the point: the history stayed on
                 the old machine, so the list starts empty even for an old
                 account. -->
            <div v-else class="recent__empty">
              <span class="recent__empty-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M5 5.75h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H9l-4.5 3v-3.25A2 2 0 0 1 3 16.25v-8.5a2 2 0 0 1 2-2Z" />
                </svg>
              </span>
              <p class="recent__empty-title">まだ会話がありません</p>
              <p class="recent__empty-note">メッセージ履歴は旧PCに保存されていたため、この端末には引き継がれていません。</p>
            </div>
          </section>
        </div>

        <aside class="home__side" aria-label="この端末について">
          <section class="card">
            <h3 class="card__title">この端末</h3>
            <dl class="card__rows">
              <div class="card__row">
                <dt>端末</dt>
                <dd>{{ NEW_DEVICE.full }}</dd>
              </div>
              <div class="card__row">
                <dt>ログイン</dt>
                <dd>{{ LOGIN_LABEL }}</dd>
              </div>
            </dl>
          </section>

          <section class="card">
            <h3 class="card__title">セキュリティ</h3>
            <ul class="card__list">
              <li>
                <span class="card__dot card__dot--ok" aria-hidden="true"></span>
                {{ OLD_DEVICE.full }} のセッションはログアウト済み
              </li>
              <li>
                <span class="card__dot card__dot--ok" aria-hidden="true"></span>
                心当たりのないログインはありません
              </li>
              <li>
                <span class="card__dot" aria-hidden="true"></span>
                会話は仮想ネットワーク内にのみ保存されます
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>

    <ChatNameDialog
      v-if="dialogOpen"
      :name="playerName"
      @close="dialogOpen = false"
      @submit="rename"
    />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { NEW_DEVICE, OLD_DEVICE } from '../../story/devices.js'
import { CONTACT_COUNT } from './contacts.js'
import ChatNameDialog from './ChatNameDialog.vue'

const props = defineProps({
  playerName: { type: String, required: true },
  playerAvatar: { type: String, required: true },
  conversations: { type: Array, default: () => [] },
  // The prologue's middle beat: signed in, nothing in the list, and searching is
  // the thing that has not happened yet.
  searchingPhase: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'rename', 'contacts'])

// The contacts came across with the migration even though the history did not —
// which is exactly why an account this old can show an empty conversation list.
// The list itself is in contacts.js; the count is read off it so the tile and
// the address book can never disagree.
const LOGIN_LABEL = '今日 9:41'
const MIGRATED_ITEMS = Object.freeze(['アカウント情報', '連絡先', '基本設定'])

const dialogOpen = ref(false)

const unreadCount = computed(() => props.conversations.reduce((total, conversation) => total + (conversation.unread || 0), 0))

// The banner announces the arrival the player has not opened yet; the list row
// carries the same unread mark, so closing one does not hide the other.
const unreadConversation = computed(() => props.conversations.find((conversation) => conversation.unread) || null)

function rename(name){
  dialogOpen.value = false
  emit('rename', name)
}
</script>

<style scoped>
.home{
  position:relative;
  min-width:0;
  min-height:0;
  display:grid;
  grid-template-rows:auto minmax(0, 1fr);
  background:#f7f9fc;
}

.home__header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  min-height:73px;
  padding:15px 22px;
  border-bottom:1px solid #e1e7ef;
  background:#fff;
}

.home__heading{
  display:flex;
  flex-direction:column;
  gap:3px;
}

.home__heading small{
  color:#8290a3;
  font-size:8px;
  font-weight:800;
  letter-spacing:0.12em;
}

.home__heading strong{
  color:#24334a;
  font-size:14px;
}

.home__device{
  display:flex;
  align-items:center;
  gap:6px;
  padding:5px 11px;
  border:1px solid #dfe6f0;
  border-radius:999px;
  background:#f8fafd;
  color:#6b7c93;
  font-size:9.5px;
  font-weight:700;
  white-space:nowrap;
}

.home__device svg{
  width:13px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.6;
  stroke-linecap:round;
}

.home__body{
  min-height:0;
  display:flex;
  flex-direction:column;
  overflow:auto;
  padding:20px 22px 26px;
}

/* ---- profile band --------------------------------------------------- */
.profile{
  display:flex;
  align-items:center;
  gap:16px;
  padding:18px;
  border:1px solid #e2e8f1;
  border-radius:18px;
  background:
    radial-gradient(120% 160% at 0% 0%, rgba(54, 119, 211, 0.09), rgba(255, 255, 255, 0) 62%),
    #fff;
  box-shadow:0 8px 24px rgba(35, 55, 85, 0.05);
}

.profile__avatar-wrap{
  position:relative;
  width:62px;
  height:62px;
  flex:0 0 auto;
}

.profile__avatar{
  width:100%;
  height:100%;
  display:block;
  border:3px solid #fff;
  border-radius:50%;
  object-fit:cover;
  background:#dbe3ee;
  box-shadow:0 7px 18px rgba(36, 53, 78, 0.16);
}

.profile__online{
  position:absolute;
  right:1px;
  bottom:2px;
  width:12px;
  height:12px;
  border:2.5px solid #fff;
  border-radius:50%;
  background:#31b66b;
}

.profile__copy{
  min-width:0;
  flex:1;
  display:flex;
  flex-direction:column;
  gap:3px;
}

.profile__eyebrow{
  color:#8492a6;
  font-size:9px;
  font-weight:700;
  letter-spacing:0.06em;
}

.profile__name{
  overflow:hidden;
  color:#1c2b41;
  font-size:19px;
  line-height:1.3;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.profile__meta{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:8px;
  margin-top:2px;
}

.profile__badge{
  padding:2px 8px;
  border-radius:999px;
  background:#e6f6ec;
  color:#2e7d52;
  font-size:9px;
  font-weight:800;
}

.profile__id{
  color:#8b99ad;
  font-size:9px;
  font-weight:600;
  letter-spacing:0.1em;
}

.profile__rename{
  flex:0 0 auto;
  padding:9px 14px;
  border:1px solid #cddaea;
  border-radius:11px;
  background:#fff;
  color:#2b5fa8;
  font:inherit;
  font-size:10.5px;
  font-weight:800;
  cursor:pointer;
  transition:background 180ms ease, border-color 180ms ease;
}

.profile__rename:hover{
  border-color:#a9c3e4;
  background:#eff5fd;
}

.profile__rename:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.28);
  outline-offset:2px;
}

/* ---- two columns, so the window is not half empty ------------------- */
/* The columns stretch and the conversation card grows into whatever is left, so
   a nearly empty account still fills the window instead of leaving a bare strip
   down the right-hand side. */
.home__grid{
  flex:1;
  min-height:0;
  display:grid;
  grid-template-columns:minmax(0, 1fr) minmax(232px, 268px);
  align-items:stretch;
  gap:16px;
  margin-top:16px;
}

.home__main{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:14px;
}

.home__side{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:12px;
}

/* ---- stat tiles ----------------------------------------------------- */
.stats{
  display:grid;
  grid-template-columns:repeat(3, minmax(0, 1fr));
  gap:10px;
}

.stat{
  display:flex;
  flex-direction:column;
  gap:3px;
  padding:12px 14px;
  border:1px solid #e4e9f1;
  border-radius:14px;
  background:#fff;
}

.stat small{
  color:#8492a6;
  font-size:9px;
  font-weight:800;
  letter-spacing:0.06em;
}

.stat strong{
  color:#22314a;
  font-size:20px;
  line-height:1.1;
  font-variant-numeric:tabular-nums;
}

.stat--accent strong{
  color:#2869c7;
}

.stat--action{
  align-items:flex-start;
  font:inherit;
  text-align:left;
  cursor:pointer;
  transition:border-color 180ms ease, background 180ms ease;
}

.stat--action:hover{
  border-color:#c9dbf4;
  background:#f7fbff;
}

.stat--action:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.28);
  outline-offset:2px;
}

.stat__action{
  margin-top:1px;
  color:#2b5fa8;
  font-size:9px;
  font-weight:800;
}

/* ---- new-message banner --------------------------------------------- */
.alert{
  width:100%;
  display:flex;
  align-items:center;
  gap:11px;
  padding:12px 14px;
  border:1px solid #cddcf2;
  border-radius:14px;
  background:#eef5ff;
  color:#1f3557;
  text-align:left;
  cursor:pointer;
  animation:alert-in 320ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
  transition:background 180ms ease, border-color 180ms ease;
}

@keyframes alert-in{
  from{ opacity:0; transform:translateY(-6px); }
  to{ opacity:1; transform:none; }
}

.alert:hover{
  border-color:#a9c6ee;
  background:#e5efff;
}

.alert:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.28);
  outline-offset:2px;
}

.alert__mark{
  width:32px;
  height:32px;
  flex:0 0 auto;
  display:grid;
  place-items:center;
  border-radius:10px;
  background:#2869c7;
  color:#fff;
}

.alert__mark svg{
  width:17px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linejoin:round;
}

.alert__copy{
  min-width:0;
  flex:1;
  display:flex;
  flex-direction:column;
  gap:2px;
}

.alert__copy strong{
  font-size:11px;
}

.alert__copy small{
  overflow:hidden;
  color:#5c7291;
  font-size:10px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.alert__open{
  flex:0 0 auto;
  color:#2b5fa8;
  font-size:10px;
  font-weight:800;
}

/* ---- recent conversations ------------------------------------------- */
.recent{
  flex:1;
  min-height:190px;
  display:flex;
  flex-direction:column;
  padding:14px;
  border:1px solid #e4e9f1;
  border-radius:16px;
  background:#fff;
}

.recent__head{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  margin-bottom:10px;
  padding:0 2px;
}

.recent__title{
  margin:0;
  color:#78879a;
  font-size:10px;
  font-weight:800;
  letter-spacing:0.08em;
  text-transform:uppercase;
}

.recent__count{
  color:#9aa7b8;
  font-size:9.5px;
  font-variant-numeric:tabular-nums;
}

.recent__list{
  flex:0 0 auto;
  display:flex;
  flex-direction:column;
  gap:5px;
}

.recent__row{
  width:100%;
  min-width:0;
  display:grid;
  grid-template-columns:42px minmax(0, 1fr) auto;
  align-items:center;
  gap:11px;
  padding:10px;
  border:1px solid #eef1f6;
  border-radius:14px;
  background:#fff;
  color:#26344a;
  text-align:left;
  cursor:pointer;
  transition:background 180ms ease, border-color 180ms ease;
}

.recent__row:hover{
  border-color:#cedcee;
  background:#f6f9fd;
}

.recent__row:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.28);
  outline-offset:2px;
}

.recent__row--unread{
  border-color:#c9dbf4;
  background:#f7fbff;
}

.recent__avatar-wrap{
  position:relative;
  width:42px;
  height:42px;
}

.recent__avatar-wrap img{
  width:100%;
  height:100%;
  display:block;
  border-radius:50%;
  object-fit:cover;
  background:#d7e0ec;
}

.recent__online{
  position:absolute;
  right:0;
  bottom:1px;
  width:10px;
  height:10px;
  border:2px solid #fff;
  border-radius:50%;
  background:#31b66b;
}

.recent__copy{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:3px;
}

.recent__topline{
  min-width:0;
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:6px;
}

.recent__topline strong{
  overflow:hidden;
  font-size:13px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.recent__topline small{
  color:#8793a4;
  font-size:9px;
  white-space:nowrap;
}

.recent__preview{
  overflow:hidden;
  color:#758398;
  font-size:11px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.recent__row--unread .recent__preview{
  color:#2b5fa8;
  font-weight:700;
}

.recent__badge{
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

.recent__empty{
  flex:1;
  display:grid;
  place-content:center;
  padding:26px 16px 24px;
  border:1px dashed #dde5ef;
  border-radius:14px;
  background:#fbfcfe;
  text-align:center;
}

.recent__empty-mark{
  width:38px;
  height:38px;
  margin:0 auto 10px;
  display:grid;
  place-items:center;
  border-radius:12px;
  background:#eef2f8;
  color:#a8b6c9;
}

.recent__empty-mark svg{
  width:19px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.7;
  stroke-linejoin:round;
}

.recent__empty-title{
  margin:0;
  color:#5d6d84;
  font-size:12px;
  font-weight:700;
}

.recent__empty-note{
  margin:8px auto 0;
  max-width:340px;
  color:#8492a6;
  font-size:10px;
  line-height:1.7;
}

.recent__empty-hint{
  margin:14px 0 0;
  color:#2b5fa8;
  font-size:10px;
  font-weight:700;
}

/* ---- side cards ----------------------------------------------------- */
.card{
  padding:14px;
  border:1px solid #e4e9f1;
  border-radius:16px;
  background:#fff;
}

.card__title{
  margin:0 0 10px;
  color:#78879a;
  font-size:10px;
  font-weight:800;
  letter-spacing:0.08em;
  text-transform:uppercase;
}

.card__rows{
  margin:0;
  display:flex;
  flex-direction:column;
}

.card__row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:7px 0;
}

.card__row + .card__row{
  border-top:1px solid #f0f3f8;
}

.card__row dt{
  color:#8492a6;
  font-size:9.5px;
}

.card__row dd{
  margin:0;
  color:#2a3a53;
  font-size:10.5px;
  font-weight:700;
  text-align:right;
}

.card__warn{
  color:#b07a3a !important;
}

.card__note{
  margin:12px 0 8px;
  color:#8492a6;
  font-size:9px;
  font-weight:700;
  letter-spacing:0.04em;
}

.card__chips{
  display:flex;
  flex-wrap:wrap;
  gap:5px;
  margin:0;
  padding:0;
  list-style:none;
}

.card__chips li{
  padding:4px 9px;
  border:1px solid #e0e7f1;
  border-radius:999px;
  background:#f6f9fd;
  color:#54677f;
  font-size:9.5px;
  font-weight:700;
}

.card__list{
  margin:0;
  padding:0;
  list-style:none;
  display:flex;
  flex-direction:column;
  gap:9px;
}

.card__list li{
  display:flex;
  align-items:flex-start;
  gap:8px;
  color:#65758c;
  font-size:10px;
  line-height:1.6;
}

.card__dot{
  width:6px;
  height:6px;
  margin-top:5px;
  flex:0 0 auto;
  border-radius:50%;
  background:#c3cddb;
}

.card__dot--ok{
  background:#41ac6d;
}

@media (max-width:860px){
  .home__grid{
    grid-template-columns:minmax(0, 1fr);
  }
}

@media (max-width:560px){
  .home__body{
    padding:16px 14px 22px;
  }

  .profile{
    flex-wrap:wrap;
  }

  .profile__rename{
    width:100%;
  }

  .stats{
    grid-template-columns:repeat(3, minmax(0, 1fr));
    gap:6px;
  }

  .home__device{
    display:none;
  }
}

@media (prefers-reduced-motion:reduce){
  .alert{
    animation:none;
  }
}
</style>
