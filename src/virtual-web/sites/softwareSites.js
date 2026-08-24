// Freeware review and distribution sites. Every title is invented; nothing here
// mirrors a real product or a real distribution site.

import { defineSite } from './kit.js'

export const madobeSoft = defineSite({
  id: 'madobe-soft',
  domain: 'madobe-soft.jp',
  name: '窓辺のフリーソフト',
  shortName: '窓辺のフリーソフト',
  kind: 'software-review',
  template: 'software',
  tagline: '小さな道具を、ていねいに紹介',
  description: 'PC作業を助ける無償のソフトウェアを紹介しています。2011年から更新しています。',
  keywords: ['フリーソフト', 'ソフト', '紹介', 'ツール', '無料'],
  authority: 0.5,
  established: '2011年',
  lastUpdated: '2026-08-07',
  defaultAuthor: 'まどべ',
  operator: '窓辺のフリーソフト',
  history: [
    { year: '2011', text: 'ソフト紹介サイトとして開設' },
    { year: '2016', text: '掲載ソフトが300本を超える' },
    { year: '2022', text: '掲載基準を見直し、更新が止まったソフトに注記を追加' }
  ],
  theme: {
    accent: '#3a6ea5',
    accentSoft: '#e9f0f7',
    ink: '#1b232c',
    muted: '#5c6875',
    page: '#eff3f7',
    line: '#c9d5e0',
    font: 'sans',
    width: 'normal',
    logo: 'retro'
  },
  nav: [
    { label: '画像', path: '/category/image' },
    { label: '文書', path: '/category/text' },
    { label: 'ファイル', path: '/category/file' },
    { label: 'システム', path: '/category/system' },
    { label: '一覧', path: '/archive' }
  ],
  categories: [
    { slug: 'image', label: '画像' },
    { slug: 'text', label: '文書' },
    { slug: 'file', label: 'ファイル' },
    { slug: 'system', label: 'システム' }
  ],
  intro: [
    '作業のなかの小さな面倒を解決する道具を紹介しています。掲載しているのはすべて無償で使えるものです。導入時の注意点も併せて記載しています。'
  ],
  sidebar: { ranking: true, archiveList: true, aboutText: '無償で使えるソフトを紹介しています。掲載内容は公開時点のものです。' },
  pages: [
    {
      path: '/soft/imageshrink',
      title: 'ImageShrink — 画像をまとめて縮小する',
      kind: 'software',
      category: '画像',
      date: '2013-04-18',
      updatedAt: '2026-05-30',
      keywords: ['画像', '縮小', 'リサイズ', 'フリーソフト', '一括'],
      art: 'screenshot',
      views: 34200,
      comments: 41,
      weight: 1.2,
      subtitle: 'フォルダごと放り込むだけで、指定した幅に揃えて保存する',
      excerpt: '画像を指定した幅に揃えて一括保存する道具。フォルダを指定するだけで動き、元のファイルは変更しない。',
      data: {
        version: '3.4.2',
        file: 'imageshrink342.zip',
        size: '2.1 MB',
        license: 'フリーソフト（寄付歓迎）',
        os: ['Windows 10', 'Windows 11'],
        downloads: 486000
      },
      body: [
        '画像を指定した幅に揃えて保存するだけの道具である。フォルダを指定して幅を入力すれば、その中の画像をまとめて処理する。',
        { h: '使い方' },
        { ol: [
          '処理したい画像が入ったフォルダを画面に放り込む',
          '出力する幅（画素数）を入力する',
          '「実行」を押す'
        ] },
        '出力先は「shrink」という名前のフォルダが自動で作られる。元のファイルには一切触れないため、失敗しても影響がない。',
        { h: '良い点' },
        { ul: [
          '設定項目が少なく、迷う場所がない',
          '処理が速い（100枚で数秒）',
          '保存時の画質を数値で指定できる'
        ] },
        { h: '注意点' },
        '透過を含む画像は、保存形式によって背景が白くなる。透過を維持したい場合は出力形式の設定を確認する必要がある。',
        { note: '配布元は作者のサイトです。収録サイト経由の古い版が出回っているため、更新日を確認してください。', label: '注意' }
      ],
      items: [
        { version: '3.4.2', date: '2026-05-30', text: '出力形式の選択を追加' },
        { version: '3.3.0', date: '2024-02-11', text: '処理速度を改善' },
        { version: '3.0.0', date: '2020-08-04', text: '画面構成を刷新' },
        { version: '1.0.0', date: '2013-04-18', text: '公開' }
      ]
    },
    {
      path: '/soft/quicknote',
      title: 'QuickNote — 起動が速いだけのメモ帳',
      kind: 'software',
      category: '文書',
      date: '2012-09-05',
      updatedAt: '2025-11-19',
      keywords: ['メモ帳', 'エディタ', 'テキスト', 'フリーソフト', '軽量'],
      art: 'screenshot',
      views: 28100,
      comments: 33,
      subtitle: '思いついたことを書き留めるまでの時間を、できるだけ短くする',
      excerpt: '起動の速さだけを目的にしたテキストエディタ。呼び出しから入力開始までが速い。',
      data: {
        version: '2.8.0',
        file: 'quicknote280.zip',
        size: '840 KB',
        license: 'フリーソフト',
        os: ['Windows 10', 'Windows 11'],
        downloads: 312000
      },
      body: [
        '機能を増やさないことを方針にしているテキストエディタである。呼び出してから入力を始めるまでの時間が短い。',
        { h: '特徴' },
        { ul: [
          '常駐しておき、キー操作で呼び出せる',
          '終了時に自動保存されるため、保存操作が不要',
          '設定ファイルが1つだけで、持ち運びできる'
        ] },
        { h: '向いていない用途' },
        '長い文章の編集や、複数ファイルを並べる作業には向かない。検索と置換はあるが、正規表現には対応していない。',
        '「思いついたことを書き留める」という一点に絞られているため、それ以外を期待すると物足りない。逆にその用途では代わりが見つかりにくい。'
      ],
      items: [
        { version: '2.8.0', date: '2025-11-19', text: '自動保存の間隔を設定可能に' },
        { version: '2.5.1', date: '2022-06-08', text: '文字数表示を追加' },
        { version: '2.0.0', date: '2018-03-22', text: '常駐機能を追加' },
        { version: '1.0.0', date: '2012-09-05', text: '公開' }
      ]
    },
    {
      path: '/soft/dupfinder',
      title: 'DupFinder — 重複したファイルを探す',
      kind: 'software',
      category: 'ファイル',
      date: '2014-11-27',
      updatedAt: '2024-09-14',
      keywords: ['重複', 'ファイル', '整理', 'フリーソフト', '削除'],
      art: 'screenshot',
      views: 19800,
      comments: 27,
      subtitle: '同じ内容のファイルを見つけて一覧にする（削除は手動）',
      excerpt: '内容が同一のファイルを探して一覧表示する道具。削除は利用者が選んで行う方式。',
      data: {
        version: '1.9.4',
        file: 'dupfinder194.zip',
        size: '1.4 MB',
        license: 'フリーソフト',
        os: ['Windows 10', 'Windows 11'],
        downloads: 158000
      },
      body: [
        'ファイル名ではなく内容を比較して、同一のファイルを探す道具である。写真の整理でよく使われる。',
        { h: '安全な設計' },
        'この種の道具で怖いのは自動削除だが、本ソフトは削除を自動で行わない。一覧に出た候補から、利用者が選んで削除する方式である。',
        { h: '処理時間の目安' },
        { table: {
          head: ['対象', '件数', '所要時間'],
          rows: [
            ['写真フォルダ', '約1万件', '約2分'],
            ['書類フォルダ', '約5万件', '約7分'],
            ['外付け装置全体', '約30万件', '約50分']
          ]
        } },
        { note: '容量の大きい装置を対象にすると、読み込みで負荷がかかります。作業中は他の処理を避けてください。', label: '注意' }
      ],
      items: [
        { version: '1.9.4', date: '2024-09-14', text: '比較処理を高速化' },
        { version: '1.7.0', date: '2020-01-30', text: '除外フォルダの指定を追加' },
        { version: '1.0.0', date: '2014-11-27', text: '公開' }
      ]
    },
    {
      path: '/soft/batchrename',
      title: 'BatchRename — ファイル名をまとめて変える',
      kind: 'software',
      category: 'ファイル',
      date: '2015-06-11',
      updatedAt: '2023-04-02',
      keywords: ['ファイル名', 'リネーム', '一括', 'フリーソフト', '2015'],
      art: 'screenshot',
      views: 22400,
      comments: 19,
      layout: '2010s',
      subtitle: '連番、置換、日付の付与を、実行前に確認できる',
      excerpt: 'ファイル名の一括変更を行う道具。変更後の名前を実行前に一覧で確認できる。',
      data: {
        version: '2.2.1',
        file: 'batchrename221.zip',
        size: '960 KB',
        license: 'フリーソフト',
        os: ['Windows 8.1', 'Windows 10', 'Windows 11'],
        downloads: 204000
      },
      body: [
        'ファイル名の一括変更を行う道具である。連番の付与、文字列の置換、撮影日の付与ができる。',
        { h: '実行前の確認が要点' },
        '一括変更で最も危ないのは、意図しない名前になることだ。本ソフトは変更後の名前を一覧に表示するため、実行前に結果を確認できる。',
        { h: '写真の整理での使い方' },
        '撮影日を先頭に付けて連番を続ける形式にすると、複数の機器で撮った写真を1つのフォルダにまとめても時系列で並ぶ。',
        { code: '20150611_001.jpg\n20150611_002.jpg\n20150612_001.jpg', lang: 'text' },
        '元に戻す機能はないため、重要なフォルダで使う場合は控えを取ってから実行するのが安全である。'
      ],
      items: [
        { version: '2.2.1', date: '2023-04-02', text: '対応環境を追加' },
        { version: '2.0.0', date: '2018-10-15', text: '確認一覧の表示を改善' },
        { version: '1.0.0', date: '2015-06-11', text: '公開' }
      ]
    },
    {
      path: '/soft/startupclean',
      title: 'StartupClean — 起動時に動くものを整理する',
      kind: 'software',
      category: 'システム',
      date: '2016-02-20',
      updatedAt: '2025-07-08',
      keywords: ['起動', '常駐', '軽くする', 'フリーソフト', '整理'],
      art: 'screenshot',
      views: 26700,
      comments: 52,
      subtitle: '起動時に動くものを一覧にし、止めた影響を戻せるようにする',
      excerpt: 'PCの起動時に自動で動くソフトを一覧表示し、個別に止められる道具。設定はいつでも戻せる。',
      data: {
        version: '4.1.0',
        file: 'startupclean410.zip',
        size: '1.8 MB',
        license: 'フリーソフト',
        os: ['Windows 10', 'Windows 11'],
        downloads: 372000
      },
      body: [
        '起動時に自動で動くソフトを一覧表示し、個別に止められる道具である。止めた設定は記録され、いつでも元に戻せる。',
        { h: '止めてよいものの見分け方' },
        { ul: [
          '常時使っていない周辺機器の付属ソフト：止めてよい',
          '更新の確認だけを行うもの：止めてよい（手動で確認する）',
          '入力方式や表示に関わるもの：止めない',
          '判断できないもの：止めない'
        ] },
        { h: '効果の目安' },
        '常駐が10本を超えている環境では、起動から使えるまでの時間が2割程度短くなる例が多い。すでに整理されている環境では体感の差はほとんどない。',
        { note: '判断できない項目を止めると、周辺機器が動かなくなる場合があります。1つずつ止めて再起動し、影響を確認してください。', label: '注意' }
      ],
      items: [
        { version: '4.1.0', date: '2025-07-08', text: '一覧の説明文を追加' },
        { version: '4.0.0', date: '2021-11-12', text: '設定の復元機能を追加' },
        { version: '1.0.0', date: '2016-02-20', text: '公開' }
      ]
    },
    {
      path: '/soft/oldlog-viewer',
      title: 'OldLog Viewer — 保存したHTMLを一覧で読む',
      kind: 'software',
      category: '文書',
      date: '2014-08-03',
      updatedAt: '2019-05-21',
      keywords: ['HTML', '保存', '閲覧', 'フリーソフト', 'ログ', '2014'],
      art: 'screenshot',
      views: 9100,
      comments: 14,
      layout: '2010s',
      subtitle: '手元に保存したページを、フォルダごと読み進める',
      excerpt: '保存したHTMLファイルを一覧から順に読むための閲覧用ソフト。更新は2019年で止まっている。',
      data: {
        version: '1.3.0',
        file: 'oldlogviewer130.zip',
        size: '1.1 MB',
        license: 'フリーソフト',
        os: ['Windows 7', 'Windows 8.1', 'Windows 10'],
        downloads: 41000
      },
      body: [
        '手元に保存したHTMLファイルを、フォルダ単位で一覧にして順に読むための道具である。個人サイトを保存していた利用者向けに作られた。',
        { h: '機能' },
        { ul: [
          'フォルダ内のHTMLを題名で一覧表示',
          '本文だけを抽出して表示する簡易モード',
          '保存日時での並べ替え'
        ] },
        { note: '2019年以降、更新が止まっています。新しい環境では文字化けが起きる場合があるという報告があります。', label: '更新停止' },
        '作者からの案内では、後継の開発予定はないとのこと。現在は代替として一般のブラウザーで開く方法が案内されている。'
      ],
      items: [
        { version: '1.3.0', date: '2019-05-21', text: '文字コードの判定を改善' },
        { version: '1.0.0', date: '2014-08-03', text: '公開' }
      ]
    }
  ]
})

