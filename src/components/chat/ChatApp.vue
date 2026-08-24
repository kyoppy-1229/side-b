<template>
  <!-- The new handset has the account but not the session, so the thread only
       exists on the other side of a sign-in. -->
  <ChatLoginGate v-if="needsRelogin" @login="completeRelogin" />

  <div v-else class="chat-app" :class="{ 'chat-app--home': showHome || showContacts }">
    <ChatSidebar
      :conversations="conversations"
      :active-id="showThread ? 'mizuno' : ''"
      :home-active="showHome"
      :contacts-active="showContacts"
      :player-name="playerName"
      :player-avatar="PLAYER_AVATAR"
      @select="selectConversation"
      @home="openHome"
      @contacts="openContacts"
    />

    <!-- Signing in lands here, not in a thread: on this handset there is no
         thread yet, only the account that came across with the migration. -->
    <ChatHome
      v-if="showHome"
      :player-name="playerName"
      :player-avatar="PLAYER_AVATAR"
      :conversations="conversations"
      :searching-phase="beforeFirstSearch"
      @select="selectConversation"
      @rename="renamePlayer"
      @contacts="openContacts"
    />

    <!-- The address book the migration did bring across. It is a screen of the
         app rather than a dialog, so the address bar can point at it. -->
    <ChatContacts
      v-else-if="showContacts"
      :conversations="conversations"
      @select="selectConversation"
      @open-url="openLinkedPage"
    />

    <template v-else>
      <ChatMessages
        :messages="visibleMessages"
        :link-card="activeLinkCard"
        :waiting-input="isWaitingInput"
        :input-config="pendingInput?.input || {}"
        :input-value="inputValue"
        :can-send="canSend"
        :cta-label="ctaLabel"
        :fresh-thread="isFreshThread"
        :player-name="playerName"
        :player-avatar="PLAYER_AVATAR"
        @update:input-value="inputValue = $event"
        @send-input="sendInput"
        @next="next"
        @open-url="openLinkedPage"
      />

      <aside class="related" aria-label="関連記録">
        <header class="related__header">
          <span>
            <small>THREAD DETAILS</small>
            <strong>関連記録</strong>
          </span>
        </header>

        <section class="related__profile">
          <img :src="MIZUNO_AVATAR" alt="水野ヒロキ" />
          <strong>水野ヒロキ</strong>
          <span><i aria-hidden="true"></i> オンライン</span>
        </section>

        <section class="related__section">
          <h2>会話の進行</h2>
          <div class="related__progress">
            <span :style="{ width: `${progressPercent}%` }"></span>
          </div>
          <p>{{ visibleMessages.length }} / {{ script.length }} メッセージ</p>
        </section>

        <section class="related__section">
          <h2>共有されたリンク</h2>
          <button
            v-for="card in availableLinkCards"
            :key="card.url"
            class="related-link"
            type="button"
            @click="openLinkedPage(card.url)"
          >
            <span class="related-link__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M6 5h9l3 3v11H6V5Z" />
                <path d="M15 5v4h4M9 13h6M9 16h4" />
              </svg>
            </span>
            <span>
              <strong>{{ card.title }}</strong>
              <small>{{ displayUrl(card.url) }}</small>
            </span>
          </button>
          <p v-if="!availableLinkCards.length" class="related__muted">会話を進めると共有リンクが表示されます。</p>
        </section>

        <section class="related__section related__section--note">
          <h2>セッション</h2>
          <p>この会話は仮想ネットワーク内に保存されています。</p>
        </section>
      </aside>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { GAME_PHASES, useGameStore } from '../../store'
import { DEBUG_CHAT_COMMANDS, useDebugStore } from '../../store/debug.js'
import { useStoryStore } from '../../store/story.js'
import { playChatNotification } from '../../audio/chatNotification.js'
import { STORY_CHAPTERS } from '../../story/chapters.js'
import { STORY_EVENTS } from '../../story/events.js'
import { STORY_MILESTONES } from '../../story/transitions.js'
import dmPrologue from '../../data/dm_prologue.json'
import dmAfterBbs from '../../data/dm_after_bbs.json'
import dmAfterRevival from '../../data/dm_after_revival.json'
import dmTrialAfterRevival from '../../data/trial_dm_after_revival.json'
import birdPhoto from '../../photo/鳥.jpg'
import { MIZUNO_AVATAR, PLAYER_AVATAR } from './avatars.js'
import { isTrialAfterRevivalChat, markTrialComplete } from '../../trial/flow.js'
import { MESSAGES_PATHS, VIRTUAL_URLS } from '../../virtual-web/constants.js'
import ChatContacts from './ChatContacts.vue'
import ChatHome from './ChatHome.vue'
import ChatLoginGate from './ChatLoginGate.vue'
import ChatMessages from './ChatMessages.vue'
import ChatSidebar from './ChatSidebar.vue'

