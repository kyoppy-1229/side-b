// One-click states for the debug console.
//
// Every scenario receives the sandbox stores and rebuilds a concrete situation
// from them, so a tester can jump straight to the moment they want to look at
// instead of replaying the story to reach it.

import { EDITIONS, FLOOR_DEFINITIONS } from '../game/data/school.js'
// Import attribute required: this module is also loaded by the node check
// scripts, which will not read a JSON module without it.
import reunionScript from '../data/reunion_prologue.json' with { type: 'json' }
import { STORY_CHAPTERS } from '../story/chapters.js'
import { STORY_MILESTONES } from '../story/transitions.js'
import { clearReunionProgress, writeReunionProgress } from '../story/reunionProgress.js'
import { MESSAGES_URL, TRACE_SEARCH_URL, VIRTUAL_URLS } from '../virtual-web/constants.js'

export const SCENARIO_GROUPS = Object.freeze([
  { id: 'story', label: '本編フロー', icon: '①' },
  { id: 'revival', label: '復刻版', icon: '②' },
  { id: 'original', label: '初期版', icon: '③' },
  { id: 'web', label: '仮想Web / UI', icon: '④' },
  { id: 'general-web', label: '一般Web', icon: '⑤' }
])

// The monologue is a milestone-only mark, so a scenario that starts after it has
// to set it by name rather than walk the transition table to it.
const { SEARCH_TUTORIAL_SEEN } = STORY_MILESTONES

const ALL_ROOMS = Object.freeze(['1F', '2F', '3F'].flatMap((floor) => FLOOR_DEFINITIONS[floor].rooms))

// The story positions the scenarios drop into, named once so a scenario reads as
// a place in the story instead of a pair of strings.
const AT = Object.freeze({
  REUNION: Object.freeze([STORY_CHAPTERS.PROLOGUE, 'reunion']),
  DEVICE_SETUP: Object.freeze([STORY_CHAPTERS.PROLOGUE, 'device_setup']),
  CHAT_LOGIN: Object.freeze([STORY_CHAPTERS.PROLOGUE, 'chat_login']),
  CHAT_HOME: Object.freeze([STORY_CHAPTERS.PROLOGUE, 'chat_home']),
  PROLOGUE_DM: Object.freeze([STORY_CHAPTERS.PROLOGUE, 'dm']),
  PROLOGUE_DM_DONE: Object.freeze([STORY_CHAPTERS.PROLOGUE, 'dm_complete']),
  BBS: Object.freeze([STORY_CHAPTERS.CH2_RECORDS_2015, 'bbs_opened']),
  AFTER_BBS: Object.freeze([STORY_CHAPTERS.CH3_BLUE_BIRDS, 'bird_prompt'])
})

// Debug-only shortcut: the milestones the story would have collected on the way
// are filled in, so a jumped-to state behaves like a played-to one.
function setStory({ storyState }, [chapter, step]){
  storyState.debugSetPosition(chapter, step, { syncMilestones: true })
}

// Puts the reunion back on screen at a chosen line.
function setReunionLine(context, index){
  const line = reunionScript[Math.min(Math.max(index, 0), reunionScript.length - 1)]
  if(line) writeReunionProgress(line.id)
  setStory(context, AT.REUNION)
}

function beatIndex(beat){
  return reunionScript.findIndex((line) => line.beat === beat)
}

function resetAll(context){
  context.storyState.resetStory()
  context.game.resetAll()
  context.browser.resetBrowser()
}

// The DM thread keeps its reveal index in the component, so a scenario that
// wants a read thread flips the persistent preference as well — that way the
// state survives the stage remount that follows every apply. Revealing also
// opens the thread (ChatApp dispatches MIZUNO_THREAD_OPENED), so a read thread
// never lands on the chat home.
function setChatRead({ debug }, read){
  debug.setPref('autoRevealChat', read)
  debug.restartChat()
  if(read) debug.revealChat()
}

