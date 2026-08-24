// The address book that came across with the migration.
//
// The prologue turns on the fact that the account is old but the handset is
// new: the conversation history stayed on the old PC, the contacts did not.
// This is that list — the classmates the protagonist has had saved since school
// and the official accounts every RE:TRACE account carries — so the 連絡先 count
// on the home screen has something real behind it.
//
// Nobody here can be written to. `hold` is the protagonist's own reason for not
// sending, and it is what the contacts screen shows in place of a compose
// button: the only thread the prologue has is the one 水野 opens himself.

// The icons are the ones these people would be using now, not the 2015
// portraits in photo/solo/ — those are school uniforms and a classroom wall,
// eleven years out of date for an address book read in 2026. They are rebuilt
// by scripts/build-contact-avatars.mjs; see photo/contacts/README.md.
//
// 水野 is the exception, and on purpose: he is the one contact the story
// actually talks to, so he keeps the face the rest of the game gives him.
import { MIZUNO_AVATAR } from './avatars.js'
import nakamuraAvatar from '../../photo/contacts/中村ユイ.png'
import satoAvatar from '../../photo/contacts/佐藤ダイキ.png'
import ogawaAvatar from '../../photo/contacts/小川トオル.png'
import yamadaAvatar from '../../photo/contacts/山田アヤ.png'
import hondaAvatar from '../../photo/contacts/本田ナオキ.png'
import hayashiAvatar from '../../photo/contacts/林ミサキ.png'
import tanakaAvatar from '../../photo/contacts/田中シン.png'
import suzukiAvatar from '../../photo/contacts/鈴木レナ.png'
import { VIRTUAL_URLS } from '../../virtual-web/constants.js'

export const CONTACT_GROUPS = Object.freeze({
  FRIENDS: 'friends',
  OFFICIAL: 'official'
})

export const CONTACT_GROUP_LABELS = Object.freeze({
  [CONTACT_GROUPS.FRIENDS]: '友だち',
  [CONTACT_GROUPS.OFFICIAL]: '公式アカウント'
})

function friend(contact){
  return Object.freeze({
    group: CONTACT_GROUPS.FRIENDS,
    online: false,
    comment: '',
    ...contact
  })
}

function official(contact){
  return Object.freeze({
    group: CONTACT_GROUPS.OFFICIAL,
    official: true,
    online: true,
    comment: '',
    hold: '公式アカウントだ。こちらから送っても、自動応答が返るだけだろう。',
    ...contact
  })
}