const props = defineProps({
  active: { type: Boolean, default: true }
})

const emit = defineEmits(['open-url', 'notify-message', 'location'])
const gameStore = useGameStore()
const storyState = useStoryStore()
const debugStore = useDebugStore()

// Reading this line is what closes the prologue DM. The story ignores the event
// from anywhere else, so revealing the thread again later changes nothing.
const PROLOGUE_DM_LAST_ID = 'prologue-dm-022'

// 水野 does not write on a timer from the sign-in: he writes just after the
// player's first search of the open web (BrowserWorkspace tells the story about
// that). The beat is long enough for the player to follow the tutorial's last
// instruction and open the weather page first, so the message lands on an
// ordinary afternoon rather than on a search results screen.
const FIRST_MESSAGE_DELAY_MS = 4200

const mediaAssets = Object.freeze({
  '../../photo/鳥.jpg': birdPhoto
})

const CHAT_STEPS = Object.freeze({
  PROLOGUE: 'prologue',
  AFTER_REVIVAL: 'after-revival',
  AFTER_BBS: 'after-bbs'
})

// The link 水野 sends at the end of the prologue is the revival build itself —
// the "これ" of the last line. The URL is the one the virtual browser resolves
// (virtual-web/constants.js), so the card, the address bar and the #/revival
// route all open the same page.
const LINK_CARDS = Object.freeze({
  [CHAT_STEPS.PROLOGUE]: Object.freeze({
    url: VIRTUAL_URLS.GAME_REVIVAL,
    title: 'SIDE-B / REVIVAL',
    description: '復刻版のSIDE-B。ブラウザ上でそのまま動く。',
    eyebrow: 'REVIVAL BUILD'
  }),
  [CHAT_STEPS.AFTER_REVIVAL]: Object.freeze({
    url: VIRTUAL_URLS.BBS_THREAD,
    title: 'みんなの掲示板：保存ログ',
    description: '水野から共有された、非公開保存ログ。',
    eyebrow: 'PRIVATE ARCHIVE'
  })
})

// The trial's own thread after the revival build: 水野 mentions the BBS and the
// trial stops there. Nothing is shared, and the story does not enter the archive
// chapter — that whole conversation belongs to the full game.
const trialThread = computed(() => isTrialAfterRevivalChat(storyState))

const step = computed(() => {
  if(trialThread.value) return CHAT_STEPS.AFTER_REVIVAL

  if(
    storyState.chapter === STORY_CHAPTERS.CH2_RECORDS_2015 &&
    storyState.step === 'search'
  ) return CHAT_STEPS.AFTER_REVIVAL

  if(
    gameStore.phase === GAME_PHASES.PROLOGUE_DM ||
    gameStore.phase === GAME_PHASES.BBS
  ) return CHAT_STEPS.PROLOGUE

  return CHAT_STEPS.AFTER_BBS
})

const afterRevivalScript = computed(() => (trialThread.value ? dmTrialAfterRevival : dmAfterRevival))

const sourceScript = computed(() => {
  if(step.value === CHAT_STEPS.PROLOGUE) return dmPrologue
  if(step.value === CHAT_STEPS.AFTER_REVIVAL) return [...dmPrologue, ...afterRevivalScript.value]
  return [...dmPrologue, ...dmAfterBbs]
})

const script = ref([])
const currentIndex = ref(-1)
const inputIndex = ref(null)
const inputValue = ref('')
const notifiedStep = ref(step.value)

// Going back to the home screen after the thread is open. Which screen is shown
// is a view concern, so it lives here; where the *story* stands is read off the
// store below.
const homeRequested = ref(false)

// The contacts screen is opened by the player and closed by going anywhere
// else, so it overrides the home screen the story would otherwise show.
const contactsRequested = ref(false)

// The player's name is save data, not component state: the profile, the thread
// and the sidebar all read the same value, and it survives a reload.
const playerName = computed(() => storyState.playerDisplayName)

// All of these are read off the story position rather than off local state, so
// a reload — or the same app opened in a second tab — resumes exactly where the
// player left it, and no beat can play twice.
const needsRelogin = computed(() => (
  storyState.chapter === STORY_CHAPTERS.PROLOGUE && storyState.step === 'chat_login'
))