export const vectoria = defineSite({
  id: 'vectoria',
  domain: 'vectoria.jp',
  name: 'Vectoria',
  shortName: 'Vectoria',
  kind: 'software-library',
  template: 'software',
  tagline: 'ソフトウェア収録ライブラリ',
  description: '作者から登録されたソフトウェアを収録・配布しているライブラリサイトです。',
  keywords: ['ソフトウェア', 'ダウンロード', '収録', 'ライブラリ', 'フリーソフト'],
  authority: 0.7,
  established: '2001年',
  lastUpdated: '2026-08-18',
  operator: 'ベクトリア運営部',
  history: [
    { year: '2001', text: 'ソフトウェア収録サイトとして開設' },
    { year: '2009', text: '収録本数が5万本を超える' },
    { year: '2017', text: '同梱ソフトの掲載基準を厳格化' },
    { year: '2024', text: '古い収録物に「更新停止」の表示を追加' }
  ],
  theme: {
    accent: '#c0562c',
    accentSoft: '#fbeee7',
    ink: '#231a15',
    muted: '#6b5d55',
    page: '#f6f2ee',
    line: '#ded1c7',
    font: 'sans',
    width: 'wide',
    logo: 'square'
  },
  nav: [
    { label: '画像・映像', path: '/category/media' },
    { label: '文書', path: '/category/text' },
    { label: 'ユーティリティ', path: '/category/utility' },
    { label: '学習', path: '/category/study' },
    { label: '収録一覧', path: '/archive' }
  ],
  categories: [
    { slug: 'media', label: '画像・映像' },
    { slug: 'text', label: '文書' },
    { slug: 'utility', label: 'ユーティリティ' },
    { slug: 'study', label: '学習' }
  ],
  intro: [
    '作者から登録されたソフトウェアを収録しています。収録物は登録時の内容であり、最新版は作者のサイトで公開されている場合があります。'
  ],
  sidebar: { ranking: true, aboutText: '収録は作者からの登録によります。内容についての責任は作者に帰属します。' },
  pages: [
    {
      path: '/library/utility/fileguard',
      title: 'FileGuard',
      kind: 'software',
      category: 'ユーティリティ',
      date: '2011-03-09',
      updatedAt: '2026-04-22',
      keywords: ['バックアップ', '複製', 'ファイル', 'ソフト', '自動'],
      art: 'screenshot',
      views: 61200,
      comments: 88,
      subtitle: '指定したフォルダを別の場所へ複製し続ける',
      excerpt: '指定フォルダを別の場所へ定期的に複製する道具。差分のみを写すため2回目以降が速い。',
      data: {
        version: '5.2.0',
        file: 'fileguard520.zip',
        size: '3.6 MB',
        license: 'フリーソフト',
        os: ['Windows 10', 'Windows 11'],
        downloads: 1240000
      },
      body: [
        '指定したフォルダを別の場所へ複製し続ける道具である。前回からの差分だけを写すため、2回目以降の処理が速い。',
        { h: '設定の考え方' },
        '写す元と先を指定し、実行の間隔を決めるだけである。削除したファイルを先でも削除するかどうかは選択でき、既定では削除しない設定になっている。',
        { h: '注意' },
        '複製は控えであって履歴ではない。誤って上書きしたファイルを元に戻したい場合は、世代を残す設定を有効にする必要がある。',
        { spec: [
          { label: '差分複製', value: '対応' },
          { label: '世代管理', value: '最大10世代' },
          { label: 'ネットワーク上の保存先', value: '対応' },
          { label: '暗号化', value: '非対応' }
        ] }
      ],
      items: [
        { version: '5.2.0', date: '2026-04-22', text: '大量ファイル時の処理を改善' },
        { version: '5.0.0', date: '2022-09-01', text: '世代管理を追加' },
        { version: '3.0.0', date: '2016-05-14', text: '差分複製に対応' },
        { version: '1.0.0', date: '2011-03-09', text: '収録' }
      ]
    },
    {
      path: '/library/media/photolens',
      title: 'PhotoLens',
      kind: 'software',
      category: '画像・映像',
      date: '2010-07-21',
      updatedAt: '2025-10-03',
      keywords: ['画像', '閲覧', 'ビューア', '写真', 'ソフト'],
      art: 'screenshot',
      views: 48700,
      comments: 61,
      subtitle: '大量の写真を素早く送りながら見る閲覧ソフト',
      excerpt: '写真の閲覧に特化したソフト。読み込みが速く、大量の画像をキー操作で送れる。',
      data: {
        version: '6.0.1',
        file: 'photolens601.zip',
        size: '5.2 MB',
        license: 'フリーソフト',
        os: ['Windows 10', 'Windows 11'],
        downloads: 890000
      },
      body: [
        '写真の閲覧に特化したソフトである。次の画像を先読みするため、キーを押した瞬間に切り替わる。',
        { h: '選別に向いた設計' },
        '閲覧しながら「採用」「除外」の印を付けられる。印を付けた画像だけを別フォルダに移す機能があり、撮影後の選別作業に向いている。',
        { h: '編集はできない' },
        '回転と切り抜き以外の編集機能はない。色や明るさの調整が必要な場合は、別のソフトと併用する前提になっている。'
      ],
      items: [
        { version: '6.0.1', date: '2025-10-03', text: '対応する画像形式を追加' },
        { version: '5.0.0', date: '2019-12-11', text: '選別機能を追加' },
        { version: '1.0.0', date: '2010-07-21', text: '収録' }
      ]
    },
    {
      path: '/library/study/kanji-drill',
      title: '漢字ドリルメーカー',
      kind: 'software',
      category: '学習',
      date: '2012-04-02',
      updatedAt: '2021-08-17',
      keywords: ['学習', '漢字', 'ドリル', '印刷', '教材', 'ソフト'],
      art: 'screenshot',
      views: 33400,
      comments: 45,
      subtitle: '学年別の漢字から練習用紙を作って印刷する',
      excerpt: '学年別の漢字から練習用紙を作成して印刷するソフト。学校や家庭で使われている。',
      data: {
        version: '3.1.0',
        file: 'kanjidrill310.zip',
        size: '4.8 MB',
        license: 'フリーソフト（学校での利用可）',
        os: ['Windows 8.1', 'Windows 10', 'Windows 11'],
        downloads: 470000
      },
      body: [
        '学年別の漢字から練習用紙を作成し、印刷するソフトである。学校の授業や家庭学習で使われている。',
        { h: '作成できる形式' },
        { ul: [
          'なぞり書き（薄い字を重ねて書く）',
          '書き取り（読みだけを表示）',
          '読み取り（漢字だけを表示）',
          '混合（1枚に複数形式）'
        ] },
        '1枚あたりの問題数と、行の高さを指定できる。低学年向けにマスを大きくする設定もある。',
        { note: '学校での利用は無償で可能ですが、作成した用紙の外部への配布は作者への確認が必要です。', label: '利用範囲' }
      ],
      items: [
        { version: '3.1.0', date: '2021-08-17', text: '印刷余白の調整を追加' },
        { version: '3.0.0', date: '2017-03-05', text: '混合形式を追加' },
        { version: '1.0.0', date: '2012-04-02', text: '収録' }
      ]
    },
    {
      path: '/library/text/tsv-editor',
      title: 'TSV Editor',
      kind: 'software',
      category: '文書',
      date: '2015-01-16',
      updatedAt: '2024-06-25',
      keywords: ['CSV', 'TSV', '表', '編集', 'ソフト', '2015'],
      art: 'screenshot',
      views: 27800,
      comments: 30,
      subtitle: '区切り文字の表データを、崩さずに開いて直す',
      excerpt: '区切り文字で並んだ表データを、書式変換をせずに開いて編集できるソフト。',
      data: {
        version: '2.4.0',
        file: 'tsveditor240.zip',
        size: '2.9 MB',
        license: 'フリーソフト',
        os: ['Windows 10', 'Windows 11'],
        downloads: 219000
      },
      body: [
        '区切り文字で並んだ表データを、内容を変換せずに開いて編集できるソフトである。',
        { h: '表計算ソフトとの違い' },
        '表計算ソフトで開くと、先頭の0が消える、日付として解釈される、といった変換が起きる。本ソフトは文字列としてそのまま扱うため、この問題が起きない。',
        { h: '向いている作業' },
        { ul: [
          '出力されたデータの一部を手で直す',
          '列の並びを入れ替える',
          '文字コードを変換して保存する'
        ] },
        '大量の行を扱う場合の処理は軽く、10万行程度までは問題なく開ける。'
      ],
      items: [
        { version: '2.4.0', date: '2024-06-25', text: '文字コードの判定を改善' },
        { version: '2.0.0', date: '2019-02-08', text: '列操作を追加' },
        { version: '1.0.0', date: '2015-01-16', text: '収録' }
      ]
    },
    {
      path: '/library/utility/timerlock',
      title: 'TimerLock',
      kind: 'software',
      category: 'ユーティリティ',
      date: '2013-10-30',
      updatedAt: '2018-11-06',
      keywords: ['タイマー', 'ロック', '時間', 'ソフト', '2013'],
      art: 'screenshot',
      views: 12600,
      comments: 22,
      layout: '2010s',
      subtitle: '指定した時間が来たら画面を施錠する',
      excerpt: '指定した時刻や経過時間で画面を施錠する常駐ソフト。更新は2018年で停止している。',
      data: {
        version: '1.5.2',
        file: 'timerlock152.zip',
        size: '620 KB',
        license: 'フリーソフト',
        os: ['Windows 7', 'Windows 8.1', 'Windows 10'],
        downloads: 74000
      },
      body: [
        '指定した時刻、または経過時間で画面を施錠する常駐ソフトである。作業時間を区切る目的で使われた。',
        '施錠の解除には利用者の資格情報が必要で、単純な閉じる操作では解除できない。ただし電源を切れば回避できるため、強制力を期待する用途には向かない。',
        { note: '2018年以降、更新が止まっています。新しい環境では常駐が解除される場合があるという報告があります。', label: '更新停止' }
      ],
      items: [
        { version: '1.5.2', date: '2018-11-06', text: '対応環境を追加' },
        { version: '1.0.0', date: '2013-10-30', text: '収録' }
      ]
    }
  ]
})

export const softwareSites = Object.freeze([madobeSoft, vectoria])
