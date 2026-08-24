<template>
  <section class="contacts" aria-label="連絡先">
    <header class="contacts__header">
      <span class="contacts__heading">
        <small>CONTACTS</small>
        <strong>連絡先</strong>
      </span>
      <span class="contacts__count">
        <strong>{{ CONTACT_COUNT }}</strong>
        <small>件</small>
      </span>
    </header>

    <div class="contacts__body">
      <div class="pane">
        <!-- The toolbar stays put while the list scrolls under it: with fourteen
             names the search box is the first thing the player reaches for. -->
        <div class="toolbar">
          <label class="search">
            <span class="visually-hidden">連絡先を検索</span>
            <svg class="search__icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              v-model="filter"
              type="text"
              inputmode="search"
              placeholder="名前・IDで検索"
              @keydown.down.prevent="moveSelection(1)"
              @keydown.up.prevent="moveSelection(-1)"
              @keydown.esc.prevent="filter = ''"
            />
            <button
              v-if="filter"
              type="button"
              class="search__clear"
              aria-label="検索条件をクリア"
              @click="filter = ''"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 7 10 10M17 7 7 17" />
              </svg>
            </button>
          </label>

          <div class="tabs" role="group" aria-label="連絡先の種別でしぼりこむ">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="tab"
              :class="{ 'tab--active': tab.id === activeTab }"
              :aria-pressed="tab.id === activeTab"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
              <small>{{ tab.count }}</small>
            </button>
          </div>
        </div>

        <div
          ref="scroller"
          class="scroller"
          @keydown.down.prevent="moveSelection(1)"
          @keydown.up.prevent="moveSelection(-1)"
        >
          <p v-if="filter" class="result-line" role="status">
            「{{ filter }}」に一致：{{ flatVisible.length }}件
          </p>

          <div v-if="visibleGroups.length" class="groups">
            <section v-for="group in visibleGroups" :key="group.id" class="group">
              <header class="group__head">
                <h2 class="group__title">{{ group.label }}</h2>
                <span class="group__count">{{ group.contacts.length }}件</span>
              </header>

              <nav class="group__list" :aria-label="group.label">
                <button
                  v-for="contact in group.contacts"
                  :key="contact.id"
                  :data-contact-id="contact.id"
                  type="button"
                  class="row"
                  :class="{ 'row--active': contact.id === selectedId }"
                  :aria-current="contact.id === selectedId ? 'true' : undefined"
                  @click="selectedId = contact.id"
                >
                  <span class="row__avatar-wrap">
                    <img v-if="contact.avatar" :src="contact.avatar" :alt="`${contact.name}のアイコン`" />
                    <span
                      v-else
                      class="row__initial"
                      :style="{ background: contact.accent || '#5b6b83' }"
                      aria-hidden="true"
                    >{{ contact.initial }}</span>
                    <span v-if="contact.online" class="row__online" aria-hidden="true"></span>
                  </span>

                  <span class="row__copy">
                    <span class="row__topline">
                      <strong class="row__name">{{ contact.name }}</strong>
                      <small v-if="contact.official" class="chip chip--official">公式</small>
                      <!-- The one contact with history on this handset is worth
                           calling out in the list, not only in the detail pane. -->
                      <small v-else-if="threadIds.has(contact.conversationId)" class="chip chip--thread">トークあり</small>
                    </span>
                    <span class="row__handle">{{ contact.handle }}</span>
                    <span class="row__comment" :class="{ 'row__comment--unset': !contact.comment }">
                      {{ contact.comment || '一言メッセージは設定されていません' }}
                    </span>
                  </span>

                  <span class="row__chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="m10 8 5 4-5 4" /></svg>
                  </span>
                </button>
              </nav>
            </section>
          </div>

          <div v-else class="empty">
            <span class="empty__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
            </span>
            <p class="empty__title">一致する連絡先はありません</p>
            <button type="button" class="empty__reset" @click="resetFilters">条件をクリアする</button>
          </div>
        </div>
      </div>

      <aside class="detail" aria-label="連絡先の詳細">
        <template v-if="selected">
          <div class="detail__card">
            <span class="detail__avatar-wrap">
              <img v-if="selected.avatar" :src="selected.avatar" :alt="`${selected.name}のプロフィール画像`" />
              <span
                v-else
                class="detail__initial"
                :style="{ background: selected.accent || '#5b6b83' }"
                aria-hidden="true"
              >{{ selected.initial }}</span>
              <span v-if="selected.online" class="detail__online" aria-hidden="true"></span>
            </span>
            <strong class="detail__name">{{ selected.name }}</strong>
            <span class="detail__handle">{{ selected.handle }}</span>
            <span class="detail__badge" :class="{ 'detail__badge--official': selected.official }">
              {{ selected.official ? '公式アカウント' : selected.note }}
            </span>
            <p v-if="selected.comment" class="detail__comment">「{{ selected.comment }}」</p>
          </div>

          <dl class="detail__rows">
            <div class="detail__row">
              <dt>種別</dt>
              <dd>{{ selected.note }}</dd>
            </div>
          </dl>

          <div class="detail__actions">
            <button v-if="hasThread" type="button" class="detail__action" @click="emit('select', selected.conversationId)">
              トークを開く
            </button>

            <!-- Not a missing feature. The button works — what it opens is the
                 protagonist deciding not to write, in his own words. -->
            <template v-else>
              <button type="button" class="detail__action detail__action--quiet" @click="speakHold">
                <span class="detail__lock" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <rect x="5.5" y="10.5" width="13" height="9" rx="1.8" />
                    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
                  </svg>
                </span>
                メッセージを送る
              </button>
              <button
                v-if="selected.url"
                type="button"
                class="detail__action detail__action--ghost"
                @click="emit('open-url', selected.url)"
              >
                サイトを開く
              </button>
            </template>
          </div>
        </template>

        <p v-else class="detail__muted">連絡先を選ぶと詳細が表示されます。</p>
      </aside>
    </div>

    <!-- He talks himself out of it. The card sits over the screen in the same
         voice the browser tutorial uses, so it reads as the protagonist
         thinking rather than as the app refusing. -->
    <Transition name="say">
      <aside v-if="spoken" class="say" role="status" :aria-label="`${speakerName}の独白`">
        <button type="button" class="say__card" @click="dismissSpoken">
          <span class="say__speaker">{{ speakerName }}</span>
          <span class="say__text">{{ spoken.text }}</span>
          <span class="say__hint" aria-hidden="true">クリックで閉じる</span>
        </button>
      </aside>
    </Transition>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useStoryStore } from '../../store/story.js'