const atChatHome = computed(() => (
  storyState.chapter === STORY_CHAPTERS.PROLOGUE && storyState.step === 'chat_home'
))

// The first message has landed — either because it just did, or because the
// story is already past the point where it must have (a debug jump, a save from
// further on).
const mizunoMessageReceived = computed(() => (
  storyState.hasMilestone(STORY_MILESTONES.MIZUNO_FIRST_MESSAGE_RECEIVED) ||
  storyState.hasReached(STORY_CHAPTERS.PROLOGUE, 'dm')
))

// Waiting is not the same as being on the home screen any more: nothing arrives
// until the player has searched something.
const awaitingFirstMessage = computed(() => (
  atChatHome.value &&
  storyState.hasMilestone(STORY_MILESTONES.FIRST_SEARCH_PERFORMED) &&
  !storyState.hasMilestone(STORY_MILESTONES.MIZUNO_FIRST_MESSAGE_RECEIVED)
))

// Received but not opened yet: the arrival is still unread exactly while the
// story is sitting on the home screen with the message already in.
const mizunoUnread = computed(() => atChatHome.value && mizunoMessageReceived.value)

// 水野 only appears in 最近の会話 once he has actually written. Before that the
// list is empty, because the history stayed on the old handset.
const mizunoVisible = computed(() => mizunoMessageReceived.value)

const showContacts = computed(() => !needsRelogin.value && contactsRequested.value)
const showHome = computed(() => (
  !needsRelogin.value && !contactsRequested.value && (atChatHome.value || homeRequested.value)
))
const showThread = computed(() => !needsRelogin.value && !showHome.value && !showContacts.value)

// The address bar follows the screen the way it would on a real site: the home
// screen is the app's front door, and only an open thread is a thread URL.
const chatLocation = computed(() => {
  if(needsRelogin.value) return { path: MESSAGES_PATHS.LOGIN, title: 'サインイン | Messages' }
  if(showContacts.value) return { path: MESSAGES_PATHS.CONTACTS, title: '連絡先 | Messages' }
  if(showHome.value) return { path: MESSAGES_PATHS.HOME, title: 'Messages' }
  return { path: `${MESSAGES_PATHS.THREAD}/mizuno`, title: '水野ヒロキ | Messages' }
})

watch(chatLocation, (location) => emit('location', location), { immediate: true })

// The browser restores its tabs from storage in its own mounted hook, which
// runs after this one and resets the displayed address to the tab's fixed url.
// Saying it again on the next tick is what keeps a reload inside the thread
// from coming back showing the home address.
onMounted(() => nextTick(() => emit('location', chatLocation.value)))

// Before the first search there is nothing to wait for on this screen, so the
// home says where to go looking instead of pretending to sync.
const beforeFirstSearch = computed(() => (
  atChatHome.value && !storyState.hasMilestone(STORY_MILESTONES.FIRST_SEARCH_PERFORMED)
))

// The prologue thread runs on a handset that never had the history, so it says
// so above the first message.
const isFreshThread = computed(() => step.value === CHAT_STEPS.PROLOGUE)

// One pending arrival at a time, cleared on unmount, so a tab switch or a
// remount can neither leak a timer nor deliver the message twice.
let firstMessageTimer = null

function clearFirstMessageTimer(){
  if(firstMessageTimer === null) return
  clearTimeout(firstMessageTimer)
  firstMessageTimer = null
}

// The arrival itself: the message is put into the thread, 水野 appears in the
// conversation list as unread, and the player is told. Nothing navigates — the
// thread is opened by the player, from the list or the banner.
function receiveFirstMessage(){
  firstMessageTimer = null
  if(!awaitingFirstMessage.value) return
  // Marked before the reveal: the milestone is what keeps a later remount from
  // waiting all over again.
  storyState.dispatch(STORY_EVENTS.MIZUNO_FIRST_MESSAGE_RECEIVED)
  revealNext()
  playChatNotification()
  const first = script.value[currentIndex.value]
  if(first?.text){
    emit('notify-message', {
      id: 'chat-prologue-first',
      sender: '水野ヒロキ',
      text: first.text,
      step: step.value
    })
  }
}

function scheduleFirstMessage(){
  clearFirstMessageTimer()
  if(!awaitingFirstMessage.value) return false
  firstMessageTimer = setTimeout(receiveFirstMessage, FIRST_MESSAGE_DELAY_MS)
  return true
}