// Boots one edition into a concrete place, bypassing the normal entry flow.
function bootGame({ game }, edition, {
  floor = '1F',
  roomId = null,
  basement = null,
  anomaly = 0,
  visited = null,
  memories = null,
  storyFlags = null,
  clockState = null
} = {}){
  game.selectEdition(edition)
  game.start(edition)
  if(basement) game.setBasementAccess(basement)
  if(anomaly) game.setAnomalyLevel(anomaly)
  if(visited) game.setVisitedRooms(visited, edition)
  if(memories) game.setMemories(memories, edition)
  if(storyFlags) for(const [flag, value] of Object.entries(storyFlags)) game.setStoryFlag(flag, value)
  if(clockState) for(const [clockId, state] of Object.entries(clockState)) game.setClockState(clockId, state)
  return game.debugMoveTo({ floor, roomId })
}

// The general web is addressed by domain + path, so a scenario only has to name
// the URL it wants to look at.
function openWeb({ browser }, ...urls){
  for(const url of urls) browser.openVirtualUrl(`https://${url}`)
}

function openGameTab({ browser }, edition){
  browser.openVirtualUrl(edition === EDITIONS.ORIGINAL ? VIRTUAL_URLS.GAME_ORIGINAL : VIRTUAL_URLS.GAME_REVIVAL)
}

// A game scenario: reset, set the story phase the game is reachable from, boot
// the edition and surface it in a browser tab.
function gameScenario(edition, options, position = AT.AFTER_BBS){
  return (context) => {
    resetAll(context)
    setStory(context, position)
    bootGame(context, edition, options)
    openGameTab(context, edition)
  }
}

