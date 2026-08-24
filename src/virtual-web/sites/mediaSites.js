// Reviews: games, films, music. Every title, studio, artist and label here is
// invented. SIDE-B is never listed on any of them.

import { defineSite } from './kit.js'

export const indieGameLog = defineSite({
  id: 'indie-game-log',
  domain: 'indie-game-log.jp',
  name: 'Indie Game Log',
  shortName: 'Indie Game Log',
  kind: 'game-review',
  template: 'media',
  tagline: '個人制作のゲームを、遊んで書く',
  description: '個人・小規模制作のゲームを取り上げるレビューサイト。プレイ時間と読みどころを添えて紹介しています。',
  keywords: ['ゲーム', 'インディー', 'レビュー', '個人制作'],
  authority: 0.55,
  established: '2015年',
  lastUpdated: '2026-08-15',
  defaultAuthor: 'すずき',
  operator: 'Indie Game Log',
  history: [
    { year: '2015', text: 'レビューサイトとして開設' },
    { year: '2020', text: '掲載本数が500本を超える' },
    { year: '2026', text: 'プレイ時間の表記を統一' }
  ],
  theme: {
    accent: '#7c5ce0',
    accentSoft: '#efeafc',
    ink: '#1a1726',
    muted: '#8b8aa0',
    surface: '#ffffff',
    page: '#f4f3f9',
    line: '#ddd9ec',
    font: 'sans',
    width: 'wide',
    logo: 'square'
  },
  nav: [
    { label: 'パズル', path: '/category/puzzle' },
    { label: 'アクション', path: '/category/action' },
    { label: '物語', path: '/category/story' },
    { label: '探索', path: '/category/explore' },
    { label: '一覧', path: '/archive' }
  ],
  categories: [
    { slug: 'puzzle', label: 'パズル' },
    { slug: 'action', label: 'アクション' },
    { slug: 'story', label: '物語' },
    { slug: 'explore', label: '探索' }
  ],
  homeCopy: { lead: '個人・小規模で作られたゲームを、実際に遊んでから書いています。評点は5点満点です。' },
  sidebar: { ranking: true, tags: true, aboutText: '掲載は編集部が購入・入手した作品のみです。' },
  data: { shape: 'poster', defaultArt: 'poster' },
  pages: [
    {
      path: '/review/kagerou-station',
      title: '『陽炎ステーション』— 待つことしかできない駅で',
      kind: 'review',
      category: '物語',
      date: '2026-08-15',
      tags: ['物語', '短編'],
      keywords: ['ゲーム', 'レビュー', '陽炎ステーション', '物語', 'インディー'],
      art: 'culture-cinema-music',
      views: 14200,
      comments: 38,
      weight: 1.2,
      subtitle: '制作：ゆうなぎ工房 ／ プレイ時間 約2時間',
      excerpt: '無人駅で列車を待つだけのゲーム。操作はほとんどないが、待合室に置かれた物と時刻表から町の歴史が組み上がる。',
      data: {
        score: 4,
        year: '2026',
        maker: 'ゆうなぎ工房',
        itemsTitle: '章構成'
      },
      facts: [
        { label: '制作', value: 'ゆうなぎ工房' },
        { label: '価格', value: '980円' },
        { label: 'プレイ時間', value: '約2時間' },
        { label: '分類', value: '物語 / 一本道' }
      ],
      lead: '無人駅で列車を待つ。それだけのゲームである。だが待合室に置かれた物が、少しずつ町の履歴を語り出す。',
      body: [
        '操作できることはほとんどない。ベンチに座る、時刻表を見る、置かれた物を手に取る。列車は決められた時刻にしか来ない。',
        { h: '物が語る構成' },
        '待合室には、忘れられた傘、貼り替えられた運賃表、掲示板に残った古い連絡が置かれている。手に取ると短い文が表示され、それが積み重なって、この駅がいつまで使われていたのかが分かってくる。',
        '説明的な語りは一切ない。分かるのは、時刻表の改正回数と、掲示物の日付の差だけである。それでも十分に伝わる。',
        { h: '気になった点' },
        '2章の中盤に、次に何をすべきか分からなくなる箇所がある。実は「何もしないで待つ」が正解なのだが、その示し方が弱い。ここで詰まって離脱する人がいるだろう。',
        { h: '総評' },
        '短い作品だが、終わったあとに駅の写真を撮りたくなる。日常の風景の見え方を変えるという点で、価格以上の体験だった。'
      ],
      items: [
        { title: '第1章 夕方の待合室', note: '約30分' },
        { title: '第2章 時刻表の改正', note: '約50分' },
        { title: '第3章 最終列車', note: '約40分' }
      ],
      posts: [
        { no: 1, name: 'みかん', date: '2026/08/16', likes: 5, text: '2章で止まりました。待つのが正解と気づかず30分うろうろしてた。' },
        { no: 2, name: 'tsuki', date: '2026/08/18', likes: 4, text: '終わったあと本当に駅に行きました。同じ気持ちの人がいて安心した。' }
      ]
    },
    {
      path: '/review/block-garden',
      title: '『ブロックガーデン』— 1面5分の設計が正しい',
      kind: 'review',
      category: 'パズル',
      date: '2026-06-28',
      tags: ['パズル', '短時間'],
      keywords: ['ゲーム', 'パズル', 'レビュー', '短時間', 'インディー'],
      art: 'poster',
      views: 11800,
      comments: 24,
      excerpt: '1面5分で区切れるパズル。難易度の上げ方が丁寧で、平日でも続けやすい設計になっている。',
      data: { score: 4, year: '2026', maker: '三日月ソフト' },
      facts: [
        { label: '制作', value: '三日月ソフト' },
        { label: '価格', value: '640円' },
        { label: 'プレイ時間', value: '1面5分 / 全120面' },
        { label: '分類', value: 'パズル' }
      ],
      lead: '1面が5分で終わる。この設計だけで、平日に遊べるゲームとして成立している。',
      body: [
        '盤面にブロックを置いて、庭の形を整えるパズル。ルールは単純で、説明は最初の3面で終わる。',
        { h: '難易度の上げ方' },
        '新しい要素は10面ごとに1つだけ増える。増えたあとの3面は、その要素だけで解ける問題になっている。この配置が丁寧で、詰まる時間が短い。',
        { h: '中断のしやすさ' },
        '面の途中で閉じても、盤面がそのまま保存される。パズルとしては当然の配慮だが、これがあるかないかで平日に遊べるかが変わる。',
        { h: '不満点' },
        '後半40面は、要素の組み合わせが増えるだけで新しい発見が少ない。100面あたりで満足して止めてもよいと思う。'
      ],
      posts: [
        { no: 1, name: 'なぎ', date: '2026/07/02', likes: 3, text: '通勤中に1面ずつやってます。ちょうどいい長さ。' }
      ]
    },
    {
      path: '/review/lantern-run',
      title: '『ランタンラン』— 光を運ぶだけの横スクロール',
      kind: 'review',
      category: 'アクション',
      date: '2026-03-22',
      tags: ['アクション'],
      keywords: ['ゲーム', 'アクション', 'レビュー', '横スクロール', 'インディー'],
      art: 'poster',
      views: 8700,
      comments: 17,
      excerpt: '灯りを消さずに運ぶ横スクロールアクション。操作は2つだけだが、後半の風の演出が難しさを作っている。',
      data: { score: 3, year: '2026', maker: 'こだま制作室' },
      facts: [
        { label: '制作', value: 'こだま制作室' },
        { label: '価格', value: '820円' },
        { label: 'プレイ時間', value: '約4時間' },
        { label: '分類', value: 'アクション' }
      ],
      lead: '灯りを消さないように運ぶ。操作は走ると跳ぶの2つだけである。',
      body: [
        '灯りを持って走る。風が吹く場所では立ち止まり、体で庇う。ルールはこれだけで、説明は不要なほど分かりやすい。',
        { h: '良い点' },
        '風の吹き方が面ごとに違い、覚えて対応する楽しさがある。音の作りが丁寧で、風の音が来る前にわずかな予兆が入る。',
        { h: '厳しい点' },
        '後半の面は、予兆を聞き分けられないと運任せになる。難易度の選択がないため、ここで止まる人は多いだろう。灯りが消えた時のやり直し位置も遠い。',
        { h: '総評' },
        '前半は良い。後半の調整が惜しい作品だが、雰囲気を味わうだけでも価値はある。'
      ]
    },
    {
      path: '/review/museum-of-notes',
      title: '『メモの博物館』— 他人の書き置きを読む',
      kind: 'review',
      category: '探索',
      date: '2025-11-30',
      tags: ['探索', '物語'],
      keywords: ['ゲーム', '探索', 'レビュー', 'インディー', '物語'],
      art: 'poster',
      views: 16400,
      comments: 52,
      weight: 1.1,
      excerpt: '閉館した博物館で、残された書き置きを読み進める探索ゲーム。読む順番が変わると印象が変わる構造。',
      data: { score: 5, year: '2025', maker: '灰色スタジオ' },
      facts: [
        { label: '制作', value: '灰色スタジオ' },
        { label: '価格', value: '1,480円' },
        { label: 'プレイ時間', value: '約6時間' },
        { label: '分類', value: '探索 / 物語' }
      ],
      lead: '閉館した博物館に残された書き置きを、順番に読んでいく。それだけの構造で6時間もつ。',
      body: [
        '来場者が残した感想の紙、職員の引き継ぎ、業者への指示書。館内に散らばった紙を集めて読むゲームである。',
        { h: '順番で印象が変わる' },
        '紙には日付があるが、拾う順番は自由だ。先に読んだ紙が後の紙の意味を変える。同じ内容でも、読む順で受け取り方が変わるように書かれている。',
        '2周目に別の順路を選ぶと、まったく違う話に見える。これが意図された設計だと分かるのは、2周目の終盤である。',
        { h: '注意点' },
        '文章量が多い。読むことが目的の作品なので、それを楽しめるかで評価が大きく変わる。マップに戻る導線が弱く、拾い忘れた紙を探すのに時間がかかった。',
        { h: '総評' },
        '「読ませる」ことに徹した作品としては、今年いちばんの完成度だった。'
      ],
      posts: [
        { no: 1, name: 'あおい', date: '2025/12/03', likes: 12, text: '2周目で全然違う話に見えて驚きました。よくできてる。' },
        { no: 2, name: 'ハル', date: '2025/12/11', likes: 6, text: '文章量は多いけど、退屈な紙が一枚もないのがすごい。' },
        { no: 3, name: 'kei', date: '2026/01/08', likes: 3, text: '拾い忘れ探しがつらかった。地図が欲しい。' }
      ]
    },
    {
      path: '/review/tide-tower',
      title: '『潮の塔』— 積み上げて、崩す',
      kind: 'review',
      category: 'パズル',
      date: '2025-07-14',
      tags: ['パズル'],
      keywords: ['ゲーム', 'パズル', 'レビュー', '積む', 'インディー'],
      art: 'poster',
      views: 6900,
      comments: 11,
      excerpt: '潮の満ち引きに合わせて塔を積むパズル。時間の要素が入ることで、単純な積み上げが別の遊びになっている。',
      data: { score: 4, year: '2025', maker: 'なみま' },
      facts: [
        { label: '制作', value: 'なみま' },
        { label: '価格', value: '520円' },
        { label: 'プレイ時間', value: '約3時間' },
        { label: '分類', value: 'パズル' }
      ],
      lead: '積み上げるパズルに、潮の満ち引きという時間の要素が加わっている。',
      body: [
        '塔を高く積むだけなら難しくない。だが一定時間ごとに水位が上がり、下の段が使えなくなる。',
        'この仕組みのおかげで、「高く積む」ではなく「どこを捨てるか」を考えるゲームになっている。積み方の最適解が水位によって変わるため、同じ盤面でも二度目は別の解き方になる。',
        '演出は控えめで、水位の音だけが変化を知らせる。派手さはないが、集中しやすい。'
      ]
    },
    {
      path: '/review/paper-planet',
      title: '『紙の惑星』— 折って進む',
      kind: 'review',
      category: 'パズル',
      date: '2024-09-08',
      tags: ['パズル', '短編'],
      keywords: ['ゲーム', 'パズル', 'レビュー', '折る', 'インディー'],
      art: 'poster',
      views: 5300,
      comments: 8,
      excerpt: '地形を折りたたんで道を作るパズル。発想は面白いが、操作の分かりにくさが惜しい。',
      data: { score: 3, year: '2024', maker: 'おりがみラボ' },
      facts: [
        { label: '制作', value: 'おりがみラボ' },
        { label: '価格', value: '440円' },
        { label: 'プレイ時間', value: '約2時間' },
        { label: '分類', value: 'パズル' }
      ],
      body: [
        '地形そのものを折りたたんで、離れた場所を繋げるパズルである。発想は面白い。',
        'ただし、どこを折れるのかが画面から読み取りにくい。折り目の表示が薄く、試行錯誤が「考える」より「探す」になってしまう。',
        '折り目の表示を濃くする設定があれば評価は変わったと思う。仕組み自体は他にない体験なので、続編に期待したい。'
      ]
    }
  ]
})

