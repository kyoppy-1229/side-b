// Utility services: weather, maps and a page-archiving service. All data is
// local — no external API is called for any of them.

import { defineSite } from './kit.js'

export const weatherLine = defineSite({
  id: 'weatherline',
  domain: 'weatherline.jp',
  name: 'WeatherLine',
  shortName: 'WeatherLine',
  kind: 'weather',
  template: 'utility',
  tagline: '今日と、この先の空',
  description: '天気予報サイト。地域別の予報、週間予報、警報の情報を掲載しています。',
  keywords: ['天気', '予報', '気温', '週間', '雨'],
  authority: 0.75,
  established: '2008年',
  lastUpdated: '2026-08-23',
  operator: 'ウェザーライン',
  history: [
    { year: '2008', text: '天気予報サイトとして開設' },
    { year: '2016', text: '地域別の詳細予報を追加' },
    { year: '2024', text: '表示を刷新' }
  ],
  theme: {
    accent: '#1e7fc2',
    accentSoft: '#e5f1fa',
    ink: '#152431',
    muted: '#5b6b78',
    page: '#f2f7fb',
    line: '#d6e3ed',
    font: 'sans',
    width: 'normal',
    logo: 'circle'
  },
  nav: [
    { label: '朝凪市', path: '/area/asanagi' },
    { label: '東都市', path: '/area/tohto' },
    { label: '週間予報', path: '/week' },
    { label: '警報・注意報', path: '/warning' }
  ],
  categories: [
    { slug: 'area', label: '地域予報' },
    { slug: 'info', label: '気象情報' }
  ],
  sidebar: { ad: true, adText: '天気に関する広告枠です。' },
  data: {
    searchPlaceholder: '地名を入力',
    listTitle: '掲載ページ',
    forecastTitle: '朝凪市の週間予報',
    panelTitle: '気象情報',
    panels: [
      { label: '高温注意', text: '8月24日まで、内陸部で最高気温35度以上が予想されます。' },
      { label: '海上の風', text: '朝凪湾では夕方から風が強まる見込みです。' }
    ],
    now: {
      area: '朝凪市（8月23日 12:00 現在）',
      value: '晴れ 32.4℃',
      note: '南の風 3m/s ／ 湿度 68% ／ 降水確率 10%',
      art: 'weather-town',
      stats: [
        { label: '最高気温', value: '33℃' },
        { label: '最低気温', value: '25℃' },
        { label: '日の入り', value: '18:24' },
        { label: '観測地点', value: '朝凪市中央' }
      ]
    },
    forecast: [
      { day: '8/23（土）', icon: 'sunny', label: '晴れ', high: '33', low: '25' },
      { day: '8/24（日）', icon: 'sunny', label: '晴れ', high: '32', low: '25' },
      { day: '8/25（月）', icon: 'cloudy', label: '曇り', high: '30', low: '24' },
      { day: '8/26（火）', icon: 'rain', label: '雨', high: '27', low: '23' },
      { day: '8/27（水）', icon: 'cloudy', label: '曇り', high: '29', low: '23' },
      { day: '8/28（木）', icon: 'sunny', label: '晴れ', high: '31', low: '24' },
      { day: '8/29（金）', icon: 'sunny', label: '晴れ', high: '31', low: '24' }
    ]
  },
  pages: [
    {
      path: '/area/asanagi',
      title: '朝凪市の天気',
      kind: 'data',
      category: '地域予報',
      date: '2026-08-23',
      keywords: ['天気', '朝凪', '予報', '気温', '今日の天気'],
      art: 'weather-sunny',
      views: 96400,
      weight: 1.4,
      subtitle: '2026年8月23日 12:00 発表',
      excerpt: '朝凪市の今日と明日の天気。今日は晴れ、最高33度。海岸部では夕方から風が強まります。',
      facts: [
        { label: '今日', value: '晴れ 33℃／25℃' },
        { label: '明日', value: '晴れ 32℃／25℃' },
        { label: '降水確率', value: '10%（今日）' },
        { label: '観測地点', value: '朝凪市中央' }
      ],
      body: [
        { h: '今日の天気' },
        '高気圧に覆われ、一日を通して晴れます。最高気温は33度、最低気温は25度の予想です。降水確率は10%で、傘の必要はありません。',
        '海岸部では、夕方から南の風がやや強まります。臨海公園の遊歩道を歩く場合は、帽子が飛ばされないようご注意ください。',
        { h: '明日の天気' },
        '同様に晴れますが、内陸部では日中に一時的な雨の可能性があります。最高気温は32度の予想です。',
        { h: '時間別の予報' },
        { table: {
          head: ['時刻', '天気', '気温', '降水確率'],
          rows: [
            ['12:00', '晴れ', '32℃', '10%'],
            ['15:00', '晴れ', '33℃', '10%'],
            ['18:00', '晴れ', '30℃', '10%'],
            ['21:00', '晴れ', '28℃', '0%'],
            ['24:00', '晴れ', '26℃', '0%']
          ]
        } },
        { h: '生活情報' },
        { ul: [
          '洗濯：よく乾く',
          '紫外線：非常に強い',
          '熱中症：警戒（屋外の作業は休憩を挟んでください）'
        ] }
      ],
      items: [
        { name: '東都市の天気', note: '晴れ 34℃／26℃' },
        { name: '白浜台市の天気', note: '晴れ 33℃／25℃' },
        { name: '三坂町の天気', note: '晴れ 32℃／23℃' }
      ],
      related: ['/week', '/warning']
    },
    {
      path: '/area/tohto',
      title: '東都市の天気',
      kind: 'data',
      category: '地域予報',
      date: '2026-08-23',
      keywords: ['天気', '東都', '予報', '気温'],
      art: 'weather-sunny',
      views: 142000,
      weight: 1.2,
      subtitle: '2026年8月23日 12:00 発表',
      excerpt: '東都市の今日と明日の天気。今日は晴れ、最高34度。内陸部のため夜間も気温が下がりにくい見込みです。',
      facts: [
        { label: '今日', value: '晴れ 34℃／26℃' },
        { label: '明日', value: '晴れ 34℃／26℃' },
        { label: '降水確率', value: '10%（今日）' },
        { label: '観測地点', value: '東都市北区' }
      ],
      body: [
        { h: '今日の天気' },
        '晴れ。最高気温は34度で、平年より2度高い予想です。内陸部のため、夜間も気温が下がりにくくなります。',
        { h: '注意' },
        '高温注意情報が発表されています。8月24日まで、最高気温35度以上となる可能性があります。日中の外出は避け、水分と休憩を取ってください。',
        { h: '時間別の予報' },
        { table: {
          head: ['時刻', '天気', '気温'],
          rows: [
            ['12:00', '晴れ', '33℃'],
            ['15:00', '晴れ', '34℃'],
            ['18:00', '晴れ', '31℃'],
            ['21:00', '晴れ', '29℃']
          ]
        } }
      ],
      related: ['/area/asanagi']
    },
    {
      path: '/week',
      title: '週間予報（朝凪・東都地方）',
      kind: 'data',
      category: '地域予報',
      date: '2026-08-23',
      keywords: ['週間予報', '天気', '予報', '一週間'],
      art: 'weather-cloudy',
      views: 58200,
      subtitle: '8月23日〜8月29日',
      excerpt: '週前半は晴れ、26日は雨の予想。週後半は再び晴れて気温が上がります。',
      facts: [
        { label: '期間', value: '8月23日〜29日' },
        { label: '傾向', value: '前半晴れ・中盤雨・後半晴れ' },
        { label: '気温', value: '平年より高め' }
      ],
      body: [
        { table: {
          head: ['日付', '天気', '最高', '最低', '降水確率'],
          rows: [
            ['8/23（土）', '晴れ', '33℃', '25℃', '10%'],
            ['8/24（日）', '晴れ', '32℃', '25℃', '10%'],
            ['8/25（月）', '曇り', '30℃', '24℃', '40%'],
            ['8/26（火）', '雨', '27℃', '23℃', '80%'],
            ['8/27（水）', '曇り', '29℃', '23℃', '30%'],
            ['8/28（木）', '晴れ', '31℃', '24℃', '10%'],
            ['8/29（金）', '晴れ', '31℃', '24℃', '10%']
          ]
        } },
        '26日は前線の通過により、朝から夕方まで雨が続く見込みです。降水量は多くない予想ですが、風がやや強まります。',
        '週後半は再び高気圧に覆われ、気温が上がります。9月に入っても平年より高い傾向が続く見込みです。'
      ],
      related: ['/area/asanagi']
    },
    {
      path: '/warning',
      title: '警報・注意報の発表状況',
      kind: 'data',
      category: '気象情報',
      date: '2026-08-23',
      keywords: ['警報', '注意報', '気象情報', '高温'],
      art: 'weather-cloudy',
      views: 34700,
      subtitle: '2026年8月23日 12:00 現在',
      excerpt: '現在発表されている警報・注意報の一覧。東都地方に高温注意情報が発表されています。',
      facts: [
        { label: '警報', value: 'なし' },
        { label: '注意報', value: '高温注意（東都地方）' },
        { label: '次回更新', value: '17:00' }
      ],
      body: [
        { h: '発表中の情報' },
        { table: {
          head: ['地域', '種類', '発表'],
          rows: [
            ['東都地方', '高温注意情報', '8月22日 11:00'],
            ['朝凪市', 'なし', '—'],
            ['白浜台市', 'なし', '—'],
            ['三坂町', 'なし', '—']
          ]
        } },
        { h: '高温注意情報について' },
        '最高気温が35度以上となることが予想される場合に発表されます。屋外での作業は、こまめな休憩と水分の補給をお願いします。',
        { h: '情報の入手方法' },
        '警報が発表された場合は、各自治体の防災メールと防災行政無線でも伝達されます。停電時はラジオが有効です。'
      ]
    }
  ]
})