function resolveMediaPath(path){
  if(!path) return ''
  const normalized = path.startsWith('../../')
    ? path
    : `../../${path.replace(/^\.\//, '').replace(/^\//, '')}`
  return mediaAssets[normalized] || ''
}

function normalizeImage(image){
  if(!image) return null
  const source = typeof image === 'string' ? image : image.src
  const src = resolveMediaPath(source)
  if(!src) return null
  return {
    src,
    alt: typeof image === 'string' ? '共有された画像' : image.alt || '共有された画像',
    caption: typeof image === 'string' ? '' : image.caption || ''
  }
}

function normalizeScript(entries){
  return entries.map(entry => {
    const normalized = {
      ...entry,
      input: entry.input ? { ...entry.input } : undefined,
      sent: !entry.input
    }
    const image = normalizeImage(entry.image)
    if(image) normalized.image = image
    else delete normalized.image
    return normalized
  })
}

function revealNext(){
  if(currentIndex.value >= script.value.length - 1) return
  const nextIndex = currentIndex.value + 1
  const entry = script.value[nextIndex]
  if(entry.input && !entry.sent){
    inputIndex.value = nextIndex
    inputValue.value = entry.input.prefill || ''
    return
  }
  currentIndex.value = nextIndex
}

function resetScript(targetStep = step.value){
  script.value = normalizeScript(sourceScript.value)
  currentIndex.value = [CHAT_STEPS.AFTER_REVIVAL, CHAT_STEPS.AFTER_BBS].includes(targetStep)
    ? dmPrologue.length - 1
    : -1
  inputIndex.value = null
  inputValue.value = ''
  if(!mizunoMessageReceived.value){
    // Nothing has arrived on this handset yet: the thread stays empty and the
    // wait runs while the player is on the home screen.
    scheduleFirstMessage()
    return
  }
  revealNext()
}

// Debug console: reveal every remaining message at once, answering the input
// gates with the text they expect, so a scenario can open on a read thread.
function revealAllMessages(){
  clearFirstMessageTimer()
  storyState.dispatch(STORY_EVENTS.MIZUNO_FIRST_MESSAGE_RECEIVED)
  // A read thread is an opened thread: the console must not leave the story
  // sitting on the home screen with 22 messages already read.
  storyState.dispatch(STORY_EVENTS.MIZUNO_THREAD_OPENED)
  homeRequested.value = false
  contactsRequested.value = false
  for(const entry of script.value){
    if(entry.input && !entry.sent){
      entry.text = entry.input.expected || entry.input.prefill || entry.text || ''
      entry.sent = true
    }
  }
  inputIndex.value = null
  inputValue.value = ''
  currentIndex.value = script.value.length - 1
}

watch(
  step,
  newStep => {
    resetScript(newStep)
    if(debugStore.autoRevealChat) revealAllMessages()

    if(!props.active && notifiedStep.value !== newStep){
      const notificationScript = newStep === CHAT_STEPS.AFTER_REVIVAL
        ? afterRevivalScript.value
        : (newStep === CHAT_STEPS.AFTER_BBS ? dmAfterBbs : dmPrologue)
      const firstMessage = notificationScript.find(entry => entry.from === '水野' && entry.text)
      if(firstMessage){
        notifiedStep.value = newStep
        nextTick(() => emit('notify-message', {
          id: `chat-${newStep}`,
          sender: '水野ヒロキ',
          text: firstMessage.text,
          step: newStep
        }))
      }
    }
  },
  { immediate: true }
)

// Signing in leaves the story on prologue/dm with the arrival still pending, so
// the wait starts here rather than in the step watcher above — that one only
// fires when the *thread* changes, which this is not.
watch(awaitingFirstMessage, (waiting) => {
  if(waiting) scheduleFirstMessage()
  else clearFirstMessageTimer()
})

onBeforeUnmount(clearFirstMessageTimer)

// Commands arrive from the debug console; the tick makes repeats observable.
watch(() => debugStore.chatTick, () => {
  if(debugStore.chatCommand === DEBUG_CHAT_COMMANDS.RESTART){
    resetScript()
    return
  }
  if(debugStore.chatCommand === DEBUG_CHAT_COMMANDS.REVEAL){
    revealAllMessages()
    return
  }
  if(debugStore.chatCommand === DEBUG_CHAT_COMMANDS.STEP){
    // Stepping past a pending arrival delivers it rather than racing its timer.
    if(awaitingFirstMessage.value){
      clearFirstMessageTimer()
      receiveFirstMessage()
      return
    }
    // Stepping outside the thread opens the one the player would have tapped.
    if(!showThread.value){
      openMizunoThread()
      return
    }
    if(isWaitingInput.value){
      const entry = script.value[inputIndex.value]
      inputValue.value = entry.input?.expected || entry.input?.prefill || inputValue.value
      sendInput()
      return
    }
    revealNext()
  }
})