export const gameTana = defineSite({
  id: 'game-tana',
  domain: 'game-tana.jp',
  name: 'ゲーム棚',
  shortName: 'ゲーム棚',
  kind: 'game-review',
  template: 'media',
  tagline: 'みんなの棚から、ひとこと',
  description: '利用者が投稿するゲームレビューサイト。点数と短い感想を投稿できます。',
  keywords: ['ゲーム', 'レビュー', '投稿', '感想', '評価'],
  authority: 0.45,
  established: '2010年',
  lastUpdated: '2026-08-13',
  operator: 'ゲーム棚 運営',
  history: [
    { year: '2010', text: '投稿型レビューサイトとして開設' },
    { year: '2016', text: '点数の平均表示を追加' },
    { year: '2023', text: '投稿ガイドラインを改定' }
  ],
  theme: {
    accent: '#e0a33a',
    accentSoft: '#fdf4e4',
    ink: '#20242c',
    muted: '#7b8290',
    page: '#f5f6f8',
    line: '#e0e3e8',
    font: 'sans',
    width: 'normal',
    logo: 'circle'
  },
  nav: [
    { label: '新着レビュー', path: '/archive' },
    { label: 'パズル', path: '/category/puzzle' },
    { label: 'RPG', path: '/category/rpg' },
    { label: 'シミュレーション', path: '/category/sim' }
  ],
  categories: [
    { slug: 'puzzle', label: 'パズル' },
    { slug: 'rpg', label: 'RPG' },
    { slug: 'sim', label: 'シミュレーション' }
  ],
  homeCopy: { lead: '利用者による投稿レビューです。点数は投稿者個人の評価です。' },
  sidebar: { ranking: true, ad: true },
  data: { shape: 'square', defaultArt: 'abstract' },
  pages: [
    {
      path: '/title/hoshi-no-tetsudou',
      title: '星の鉄道',
      kind: 'review',
      category: 'RPG',
      date: '2026-08-13',
      tags: ['RPG'],
      keywords: ['ゲーム', 'RPG', 'レビュー', '星の鉄道', '投稿'],
      art: 'jacket',
      views: 9400,
      comments: 6,
      subtitle: '発売：2026年 ／ 平均 4.2 / 5.0（投稿6件）',
      excerpt: '路線を延ばしながら町を育てるRPG。戦闘より運行計画が主体で、テンポの良さが評価されている。',
      data: { score: 4, year: '2026', maker: '青灯ゲームズ' },
      facts: [
        { label: '発売', value: '2026年5月' },
        { label: '制作', value: '青灯ゲームズ' },
        { label: '平均点', value: '4.2 / 5.0' },
        { label: '投稿数', value: '6件' }
      ],
      body: [
        '路線を延ばしながら沿線の町を育てるRPG。戦闘はあるが、主体は運行計画である。',
        '投稿されたレビューでは、テンポの良さと、町の変化が目に見える点が高く評価されている。一方、後半の路線図が広がりすぎて管理が煩雑になるという指摘が複数あった。'
      ],
      posts: [
        { no: 1, name: 'いちの', date: '2026/08/13', likes: 5, text: '町が育つのが目に見えて楽しい。時間を忘れる。' },
        { no: 2, name: 'ゆう', date: '2026/07/28', likes: 4, text: '後半は路線が多すぎて管理が大変。地図の機能がもう少し欲しい。' },
        { no: 3, name: 'まめ', date: '2026/06/19', likes: 5, text: '戦闘が少ないのが逆に良かった。運行の計画を立てるのが本編。' }
      ]
    },
    {
      path: '/title/kumo-no-machi',
      title: '雲の街づくり',
      kind: 'review',
      category: 'シミュレーション',
      date: '2026-05-06',
      tags: ['シミュレーション'],
      keywords: ['ゲーム', 'シミュレーション', '街づくり', 'レビュー', '投稿'],
      art: 'jacket',
      views: 7100,
      comments: 5,
      subtitle: '発売：2025年 ／ 平均 3.8 / 5.0（投稿5件）',
      excerpt: '空中の島に街を作るシミュレーション。序盤の分かりやすさと、後半の数値管理の重さで評価が分かれている。',
      data: { score: 4, year: '2025', maker: 'ひばり工房' },
      facts: [
        { label: '発売', value: '2025年11月' },
        { label: '制作', value: 'ひばり工房' },
        { label: '平均点', value: '3.8 / 5.0' },
        { label: '投稿数', value: '5件' }
      ],
      body: [
        '空中の島に街を作るシミュレーション。土地が限られているため、拡張よりも配置の工夫が中心になる。',
        '序盤の導入は丁寧で、初めてこの種のゲームを触る人にも分かりやすい。一方、中盤以降は管理する数値が増え、画面を行き来する時間が長くなる。'
      ],
      posts: [
        { no: 1, name: 'そら', date: '2026/05/06', likes: 4, text: '限られた土地でやりくりするのが楽しい。最初の説明が親切。' },
        { no: 2, name: 'tk', date: '2026/03/12', likes: 3, text: '中盤から画面の行き来が多くて疲れる。まとめて見られる画面が欲しい。' }
      ]
    },
    {
      path: '/title/mojiawase',
      title: '文字あわせ',
      kind: 'review',
      category: 'パズル',
      date: '2025-12-19',
      tags: ['パズル'],
      keywords: ['ゲーム', 'パズル', '文字', 'レビュー', '投稿'],
      art: 'jacket',
      views: 5600,
      comments: 4,
      subtitle: '発売：2024年 ／ 平均 4.5 / 5.0（投稿9件）',
      excerpt: '文字を並べて言葉を作るパズル。辞書の収録語が広く、思いついた言葉がだいたい通る。',
      data: { score: 5, year: '2024', maker: 'ことのは' },
      facts: [
        { label: '発売', value: '2024年8月' },
        { label: '制作', value: 'ことのは' },
        { label: '平均点', value: '4.5 / 5.0' },
        { label: '投稿数', value: '9件' }
      ],
      body: [
        '文字を並べて言葉を作るパズル。この種のゲームで最も重要なのは辞書の広さで、その点で評価が高い。',
        '思いついた言葉が通らない体験が少ないため、ストレスがない。1回3分で終わるので、隙間の時間に向いている。'
      ],
      posts: [
        { no: 1, name: 'なな', date: '2025/12/19', likes: 7, text: '思いついた言葉がちゃんと通るのが気持ちいい。' },
        { no: 2, name: 'こう', date: '2025/09/30', likes: 5, text: '1回3分。寝る前にちょうどいい。' }
      ]
    },
    {
      path: '/title/tsukiyo-no-tou',
      title: '月夜の塔',
      kind: 'review',
      category: 'RPG',
      date: '2024-11-11',
      tags: ['RPG'],
      keywords: ['ゲーム', 'RPG', 'レビュー', 'ダンジョン', '投稿'],
      art: 'jacket',
      views: 4200,
      comments: 3,
      subtitle: '発売：2023年 ／ 平均 3.4 / 5.0（投稿4件）',
      excerpt: '塔を登るRPG。階層ごとの変化は面白いが、繰り返しの作業が多いという指摘が目立つ。',
      data: { score: 3, year: '2023', maker: '灯火ソフト' },
      facts: [
        { label: '発売', value: '2023年6月' },
        { label: '制作', value: '灯火ソフト' },
        { label: '平均点', value: '3.4 / 5.0' },
        { label: '投稿数', value: '4件' }
      ],
      body: [
        '塔を1階ずつ登るRPG。階層ごとに仕掛けが変わる構成で、上に進むほど演出が凝ってくる。',
        '一方、必要な準備のために同じ階を何度も往復する場面が多い。この繰り返しをどう受け取るかで評価が分かれている。'
      ],
      posts: [
        { no: 1, name: 'りん', date: '2024/11/11', likes: 3, text: '階層ごとの変化は面白い。往復が多いのは確かに疲れる。' },
        { no: 2, name: 'めぐ', date: '2024/07/02', likes: 2, text: '演出は良い。もう少しテンポが良ければ。' }
      ]
    }
  ]
})

