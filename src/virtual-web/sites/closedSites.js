// Sites that no longer exist.
//
// Their old pages stay in the search index with their original dates, so a
// year-scoped search turns them up — but every path on the domain now answers
// with the closure notice, and the notice points at the saved copies on
// web-keeper.jp. Link rot, with somewhere to go.

import { defineSite } from './kit.js'

export const yozoraNote = defineSite({
  id: 'yozora-note',
  domain: 'yozora-note.net',
  name: '夜空ノート',
  shortName: '夜空ノート',
  kind: 'blog',
  template: 'closed',
  status: 'closed',
  tagline: 'ベランダからの天体観測記録',
  description: '自宅のベランダから撮影した月と惑星の記録を掲載していた個人サイト。2016年4月に公開を終了しました。',
  keywords: ['天体観測', '月', '惑星', '写真', '個人サイト'],
  authority: 0.3,
  established: '2009年',
  closedAt: '2016-04-30',
  lastUpdated: '2016-03-12',
  operator: '夜空ノート',
  theme: {
    accent: '#3d5a8a',
    accentSoft: '#e8edf5',
    ink: '#1b2330',
    muted: '#5f6a7a',
    page: '#eef1f6',
    line: '#c4ccd8',
    font: 'serif',
    width: 'narrow',
    logo: 'mark'
  },
  staticPages: false,
  data: {
    closingNote: '観測記録のデータは手元に保存しています。再開の予定は未定です。',
    archives: [
      { title: '夜空ノート トップページ（2016年3月19日 保存）', url: 'https://web-keeper.jp/snapshot/yozora-note/2016-03-19', date: '2016-03-19' }
    ]
  },
  pages: [
    {
      path: '/log/2016/03/march-record',
      title: '3月の観測記録',
      kind: 'article',
      category: '観測記録',
      date: '2016-03-12',
      keywords: ['天体観測', '木星', '記録', '2016', '夜空ノート'],
      views: 1200,
      excerpt: '3月は晴れた夜が3日だけ。そのうち2日は月が明るく、残った1日に木星を撮影しました。',
      body: [
        '3月の観測記録。晴れた夜が3日しかなく、そのうち2日は月が明るすぎた。'
      ]
    },
    {
      path: '/log/2015/09/moon-september',
      title: '9月の月',
      kind: 'article',
      category: '観測記録',
      date: '2015-09-28',
      keywords: ['天体観測', '月', '記録', '2015', '夜空ノート'],
      views: 940,
      excerpt: '9月の月の記録。空気が澄んでいて、クレーターの輪郭がはっきり写りました。',
      body: [
        '9月の月の記録。空気が澄んでいて、クレーターの輪郭がはっきり写った。'
      ]
    },
    {
      path: '/log/2014/07/planet-list',
      title: '観測に使っている機材の一覧',
      kind: 'article',
      category: '機材',
      date: '2014-07-06',
      keywords: ['機材', '望遠鏡', 'カメラ', '2014', '夜空ノート'],
      views: 1600,
      excerpt: 'ベランダからの観測に使っている望遠鏡とカメラの一覧。総額は10万円ほどです。',
      body: [
        'ベランダからの観測に使っている機材の一覧。'
      ]
    }
  ]
})

export const softHozon = defineSite({
  id: 'soft-hozon',
  domain: 'soft-hozon.jp',
  name: 'ソフト保存室',
  shortName: 'ソフト保存室',
  kind: 'software-distribution',
  template: 'closed',
  status: 'closed',
  tagline: '自作の小さなソフトを置いていました',
  description: '自作のフリーソフトを配布していた個人サイト。2016年5月に公開を終了しました。',
  keywords: ['フリーソフト', '配布', '自作', '個人サイト', 'ツール'],
  authority: 0.3,
  established: '2008年',
  closedAt: '2016-05-31',
  lastUpdated: '2015-11-20',
  operator: 'ソフト保存室',
  theme: {
    accent: '#8a5a2b',
    accentSoft: '#f4ece2',
    ink: '#241c14',
    muted: '#6a5d50',
    page: '#f3efe9',
    line: '#d8cec1',
    font: 'mono',
    width: 'narrow',
    logo: 'retro'
  },
  staticPages: false,
  data: {
    closingNote: '配布していたソフトの再公開の予定はありません。同種の機能を持つソフトは収録サイトで配布されています。',
    archives: [
      { title: 'ソフト保存室 トップページ（2015年11月30日 保存）', url: 'https://web-keeper.jp/snapshot/soft-hozon/2015-11-30', date: '2015-11-30' }
    ]
  },
  pages: [
    {
      path: '/soft/text-format',
      title: 'テキスト整形ツール v1.4',
      kind: 'article',
      category: '配布',
      date: '2013-08-11',
      keywords: ['テキスト', '整形', 'フリーソフト', '2013', '配布'],
      views: 3400,
      excerpt: '行の折り返しと空白の整理を行う小さなツール。2013年8月に v1.4 を公開しました。',
      body: [
        '行の折り返しと余分な空白の整理を行うツール。'
      ]
    },
    {
      path: '/soft/rename-tool',
      title: '一括改名ツール v2.0',
      kind: 'article',
      category: '配布',
      date: '2014-05-23',
      keywords: ['改名', 'リネーム', 'フリーソフト', '2014', '配布'],
      views: 5100,
      excerpt: 'ファイル名をまとめて変更するツール。2014年5月に v2.0 を公開しました。',
      body: [
        'ファイル名をまとめて変更するツール。連番と日付の付与に対応。'
      ]
    },
    {
      path: '/soft/html-check',
      title: 'HTML簡易チェッカー v1.1',
      kind: 'article',
      category: '配布',
      date: '2012-04-02',
      keywords: ['HTML', 'チェック', 'フリーソフト', '2012', '配布'],
      views: 2200,
      excerpt: 'HTMLの閉じ忘れを検出する簡易ツール。2012年4月に v1.1 を公開しました。',
      body: [
        'HTMLの閉じ忘れと属性の記述ミスを検出する簡易ツール。'
      ]
    }
  ]
})