export const CHAT_CONTACTS = Object.freeze([
  // 水野 is the only contact the story ever opens a thread with — and even he
  // is written to only after he writes first, which is why he carries a hold
  // like everyone else.
  friend({
    id: 'mizuno',
    conversationId: 'mizuno',
    name: '水野ヒロキ',
    handle: '@hiroki_mzn',
    avatar: MIZUNO_AVATAR,
    comment: '懐かしいものを掘り返し中',
    note: '同級生 / 3年B組',
    online: true,
    detail: '同窓会で連絡先を交換し直した。今のところ、この端末で唯一トークが動いている相手。',
    hold: '番号を交換し直したばかりだ。用もないのに送るのも変か。'
  }),
  friend({
    id: 'tanaka',
    name: '田中シン',
    handle: '@shin_tnk',
    avatar: tanakaAvatar,
    comment: '幹事はもうやらない',
    note: '同級生 / 3年B組',
    detail: '同窓会の幹事。SIDE-B の話を最初に掘り返した一人。',
    hold: '昨日会ったばかりだ。今わざわざ送ることもないか。'
  }),
  friend({
    id: 'yamada',
    name: '山田アヤ',
    handle: '@aya_ymd',
    avatar: yamadaAvatar,
    comment: '引っ越しました',
    note: '同級生 / 3年B組',
    detail: '同窓会でSIDE-Bの名前を出した本人。',
    hold: '同窓会で少し話しただけだ。今は連絡しなくていいか。'
  }),
  friend({
    id: 'nakamura',
    name: '中村ユイ',
    handle: '@yui_nkmr',
    avatar: nakamuraAvatar,
    comment: '通知はあまり見ていません',
    note: '同級生 / 3年A組',
    detail: 'SIDE-Bをやった記憶がないと言っていた。',
    hold: '記憶にないと言っていた。今それを聞いても、困らせるだけだ。'
  }),
  friend({
    id: 'sato',
    name: '佐藤ダイキ',
    handle: '@daiki_st',
    avatar: satoAvatar,
    comment: '出張続きです',
    note: '同級生 / 3年A組',
    detail: '卒業後は連絡を取っていない。番号だけが残っている。',
    hold: '卒業以来、一度も送っていない。今さら送る理由もない。'
  }),
  friend({
    id: 'ogawa',
    name: '小川トオル',
    handle: '@toru_ogw',
    avatar: ogawaAvatar,
    comment: 'ぼちぼちやっています',
    note: '同級生 / 3年C組',
    detail: '卒業後は連絡を取っていない。番号だけが残っている。',
    hold: '顔も思い出すのに少しかかった。送る用事はない。'
  }),
  friend({
    id: 'honda',
    name: '本田ナオキ',
    handle: '@naoki_hnd',
    // Not everyone bothers to set one; the screen says so rather than hiding it.
    comment: '',
    avatar: hondaAvatar,
    note: '同級生 / 3年C組',
    detail: '卒業後は連絡を取っていない。番号だけが残っている。',
    hold: '同窓会にも来ていなかった。今は連絡しなくていいか。'
  }),
  friend({
    id: 'hayashi',
    name: '林ミサキ',
    handle: '@misaki_hys',
    avatar: hayashiAvatar,
    comment: '返信は遅めです',
    note: '同級生 / 3年A組',
    detail: '卒業後は連絡を取っていない。番号だけが残っている。',
    hold: '返信は遅いと書いてある。急ぐ話でもない。'
  }),
  friend({
    id: 'suzuki',
    name: '鈴木レナ',
    handle: '@rena_szk',
    avatar: suzukiAvatar,
    comment: '猫と暮らしています',
    note: '同級生 / 3年B組',
    detail: '卒業後は連絡を取っていない。番号だけが残っている。',
    hold: '卒業以来、一度も送っていない。今さら送る理由もない。'
  }),

  official({
    id: 'retrace-support',
    name: 'RE:TRACE サポート',
    handle: '@retrace_support',
    initial: 'RE',
    accent: '#2869c7',
    comment: 'お困りのときはヘルプをご確認ください',
    note: '公式 / アカウント案内',
    detail: '端末の移行やログインについての案内。問い合わせは自動応答で返る。'
  }),
  official({
    id: 'trace-search',
    name: 'TRACE Search お知らせ',
    handle: '@trace_search',
    initial: 'TS',
    accent: '#3f7f5f',
    comment: '検索のコツを配信中',
    note: '公式 / 検索',
    detail: '検索のヒントと障害情報を配信している。',
    url: VIRTUAL_URLS.TRACE_SEARCH
  }),
  official({
    id: 'weatherline',
    name: 'WeatherLine',
    handle: '@weatherline',
    initial: 'WL',
    accent: '#3d7fb8',
    comment: '今日の天気をお届けします',
    note: '公式 / 天気',
    detail: '地域の天気を毎朝配信している。',
    url: 'https://weatherline.jp/'
  }),
  official({
    id: 'tohto-news',
    name: '東都ニュースオンライン',
    handle: '@tohto_news',
    initial: '東',
    accent: '#b0563a',
    comment: '最新のニュースをお届けします',
    note: '公式 / ニュース',
    detail: '全国と地方のニュースを配信している。',
    url: 'https://tohto-news.jp/'
  }),
  official({
    id: 'naviweb',
    name: 'NaviWeb',
    handle: '@naviweb',
    initial: 'NW',
    accent: '#6a5aa8',
    comment: '今日のおすすめを更新しました',
    note: '公式 / ポータル',
    detail: 'ポータルの更新情報を配信している。',
    url: 'https://naviweb.jp/'
  })
])

export const CONTACT_COUNT = CHAT_CONTACTS.length
