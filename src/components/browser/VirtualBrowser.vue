<template>
  <main class="virtual-browser-stage">
    <section class="virtual-browser" :aria-label="`${browserName} ウィンドウ`">
      <BrowserTopBar
        :app-name="browserName"
        :active-title="activeTab?.title || ''"
        :session-label="sessionLabel"
      >
        <template #notifications>
          <BrowserNotifications
            :open="notificationsOpen"
            :unread-count="browser.unreadMessageCount"
            @toggle="toggleNotifications"
            @close="notificationsOpen = false"
            @open-messages="openMessages"
            @mark-read="browser.markMessagesRead()"
          />
        </template>
      </BrowserTopBar>

      <BrowserTabs
        :tabs="tabs"
        :active-tab-id="browser.activeTabId"
        @activate="activateTab"
        @close="closeTab"
        @new-tab="openBlankTab"
      />

      <BrowserNavigation
        ref="navigation"
        :url="activeTab?.currentUrl || activeTab?.url || ''"
        :can-go-back="browser.canGoBack"
        :can-go-forward="browser.canGoForward"
        :reloading="isReloading"
        @back="goBack"
        @forward="goForward"
        @reload="reloadActive"
        @submit-address="submitAddress"
      />

      <div class="browser-content">
        <div
          v-for="tab in tabs"
          v-show="tab.id === browser.activeTabId"
          :id="panelId(tab.id)"
          :key="tab.id"
          class="browser-page-panel"
          role="tabpanel"
          :aria-labelledby="tabId(tab.id)"
          :aria-hidden="tab.id !== browser.activeTabId"
          :inert="tab.id !== browser.activeTabId"
        >
          <slot
            name="page"
            :tab="tab"
            :active="tab.id === browser.activeTabId"
            :reload-key="tab.reloadKey || 0"
            :open-url="openUrl"
            :submit-address="submitAddress"
            :notify-message="notifyMessage"
          >
            <div class="browser-page-fallback">
              <strong>{{ tab.title || '新しいタブ' }}</strong>
              <span>{{ tab.currentUrl || tab.url }}</span>
            </div>
          </slot>
        </div>
      </div>

      <footer class="browser-status-bar">
        <div class="status-connection">
          <span class="status-dot" aria-hidden="true"></span>
          <span>{{ statusText }}</span>
        </div>
        <div class="status-meta" aria-label="ブラウザー状態">
          <span>{{ tabs.length }} tabs</span>
          <span class="status-separator" aria-hidden="true"></span>
          <span>Virtual network</span>
        </div>
      </footer>

      <!-- Anything that belongs to the window rather than to a page: the
           protagonist's own notes about the browser itself. -->
      <slot name="overlay" />

      <Transition name="toast">
        <BrowserToast
          v-if="browser.toast"
          :key="browser.toast.id"
          :toast="browser.toast"
          @open="openMessages"
          @dismiss="dismissToast"
        />
      </Transition>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { useVirtualBrowserStore } from '../../store/virtualBrowser.js'
import { MESSAGES_URL, VIRTUAL_BROWSER_NAME } from '../../virtual-web/constants.js'
import BrowserNavigation from './BrowserNavigation.vue'
import BrowserNotifications from './BrowserNotifications.vue'
import BrowserTabs from './BrowserTabs.vue'
import BrowserToast from './BrowserToast.vue'
import BrowserTopBar from './BrowserTopBar.vue'
import { VIRTUAL_BROWSER_KEY } from './browserContext.js'

const props = defineProps({
  browserName: {
    type: String,
    default: VIRTUAL_BROWSER_NAME
  },
  sessionLabel: {
    type: String,
    default: '調査セッション'
  },
  statusText: {
    type: String,
    default: '仮想ネットワークに接続済み'
  },
  toastDuration: {
    type: Number,
    default: 5600
  }
})

const emit = defineEmits([
  'open-url',
  'address-submit',
  'tab-activate',
  'tab-close',
  'new-tab',
  'reload',
  'notification-open'
])

const browser = useVirtualBrowserStore()
const notificationsOpen = ref(false)
const isReloading = ref(false)
const navigation = ref(null)
let reloadTimer = 0
let toastTimer = 0

const tabs = computed(() => browser.openTabs || browser.tabs || [])
const activeTab = computed(() => browser.activeTab)