export const machiTsushin = defineSite({
  id: 'machi-tsushin',
  domain: 'machi-tsushin-asanagi.net',
  name: 'まち通信・朝凪',
  shortName: 'まち通信・朝凪',
  kind: 'local-media',
  template: 'closed',
  status: 'closed',
  tagline: '朝凪の商店街と地域の記録',
  description: '朝凪市の商店街の店舗情報と地域の話題を扱っていた個人運営の地域情報サイト。2015年3月に公開を終了しました。',
  keywords: ['朝凪', '商店街', '地域', '店舗一覧'],
  authority: 0.3,
  established: '2007年',
  closedAt: '2015-03-31',
  lastUpdated: '2015-02-20',
  operator: 'まち通信・朝凪',
  theme: {
    accent: '#5c7a3d',
    accentSoft: '#eef3e7',
    ink: '#1d2418',
    muted: '#5e6a52',
    page: '#f2f5ee',
    line: '#cdd8c3',
    font: 'sans',
    width: 'narrow',
    logo: 'retro'
  },
  staticPages: false,
  data: {
    closingNote: '掲載していた店舗情報は、朝凪タウンナビへ引き継がれています。',
    successor: '朝凪タウンナビ（asanagi-townnavi.jp）',
    archives: [
      { title: 'まち通信・朝凪 トップページ（2013年5月8日 保存）', url: 'https://web-keeper.jp/snapshot/machi-tsushin/2013-05-08', date: '2013-05-08' }
    ]
  },
  pages: [
    {
      path: '/shotengai/list-2013',
      title: '朝凪銀座商店街 店舗一覧（2013年5月現在）',
      kind: 'article',
      category: '商店街',
      date: '2013-05-08',
      keywords: ['商店街', '店舗一覧', '朝凪', '2013', '朝凪銀座'],
      views: 4100,
      excerpt: '2013年5月現在の朝凪銀座商店街の店舗一覧。店舗数68店、空き店舗6件。',
      body: [
        '2013年5月現在の店舗一覧。店舗数は68店、空き店舗は6件。'
      ]
    },
    {
      path: '/topic/2014/arcade-repair',
      title: 'アーケードの改修について（2014年）',
      kind: 'article',
      category: '地域の話題',
      date: '2014-09-17',
      keywords: ['アーケード', '改修', '商店街', '朝凪', '2014'],
      views: 2600,
      excerpt: '1987年設置のアーケードの老朽化と、改修費用の負担についての2014年時点の記録。',
      body: [
        'アーケードの屋根は1987年に設置されたもので、老朽化が指摘されている。費用の負担方法が決まっていない。'
      ]
    },
    {
      path: '/topic/2015/closing',
      title: 'サイトの更新終了について',
      kind: 'article',
      category: 'お知らせ',
      date: '2015-02-20',
      keywords: ['お知らせ', '終了', '朝凪', '2015'],
      views: 1900,
      excerpt: '2015年3月末をもって公開を終了する旨のお知らせ。店舗情報は他サイトへ引き継がれました。',
      body: [
        '3月末をもって公開を終了します。店舗情報の掲載は他のサイトへ引き継ぎます。'
      ]
    }
  ]
})

export const closedSites = Object.freeze([yozoraNote, softHozon, machiTsushin])