export const SCENARIOS = Object.freeze([
  // ---- 本編フロー ------------------------------------------------------
  {
    id: 'story-reunion',
    group: 'story',
    label: '序章 同窓会シーン（最初から）',
    note: '全リセット / 居酒屋の1行目・環境音つき',
    apply(context){
      resetAll(context)
      clearReunionProgress()
      setStory(context, AT.REUNION)
      setChatRead(context, false)
      context.browser.openVirtualUrl(MESSAGES_URL)
    }
  },
  {
    id: 'story-reunion-memory-gap',
    group: 'story',
    label: '同窓会「記憶の食い違い」から',
    note: '中村の記憶違いの場面から再開（演出変化なしの確認）',
    apply(context){
      resetAll(context)
      setReunionLine(context, beatIndex('memory_gap'))
    }
  },
  {
    id: 'story-reunion-outro',
    group: 'story',
    label: '同窓会 最後の台詞',
    note: '暗転 →「――同窓会から、数日後。」→ PCのセットアップ確認',
    apply(context){
      resetAll(context)
      setReunionLine(context, reunionScript.length - 1)
    }
  },
  {
    id: 'story-device-setup',
    group: 'story',
    label: '新しいPCのデータ移行',
    note: '同窓会の数日後 / 旧PC→新PCの移行演出 → ブラウザを開くまで',
    apply(context){
      resetAll(context)
      clearReunionProgress()
      setStory(context, AT.DEVICE_SETUP)
      setChatRead(context, false)
      context.browser.openVirtualUrl(MESSAGES_URL)
    }
  },
  {
    id: 'story-chat-login',
    group: 'story',
    label: 'Chat 再ログイン',
    note: '移行データのアカウントでログイン → 履歴なしの空スレッド',
    apply(context){
      resetAll(context)
      setStory(context, AT.CHAT_LOGIN)
      setChatRead(context, false)
      context.browser.openVirtualUrl(MESSAGES_URL)
    }
  },
  {
    id: 'story-chat-home',
    group: 'story',
    label: 'Chatホーム＋検索チュートリアル',
    note: 'ログイン直後 / 最近の会話は空 / 主人公が検索の使い方を話す',
    apply(context){
      resetAll(context)
      setStory(context, AT.CHAT_HOME)
      setChatRead(context, false)
      context.browser.openVirtualUrl(MESSAGES_URL)
    }
  },
  {
    id: 'story-first-search',
    group: 'story',
    label: '初回検索待ち（チュートリアル済み）',
    note: 'TRACE Searchで何か検索すると数秒後に水野から届く',
    apply(context){
      resetAll(context)
      setStory(context, AT.CHAT_HOME)
      context.storyState.markMilestone(SEARCH_TUTORIAL_SEEN, true)
      setChatRead(context, false)
      context.browser.openVirtualUrl(TRACE_SEARCH_URL)
    }
  },
  {
    id: 'story-prologue',
    group: 'story',
    label: 'Ch.1 プロローグDM（最初から）',
    note: '水野のスレッドを開いた直後 / 1件目から進行',
    apply(context){
      resetAll(context)
      setStory(context, AT.PROLOGUE_DM)
      setChatRead(context, false)
      context.browser.openVirtualUrl(MESSAGES_URL)
    }
  },
  {
    id: 'story-prologue-read',
    group: 'story',
    label: 'Ch.1 プロローグDM読了',
    note: '22件すべて既読（入力ゲートなし）',
    apply(context){
      resetAll(context)
      setStory(context, AT.PROLOGUE_DM)
      context.browser.openVirtualUrl(MESSAGES_URL)
      setChatRead(context, true)
    }
  },
  {
    id: 'story-prologue-complete',
    group: 'story',
    label: '序章完了（リンク待ち）',
    note: 'prologue / dm_complete。復刻版はまだ解放されない',
    apply(context){
      resetAll(context)
      setStory(context, AT.PROLOGUE_DM_DONE)
      context.browser.openVirtualUrl(MESSAGES_URL)
      setChatRead(context, true)
    }
  },
  {
    id: 'story-search',
    group: 'story',
    label: '検索ステップ（TRACE Search）',
    note: '「SIDE-B 2015」で検索済みの状態',
    apply(context){
      setStory(context, AT.PROLOGUE_DM)
      context.browser.submitAddress('SIDE-B 2015')
    }
  },
  {
    id: 'story-bbs',
    group: 'story',
    label: 'Ch.2 掲示板ログ',
    note: '掲示板を開いた状態 / スレッドタブを開く',
    apply(context){
      setStory(context, AT.BBS)
      context.browser.openVirtualUrl(VIRTUAL_URLS.BBS_THREAD)
    }
  },
  {
    id: 'story-news',
    group: 'story',
    label: '掲示板 → 保存ニュース',
    note: '2015/03/02 のキャッシュページ',
    apply(context){
      setStory(context, AT.BBS)
      context.browser.openVirtualUrl(VIRTUAL_URLS.BBS_THREAD)
      context.browser.openVirtualUrl(VIRTUAL_URLS.NEWS_20150302)
    }
  },
  {
    id: 'story-archive',
    group: 'story',
    label: '学校アーカイブ / 卒業記録',
    note: '青い鳥・集合写真の資料ページ',
    apply(context){
      context.browser.openVirtualUrl(VIRTUAL_URLS.SCHOOL_ARCHIVE)
      context.browser.openVirtualUrl(VIRTUAL_URLS.SCHOOL_GRADUATION_2015)
    }
  },
  {
    id: 'story-after-bbs',
    group: 'story',
    label: 'Ch.3 掲示板後DM（冒頭）',
    note: 'フェーズ=掲示板後 / 入力ゲート手前から',
    apply(context){
      setStory(context, AT.AFTER_BBS)
      context.browser.openVirtualUrl(MESSAGES_URL)
      setChatRead(context, false)
    }
  },
  {
    id: 'story-after-bbs-read',
    group: 'story',
    label: 'Ch.3 掲示板後DM読了',
    note: '入力ゲート4か所を自動回答して最後まで',
    apply(context){
      setStory(context, AT.AFTER_BBS)
      context.browser.openVirtualUrl(MESSAGES_URL)
      setChatRead(context, true)
    }
  },

  // ---- 復刻版 ----------------------------------------------------------
  {
    id: 'revival-title',
    group: 'revival',
    label: 'タイトル画面',
    note: 'セーブなし / START・CONTINUE の出し分け確認',
    apply(context){
      resetAll(context)
      setStory(context, AT.AFTER_BBS)
      context.game.selectEdition(EDITIONS.REVIVAL)
      openGameTab(context, EDITIONS.REVIVAL)
    }
  },
  {
    id: 'revival-start',
    group: 'revival',
    label: '開始直後（1F 昇降口）',
    note: 'STARTした直後の位置',
    apply: gameScenario(EDITIONS.REVIVAL, { floor: '1F', roomId: 'F1-01' })
  },
  {
    id: 'revival-corridor',
    group: 'revival',
    label: '1F 廊下',
    note: 'ドア・階段の当たり判定確認',
    apply: gameScenario(EDITIONS.REVIVAL, { floor: '1F' })
  },
  {
    id: 'revival-3f',
    group: 'revival',
    label: '3F 廊下（階段移動後）',
    note: '上階の描画とカメラ追従',
    apply: gameScenario(EDITIONS.REVIVAL, { floor: '3F' })
  },
  {
    id: 'revival-music-room',
    group: 'revival',
    label: '1F 音楽室（特別教室）',
    note: '特別教室レイアウトの確認',
    apply: gameScenario(EDITIONS.REVIVAL, { floor: '1F', roomId: 'F1-06' })
  },
  {
    id: 'revival-explored',
    group: 'revival',
    label: '地上18部屋 踏破済み',
    note: '進捗HUD・思い出カウンタの最大表示',
    apply: gameScenario(EDITIONS.REVIVAL, {
      floor: '2F',
      visited: ALL_ROOMS,
      memories: [
        'memory:school-layout',
        'memory:school-notices',
        'memory:graduation',
        'memory:class-life',
        'memory:school-history',
        'memory:class-photo',
        'memory:school-news',
        'memory:archive-record'
      ]
    })
  },
  {
    id: 'revival-basement-denied',
    group: 'revival',
    label: '地下は常に不可',
    note: '解放フラグを立ててもB1が出ないこと',
    apply: gameScenario(EDITIONS.REVIVAL, {
      floor: '1F',
      basement: { unlocked: true, canAccess: true }
    })
  },

  // ---- 初期版 ----------------------------------------------------------
  {
    id: 'original-title',
    group: 'original',
    label: 'タイトル画面（ver 1.00）',
    note: 'LOAD / CONFIG メニューの表示',
    apply(context){
      resetAll(context)
      setStory(context, AT.AFTER_BBS)
      context.game.selectEdition(EDITIONS.ORIGINAL)
      openGameTab(context, EDITIONS.ORIGINAL)
    }
  },
  {
    id: 'original-start',
    group: 'original',
    label: '開始直後（1F 昇降口）',
    note: '夕方トーン / スキャンライン',
    apply: gameScenario(EDITIONS.ORIGINAL, { floor: '1F', roomId: 'F1-01' })
  },
  {
    id: 'original-anomaly-1',
    group: 'original',
    label: '違和感 Lv.1（掲示物の差異）',
    note: 'anomalyLevel=1',
    apply: gameScenario(EDITIONS.ORIGINAL, { floor: '1F', roomId: 'F1-01', anomaly: 1 })
  },
  {
    id: 'original-anomaly-max',
    group: 'original',
    label: '違和感 Lv.4 + 時計異常',
    note: 'anomalyPhase フラグ / 全時計 reverse',
    apply: gameScenario(EDITIONS.ORIGINAL, {
      floor: '3F',
      roomId: 'F3-03',
      anomaly: 4,
      storyFlags: { anomalyPhase: true },
      clockState: {
        'clock-1f-hall': 'reverse',
        'clock-2f-hall': 'stopped',
        'clock-3f-hall': 'reverse',
        'clock-f1-entrance': 'offset'
      }
    })
  },
  {
    id: 'original-basement-locked',
    group: 'original',
    label: '地下 LOCKED',
    note: '未解放 / ワープ拒否メッセージ',
    apply: gameScenario(EDITIONS.ORIGINAL, {
      floor: '1F',
      basement: { unlocked: false, canAccess: false }
    })
  },
  {
    id: 'original-basement-unlocked',
    group: 'original',
    label: '地下 UNLOCKED（進入不可）',
    note: '解放済みだが条件未達の分岐',
    apply: gameScenario(EDITIONS.ORIGINAL, {
      floor: '1F',
      basement: { unlocked: true, canAccess: false }
    })
  },
  {
    id: 'original-basement-access',
    group: 'original',
    label: '地下 ACCESS（B1 廊下）',
    note: '地下ゲート通過後',
    apply: gameScenario(EDITIONS.ORIGINAL, {
      floor: 'B1',
      basement: { unlocked: true, canAccess: true }
    })
  },
  {
    id: 'original-basement-room',
    group: 'original',
    label: '地下 B1-03 資料室',
    note: '最深部の部屋',
    apply: gameScenario(EDITIONS.ORIGINAL, {
      floor: 'B1',
      roomId: 'B1-03',
      basement: { unlocked: true, canAccess: true }
    })
  },

  // ---- 仮想Web / UI ----------------------------------------------------
  {
    id: 'web-error',
    group: 'web',
    label: 'エラーページ（未登録URL）',
    note: 'ERR_VIRTUAL_HOST_NOT_FOUND',
    apply(context){
      context.browser.submitAddress('outside.example/not-found')
    }
  },
  {
    id: 'web-blank',
    group: 'web',
    label: '新しいタブ（about:blank）',
    note: 'おすすめリンクとアドレス入力',
    apply(context){
      context.browser.openBlankTab()
    }
  },
  {
    id: 'web-unread',
    group: 'web',
    label: '未読通知 + トースト',
    note: '他タブ表示中に水野からDMが来た状態',
    apply(context){
      context.browser.openVirtualUrl(VIRTUAL_URLS.SCHOOL_ARCHIVE)
      context.browser.notifyMessage({
        id: `debug-${context.browser.openTabs.length}-${context.storyState.step}`,
        sender: '水野ヒロキ',
        title: '新しいメッセージ',
        preview: 'あの掲示板、まだ見れる？'
      })
    }
  },
  {
    id: 'web-many-tabs',
    group: 'web',
    label: 'タブを大量に開く',
    note: 'タブバーの詰まり / 省略表示の確認',
    apply(context){
      for(const url of [
        VIRTUAL_URLS.BBS_THREAD,
        VIRTUAL_URLS.NEWS_20150302,
        VIRTUAL_URLS.SCHOOL_ARCHIVE,
        VIRTUAL_URLS.SCHOOL_GRADUATION_2015,
        VIRTUAL_URLS.GAME_REVIVAL,
        VIRTUAL_URLS.GAME_ORIGINAL
      ]) context.browser.openVirtualUrl(url)
      context.browser.openBlankTab()
    }
  },
  {
    id: 'web-fresh',
    group: 'web',
    label: 'ブラウザだけ初期化',
    note: 'Messages / TRACE Search の2タブに戻す',
    apply(context){
      context.browser.resetBrowser()
      context.browser.openVirtualUrl(TRACE_SEARCH_URL)
    }
  },

  // ---- 一般Web ---------------------------------------------------------
  // 本編とは無関係な2026年のインターネット側。テンプレートごとの見た目と、
  // 年代検索・閉鎖サイト・404の挙動を1クリックで確認できるようにしている。
  {
    id: 'gweb-portal',
    group: 'general-web',
    label: 'ポータル（NaviWeb）',
    note: '検索窓・注目キーワード・天気パネル',
    apply(context){
      openWeb(context, 'naviweb.jp/')
    }
  },
  {
    id: 'gweb-news-now',
    group: 'general-web',
    label: '2026年のニュース記事',
    note: '東都ニュース / 2カラム・見出しリスト',
    apply(context){
      openWeb(context, 'tohto-news.jp/', 'tohto-news.jp/articles/2026/08/cloud-textbook')
    }
  },
  {
    id: 'gweb-news-2015',
    group: 'general-web',
    label: '2015年の記事（当時レイアウト）',
    note: 'layout: 2010s の表示確認',
    apply(context){
      openWeb(context, 'digital-scope.jp/articles/2015/school-windows7', 'houkago-log.net/log/2015/0417')
    }
  },
  {
    id: 'gweb-templates',
    group: 'general-web',
    label: 'テンプレート一覧を開く',
    note: '掲示板 / Q&A / 事典 / 行政 / EC / 映画 / 天気',
    apply(context){
      openWeb(
        context,
        'minna-bbs.net/thread/pc/8842',
        'q-link.jp/questions/18472',
        'minna-pedia.jp/entry/windows-7',
        'city.asanagi.lg.jp/kurashi/gomi',
        'mono-market.jp/product/kb-104q',
        'cinema-pocket.jp/film/nagisa-no-toshokan',
        'weatherline.jp/area/asanagi'
      )
    }
  },
  {
    id: 'gweb-search-era',
    group: 'general-web',
    label: '年代検索（学校 パソコン 2015）',
    note: '2014〜2016年の記事が上位に来ること',
    apply(context){
      context.browser.submitAddress('学校 パソコン 2015')
    }
  },
  {
    id: 'gweb-search-now',
    group: 'general-web',
    label: '現在の検索（今日の天気）',
    note: '年代指定なし → 2026年の情報が上位',
    apply(context){
      context.browser.submitAddress('今日の天気')
    }
  },
  {
    id: 'gweb-search-story',
    group: 'general-web',
    label: '本編語句で検索（分離の確認）',
    note: '一般Webは0件 / 本編の保存記録だけが出る',
    apply(context){
      context.browser.submitAddress('SIDE-B')
    }
  },
  {
    id: 'gweb-closed',
    group: 'general-web',
    label: '閉鎖サイトと保存版',
    note: '記事URL → 閉鎖告知 → ウェブ保存庫',
    apply(context){
      openWeb(
        context,
        'yozora-note.net/log/2016/03/march-record',
        'web-keeper.jp/snapshot/yozora-note/2016-03-19'
      )
    }
  },
  {
    id: 'gweb-notfound',
    group: 'general-web',
    label: 'サイト内404 / 接続エラー',
    note: '既知ドメインは自前の404、未知ドメインは接続エラー',
    apply(context){
      openWeb(context, 'tohto-news.jp/articles/9999/nope')
      context.browser.submitAddress('outside.example/not-found')
    }
  },
  {
    id: 'gweb-archive',
    group: 'general-web',
    label: 'アーカイブ回遊',
    note: '年別 → 月別 → カテゴリ → サイト内検索',
    apply(context){
      openWeb(
        context,
        'digital-scope.jp/archive/2015',
        'pc-life.jp/archive/2015/08',
        'tohto-news.jp/category/society',
        'minna-pedia.jp/search?q=%E5%AD%A6%E6%A0%A1'
      )
    }
  }
])

export const SCENARIOS_BY_GROUP = Object.freeze(
  SCENARIO_GROUPS.map((group) => Object.freeze({
    ...group,
    scenarios: Object.freeze(SCENARIOS.filter((scenario) => scenario.group === group.id))
  }))
)
