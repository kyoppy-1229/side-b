// Portals and aggregators — the pages a player is most likely to type a domain
// for. NaviWeb is the general-purpose front page of this virtual internet.

import { defineSite } from './kit.js'

export const naviWeb = defineSite({
  id: 'naviweb',
  domain: 'naviweb.jp',
  name: 'NaviWeb',
  shortName: 'NaviWeb',
  kind: 'portal',
  template: 'portal',
  tagline: '知りたいことへ、まっすぐ',
  description: 'ニュース、天気、注目キーワードをまとめた総合ポータルサイト。カテゴリから情報を探せます。',
  keywords: ['ポータル', '検索', 'ニュース', '天気', 'まとめ'],
  authority: 0.9,
  established: '2004年',
  lastUpdated: '2026-08-23',
  defaultAuthor: 'NaviWeb編集部',
  operator: 'ナビウェブ株式会社',
  history: [
    { year: '2004', text: 'ディレクトリ型のリンク集として開設' },
    { year: '2010', text: 'ニュース配信を開始' },
    { year: '2021', text: 'トップページを全面刷新' },
    { year: '2026', text: '注目キーワードの集計方法を変更' }
  ],
  theme: {
    accent: '#d94f3d',
    accentSoft: '#fdeeec',
    ink: '#1e2229',
    muted: '#61686f',
    page: '#f7f7f8',
    line: '#e2e3e6',
    font: 'sans',
    width: 'wide',
    logo: 'circle'
  },
  nav: [
    { label: 'ニュース', path: '/category/news' },
    { label: '天気', path: '/category/weather' },
    { label: 'IT', path: '/category/it' },
    { label: '暮らし', path: '/category/life' },
    { label: '地域', path: '/category/local' }
  ],
  categories: [
    { slug: 'news', label: 'ニュース' },
    { slug: 'weather', label: '天気' },
    { slug: 'it', label: 'IT' },
    { slug: 'life', label: '暮らし' },
    { slug: 'local', label: '地域' }
  ],
  homeCopy: {
    lead: 'ニュース・天気・話題のキーワードをまとめて確認できます。',
    searchPlaceholder: 'キーワードを入力'
  },
  sidebar: { ranking: true, adText: 'NaviWebの広告掲載についてはお問い合わせください。' },
  data: {
    trending: [
      { label: 'デジタル教科書', path: '/news/2026/textbook-digital' },
      { label: '朝凪花火大会', path: '/news/2026/asanagi-fireworks-guide' },
      { label: '週末の天気', path: '/news/2026/weekend-weather' },
      { label: '中古PC 選び方', path: '/news/2026/used-pc-guide' },
      { label: '節電 夏', path: '/news/2026/power-summer' }
    ],
    weather: { area: '朝凪市', condition: 'sunny', label: '晴れ', high: 33, low: 25, link: '/category/weather' },
    links: [
      { label: 'ニュース一覧', path: '/category/news', note: '毎時更新' },
      { label: '天気', path: '/category/weather', note: '朝凪市' },
      { label: 'IT・PC', path: '/category/it', note: '注目' },
      { label: '地域の話題', path: '/category/local', note: '朝凪・白浜台' }
    ]
  },
  pages: [
    {
      path: '/news/2026/textbook-digital',
      title: 'デジタル教科書の全学年採用、何が変わるのか',
      category: 'ニュース',
      date: '2026-08-20',
      tags: ['教育', 'まとめ'],
      keywords: ['デジタル教科書', '教育', '学校', 'まとめ', '2026'],
      art: 'classroom',
      views: 42100,
      comments: 210,
      weight: 1.3,
      excerpt: '来年度から全学年で標準採用される方針が固まったデジタル教科書について、決まっている点と未定の点を整理した。',
      body: [
        '来年度から小中学校の全学年でデジタル教科書が標準採用される方針が固まった。報道が続いているが、決まっている点と未定の点が混ざっているため整理する。',
        { h: '決まっていること' },
        { ul: [
          '算数・数学と英語を先行して切り替える',
          '紙の教科書との併用は当面続く',
          '通信環境が整わない地域には印刷版とオフライン教材を配る'
        ] },
        { h: '未定のこと' },
        { ul: [
          '家庭での通信費の扱い（自治体ごとに差がある）',
          '端末更新の費用負担の考え方',
          '社会・理科の切り替え時期'
        ] },
        '教育委員会への取材では、教材そのものよりも端末の更新周期が課題という声が多い。導入年度が揃っているため、更新も同じ年度に来る構造になっている。',
        { links: { label: '関連する記事', items: [
          { label: '中古PCの選び方', path: '/news/2026/used-pc-guide' }
        ] } }
      ]
    },
    {
      path: '/news/2026/asanagi-fireworks-guide',
      title: '朝凪花火大会2026 会場・アクセス・観覧のまとめ',
      category: '地域',
      date: '2026-08-18',
      tags: ['朝凪市', '花火', 'まとめ'],
      keywords: ['朝凪', '花火大会', 'アクセス', '観覧', 'まとめ', '2026'],
      art: 'festival',
      views: 58700,
      comments: 96,
      weight: 1.2,
      excerpt: '9月5日に開かれる朝凪花火大会について、会場、アクセス、観覧場所、交通規制をまとめた。',
      body: [
        '9月5日に開かれる朝凪花火大会について、現時点で公表されている情報をまとめる。',
        { table: {
          head: ['項目', '内容'],
          rows: [
            ['日時', '9月5日（土）19:30〜（荒天時は6日に順延）'],
            ['会場', '朝凪臨海公園および周辺護岸'],
            ['打ち上げ数', '約4500発'],
            ['最寄駅', '蒼海鉄道 朝凪駅（徒歩15分）'],
            ['有料席', '8月10日から抽選申込']
          ]
        } },
        { h: '観覧場所' },
        '3年ぶりに海上からの打ち上げとなるため、護岸沿いの視界が広い。芝生広場は打ち上げ地点から離れるが、混雑は比較的少ない。',
        { h: '交通規制' },
        '当日17時から22時まで、駅前から護岸へ向かう通りが車両通行止めとなる。周辺の駐車場は早い時間に満車になるため、公共交通機関の利用が案内されている。',
        { note: '雨天の判断は当日15時に実行委員会から発表されます。', label: '注意' }
      ]
    },
    {
      path: '/news/2026/weekend-weather',
      title: '週末の天気 各地で気温が高め',
      category: '天気',
      date: '2026-08-22',
      tags: ['天気'],
      keywords: ['天気', '週末', '気温', '予報', '2026'],
      art: 'weather-sunny',
      views: 21300,
      comments: 12,
      excerpt: '週末は各地で晴れ、気温は平年より高めの見込み。日曜の夕方以降は内陸で雨の可能性がある。',
      body: [
        '週末は各地で晴れる見込み。気温は平年より2〜3度高く、朝凪市では最高33度が予想されている。',
        '日曜の夕方以降は内陸部で雨の可能性がある。屋外の行事がある場合は、当日昼の予報を確認したい。',
        { ul: [
          '土曜：晴れ　最高33度／最低25度',
          '日曜：晴れのち曇り　最高32度／最低25度',
          '月曜：曇り　最高30度／最低24度'
        ] },
        '週明けからは気温がやや下がる見込み。'
      ]
    },
    {
      path: '/news/2026/used-pc-guide',
      title: '中古PCの選び方 確認する順番はこの5つ',
      category: 'IT',
      date: '2026-07-14',
      tags: ['PC', 'まとめ'],
      keywords: ['中古PC', 'PC', 'おすすめ', '選び方', 'まとめ', 'パソコン'],
      art: 'product-laptop',
      views: 67200,
      comments: 178,
      weight: 1.2,
      excerpt: '中古PCを買うときに確認する項目を、優先順位の高い順に5つ挙げた。価格より先に見る点がある。',
      body: [
        '中古PCを買うときに確認する項目を、優先順位の順に挙げる。価格より先に見るべき点がある。',
        { ol: [
          'OSの更新提供が続いている機種か（最優先。ここを外すと他が良くても使えない）',
          '記憶装置が半導体式か（回転式なら交換費用を上乗せして考える）',
          'メモリが8GB以上か（4GBは閲覧でも足りない場合がある）',
          'バッテリーの状態と交換費用（保証対象外の店が多い）',
          '必要な端子があるか（映像出力、有線接続など）'
        ] },
        { h: '価格帯の目安' },
        { table: {
          head: ['予算', '期待できる構成'],
          rows: [
            ['2万円台', '半導体式＋メモリ8GB、世代は古め'],
            ['3〜4万円台', '半導体式＋メモリ8〜16GB、数年前の世代'],
            ['5万円以上', '状態の良い法人向け機種、保証も長め']
          ]
        } },
        '文書作成と閲覧が主な用途であれば、処理装置の世代よりも記憶装置とメモリを優先したほうが満足度が高い。'
      ]
    },
    {
      path: '/news/2026/power-summer',
      title: '今夏の節電要請は見送り 需給に余裕',
      category: 'ニュース',
      date: '2026-06-29',
      tags: ['電力', 'まとめ'],
      keywords: ['節電', '電力', '夏', '需給', '2026'],
      art: 'abstract-grid',
      views: 18400,
      comments: 44,
      excerpt: '今夏は全エリアで予備率を確保できる見通しとなり、一律の節電要請は見送られた。',
      body: [
        '今夏の電力需給について、全エリアで安定供給に必要な予備率を確保できる見通しとなった。一律の節電要請は見送られる。',
        '需要のピークが夕方に移っているため、日中の使用量を抑えるという従来の呼びかけとは前提が変わっている。冷房の設定を極端に上げる必要はないという説明が出ている。',
        '事業所向けには、需要が急増した場合の連絡手順が改めて周知される予定。'
      ]
    },
    {
      path: '/news/2026/library-guide',
      title: '東都市立図書館 再開館後の使い方',
      category: '暮らし',
      date: '2026-05-18',
      tags: ['図書館', 'まとめ'],
      keywords: ['図書館', '再開館', '東都', '席', 'まとめ'],
      art: 'library',
      views: 12900,
      comments: 23,
      excerpt: '改修が終わった東都市立図書館の変更点をまとめた。閲覧席、貸出期間、資料の配置が変わっている。',
      body: [
        '改修工事を終えて再開館した東都市立図書館の変更点をまとめる。',
        { ul: [
          '閲覧席が190席から290席に増加（うち80席は電源・ネットワーク付き）',
          '貸出期間が2週間から3週間に延長（予約が入っている資料は延長不可）',
          '地域資料と新聞縮刷版が2階に集約',
          '1970年代以降の地域資料の一部が開架へ移動'
        ] },
        '電源付きの席は予約制ではなく先着順。夕方は埋まりやすいという案内が出ている。'
      ]
    },
    {
      path: '/news/2025/school-terminal-summary',
      title: '学校端末の更新問題 3つの調達方式',
      category: 'IT',
      date: '2025-11-20',
      tags: ['教育', 'PC', 'まとめ'],
      keywords: ['学校', '端末', 'PC', '更新', '調達', '2025'],
      art: 'classroom-desk',
      views: 15700,
      comments: 38,
      excerpt: '学校端末の更新時期が集中する問題について、一斉調達・分割調達・リースの違いを短くまとめた。',
      body: [
        '学校端末の更新時期が集中する問題について、調達方式の違いを短くまとめる。',
        { ul: [
          '一斉調達：機種が揃い管理は楽。費用が単年度に集中する。',
          '分割調達：費用は平準化。機種が混在し動作確認が増える。',
          'リース：保守が含まれ担当者の負担が軽い。総額は高くなりやすい。'
        ] },
        '今年度は、パソコン室を一斉、貸与端末を分割という組み合わせが多いとされる。'
      ]
    }
  ]
})

