<template>
  <DebugSection id="browser-tabs" title="仮想ブラウザ / タブ" icon="▤" :badge="browser.openTabs.length">
    <div class="dbg-row">
      <input
        v-model.trim="address"
        class="dbg-input dbg-grow"
        type="text"
        placeholder="URL または検索語"
        @keydown.stop
        @keyup.stop
        @keydown.enter="submitAddress"
      />
      <button type="button" class="dbg-btn dbg-btn--primary" @click="submitAddress">開く</button>
    </div>

    <ul class="dbg-list">
      <li
        v-for="tab in browser.openTabs"
        :key="tab.id"
        class="dbg-item"
        :class="{ 'is-active': tab.id === browser.activeTabId }"
      >
        <button type="button" class="dbg-btn dbg-btn--ghost dbg-btn--sm dbg-btn--row" @click="activate(tab)">
          <span class="dbg-item__text">
            <span class="dbg-item__title">{{ tab.title }}<template v-if="tab.unreadCount"> ({{ tab.unreadCount }})</template></span>
            <span class="dbg-item__sub">{{ tab.currentUrl }}</span>
          </span>
        </button>
        <button
          type="button"
          class="dbg-btn dbg-btn--sm dbg-btn--danger"
          :disabled="!tab.closable"
          @click="closeTab(tab)"
        >×</button>
      </li>
    </ul>

    <div class="dbg-grid-3">
      <button type="button" class="dbg-btn" :disabled="!browser.canGoBack" @click="run(() => browser.goBack(), '戻る')">← 戻る</button>
      <button type="button" class="dbg-btn" :disabled="!browser.canGoForward" @click="run(() => browser.goForward(), '進む')">進む →</button>
      <button type="button" class="dbg-btn" @click="run(() => browser.reloadActive(), '再読み込み')">⟳ 再読込</button>
    </div>
    <div class="dbg-grid-3">
      <button type="button" class="dbg-btn" @click="run(() => browser.openBlankTab(), '新規タブ')">＋ 新規タブ</button>
      <button type="button" class="dbg-btn" @click="run(() => browser.closeExtraTabs(), '追加タブを全て閉じた')">余分を閉じる</button>
      <button type="button" class="dbg-btn dbg-btn--danger" @click="run(() => browser.resetBrowser(), 'ブラウザ初期化')">初期化</button>
    </div>
  </DebugSection>

  <DebugSection id="browser-pages" title="ページ直接オープン" icon="⌘" :badge="PAGE_LINKS.length">
    <div class="dbg-stack">
      <button
        v-for="link in PAGE_LINKS"
        :key="link.url"
        type="button"
        class="dbg-btn dbg-btn--wide"
        style="justify-content:space-between;gap:10px"
        @click="open(link)"
      >
        <span>{{ link.label }}</span>
        <span class="dbg-item__sub">{{ link.short }}</span>
      </button>
    </div>
    <p class="dbg-label">エラー系</p>
    <div class="dbg-grid-2">
      <button type="button" class="dbg-btn" @click="run(() => browser.submitAddress('outside.example/not-found'), '未登録URL')">未登録URL</button>
      <button type="button" class="dbg-btn" @click="run(() => browser.submitAddress('javascript:alert(1)'), '不正スキーム')">不正スキーム</button>
    </div>
  </DebugSection>

  <DebugSection id="browser-notify" title="通知 / トースト" icon="◔" :badge="browser.unreadMessageCount">
    <div class="dbg-row">
      <input v-model.trim="toastText" class="dbg-input dbg-grow" type="text" placeholder="通知本文" @keydown.stop @keyup.stop />
      <button type="button" class="dbg-btn dbg-btn--primary" @click="notifyMessage">送信</button>
    </div>
    <div class="dbg-grid-3">
      <button type="button" class="dbg-btn" @click="run(() => browser.setUnreadCount(browser.unreadMessageCount + 1), '未読 +1')">未読 +1</button>
      <button type="button" class="dbg-btn" @click="run(() => browser.markMessagesRead(), '既読にした')">既読</button>
      <button type="button" class="dbg-btn" @click="run(() => browser.dismissToast(browser.toast?.id), 'トーストを閉じた')">トースト消去</button>
    </div>
    <dl class="dbg-facts">
      <div><dt>unread</dt><dd>{{ browser.unreadMessageCount }}</dd></div>
      <div><dt>lastMessage</dt><dd>{{ browser.lastMessageId || '—' }}</dd></div>
      <div><dt>toast</dt><dd>{{ browser.toast ? 'あり' : 'なし' }}</dd></div>
    </dl>
    <p class="dbg-hint">Messages タブを表示中は未読が付かない仕様です。別タブに切り替えてから送信してください。</p>
  </DebugSection>
</template>

<script setup>
import { ref } from 'vue'
import DebugSection from './DebugSection.vue'
import { useDebugConsole } from './debugContext.js'
import { MESSAGES_URL, TRACE_SEARCH_URL, VIRTUAL_URLS } from '../../virtual-web/constants.js'

const shell = useDebugConsole()
const browser = shell.browser
const address = ref('')
const toastText = ref('あの掲示板、まだ見れる？')
let notifySequence = 0

const PAGE_LINKS = Object.freeze([
  { label: 'Messages（DM）', url: MESSAGES_URL },
  { label: 'TRACE Search', url: TRACE_SEARCH_URL },
  { label: '掲示板ログ', url: VIRTUAL_URLS.BBS_THREAD },
  { label: '学校アーカイブ', url: VIRTUAL_URLS.SCHOOL_ARCHIVE },
  { label: '2015年度 卒業記録', url: VIRTUAL_URLS.SCHOOL_GRADUATION_2015 },
  { label: '保存ニュース(2015/03/02)', url: VIRTUAL_URLS.NEWS_20150302 },
  { label: 'ゲーム / 復刻版', url: VIRTUAL_URLS.GAME_REVIVAL },
  { label: 'ゲーム / 初期版', url: VIRTUAL_URLS.GAME_ORIGINAL },
  { label: '新しいタブ', url: VIRTUAL_URLS.BLANK }
].map((link) => ({ ...link, short: link.url.replace(/^https?:\/\//, '') })))

function run(action, label){
  action()
  shell.notify(label)
}

function submitAddress(){
  if(!address.value) return
  browser.submitAddress(address.value)
  shell.notify(`アドレス実行: ${address.value}`)
}

function open(link){
  browser.openVirtualUrl(link.url)
  shell.notify(`開いた: ${link.label}`)
}

function activate(tab){
  browser.activateTab(tab.id)
  shell.notify(`タブ切替: ${tab.title}`)
}

function closeTab(tab){
  browser.closeTab(tab.id)
  shell.notify(`タブを閉じた: ${tab.title}`)
}

function notifyMessage(){
  notifySequence += 1
  browser.notifyMessage({
    id: `debug-toast-${notifySequence}`,
    sender: '水野ヒロキ',
    title: '新しいメッセージ',
    preview: toastText.value || 'デバッグ通知'
  })
  shell.notify('通知を送信')
}
</script>