export const mapSquare = defineSite({
  id: 'mapsquare',
  domain: 'mapsquare.jp',
  name: 'MapSquare',
  shortName: 'MapSquare',
  kind: 'map',
  template: 'utility',
  tagline: '場所を、調べる',
  description: '地図と施設検索のサイト。地域別の施設情報と、周辺の目安を掲載しています。',
  keywords: ['地図', '施設', '検索', '場所', 'アクセス'],
  authority: 0.7,
  established: '2007年',
  lastUpdated: '2026-08-19',
  operator: 'マップスクエア',
  history: [
    { year: '2007', text: '地図サービスとして開設' },
    { year: '2015', text: '施設情報の掲載を開始' },
    { year: '2022', text: '地域ページを再構成' }
  ],
  theme: {
    accent: '#4c8c3f',
    accentSoft: '#eaf3e6',
    ink: '#1a231a',
    muted: '#5c6a58',
    page: '#f5f8f4',
    line: '#d9e4d6',
    font: 'sans',
    width: 'wide',
    logo: 'square'
  },
  nav: [
    { label: '朝凪市', path: '/area/asanagi' },
    { label: '東都市', path: '/area/tohto' },
    { label: '施設を探す', path: '/category/spot' }
  ],
  categories: [
    { slug: 'area', label: 'エリア' },
    { slug: 'spot', label: '施設' }
  ],
  sidebar: { ad: true },
  data: {
    searchPlaceholder: '住所・施設名を入力',
    listTitle: '掲載しているエリア・施設',
    panelTitle: 'お知らせ',
    panels: [
      { label: '経路の情報', text: '循環バスの経路は2026年10月に変更されます。' },
      { label: '掲載データ', text: '施設情報は2026年8月時点のものです。' }
    ],
    now: {
      area: 'MapSquare',
      value: '地図と施設検索',
      note: '住所または施設名を入力して検索できます。掲載範囲は東都地方です。',
      art: 'map-rail',
      stats: [
        { label: '掲載エリア', value: '東都地方（5市2町）' },
        { label: '掲載施設', value: '約4,200件' },
        { label: '更新', value: '毎月' }
      ]
    }
  },
  pages: [
    {
      path: '/area/asanagi',
      title: '朝凪市の地図と主な施設',
      kind: 'spot',
      category: 'エリア',
      date: '2022-04-01',
      updatedAt: '2026-08-19',
      keywords: ['朝凪市', '地図', '施設', 'エリア', 'アクセス'],
      art: 'map-water',
      views: 44100,
      weight: 1.2,
      subtitle: '人口 約7.8万人／面積 32.4km²',
      excerpt: '朝凪市の地図と主な施設の一覧。市役所、駅、公園、図書館などの位置と最寄りの停留所を掲載しています。',
      facts: [
        { label: '人口', value: '約7.8万人' },
        { label: '面積', value: '32.4km²' },
        { label: '主要駅', value: '蒼海鉄道 朝凪駅' },
        { label: '隣接', value: '白浜台市、三坂町、港北区' }
      ],
      body: [
        '東都市の南東に位置する市です。臨海部と、内陸の住宅地に大きく分かれます。',
        { h: '主な施設' },
        { table: {
          head: ['施設', '所在地', '最寄り'],
          rows: [
            ['朝凪市役所', '中央3-1-1', '循環バス「市役所前」'],
            ['朝凪駅', '中央1', '—'],
            ['朝凪市立図書館', '中央3-8', '循環バス「図書館前」'],
            ['朝凪臨海公園', '港北5-1', '循環バス「臨海公園」'],
            ['朝凪市民体育館', '中央4-2', '朝凪駅 徒歩14分'],
            ['朝凪銀座商店街', '中央1〜3', '朝凪駅 徒歩3分']
          ]
        } },
        { h: '地区の構成' },
        { ul: [
          '中央地区：市役所、駅、商店街',
          '港北地区：臨海公園、港湾施設、灯台跡',
          '白浜台方面：住宅地',
          '三坂地区：住宅地、公民館'
        ] },
        { h: '交通' },
        '鉄道は蒼海鉄道が市内を東西に走り、駅は朝凪駅の1駅です。市内の移動は循環バス（1日14便）が主な手段になります。'
      ],
      items: [
        { name: '朝凪駅', note: '中央1／蒼海鉄道' },
        { name: '朝凪市役所', note: '中央3-1-1' },
        { name: '朝凪臨海公園', note: '港北5-1' }
      ],
      related: ['/spot/asanagi-station', '/area/tohto']
    },
    {
      path: '/spot/asanagi-station',
      title: '朝凪駅',
      kind: 'spot',
      category: '施設',
      date: '2015-06-10',
      updatedAt: '2026-08-19',
      keywords: ['朝凪駅', '駅', '地図', 'アクセス', '鉄道'],
      art: 'map-rail',
      views: 31200,
      subtitle: '蒼海鉄道 朝凪駅（中央1丁目）',
      excerpt: '蒼海鉄道朝凪駅の構内案内と周辺情報。1日の乗降客は約1万8千人です。',
      facts: [
        { label: '所在地', value: '朝凪市中央1' },
        { label: '路線', value: '蒼海鉄道 本線' },
        { label: '乗降客', value: '約1万8千人／日' },
        { label: '出口', value: '東口・西口' },
        { label: '設備', value: 'エレベーター（2015年設置）' }
      ],
      body: [
        '蒼海鉄道本線の駅です。東都駅までは快速で42分、普通で58分です。',
        { h: '構内' },
        { ul: [
          '改札は1か所（1階）',
          'ホームは2面2線',
          'エレベーターは2015年3月に設置',
          '待合室は上りホームのみ'
        ] },
        { h: '出口と周辺' },
        '東口は商店街と市役所方面、西口は住宅地方面です。循環バスの停留所は東口を出て左手にあります。',
        { h: '2026年9月のダイヤ改正' },
        '9月12日から、平日朝の上り快速が2本増発されます。日中の普通列車は毎時4本に統一されます。最終列車は14分繰り上がります。'
      ],
      items: [
        { name: '朝凪銀座商店街', note: '東口 徒歩3分' },
        { name: '朝凪市役所', note: '東口 徒歩10分' },
        { name: '朝凪臨海公園', note: '東口 徒歩15分' }
      ],
      related: ['/area/asanagi']
    },
    {
      path: '/area/tohto',
      title: '東都市の地図と主な施設',
      kind: 'spot',
      category: 'エリア',
      date: '2022-04-01',
      updatedAt: '2026-06-02',
      keywords: ['東都市', '地図', '施設', 'エリア'],
      art: 'map',
      views: 62800,
      subtitle: '人口 約94万人／面積 218.6km²',
      excerpt: '東都市の地図と主な施設。図書館、市庁舎、主要駅の位置を掲載しています。',
      facts: [
        { label: '人口', value: '約94万人' },
        { label: '面積', value: '218.6km²' },
        { label: '主要駅', value: '東都駅、東都北駅' },
        { label: '区', value: '5区（北・中央・南・西・港北）' }
      ],
      body: [
        '東都地方の中心都市です。5区で構成され、行政と商業の中心は中央区にあります。',
        { h: '主な施設' },
        { table: {
          head: ['施設', '所在地', '最寄り'],
          rows: [
            ['東都市庁舎', '中央区1-1', '東都駅 徒歩6分'],
            ['東都市立図書館', '中央区4-12', '東都駅 徒歩12分'],
            ['東都情報大学', '北区7', '東都北駅 徒歩15分'],
            ['港北高等学校', '港北区3', '港北駅 徒歩7分']
          ]
        } },
        '図書館は2026年5月に改修を終えて再開館しました。閲覧席が290席に増えています。'
      ],
      related: ['/area/asanagi']
    }
  ]
})