function tabId(id){
  return `virtual-tab-${String(id).replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function panelId(id){
  return `virtual-panel-${String(id).replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function openUrl(url, options = {}){
  const tab = browser.openVirtualUrl(url, options)
  emit('open-url', { url, options, tab })
  return tab
}

function submitAddress(value){
  const tab = browser.submitAddress(value)
  emit('address-submit', { value, tab })
  return tab
}

function notifyMessage(message){
  return browser.notifyMessage(message)
}

function activateTab(tabIdValue){
  const tab = browser.activateTab(tabIdValue)
  notificationsOpen.value = false
  emit('tab-activate', tab)
  return tab
}

async function closeTab(payload){
  const tabIdValue = typeof payload === 'object' ? payload.tabId : payload
  const focusAfterClose = typeof payload === 'object' && payload.focusAfterClose
  const didClose = browser.closeTab(tabIdValue)
  if(didClose){
    emit('tab-close', tabIdValue)
    if(focusAfterClose){
      await nextTick()
      document.getElementById(tabId(browser.activeTabId))?.focus()
    }
  }
  return didClose
}

async function openBlankTab(){
  const tab = browser.openBlankTab()
  emit('new-tab', tab)
  await nextTick()
  navigation.value?.focusAddress()
  return tab
}

function goBack(){
  return browser.goBack()
}

function goForward(){
  return browser.goForward()
}

function reloadActive(){
  const didReload = browser.reloadActive()
  if(!didReload) return false

  window.clearTimeout(reloadTimer)
  isReloading.value = true
  reloadTimer = window.setTimeout(() => {
    isReloading.value = false
  }, 360)
  emit('reload', activeTab.value)
  return true
}

function toggleNotifications(){
  notificationsOpen.value = !notificationsOpen.value
  emit('notification-open', notificationsOpen.value)
}

function openMessages(){
  notificationsOpen.value = false
  browser.dismissToast()
  return openUrl(MESSAGES_URL)
}

function dismissToast(){
  return browser.dismissToast(browser.toast?.id)
}

watch(() => browser.toast?.id, (toastId) => {
  window.clearTimeout(toastTimer)
  if(!toastId || props.toastDuration <= 0) return
  toastTimer = window.setTimeout(() => browser.dismissToast(toastId), props.toastDuration)
})

provide(VIRTUAL_BROWSER_KEY, {
  browser,
  activeTab,
  openUrl,
  submitAddress,
  notifyMessage,
  activateTab,
  closeTab,
  openBlankTab
})

onMounted(() => browser.initializeBrowser())
onBeforeUnmount(() => {
  window.clearTimeout(reloadTimer)
  window.clearTimeout(toastTimer)
})
</script>

<style scoped>
.virtual-browser-stage{
  --browser-primary:#2563eb;
  --browser-primary-dark:#1d4ed8;
  --browser-text:#172033;
  --browser-muted:#64748b;
  --browser-line:#cbd5e1;
  --browser-surface:#fff;
  --browser-surface-raised:#f8fafc;
  display:grid;
  place-items:center;
  width:100%;
  min-height:100dvh;
  padding:clamp(8px, 2vw, 24px);
  background:
    radial-gradient(circle at 14% 10%, rgba(59,130,246,.16), transparent 30%),
    radial-gradient(circle at 86% 85%, rgba(14,165,233,.1), transparent 32%),
    linear-gradient(145deg, #e7eef8 0%, #d8e2ef 100%);
  color:var(--browser-text);
  font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.virtual-browser{
  position:relative;
  display:flex;
  flex-direction:column;
  width:min(1480px, 100%);
  height:min(920px, calc(100vh - clamp(16px, 4vw, 48px)));
  height:min(920px, calc(100dvh - clamp(16px, 4vw, 48px)));
  min-height:600px;
  overflow:hidden;
  border:1px solid rgba(100,116,139,.45);
  border-radius:20px;
  background:#fff;
  box-shadow:0 30px 80px rgba(30,41,59,.25), 0 5px 18px rgba(30,41,59,.12);
  isolation:isolate;
}

.browser-content{
  position:relative;
  min-height:0;
  overflow:hidden;
  background:#f1f5f9;
  flex:1;
}

.browser-page-panel{
  width:100%;
  height:100%;
  min-height:0;
  overflow:auto;
  background:#fff;
  scrollbar-color:#94a3b8 #e2e8f0;
  scrollbar-width:thin;
}

.browser-page-fallback{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:7px;
  height:100%;
  min-height:280px;
  padding:32px;
  color:#64748b;
  text-align:center;
}

.browser-page-fallback strong{
  color:#1e293b;
  font-size:20px;
}

.browser-page-fallback span{
  font-size:12px;
}

.browser-status-bar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  min-height:27px;
  padding:0 12px;
  border-top:1px solid #dbe3ed;
  background:#f8fafc;
  color:#64748b;
  font-size:9px;
  font-weight:650;
  letter-spacing:.025em;
}

.status-connection,
.status-meta{
  display:flex;
  align-items:center;
  gap:7px;
  min-width:0;
}

.status-dot{
  width:6px;
  height:6px;
  border-radius:50%;
  background:#16a34a;
  box-shadow:0 0 0 2px #dcfce7;
}

.status-separator{
  width:1px;
  height:10px;
  background:#cbd5e1;
}

.toast-enter-active,
.toast-leave-active{
  transition:opacity 200ms ease, transform 200ms ease;
}

.toast-enter-from,
.toast-leave-to{
  opacity:0;
  transform:translateY(-8px) scale(.98);
}

@media (prefers-reduced-motion:reduce){
  .toast-enter-active,
  .toast-leave-active{
    transition:none;
  }
}

@media (max-width:720px){
  .virtual-browser-stage{
    display:block;
    min-height:100vh;
    min-height:100dvh;
    padding:0;
  }

  .virtual-browser{
    width:100%;
    height:100vh;
    height:100dvh;
    min-height:520px;
    border:0;
    border-radius:0;
    box-shadow:none;
  }

  .status-meta{
    display:none;
  }
}
</style>