export const cinemaPocket = defineSite({
  id: 'cinema-pocket',
  domain: 'cinema-pocket.jp',
  name: 'Cinema Pocket',
  shortName: 'Cinema Pocket',
  kind: 'film-review',
  template: 'media',
  tagline: '映画のことだけ',
  description: '公開中の映画の情報とレビューを掲載しています。作品は架空のものです。',
  keywords: ['映画', 'レビュー', '上映', '作品'],
  authority: 0.6,
  established: '2013年',
  lastUpdated: '2026-08-20',
  defaultAuthor: '編集部',
  operator: 'シネマポケット編集部',
  history: [
    { year: '2013', text: '映画情報サイトとして開設' },
    { year: '2019', text: 'レビュー投稿機能を追加' }
  ],
  theme: {
    accent: '#c8392b',
    accentSoft: '#fbeae8',
    ink: '#181a1e',
    muted: '#868b95',
    page: '#f3f3f5',
    line: '#e0e0e4',
    font: 'serif',
    width: 'wide',
    logo: 'square'
  },
  nav: [
    { label: '公開中', path: '/category/now' },
    { label: '公開予定', path: '/category/soon' },
    { label: '旧作', path: '/category/classic' },
    { label: '一覧', path: '/archive' }
  ],
  categories: [
    { slug: 'now', label: '公開中' },
    { slug: 'soon', label: '公開予定' },
    { slug: 'classic', label: '旧作' }
  ],
  homeCopy: { lead: '掲載している作品はすべて架空のものです。レビューは編集部と利用者の投稿によります。' },
  sidebar: { ranking: true, tags: true },
  data: { shape: 'poster', defaultArt: 'poster' },
  pages: [
    {
      path: '/film/nagisa-no-toshokan',
      title: '『渚の図書館』',
      kind: 'review',
      category: '公開中',
      date: '2026-08-20',
      tags: ['ドラマ'],
      keywords: ['映画', 'レビュー', '渚の図書館', 'ドラマ', '公開中'],
      art: 'poster',
      views: 23400,
      comments: 41,
      weight: 1.2,
      subtitle: '監督：白石ゆかり ／ 118分 ／ 2026年8月公開',
      excerpt: '海辺の図書館を舞台にしたドラマ。閉館までの3か月を、貸出記録の視点から描く。',
      data: { score: 4, year: '2026', maker: '白石ゆかり', itemsTitle: '主な出演' },
      facts: [
        { label: '監督', value: '白石ゆかり' },
        { label: '上映時間', value: '118分' },
        { label: '公開', value: '2026年8月7日' },
        { label: '分類', value: 'ドラマ' }
      ],
      lead: '閉館が決まった海辺の図書館の、最後の3か月を描く。',
      body: [
        '閉館が決まった図書館で、司書が最後の3か月を過ごす。物語は貸出記録を軸に進み、誰が何を借りたかという記録から、町の人の生活が見えてくる構成である。',
        { h: '記録が主役' },
        '登場人物の説明はほとんどない。代わりに、同じ本を10年借り続けている人、閉館を知って一度に20冊借りた人、といった記録が示される。説明せずに人を描く手つきが良い。',
        { h: '難点' },
        '中盤の30分は、進行がゆるやかで眠くなる。閉館作業の描写が丁寧すぎるとも言える。ここを短くすれば、後半の印象がさらに強くなったはずだ。',
        { h: '総評' },
        '静かな映画だが、退屈ではない。図書館を使う人には、心当たりのある場面がいくつもあるだろう。'
      ],
      items: [
        { title: '司書・辻本', note: '演：森野あかり' },
        { title: '館長', note: '演：大城孝一' },
        { title: '常連の客', note: '演：井坂ちひろ' }
      ],
      posts: [
        { no: 1, name: 'あん', date: '2026/08/21', likes: 8, text: '貸出記録だけで人が見えるのがすごい。静かだけど飽きなかった。' },
        { no: 2, name: 'よし', date: '2026/08/22', likes: 3, text: '中盤は確かに長い。でも最後まで見ると意味が分かる。' }
      ]
    },
    {
      path: '/film/kitakaze-no-kisetsu',
      title: '『北風の季節』',
      kind: 'review',
      category: '公開中',
      date: '2026-07-04',
      tags: ['ドラマ', '家族'],
      keywords: ['映画', 'レビュー', '北風の季節', '家族', 'ドラマ'],
      art: 'poster',
      views: 17800,
      comments: 29,
      subtitle: '監督：中溝タカシ ／ 132分 ／ 2026年6月公開',
      excerpt: '雪深い町の家族を描く132分。台詞の少なさと、生活音の使い方が印象に残る。',
      data: { score: 4, year: '2026', maker: '中溝タカシ' },
      facts: [
        { label: '監督', value: '中溝タカシ' },
        { label: '上映時間', value: '132分' },
        { label: '公開', value: '2026年6月19日' },
        { label: '分類', value: 'ドラマ' }
      ],
      body: [
        '雪深い町に暮らす家族の1年を描く。台詞は少なく、生活の音が場面をつないでいく。',
        '雪を掻く音、戸を閉める音、湯を沸かす音。これらが会話の代わりに使われ、家族の距離が音の間隔で示される。',
        '132分は長いが、季節が変わるまでを描く構成上、短くはできないだろう。冬から春に移る場面の音の変化は、劇場で聞く価値がある。'
      ]
    },
    {
      path: '/film/yakan-hiko',
      title: '『夜間飛行』',
      kind: 'review',
      category: '公開予定',
      date: '2026-08-11',
      tags: ['サスペンス'],
      keywords: ['映画', '夜間飛行', 'サスペンス', '公開予定'],
      art: 'poster',
      views: 12600,
      comments: 15,
      subtitle: '監督：桐生レイ ／ 104分 ／ 2026年9月公開予定',
      excerpt: '深夜の空港を舞台にしたサスペンス。9月11日公開予定。先行上映の評判は上々。',
      data: { score: 0, year: '2026', maker: '桐生レイ' },
      facts: [
        { label: '監督', value: '桐生レイ' },
        { label: '上映時間', value: '104分' },
        { label: '公開予定', value: '2026年9月11日' },
        { label: '分類', value: 'サスペンス' }
      ],
      body: [
        '深夜の空港で最終便を待つ乗客たちを描くサスペンス。公開は9月11日を予定している。',
        '先行上映を観た記者の話では、104分のうち約80分が待合室の場面で構成されているという。密室に近い構成で緊張を保つ作りで、監督の前作とは印象が大きく異なる。',
        '公開後にレビューを掲載する予定。'
      ]
    },
    {
      path: '/film/kaze-no-tegami',
      title: '『風の手紙』（2018年）',
      kind: 'review',
      category: '旧作',
      date: '2024-04-19',
      tags: ['ドラマ', '旧作'],
      keywords: ['映画', '風の手紙', '旧作', 'レビュー', '2018'],
      art: 'poster',
      views: 8100,
      comments: 12,
      subtitle: '監督：白石ゆかり ／ 96分 ／ 2018年公開',
      excerpt: '2018年公開作の再評価記事。当時は評価が低かったが、後の作品と併せて観ると位置づけが変わる。',
      data: { score: 4, year: '2018', maker: '白石ゆかり' },
      facts: [
        { label: '監督', value: '白石ゆかり' },
        { label: '上映時間', value: '96分' },
        { label: '公開', value: '2018年10月5日' },
        { label: '分類', value: 'ドラマ' }
      ],
      body: [
        '2018年に公開された作品。当時の評価は高くなかったが、同じ監督の近作と併せて観ると位置づけが変わる。',
        '手紙を配る仕事に就いた主人公が、宛先不明の手紙を扱う話である。公開時は「起伏がない」と評されたが、記録から人を描くという手法は、後の作品でより明確な形になっている。',
        '再上映の機会があれば、順番を追って観ることをおすすめしたい。'
      ]
    },
    {
      path: '/film/machi-no-oto',
      title: '『街の音』（2015年）',
      kind: 'review',
      category: '旧作',
      date: '2022-08-26',
      tags: ['旧作', 'ドキュメンタリー'],
      keywords: ['映画', '街の音', '旧作', 'ドキュメンタリー', '2015'],
      art: 'poster',
      views: 6400,
      comments: 9,
      subtitle: '監督：南田ケイ ／ 88分 ／ 2015年公開',
      excerpt: '2015年公開のドキュメンタリー。地方都市の商店街を1年間撮り続けた記録。',
      data: { score: 4, year: '2015', maker: '南田ケイ' },
      facts: [
        { label: '監督', value: '南田ケイ' },
        { label: '上映時間', value: '88分' },
        { label: '公開', value: '2015年4月11日' },
        { label: '分類', value: 'ドキュメンタリー' }
      ],
      body: [
        '2015年に公開されたドキュメンタリー。地方都市の商店街を1年間撮り続けた記録である。',
        '当時のアーケードは照明が主な光源で、映像は全編を通して同じ色をしている。監督はそれを承知で撮っており、色の均一さそのものが商店街の印象として残る。',
        '10年経って観ると、記録映像としての価値のほうが強く出てくる。同じ場所を今撮ったら、まったく違う映像になるだろう。'
      ]
    }
  ]
})