export const asanagiTownNavi = defineSite({
  id: 'asanagi-townnavi',
  domain: 'asanagi-townnavi.jp',
  name: '朝凪タウンナビ',
  shortName: 'タウンナビ',
  kind: 'local-portal',
  template: 'portal',
  tagline: '朝凪のお店とイベント',
  description: '朝凪市の飲食店、イベント、お店の情報を紹介する地域ポータルサイトです。',
  keywords: ['朝凪', '地域', 'グルメ', 'イベント', 'お店'],
  authority: 0.5,
  established: '2011年',
  lastUpdated: '2026-08-19',
  defaultAuthor: 'タウンナビ編集室',
  operator: '朝凪タウンナビ編集室',
  history: [
    { year: '2011', text: '地域情報サイトとして開設' },
    { year: '2018', text: '店舗情報の掲載を開始' },
    { year: '2025', text: 'スマートフォン向け表示を改善' }
  ],
  theme: {
    accent: '#e0913a',
    accentSoft: '#fdf3e6',
    ink: '#26201a',
    muted: '#6d6255',
    page: '#faf7f2',
    line: '#e7ded1',
    font: 'rounded',
    width: 'normal',
    logo: 'circle'
  },
  nav: [
    { label: 'グルメ', path: '/category/gourmet' },
    { label: 'イベント', path: '/category/event' },
    { label: 'お店', path: '/category/shop' },
    { label: '地域の話題', path: '/category/topic' }
  ],
  categories: [
    { slug: 'gourmet', label: 'グルメ' },
    { slug: 'event', label: 'イベント' },
    { slug: 'shop', label: 'お店' },
    { slug: 'topic', label: '地域の話題' }
  ],
  homeCopy: { lead: '朝凪市のお店、イベント、地域の話題をお届けします。', searchPlaceholder: '店名・エリアで検索' },
  sidebar: { ranking: true, adText: '掲載のご依頼は編集室までご連絡ください。' },
  data: {
    trending: [
      { label: '花火大会の屋台', path: '/topic/2026/fireworks-yatai' },
      { label: '商店街の新店', path: '/shop/2026/hanaya-open' },
      { label: '朝市', path: '/event/2026/morning-market' }
    ],
    links: [
      { label: 'イベント一覧', path: '/category/event', note: '9月まで' },
      { label: '商店街のお店', path: '/category/shop', note: '32件' }
    ]
  },
  pages: [
    {
      path: '/topic/2026/fireworks-yatai',
      title: '花火大会の屋台、今年は公園西側に集約',
      category: '地域の話題',
      date: '2026-08-19',
      tags: ['花火', '朝凪'],
      keywords: ['花火大会', '屋台', '朝凪', '公園', '2026'],
      art: 'festival',
      views: 8700,
      comments: 14,
      excerpt: '9月5日の花火大会で、屋台の配置が公園西側に集約される。通路の幅を確保するためとしている。',
      body: [
        '9月5日の朝凪花火大会で、屋台の配置が臨海公園の西側に集約されることが決まった。',
        '実行委員会によると、これまで護岸沿いに並んでいた屋台を移すことで、避難用の通路幅を確保する狙いがある。海上打ち上げが3年ぶりに復活し、護岸沿いの人出が増える見込みのためだ。',
        '出店数は約40店で、昨年と同程度。飲食のほか、地元の菓子店が並ぶ区画も設けられる。',
        { ul: [
          '場所：朝凪臨海公園 西側広場',
          '時間：16時〜21時30分',
          '出店数：約40店'
        ] }
      ]
    },
    {
      path: '/shop/2026/hanaya-open',
      title: '商店街に花屋が開店 元乾物店の場所',
      category: 'お店',
      date: '2026-06-06',
      tags: ['商店街', '開店'],
      keywords: ['花屋', '商店街', '開店', '朝凪', 'お店'],
      art: 'shopping-street',
      views: 4200,
      comments: 6,
      excerpt: '朝凪銀座商店街に花屋が開店した。長く乾物店だった場所で、内装は前の店の棚を一部残している。',
      body: [
        '朝凪銀座商店街の中央通りに花屋「みちくさ」が開店した。長く乾物店だった場所で、店主は市内在住の30代。',
        '内装は前の店の木製の棚を一部残しており、乾物の量り売りに使われていた台がそのままレジ台になっている。「壊すのが惜しかった」と店主は話す。',
        '営業は火曜から日曜の10時から18時30分まで。月曜定休。'
      ]
    },
    {
      path: '/event/2026/morning-market',
      title: '朝市が毎月第2日曜に開催へ',
      category: 'イベント',
      date: '2026-05-10',
      tags: ['朝市', 'イベント'],
      keywords: ['朝市', 'イベント', '朝凪', '日曜'],
      art: 'shopping-street',
      views: 3600,
      comments: 4,
      excerpt: '臨海公園の朝市が、今年度から毎月第2日曜の開催になった。開催時間も30分早まる。',
      body: [
        '臨海公園で開かれている朝市が、今年度から毎月第2日曜の開催になった。これまでは不定期だった。',
        '開始時間は7時から6時30分に繰り上がる。夏場の暑さを避けるためで、終了は10時30分。',
        '出店は野菜、魚、パン、菓子の計20店前後。雨天中止で、当日6時に公式サイトで告知される。'
      ]
    },
    {
      path: '/gourmet/2026/teishoku-nakamichi',
      title: '駅前の定食屋が2階席を開放',
      category: 'グルメ',
      date: '2026-04-15',
      tags: ['グルメ', '駅前'],
      keywords: ['定食', 'グルメ', '駅前', '朝凪', 'お店'],
      art: 'cafe',
      views: 5100,
      comments: 9,
      excerpt: '駅前の定食屋「なかみち」が2階席の利用を始めた。昼の待ち時間が短くなっている。',
      body: [
        '朝凪駅前の定食屋「なかみち」が、2階の座敷席の利用を始めた。倉庫として使っていた部分を片付けたという。',
        '席数は1階の18席に加えて2階が16席。昼の混雑時の待ち時間が短くなっており、12時台でも並ばずに入れる日が増えた。',
        '定食は日替わりが900円、焼き魚定食が1100円。営業は11時から14時30分と、17時30分から20時30分。'
      ]
    },
    {
      path: '/topic/2025/bus-route-change',
      title: '循環バスの経路変更、住民説明会が開かれた',
      category: '地域の話題',
      date: '2025-12-08',
      tags: ['バス', '朝凪'],
      keywords: ['循環バス', '経路', '説明会', '朝凪', '交通'],
      art: 'bus',
      views: 2900,
      comments: 11,
      excerpt: '市内循環バスの経路変更について住民説明会が開かれた。病院経由を歓迎する声と、所要時間増への懸念が出た。',
      body: [
        '市内循環バスの経路変更について、住民説明会が市民活動センターで開かれた。参加者は約60人。',
        '市立病院前を経由する案について、通院で乗り換えが不要になる点を歓迎する声が多く出た。一方、一周の所要時間が4分延びることについて、通勤利用者から懸念が示された。',
        '市の担当者は「便数は現行の1日14便を維持する」と説明。実施は2026年10月1日を予定している。'
      ]
    }
  ]
})