import { PLAYER_SPEAKER_ID } from '../../story/player.js'
import {
  CHAT_CONTACTS,
  CONTACT_COUNT,
  CONTACT_GROUPS,
  CONTACT_GROUP_LABELS
} from './contacts.js'

const props = defineProps({
  // Which contacts actually have a thread on this handset. Empty until 水野
  // writes, which is the whole point of the screen.
  conversations: { type: Array, default: () => [] }
})

const emit = defineEmits(['select', 'open-url'])

// Long enough to read a single line twice; it can always be dismissed sooner.
const SPEECH_DURATION_MS = 7000

const story = useStoryStore()

// The protagonist's lines are labelled with the name the player chose, exactly
// as they are in the DM thread and the browser tutorial.
const speakerName = computed(() => story.speakerName(PLAYER_SPEAKER_ID))

const filter = ref('')
const activeTab = ref('all')
const selectedId = ref(CHAT_CONTACTS[0]?.id || '')
const spoken = ref(null)
const scroller = ref(null)

const GROUP_ORDER = [CONTACT_GROUPS.FRIENDS, CONTACT_GROUPS.OFFICIAL]

function countOf(group){
  return CHAT_CONTACTS.filter((contact) => contact.group === group).length
}

const tabs = Object.freeze([
  { id: 'all', label: 'すべて', count: CONTACT_COUNT },
  { id: CONTACT_GROUPS.FRIENDS, label: CONTACT_GROUP_LABELS[CONTACT_GROUPS.FRIENDS], count: countOf(CONTACT_GROUPS.FRIENDS) },
  { id: CONTACT_GROUPS.OFFICIAL, label: CONTACT_GROUP_LABELS[CONTACT_GROUPS.OFFICIAL], count: countOf(CONTACT_GROUPS.OFFICIAL) }
])

const threadIds = computed(() => new Set(props.conversations.map((conversation) => conversation.id)))

const filtered = computed(() => {
  const query = filter.value.trim().toLocaleLowerCase('ja')
  return CHAT_CONTACTS.filter((contact) => {
    if(activeTab.value !== 'all' && contact.group !== activeTab.value) return false
    if(!query) return true
    return `${contact.name} ${contact.handle} ${contact.note} ${contact.comment}`
      .toLocaleLowerCase('ja')
      .includes(query)
  })
})