export const webKeeper = defineSite({
  id: 'web-keeper',
  domain: 'web-keeper.jp',
  name: 'ウェブ保存庫',
  shortName: 'ウェブ保存庫',
  kind: 'archive-service',
  template: 'utility',
  tagline: '公開が終わったページを、読める形で残す',
  description: '公開が終了したWebページの保存版を閲覧できるサービス。保存日時の記録とともに公開しています。',
  keywords: ['保存', 'アーカイブ', '閉鎖', '過去のページ', 'キャッシュ'],
  authority: 0.65,
  established: '2010年',
  lastUpdated: '2026-08-05',
  operator: 'ウェブ保存庫 運営部',
  history: [
    { year: '2010', text: '保存サービスとして開始' },
    { year: '2019', text: '保存対象を個人サイトへ拡大' },
    { year: '2026', text: '検索機能を改善' }
  ],
  theme: {
    accent: '#7a6a55',
    accentSoft: '#f2eee7',
    ink: '#221d16',
    muted: '#6a6055',
    page: '#f8f6f2',
    line: '#e0d9cd',
    font: 'mono',
    width: 'normal',
    logo: 'retro'
  },
  nav: [
    { label: '保存一覧', path: '/archive' },
    { label: '個人サイト', path: '/category/personal' },
    { label: '団体・企業', path: '/category/org' },
    { label: '保存について', path: '/about' }
  ],
  categories: [
    { slug: 'personal', label: '個人サイト' },
    { slug: 'org', label: '団体・企業' }
  ],
  sidebar: { ad: false },
  data: {
    searchPlaceholder: 'URLまたはサイト名で検索',
    listTitle: '最近の保存',
    panelTitle: 'ご利用にあたって',
    panels: [
      { label: '保存の範囲', text: '本文と構造を保存しています。画像は保存されていない場合があります。' },
      { label: '削除の依頼', text: '権利者からの申し出により、保存版を非公開にする場合があります。' }
    ],
    now: {
      area: 'ウェブ保存庫',
      value: '保存されたページを読む',
      note: '公開が終了したページの保存版を、保存日時の記録とともに閲覧できます。',
      art: 'screenshot',
      stats: [
        { label: '保存サイト数', value: '約12万件' },
        { label: '最古の保存', value: '2010年4月' },
        { label: '更新', value: '毎日' }
      ]
    }
  },
  pages: [
    {
      path: '/snapshot/yozora-note/2016-03-19',
      title: '［保存版］夜空ノート — 2016年3月19日',
      kind: 'snapshot',
      category: '個人サイト',
      date: '2016-03-19',
      updatedAt: '2016-03-19',
      keywords: ['保存版', '夜空ノート', '個人サイト', '天体', '2016', '閉鎖'],
      art: 'sunset',
      views: 4200,
      subtitle: 'yozora-note.net の保存版（保存日 2016年3月19日）',
      excerpt: '2016年に公開を終了した個人サイト「夜空ノート」の保存版。天体観測の記録を掲載していたサイトです。',
      facts: [
        { label: '元のURL', value: 'yozora-note.net' },
        { label: '保存日', value: '2016年3月19日' },
        { label: '公開終了', value: '2016年4月' },
        { label: '保存範囲', value: '本文のみ（画像なし）' }
      ],
      body: [
        { note: 'このページは保存版です。元のサイトは2016年4月に公開を終了しています。表示は保存日時点の内容です。', label: '保存版' },
        { h: '夜空ノート（保存された本文）' },
        '「このサイトでは、自宅のベランダから撮った月と惑星の写真を置いています。機材は望遠鏡と小さなカメラだけです。」',
        '「更新は月に2回程度です。天気が悪い月は何も書きません。」',
        { h: '最終更新の記事（2016年3月12日）' },
        '「3月の観測記録。今月は晴れた夜が3日しかなく、そのうち2日は月が明るすぎました。残った1日に木星を撮りました。」',
        '「来月からは引っ越しのため、しばらく観測ができません。サイトの更新も止めます。データは手元に残しますので、また落ち着いたら別の場所で再開するかもしれません。」',
        { h: '保存されなかった部分' },
        '画像ファイルは保存されていません。掲示板は外部サービスを利用していたため、内容は残っていません。'
      ]
    },
    {
      path: '/snapshot/hanabi-kikaku/2014-08-02',
      title: '［保存版］朝凪花火企画委員会 — 2014年8月2日',
      kind: 'snapshot',
      category: '団体・企業',
      date: '2014-08-02',
      updatedAt: '2014-08-02',
      keywords: ['保存版', '花火', '朝凪', '2014', '委員会', '閉鎖'],
      art: 'festival',
      views: 2100,
      subtitle: 'hanabi-kikaku.asanagi.jp の保存版（保存日 2014年8月2日）',
      excerpt: '2014年当時の朝凪花火大会の企画委員会サイトの保存版。現在は市の観光協会サイトに統合されています。',
      facts: [
        { label: '元のURL', value: 'hanabi-kikaku.asanagi.jp' },
        { label: '保存日', value: '2014年8月2日' },
        { label: '公開終了', value: '2017年（観光協会サイトへ統合）' },
        { label: '保存範囲', value: '本文のみ' }
      ],
      body: [
        { note: 'このページは保存版です。元のサイトは2017年に朝凪市観光協会のサイトへ統合されました。', label: '保存版' },
        { h: '2014年の開催案内（保存された本文）' },
        '「第39回 朝凪花火大会は、8月23日（土）午後7時30分から開催します。会場は朝凪臨海公園および周辺護岸です。打ち上げ数は約4000発を予定しています。」',
        '「今年は護岸の一部で工事が行われているため、観覧できる区域が例年より狭くなります。ご了承ください。」',
        { h: 'ボランティア募集（保存された本文）' },
        '「当日の運営を手伝っていただける方を募集しています。会場設営、案内、清掃の3種です。高校生以上が対象です。」',
        '「特に片付けの人手が不足しています。最終日の夕方だけでもご協力いただけると助かります。」',
        { h: '備考' },
        '2014年の護岸工事は、この年から数年にわたって続いた。海上からの打ち上げが再開されたのは2026年である。'
      ]
    },
    {
      path: '/snapshot/soft-hozon/2015-11-30',
      title: '［保存版］ソフト保存室 — 2015年11月30日',
      kind: 'snapshot',
      category: '個人サイト',
      date: '2015-11-30',
      updatedAt: '2015-11-30',
      keywords: ['保存版', 'フリーソフト', '2015', '個人サイト', '配布', '閉鎖'],
      art: 'screenshot',
      views: 6800,
      subtitle: 'soft-hozon.jp の保存版（保存日 2015年11月30日）',
      excerpt: '2016年に閉鎖した個人のフリーソフト配布サイトの保存版。配布ファイルは保存されていません。',
      facts: [
        { label: '元のURL', value: 'soft-hozon.jp' },
        { label: '保存日', value: '2015年11月30日' },
        { label: '公開終了', value: '2016年5月' },
        { label: '保存範囲', value: '本文のみ（配布ファイルなし）' }
      ],
      body: [
        { note: 'このページは保存版です。配布されていたファイルは保存されていません。作者への連絡先も現在は有効ではありません。', label: '保存版' },
        { h: 'サイトの説明（保存された本文）' },
        '「自作の小さなソフトを置いています。どれも自分が必要になって作ったものです。動作の保証はできませんが、質問には答えます。」',
        { h: '公開していたソフト（一覧のみ保存）' },
        { ul: [
          'テキスト整形ツール（v1.4／2013年更新）',
          '一括改名ツール（v2.0／2014年更新）',
          'HTML簡易チェッカー（v1.1／2012年更新）'
        ] },
        { h: '最後の更新（2015年11月20日）' },
        '「しばらく更新できていません。作ったソフトはそのまま置いておきますが、新しい環境での動作確認はしていません。ご利用は自己責任でお願いします。」',
        { h: '備考' },
        '同種の機能を持つソフトは、現在も収録サイトで配布されています。'
      ]
    },
    {
      path: '/snapshot/machi-tsushin/2013-05-08',
      title: '［保存版］まち通信・朝凪 — 2013年5月8日',
      kind: 'snapshot',
      category: '団体・企業',
      date: '2013-05-08',
      updatedAt: '2013-05-08',
      keywords: ['保存版', '朝凪', '地域', '2013', 'ニュース', '閉鎖'],
      art: 'shopping-street',
      views: 1700,
      subtitle: 'machi-tsushin-asanagi.net の保存版（保存日 2013年5月8日）',
      excerpt: '2013年当時の地域情報サイトの保存版。商店街の店舗一覧などを掲載していました。',
      facts: [
        { label: '元のURL', value: 'machi-tsushin-asanagi.net' },
        { label: '保存日', value: '2013年5月8日' },
        { label: '公開終了', value: '2015年3月' },
        { label: '保存範囲', value: '本文のみ' }
      ],
      body: [
        { note: 'このページは保存版です。元のサイトは2015年3月に公開を終了しています。', label: '保存版' },
        { h: '掲載されていた内容（保存された本文の一部）' },
        '「朝凪銀座商店街の店舗一覧を掲載しています。掲載は各店の許可を得たものです。閉店・移転の情報がありましたらご連絡ください。」',
        '「2013年5月現在、商店街の店舗数は68店です。空き店舗は6件です。」',
        { h: 'アーケードについて（保存された本文）' },
        '「アーケードの屋根は1987年に設置されたもので、老朽化が指摘されています。商店会では改修の検討を進めていますが、費用の負担方法が決まっていません。」',
        { h: '備考' },
        'アーケードの改修は2026年8月に完了した。'
      ]
    }
  ]
})

export const utilitySites = Object.freeze([weatherLine, mapSquare, webKeeper])