// The thread reports what the player has read; the story decides what that
// means. Sharing the revival link is not the same as reaching chapter 1 — the
// card opens the build, and nothing here dispatches the story past the
// prologue; that wiring is a separate task.
watch(currentIndex, (revealedIndex) => {
  if(script.value[revealedIndex]?.id !== PROLOGUE_DM_LAST_ID) return
  storyState.dispatch(STORY_EVENTS.PROLOGUE_DM_COMPLETE)
})

const visibleMessages = computed(() => {
  if(currentIndex.value < 0) return []
  return script.value
    .slice(0, currentIndex.value + 1)
    .filter(entry => !entry.input || entry.sent)
})

const pendingInput = computed(() => {
  return inputIndex.value === null ? null : script.value[inputIndex.value]
})

const isWaitingInput = computed(() => Boolean(pendingInput.value))
const canSend = computed(() => {
  if(!pendingInput.value || !inputValue.value.trim()) return false
  const expected = pendingInput.value.input?.expected
  return !expected || inputValue.value.trim() === expected
})
const isComplete = computed(() => script.value.length > 0 && currentIndex.value >= script.value.length - 1)
// The trial's thread hands nothing over: the player is told the BBS exists, and
// that is where it ends. No card, and no address to type in later.
const activeLinkCard = computed(() => {
  if(!isComplete.value || trialThread.value) return null
  return LINK_CARDS[step.value] || null
})
const ctaLabel = computed(() => {
  if(trialThread.value && isComplete.value) return '体験版を終える'
  return isComplete.value ? '共有リンクを確認' : '次のメッセージ'
})
const progressPercent = computed(() => {
  if(!script.value.length) return 0
  return Math.round((visibleMessages.value.length / script.value.length) * 100)
})

const availableLinkCards = computed(() => {
  const cards = []
  if(trialThread.value) return cards
  if(step.value === CHAT_STEPS.PROLOGUE && isComplete.value){
    cards.push(LINK_CARDS[CHAT_STEPS.PROLOGUE])
  }
  if(step.value === CHAT_STEPS.AFTER_REVIVAL && isComplete.value){
    cards.push(LINK_CARDS[CHAT_STEPS.AFTER_REVIVAL])
  }
  return cards
})

const conversations = computed(() => {
  if(!mizunoVisible.value) return []
  return [{
    id: 'mizuno',
    name: '水野ヒロキ',
    preview: visibleMessages.value.at(-1)?.text || '会話を開く',
    avatar: MIZUNO_AVATAR,
    timeLabel: '現在',
    online: true,
    unread: mizunoUnread.value || !props.active ? 1 : 0
  }]
})

function next(){
  if(isWaitingInput.value) return
  if(!isComplete.value){
    revealNext()
    return
  }
  // Reading the last line of the trial's thread is the end of the trial.
  if(trialThread.value){
    markTrialComplete(storyState)
    return
  }
  if(activeLinkCard.value) openLinkedPage(activeLinkCard.value.url)
}

function sendInput(){
  if(!canSend.value || inputIndex.value === null) return
  const entry = script.value[inputIndex.value]
  entry.text = inputValue.value.trim()
  entry.sent = true
  currentIndex.value = inputIndex.value
  inputIndex.value = null
  inputValue.value = ''
}

function openLinkedPage(url){
  if(url === VIRTUAL_URLS.BBS_THREAD){
    storyState.dispatch(STORY_EVENTS.BBS_OPENED)
    gameStore.openBBS()
  }
  emit('open-url', url)
}

// The gate reports that the player signed in; the story decides what that
// means, so the thread can only be entered one way.
function completeRelogin(){
  storyState.dispatch(STORY_EVENTS.CHAT_RELOGIN_COMPLETE)
}

// Opening the thread is what moves the story off the home screen. The event
// does nothing from anywhere else, so a stray click cannot skip the wait.
function openMizunoThread(){
  if(!mizunoVisible.value) return
  homeRequested.value = false
  contactsRequested.value = false
  storyState.dispatch(STORY_EVENTS.MIZUNO_THREAD_OPENED)
}

function selectConversation(id = 'mizuno'){
  if(id !== 'mizuno') return
  openMizunoThread()
}