const visibleGroups = computed(() => (
  GROUP_ORDER
    .map((id) => ({
      id,
      label: CONTACT_GROUP_LABELS[id],
      contacts: filtered.value.filter((contact) => contact.group === id)
    }))
    .filter((group) => group.contacts.length)
))

// The list as the player sees it, top to bottom — what the arrow keys walk.
const flatVisible = computed(() => visibleGroups.value.flatMap((group) => group.contacts))

const selected = computed(() => CHAT_CONTACTS.find((contact) => contact.id === selectedId.value) || null)

// A thread can only be opened when the conversation exists — before 水野 writes,
// even his row is just a saved number.
const hasThread = computed(() => {
  const conversationId = selected.value?.conversationId
  if(!conversationId) return false
  return threadIds.value.has(conversationId)
})

function resetFilters(){
  filter.value = ''
  activeTab.value = 'all'
}

// ---- keeping the two panes in step ------------------------------------
// The detail pane is the whole right-hand side of the screen, so it must never
// describe a row the filter has hidden.
watch(flatVisible, (rows) => {
  if(!rows.length) return
  if(rows.some((contact) => contact.id === selectedId.value)) return
  selectedId.value = rows[0].id
})

function focusRow(id){
  const row = scroller.value?.querySelector(`[data-contact-id="${id}"]`)
  if(!row) return
  row.focus()
  row.scrollIntoView({ block: 'nearest' })
}

// Arrow keys walk the list from the search box as well as from a row, so the
// player can type a couple of letters and keep going without reaching for the
// mouse.
function moveSelection(step){
  const rows = flatVisible.value
  if(!rows.length) return
  const current = rows.findIndex((contact) => contact.id === selectedId.value)
  const next = Math.min(Math.max(current + step, 0), rows.length - 1)
  const target = rows[current === -1 ? 0 : next]
  selectedId.value = target.id
  nextTick(() => focusRow(target.id))
}

// ---- the protagonist talking himself out of it -------------------------
let speechTimer = null

function dismissSpoken(){
  if(speechTimer !== null){
    clearTimeout(speechTimer)
    speechTimer = null
  }
  spoken.value = null
}

// Pressing 送る is not refused: he picks the handset up, looks at the name and
// puts it down again.
function speakHold(){
  const line = selected.value?.hold
  if(!line) return
  dismissSpoken()
  spoken.value = { text: line }
  speechTimer = setTimeout(dismissSpoken, SPEECH_DURATION_MS)
}

// A line said about one contact must not stay on screen over another.
watch(selectedId, dismissSpoken)

onBeforeUnmount(dismissSpoken)
</script>

<style scoped>
.contacts{
  position:relative;
  min-width:0;
  min-height:0;
  display:grid;
  grid-template-rows:auto minmax(0, 1fr);
  background:#f5f7fb;
}

.contacts__header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  min-height:73px;
  padding:15px 24px;
  border-bottom:1px solid #dfe5ee;
  background:#fff;
}

.contacts__heading{
  display:flex;
  flex-direction:column;
  gap:3px;
}

.contacts__heading small{
  color:#7a8798;
  font-size:9px;
  font-weight:800;
  letter-spacing:0.14em;
}

.contacts__heading strong{
  color:#1e2c42;
  font-size:16px;
}

.contacts__count{
  display:flex;
  align-items:baseline;
  gap:3px;
  padding:6px 13px;
  border:1px solid #dde5f0;
  border-radius:999px;
  background:#f7f9fd;
  color:#4d5f79;
}

.contacts__count strong{
  font-size:14px;
  font-variant-numeric:tabular-nums;
}

.contacts__count small{
  font-size:10px;
  font-weight:700;
}

.contacts__body{
  min-height:0;
  display:grid;
  grid-template-columns:minmax(0, 1fr) minmax(300px, 344px);
  align-items:stretch;
  gap:18px;
  padding:18px 24px 22px;
  overflow:hidden;
}

/* ---- list pane ------------------------------------------------------- */
.pane{
  min-width:0;
  min-height:0;
  display:grid;
  grid-template-rows:auto minmax(0, 1fr);
  gap:12px;
}

.toolbar{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:10px;
}

.search{
  flex:1 1 240px;
  min-width:0;
  display:flex;
  align-items:center;
  gap:9px;
  padding:11px 13px;
  border:1px solid #dde4ee;
  border-radius:12px;
  background:#fff;
  color:#5f7089;
  transition:border-color 180ms ease, box-shadow 180ms ease;
}