export const matome24 = defineSite({
  id: 'matome24',
  domain: 'matome24.net',
  name: '話題まとめ24',
  shortName: 'まとめ24',
  kind: 'aggregator',
  template: 'portal',
  tagline: 'ネットの話題を24時間まとめ',
  description: '掲示板やQ&Aサイトで話題になった内容をまとめて紹介するサイトです。',
  keywords: ['まとめ', '話題', 'ネット', '掲示板'],
  authority: 0.35,
  established: '2013年',
  lastUpdated: '2026-08-20',
  operator: '話題まとめ24 編集部',
  history: [
    { year: '2013', text: 'まとめサイトとして開設' },
    { year: '2019', text: '引用元の明記を方針化' }
  ],
  theme: {
    accent: '#2f9e6f',
    accentSoft: '#e6f5ee',
    ink: '#1c2a24',
    muted: '#5d6d66',
    page: '#f4f8f6',
    line: '#dce8e2',
    font: 'sans',
    width: 'normal',
    logo: 'square'
  },
  nav: [
    { label: 'PC・IT', path: '/category/it' },
    { label: '暮らし', path: '/category/life' },
    { label: '雑談', path: '/category/talk' }
  ],
  categories: [
    { slug: 'it', label: 'PC・IT' },
    { slug: 'life', label: '暮らし' },
    { slug: 'talk', label: '雑談' }
  ],
  homeCopy: { lead: '掲示板やQ&Aで話題になった内容をまとめています。引用元は各記事に記載しています。' },
  sidebar: { ranking: true, adText: '広告掲載に関するお問い合わせはこちら。' },
  data: {
    trending: [
      { label: '古いPCの延命', path: '/matome/2026/old-pc-thread' },
      { label: '端末の持ち帰り', path: '/matome/2026/tablet-rule' }
    ]
  },
  pages: [
    {
      path: '/matome/2026/old-pc-thread',
      title: '「10年前のPC、まだ使える？」に集まった意見まとめ',
      category: 'PC・IT',
      date: '2026-08-20',
      tags: ['PC', 'まとめ'],
      keywords: ['古いPC', '延命', 'まとめ', '掲示板', 'PC'],
      art: 'product-laptop',
      views: 31200,
      comments: 87,
      excerpt: '掲示板で盛り上がった「10年前のPCはまだ使えるか」という話題から、主な意見をまとめた。',
      body: [
        '掲示板で盛り上がっていた「10年前のPCはまだ使えるか」という話題から、主な意見をまとめる。',
        { h: '「使える」派の意見' },
        { ul: [
          '記憶装置を半導体式にすれば閲覧と文書作成は問題ない',
          'メモリを8GBにすれば体感が変わる',
          '法人向けの機種なら作りが丈夫で長く持つ'
        ] },
        { h: '「厳しい」派の意見' },
        { ul: [
          'OSの更新提供が終わっている機種は繋ぐべきでない',
          '交換部品の入手が難しい薄型機は諦めたほうがいい',
          '動画編集など負荷の高い作業は世代の差が出る'
        ] },
        { h: '結論として多かった意見' },
        '「用途で分ける」という意見が最も多かった。閲覧と文書作成の機として延命し、負荷の高い作業は新しい機に任せる、という使い分けである。',
        { note: '引用元：みんなの掲示板 PC板／教えて！Q-LINK', label: '引用元' },
        { links: { label: '元になったページ', items: [
          { label: '教えて！Q-LINK の質問', path: '/matome/2026/tablet-rule' }
        ] } }
      ]
    },
    {
      path: '/matome/2026/tablet-rule',
      title: '学校端末の持ち帰り、各家庭のルールまとめ',
      category: '暮らし',
      date: '2026-05-04',
      tags: ['教育', 'まとめ'],
      keywords: ['学習端末', '持ち帰り', 'ルール', '家庭', 'まとめ'],
      art: 'classroom-desk',
      views: 18600,
      comments: 52,
      excerpt: '学校の端末を家に持ち帰るようになった家庭のルールを、Q&Aサイトの回答からまとめた。',
      body: [
        '学校の端末を持ち帰るようになった家庭で、どんなルールを決めているかをまとめる。',
        { h: '多かったルール' },
        { ul: [
          '使う場所を決める（リビングのみ、など）',
          '充電場所を決めて、寝室に持ち込ませない',
          '時間ではなく場所で区切る（宿題量で揉めないため）'
        ] },
        { h: '注意されていた点' },
        '学校側で既に閲覧制限が設定されている場合、家庭で二重に制限をかけると宿題のページが開けなくなる例がある。まず学校の設定を確認するよう複数の回答者が指摘していた。',
        { note: '引用元：教えて！Q-LINK', label: '引用元' }
      ]
    },
    {
      path: '/matome/2025/old-site-search',
      title: '閉鎖した個人サイトを探す方法まとめ',
      category: 'PC・IT',
      date: '2025-11-12',
      tags: ['Web', 'まとめ'],
      keywords: ['閉鎖', '個人サイト', '探す', '保存', 'まとめ', '昔のホームページ'],
      art: 'screenshot',
      views: 22400,
      comments: 63,
      excerpt: '閉鎖した個人サイトの内容を探す方法として挙がっていた手段をまとめた。',
      body: [
        '閉鎖した個人サイトの内容を探す方法として挙がっていた手段をまとめる。',
        { ol: [
          '保存サービスでURLと日付を指定して探す（文章は残りやすく、画像は残りにくい）',
          '当時リンクしていた別サイトのリンク集から辿る',
          '作者のハンドルネームで検索し、移転先を探す',
          '設置していた外部の掲示板サービス側にログが残っていないか確認する'
        ] },
        '成功率が高いのは1と2という意見が多かった。3は作者が名前を変えている場合に行き止まりになる。',
        { note: '引用元：教えて！Q-LINK／みんなの掲示板', label: '引用元' }
      ]
    },
    {
      path: '/matome/2024/keyboard-thread',
      title: 'キーボード選びで意見が割れた点まとめ',
      category: '雑談',
      date: '2024-08-30',
      tags: ['PC', 'まとめ'],
      keywords: ['キーボード', '選び方', 'まとめ', '雑談'],
      art: 'product-keyboard',
      views: 14100,
      comments: 118,
      excerpt: 'キーボード選びの話題で、意見が大きく割れた3つの点をまとめた。',
      body: [
        'キーボード選びの話題で、意見が大きく割れた点をまとめる。',
        { h: '1. テンキーの有無' },
        '表計算を使う頻度で決まる、という意見が多数。一方で「机の幅が優先」という意見も根強い。',
        { h: '2. 打鍵音' },
        '静かな環境で使う人と、そうでない人で完全に評価が分かれた。店頭で試したときの印象と自宅での印象が違う、という指摘は共通していた。',
        { h: '3. 配列' },
        '慣れれば何でもよい、という意見と、記号の位置だけは譲れない、という意見に分かれた。複数台を使い分ける人は前者が多い。',
        { note: '引用元：みんなの掲示板 PC板', label: '引用元' }
      ]
    }
  ]
})

export const portalSites = Object.freeze([naviWeb, asanagiTownNavi, matome24])