export const soundShelf = defineSite({
  id: 'sound-shelf',
  domain: 'sound-shelf.jp',
  name: 'Sound Shelf',
  shortName: 'Sound Shelf',
  kind: 'music-review',
  template: 'media',
  tagline: '棚に並べて、また聴く',
  description: '音楽のレビューサイト。掲載しているアーティストと作品はすべて架空のものです。',
  keywords: ['音楽', 'アルバム', 'レビュー', 'バンド'],
  authority: 0.55,
  established: '2012年',
  lastUpdated: '2026-08-17',
  defaultAuthor: '編集部',
  operator: 'Sound Shelf',
  history: [
    { year: '2012', text: '音楽レビューサイトとして開設' },
    { year: '2018', text: '掲載作品の分類を整理' },
    { year: '2025', text: 'デザインを刷新' }
  ],
  theme: {
    accent: '#2a9d8f',
    accentSoft: '#e4f4f2',
    ink: '#16211f',
    muted: '#7d8f8c',
    page: '#f3f7f6',
    line: '#dbe8e5',
    font: 'sans',
    width: 'wide',
    logo: 'circle'
  },
  nav: [
    { label: '新譜', path: '/category/new' },
    { label: '再発', path: '/category/reissue' },
    { label: '国内', path: '/category/jp' },
    { label: '一覧', path: '/archive' }
  ],
  categories: [
    { slug: 'new', label: '新譜' },
    { slug: 'reissue', label: '再発' },
    { slug: 'jp', label: '国内' }
  ],
  homeCopy: { lead: '掲載しているアーティスト・作品はすべて架空のものです。' },
  sidebar: { ranking: true, tags: true },
  data: { shape: 'square', defaultArt: 'jacket' },
  pages: [
    {
      path: '/album/kaze-to-kotoba',
      title: 'ハルナ『風と言葉』',
      kind: 'review',
      category: '新譜',
      date: '2026-08-17',
      tags: ['新譜', '国内'],
      keywords: ['音楽', 'アルバム', 'レビュー', 'ハルナ', '風と言葉'],
      art: 'jacket',
      views: 11400,
      comments: 22,
      subtitle: '2026年8月／全10曲／48分',
      excerpt: '弾き語りを中心にした10曲。前作の重ねた音作りから離れ、余白の多い録音になっている。',
      data: { score: 4, year: '2026', maker: 'ハルナ', itemsTitle: '収録曲' },
      facts: [
        { label: 'アーティスト', value: 'ハルナ' },
        { label: '発売', value: '2026年8月5日' },
        { label: '収録時間', value: '48分' },
        { label: '形態', value: 'アルバム（全10曲）' }
      ],
      lead: '重ねることをやめた10曲。余白がそのまま録音されている。',
      body: [
        '前作は音を重ねる方向で作られていたが、本作はほぼ弾き語りである。楽器はギターとピアノ、曲によって控えめな打楽器が入る。',
        { h: '録音の余白' },
        '注目したいのは、演奏していない時間が編集で切られていないことだ。弦を押さえ直す音、息を吸う間がそのまま残っている。この余白が、歌詞の間を引き延ばして聞こえる。',
        { h: '中盤の3曲' },
        '4曲目から6曲目までは、同じ和音の進行を少しずつ変えながら続く構成になっている。単体で聴くと似ているが、通して聴くと1つの曲に聞こえる。アルバムとして通す前提の作りだ。',
        { h: '総評' },
        '通して聴く時間が取れる人向け。1曲ずつ取り出すと、良さの半分が抜ける。'
      ],
      items: [
        { title: '朝の駅', note: '4:12' },
        { title: '手紙のかわり', note: '3:48' },
        { title: '雨の分かれ道', note: '5:02' },
        { title: '窓', note: '4:31' },
        { title: '窓（続き）', note: '3:59' },
        { title: '同じ道', note: '4:44' },
        { title: '灯', note: '5:20' },
        { title: '橋の上', note: '4:08' },
        { title: '風と言葉', note: '6:12' },
        { title: '夜明けまで', note: '5:44' }
      ],
      posts: [
        { no: 1, name: 'とも', date: '2026/08/18', likes: 6, text: '中盤の3曲、確かに1曲に聞こえます。通して聴くと全然違う。' }
      ]
    },
    {
      path: '/album/tetsu-no-hana',
      title: 'アオイロ機構『鉄の花』',
      kind: 'review',
      category: '新譜',
      date: '2026-06-09',
      tags: ['新譜'],
      keywords: ['音楽', 'アルバム', 'レビュー', 'アオイロ機構', 'ロック'],
      art: 'jacket',
      views: 9200,
      comments: 18,
      subtitle: '2026年6月／全11曲／52分',
      excerpt: '4人編成のバンドによる5作目。音の隙間を埋めない録音で、演奏の粗さがそのまま強さになっている。',
      data: { score: 4, year: '2026', maker: 'アオイロ機構' },
      facts: [
        { label: 'アーティスト', value: 'アオイロ機構' },
        { label: '発売', value: '2026年6月3日' },
        { label: '収録時間', value: '52分' },
        { label: '形態', value: 'アルバム（全11曲）' }
      ],
      body: [
        '4人編成のバンドの5作目。前作までは音を丁寧に整えていたが、本作は演奏の粗さを残している。',
        '合わせきっていない箇所が、そのまま収録されている。整えれば聴きやすくなるが、勢いは失われる。この判断は正しかったと思う。',
        '9曲目の6分を超える曲が中心にある。ここまでの8曲は、その曲に向けた助走として並べられている。'
      ]
    },
    {
      path: '/album/machi-no-rhythm',
      title: '『街のリズム 1998-2005』（再発）',
      kind: 'review',
      category: '再発',
      date: '2026-03-27',
      tags: ['再発'],
      keywords: ['音楽', '再発', 'コンピレーション', 'レビュー'],
      art: 'jacket',
      views: 6800,
      comments: 11,
      subtitle: '2026年3月／全18曲／74分',
      excerpt: '1998年から2005年の地方の音源を集めた再発盤。音質の統一を避けた編集が功を奏している。',
      data: { score: 5, year: '2026', maker: '各アーティスト' },
      facts: [
        { label: '内容', value: 'コンピレーション（再発）' },
        { label: '発売', value: '2026年3月11日' },
        { label: '収録時間', value: '74分' },
        { label: '形態', value: '全18曲' }
      ],
      body: [
        '1998年から2005年に地方で自主制作された音源を集めた再発盤である。',
        '特筆すべきは、音質を統一しなかったことだ。録音環境の差がそのまま残っており、曲ごとに音量も響きも違う。聴きやすさは犠牲になっているが、当時の記録としての価値は高い。',
        '解説書に収録された、各音源の制作環境の記載が充実している。これだけで買う価値がある。'
      ]
    },
    {
      path: '/album/yagi-to-tsuki',
      title: 'ノイズ商店『山羊と月』（2015年）',
      kind: 'review',
      category: '国内',
      date: '2024-10-05',
      tags: ['国内', '旧作'],
      keywords: ['音楽', 'アルバム', 'レビュー', '2015', 'ノイズ商店'],
      art: 'jacket',
      views: 4900,
      comments: 7,
      subtitle: '2015年／全9曲／41分',
      excerpt: '2015年の作品を振り返る。当時は評価が分かれたが、後の同種の作品と比べると先行していた点が見える。',
      data: { score: 4, year: '2015', maker: 'ノイズ商店' },
      facts: [
        { label: 'アーティスト', value: 'ノイズ商店' },
        { label: '発売', value: '2015年9月16日' },
        { label: '収録時間', value: '41分' },
        { label: '形態', value: 'アルバム（全9曲）' }
      ],
      body: [
        '2015年に発売された作品。当時は「まとまりがない」という評が多かった。',
        'いま聴くと、曲の途中で構成が切り替わる作りが、その後の同種の作品に先行していたことが分かる。当時の耳には唐突に聞こえた箇所が、現在ではむしろ自然に聞こえる。',
        '入手はしにくいが、再発の予定があるという話も出ている。'
      ]
    }
  ]
})

export const mediaSites = Object.freeze([indieGameLog, gameTana, cinemaPocket, soundShelf])