.search:focus-within{
  border-color:#6d9cdd;
  box-shadow:0 0 0 3px rgba(43, 107, 198, 0.16);
}

.search__icon{
  width:17px;
  flex:0 0 auto;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
}

.search input{
  min-width:0;
  width:100%;
  padding:0;
  border:0;
  outline:0;
  background:transparent;
  color:#1e2c42;
  font:inherit;
  font-size:14px;
}

.search input::placeholder{
  color:#9aa6b8;
}

.search__clear{
  flex:0 0 auto;
  display:grid;
  place-items:center;
  width:22px;
  height:22px;
  padding:0;
  border:0;
  border-radius:50%;
  background:#eef1f7;
  color:#66768e;
  cursor:pointer;
  transition:background 160ms ease, color 160ms ease;
}

.search__clear:hover{
  background:#e2e8f2;
  color:#3d4d66;
}

.search__clear svg{
  width:13px;
  fill:none;
  stroke:currentColor;
  stroke-width:2;
  stroke-linecap:round;
}

.tabs{
  display:flex;
  gap:4px;
  padding:4px;
  border:1px solid #dde4ee;
  border-radius:12px;
  background:#fff;
}

.tab{
  display:flex;
  align-items:center;
  gap:6px;
  padding:7px 12px;
  border:0;
  border-radius:9px;
  background:transparent;
  color:#5c6c85;
  font:inherit;
  font-size:12.5px;
  font-weight:700;
  white-space:nowrap;
  cursor:pointer;
  transition:background 160ms ease, color 160ms ease;
}

.tab small{
  padding:1px 6px;
  border-radius:999px;
  background:#eef1f7;
  color:#6b7b93;
  font-size:10.5px;
  font-weight:800;
  font-variant-numeric:tabular-nums;
}

.tab:hover{
  background:#f2f5fa;
  color:#33425c;
}

.tab--active{
  background:#2869c7;
  color:#fff;
}

.tab--active small{
  background:rgba(255, 255, 255, 0.22);
  color:#fff;
}

.scroller{
  min-height:0;
  overflow-y:auto;
  padding-right:4px;
  scrollbar-width:thin;
}

.result-line{
  margin:0 0 10px;
  padding:0 2px;
  color:#5f6f88;
  font-size:12px;
  font-weight:700;
}

.groups{
  display:flex;
  flex-direction:column;
  gap:14px;
}

.group{
  padding:14px;
  border:1px solid #e1e7f0;
  border-radius:16px;
  background:#fff;
}

.group__head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  margin-bottom:10px;
  padding:0 2px 9px;
  border-bottom:1px solid #eef2f7;
}

.group__title{
  margin:0;
  color:#2b3a52;
  font-size:13px;
  font-weight:800;
}

.group__count{
  color:#7c8a9d;
  font-size:11px;
  font-weight:700;
  font-variant-numeric:tabular-nums;
}

/* Fourteen names read far better as two columns than as one narrow strip down
   the middle of a wide window. */
.group__list{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(272px, 1fr));
  gap:6px;
}

.row{
  position:relative;
  width:100%;
  min-width:0;
  display:grid;
  grid-template-columns:44px minmax(0, 1fr) 14px;
  align-items:center;
  gap:12px;
  padding:10px 11px;
  border:1px solid transparent;
  border-radius:13px;
  background:transparent;
  color:#22304a;
  font:inherit;
  text-align:left;
  cursor:pointer;
  transition:background 170ms ease, border-color 170ms ease;
}

.row:hover{
  border-color:#dbe5f3;
  background:#f6f9fd;
}

.row--active{
  border-color:#b9d1ee;
  background:#eef5ff;
  box-shadow:inset 3px 0 0 #2869c7;
}

.row:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.3);
  outline-offset:2px;
}

.row__avatar-wrap{
  position:relative;
  width:44px;
  height:44px;
}

.row__avatar-wrap img{
  width:100%;
  height:100%;
  display:block;
  border-radius:50%;
  object-fit:cover;
  background:#d7e0ec;
}

.row__initial{
  width:100%;
  height:100%;
  display:grid;
  place-items:center;
  border-radius:13px;
  color:#fff;
  font-size:13px;
  font-weight:800;
  letter-spacing:0.02em;
}

.row__online{
  position:absolute;
  right:-1px;
  bottom:0;
  width:11px;
  height:11px;
  border:2px solid #fff;
  border-radius:50%;
  background:#2fae67;
}