function openHome(){
  contactsRequested.value = false
  homeRequested.value = true
}

function openContacts(){
  contactsRequested.value = true
}

// The home screen reports the name the player typed; the store decides whether
// it is usable and keeps it.
function renamePlayer(name){
  storyState.setPlayerName(name)
}

function displayUrl(url){
  return url.replace(/^https?:\/\//, '')
}
</script>

<style scoped>
.chat-app{
  width:100%;
  height:100%;
  min-height:560px;
  display:grid;
  grid-template-columns:minmax(180px, 236px) minmax(360px, 1fr) minmax(210px, 270px);
  overflow:hidden;
  background:#fff;
  color:#223048;
  font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.chat-app--home{
  grid-template-columns:minmax(180px, 236px) minmax(0, 1fr);
}

.related{
  min-width:0;
  overflow:auto;
  padding:0 18px 22px;
  border-left:1px solid #dce4ef;
  background:#f8fafc;
}

.related__header{
  display:flex;
  align-items:center;
  min-height:73px;
  border-bottom:1px solid #e0e6ee;
}

.related__header span{
  display:flex;
  flex-direction:column;
  gap:3px;
}

.related__header small{
  color:#8290a3;
  font-size:8px;
  font-weight:800;
  letter-spacing:0.12em;
}

.related__header strong{
  color:#24334a;
  font-size:13px;
}

.related__profile{
  display:flex;
  align-items:center;
  flex-direction:column;
  padding:24px 0 19px;
  border-bottom:1px solid #e1e7ef;
}

.related__profile img{
  width:68px;
  height:68px;
  display:block;
  border:3px solid #fff;
  border-radius:50%;
  object-fit:cover;
  box-shadow:0 7px 18px rgba(36, 53, 78, 0.15);
}

.related__profile strong{
  margin-top:10px;
  font-size:13px;
}

.related__profile span{
  display:flex;
  align-items:center;
  gap:5px;
  margin-top:3px;
  color:#62816f;
  font-size:9px;
}

.related__profile i{
  width:6px;
  height:6px;
  border-radius:50%;
  background:#31b66b;
}

.related__section{
  padding:18px 0;
  border-bottom:1px solid #e1e7ef;
}

.related__section h2{
  margin:0 0 11px;
  color:#68788e;
  font-size:9px;
  font-weight:900;
  letter-spacing:0.08em;
  text-transform:uppercase;
}

.related__section p{
  margin:7px 0 0;
  color:#718096;
  font-size:9px;
  line-height:1.6;
}

.related__progress{
  height:6px;
  overflow:hidden;
  border-radius:999px;
  background:#dce4ee;
}

.related__progress span{
  height:100%;
  display:block;
  border-radius:inherit;
  background:#3474ce;
  transition:width 220ms ease;
}

.related-link{
  width:100%;
  min-width:0;
  display:flex;
  align-items:center;
  gap:9px;
  padding:8px;
  border:1px solid transparent;
  border-radius:11px;
  background:transparent;
  color:#25354c;
  text-align:left;
  cursor:pointer;
  transition:background 180ms ease, border-color 180ms ease;
}

.related-link:hover{
  border-color:#d3deec;
  background:#fff;
}

.related-link:focus-visible{
  outline:3px solid rgba(44, 111, 208, 0.26);
  outline-offset:2px;
}

.related-link__icon{
  width:31px;
  height:31px;
  display:grid;
  place-items:center;
  border-radius:9px;
  background:#e6eef9;
  color:#3e6fae;
  flex:0 0 auto;
}

.related-link__icon svg{
  width:17px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.6;
  stroke-linecap:round;
  stroke-linejoin:round;
}

.related-link > span:last-child{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:2px;
}

.related-link strong,
.related-link small{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.related-link strong{
  font-size:10px;
}

.related-link small{
  color:#7e8c9e;
  font-size:8px;
}

.related__muted{
  padding:0 4px;
}

.related__section--note{
  border-bottom:0;
}

@media (max-width:980px){
  .chat-app{
    grid-template-columns:minmax(76px, 190px) minmax(0, 1fr);
  }

  .related{
    display:none;
  }
}

@media (max-width:980px){
  .chat-app--home{
    grid-template-columns:minmax(76px, 190px) minmax(0, 1fr);
  }
}

@media (max-width:520px){
  .chat-app,
  .chat-app--home{
    min-height:500px;
    grid-template-columns:minmax(0, 1fr);
  }
}
</style>