.row__copy{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:2px;
}

.row__topline{
  min-width:0;
  display:flex;
  align-items:center;
  gap:6px;
}

.row__name{
  overflow:hidden;
  font-size:14.5px;
  font-weight:700;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.chip{
  flex:0 0 auto;
  padding:2px 7px;
  border-radius:999px;
  font-size:9.5px;
  font-weight:800;
  letter-spacing:0.02em;
}

.chip--official{
  background:#e6effb;
  color:#2b60a4;
}

.chip--thread{
  background:#e4f4ea;
  color:#2c7d4f;
}

.row__handle{
  overflow:hidden;
  color:#7a889c;
  font-size:11.5px;
  font-variant-numeric:tabular-nums;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.row__comment{
  overflow:hidden;
  color:#6b7a90;
  font-size:12px;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.row__comment--unset{
  color:#a3aebd;
  font-style:italic;
}

.row__chevron{
  display:grid;
  place-items:center;
  color:#c3cddc;
  transition:color 170ms ease, transform 170ms ease;
}

.row__chevron svg{
  width:14px;
  fill:none;
  stroke:currentColor;
  stroke-width:2;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.row:hover .row__chevron,
.row--active .row__chevron{
  color:#5f8dcd;
  transform:translateX(1px);
}

/* ---- empty state ----------------------------------------------------- */
.empty{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:9px;
  padding:34px 18px;
  border:1px dashed #d8e0ec;
  border-radius:16px;
  background:#fbfcfe;
  text-align:center;
}

.empty__mark{
  display:grid;
  place-items:center;
  width:38px;
  height:38px;
  border-radius:50%;
  background:#eef2f8;
  color:#8b9bb0;
}

.empty__mark svg{
  width:19px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
}

.empty__title{
  margin:0;
  color:#54637a;
  font-size:13px;
  font-weight:700;
}

.empty__reset{
  padding:8px 14px;
  border:1px solid #cddaea;
  border-radius:10px;
  background:#fff;
  color:#2b5fa8;
  font:inherit;
  font-size:12px;
  font-weight:700;
  cursor:pointer;
}

.empty__reset:hover{
  border-color:#a9c3e4;
  background:#f2f7fd;
}

/* ---- detail ---------------------------------------------------------- */
.detail{
  min-width:0;
  min-height:0;
  display:flex;
  flex-direction:column;
  gap:14px;
  padding:20px 18px;
  border:1px solid #e1e7f0;
  border-radius:18px;
  background:#fff;
  overflow-y:auto;
  scrollbar-width:thin;
}

.detail__card{
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
}

.detail__avatar-wrap{
  position:relative;
  width:80px;
  height:80px;
}

.detail__avatar-wrap img{
  width:100%;
  height:100%;
  display:block;
  border:3px solid #fff;
  border-radius:50%;
  object-fit:cover;
  background:#dbe3ee;
  box-shadow:0 8px 20px rgba(36, 53, 78, 0.18);
}

.detail__initial{
  width:100%;
  height:100%;
  display:grid;
  place-items:center;
  border-radius:22px;
  color:#fff;
  font-size:22px;
  font-weight:800;
}

.detail__online{
  position:absolute;
  right:5px;
  bottom:5px;
  width:14px;
  height:14px;
  border:3px solid #fff;
  border-radius:50%;
  background:#2fae67;
}

.detail__name{
  margin-top:11px;
  color:#18263c;
  font-size:18px;
}

.detail__handle{
  margin-top:4px;
  color:#7a889c;
  font-size:12px;
  font-variant-numeric:tabular-nums;
}

.detail__badge{
  margin-top:10px;
  padding:4px 12px;
  border-radius:999px;
  background:#eef2f8;
  color:#51617a;
  font-size:11px;
  font-weight:800;
}

.detail__badge--official{
  background:#e6effb;
  color:#2b60a4;
}

.detail__comment{
  margin:11px 0 0;
  color:#4f5f78;
  font-size:12.5px;
  line-height:1.7;
}

.detail__text{
  margin:0;
  padding:12px 13px;
  border-radius:12px;
  background:#f6f8fc;
  color:#54637a;
  font-size:12px;
  line-height:1.85;
}

.detail__rows{
  margin:0;
  display:flex;
  flex-direction:column;
  border-top:1px solid #edf1f7;
}

.detail__row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:10px 2px;
  border-bottom:1px solid #edf1f7;
}

.detail__row dt{
  flex:0 0 auto;
  color:#7c8a9d;
  font-size:11.5px;
  font-weight:700;
}

.detail__row dd{
  margin:0;
  color:#25344c;
  font-size:12.5px;
  font-weight:700;
  text-align:right;
}

.detail__warn{
  color:#a3702f;
}

.detail__actions{
  display:flex;
  flex-direction:column;
  gap:9px;
  margin-top:auto;
  padding-top:2px;
}

.detail__action{
  width:100%;
  padding:12px 14px;
  border:1px solid transparent;
  border-radius:12px;
  background:#2869c7;
  color:#fff;
  font:inherit;
  font-size:13px;
  font-weight:800;
  cursor:pointer;
  transition:background 180ms ease, border-color 180ms ease, color 180ms ease;
}

.detail__action:hover{
  background:#215aae;
}

.detail__action--ghost{
  border-color:#cddaea;
  background:#fff;
  color:#2b5fa8;
}

.detail__action--ghost:hover{
  border-color:#a9c3e4;
  background:#eff5fd;
}

/* The compose button is quiet rather than dead: pressing it is how the player
   hears why the protagonist is not writing. */
.detail__action--quiet{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  border-color:#e0e6f0;
  background:#f2f4f8;
  color:#75849a;
}

.detail__action--quiet:hover{
  border-color:#cddaea;
  background:#eaeff7;
  color:#586a83;
}

.detail__lock{
  display:grid;
  place-items:center;
}

.detail__lock svg{
  width:15px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.8;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.detail__action:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.3);
  outline-offset:2px;
}

.detail__muted{
  margin:auto 0;
  color:#7c8a9d;
  font-size:12px;
  line-height:1.8;
  text-align:center;
}

/* ---- the monologue ---------------------------------------------------- */
/* Same voice as the browser tutorial: a dark card over the screen, dismissed
   by clicking it. */
.say{
  position:absolute;
  right:0;
  bottom:22px;
  left:0;
  z-index:6;
  width:min(520px, calc(100% - 40px));
  margin:0 auto;
  padding:16px 18px 14px;
  border:1px solid rgba(148, 176, 216, 0.28);
  border-radius:18px;
  background:linear-gradient(180deg, rgba(17, 22, 33, 0.96), rgba(12, 15, 22, 0.96));
  color:#eef2f9;
  font-family:'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', ui-sans-serif, system-ui, sans-serif;
  box-shadow:0 22px 50px rgba(8, 14, 26, 0.45);
  backdrop-filter:blur(6px);
}

.say__card{
  width:100%;
  display:flex;
  flex-direction:column;
  gap:7px;
  padding:0;
  border:0;
  background:transparent;
  color:inherit;
  font:inherit;
  text-align:left;
  cursor:pointer;
}

.say__card:focus-visible{
  outline:3px solid rgba(120, 172, 255, 0.4);
  outline-offset:4px;
  border-radius:10px;
}

.say__speaker{
  color:#8fb2e8;
  font-size:11px;
  font-weight:800;
  letter-spacing:0.08em;
}

.say__text{
  font-size:14px;
  line-height:1.85;
}

.say__hint{
  color:#8593ab;
  font-size:10px;
  letter-spacing:0.04em;
}

.say-enter-active,
.say-leave-active{
  transition:opacity 220ms ease, transform 220ms cubic-bezier(0.2, 0.9, 0.25, 1);
}

.say-enter-from,
.say-leave-to{
  opacity:0;
  transform:translateY(10px);
}

@media (prefers-reduced-motion:reduce){
  .say-enter-active,
  .say-leave-active{
    transition:opacity 120ms ease;
  }

  .say-enter-from,
  .say-leave-to{
    transform:none;
  }
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

/* Below the two-pane width the whole screen scrolls as one column, with the
   selected contact kept on top so a tap on a row still shows something. */
@media (max-width:1000px){
  .contacts__body{
    grid-template-columns:minmax(0, 1fr);
    overflow-y:auto;
  }

  .pane{
    grid-template-rows:auto auto;
  }

  .scroller{
    overflow:visible;
    padding-right:0;
  }

  .detail{
    order:-1;
    overflow:visible;
  }

  .detail__actions{
    margin-top:4px;
  }
}

@media (max-width:560px){
  .contacts__header{
    padding:14px 16px;
  }

  .contacts__body{
    padding:14px 16px 18px;
  }

  .group__list{
    grid-template-columns:minmax(0, 1fr);
  }
}
</style>
