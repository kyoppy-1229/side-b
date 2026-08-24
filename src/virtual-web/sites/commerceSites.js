// Shopping. Nothing can actually be ordered: the cart acknowledges the click
// and says so.

import { defineSite } from './kit.js'

export const monoMarket = defineSite({
  id: 'mono-market',
  domain: 'mono-market.jp',
  name: 'mono-market',
  shortName: 'mono-market',
  kind: 'shop',
  template: 'shop',
  tagline: '道具を、長く使うために',
  description: 'PC周辺機器と文房具を扱う通信販売サイト。商品の仕様と使用感を詳しく掲載しています。',
  keywords: ['通販', '買い物', 'PC周辺機器', '文房具', '商品'],
  authority: 0.6,
  established: '2015年',
  lastUpdated: '2026-08-21',
  operator: 'モノマーケット株式会社',
  history: [
    { year: '2015', text: '通信販売サイトを開設' },
    { year: '2019', text: '取扱商品を文房具へ拡大' },
    { year: '2025', text: '商品ページに仕様表を追加' }
  ],
  theme: {
    accent: '#166f5a',
    accentSoft: '#e5f2ee',
    ink: '#17211e',
    muted: '#5f6d68',
    page: '#f6f8f7',
    line: '#dde5e2',
    font: 'sans',
    width: 'wide',
    logo: 'square'
  },
  nav: [
    { label: '入力機器', path: '/category/input' },
    { label: '表示機器', path: '/category/display' },
    { label: '記録装置', path: '/category/storage' },
    { label: '文房具', path: '/category/stationery' }
  ],
  categories: [
    { slug: 'input', label: '入力機器' },
    { slug: 'display', label: '表示機器' },
    { slug: 'storage', label: '記録装置' },
    { slug: 'stationery', label: '文房具' }
  ],
  homeCopy: {
    kicker: '取り扱い',
    title: '長く使える道具を選んで置いています',
    lead: '仕様だけでなく、実際に使ったときの感触も掲載しています。'
  },
  sidebar: { ad: false },
  pages: [
    {
      path: '/product/kb-104q',
      title: 'KB-104Q 静音キーボード（有線）',
      kind: 'product',
      category: '入力機器',
      date: '2026-03-11',
      updatedAt: '2026-08-21',
      keywords: ['キーボード', '静音', '有線', 'PC', '周辺機器', 'おすすめ'],
      art: 'product-keyboard',
      views: 8400,
      weight: 1.2,
      excerpt: '打鍵音を抑えた有線キーボード。押し込みの深さは中間で、長時間の入力に向いています。',
      data: {
        price: 6480,
        listPrice: 7800,
        brand: 'モノマーケット取扱',
        rating: 4,
        reviews: 62,
        stock: 'in',
        stockText: '在庫あり — 通常2〜3日で発送'
      },
      facts: [
        { label: '接続', value: '有線（USB）' },
        { label: 'キー数', value: '104キー（テンキー付き）' },
        { label: '押し込みの深さ', value: '3.2mm' },
        { label: '重量', value: '780g' },
        { label: '保証', value: '1年' }
      ],
      body: [
        '打鍵音を抑えることを目的に作られた有線キーボードです。押し込みの深さは3.2mmで、浅すぎず深すぎない中間の設定になっています。',
        { h: '使用感' },
        '静音を謳う製品は押した感触が弱くなりがちですが、本製品は底に当たる感触が残っています。打鍵音は、一般的なキーボードと比べて明らかに小さいものの、無音ではありません。',
        { h: '向いている用途' },
        { ul: [
          '同じ部屋に他の人がいる環境での入力作業',
          '通話をしながらの入力',
          '長時間の文書作成'
        ] },
        { h: '向いていない用途' },
        '素早い連続入力を必要とする用途には、押し込みの深さが不足を感じる場合があります。',
        { note: '有線接続のみです。無線の同型はありません。', label: 'ご注意' }
      ],
      posts: [
        { no: 1, name: 'つくだ', date: '2026/07/12', likes: 4, text: '深さがちょうどよく、長時間でも指が疲れません。音は期待通り小さいです。' },
        { no: 2, name: 'k.m', date: '2026/06/28', likes: 4, text: '在宅の通話中に打っても気にならなくなりました。テンキー付きが助かる。' },
        { no: 3, name: 'なつ', date: '2026/05/03', likes: 3, text: '無音ではないので、そこは誤解しないほうがいいと思います。十分静かですが。' }
      ],
      related: ['/product/ms-2200', '/product/kb-88s']
    },
    {
      path: '/product/kb-88s',
      title: 'KB-88S コンパクトキーボード（無線）',
      kind: 'product',
      category: '入力機器',
      date: '2025-11-08',
      keywords: ['キーボード', '無線', 'コンパクト', 'PC', '周辺機器'],
      art: 'product-keyboard',
      views: 5900,
      excerpt: 'テンキーを省いた無線キーボード。机の幅を優先したい場合に向いています。',
      data: {
        price: 7980,
        brand: 'モノマーケット取扱',
        rating: 4,
        reviews: 38,
        stock: 'low',
        stockText: '残りわずか — 在庫3点'
      },
      facts: [
        { label: '接続', value: '無線（レシーバー／Bluetooth両対応）' },
        { label: 'キー数', value: '88キー（テンキーなし）' },
        { label: '押し込みの深さ', value: '2.8mm' },
        { label: '電池', value: '乾電池2本（約8か月）' },
        { label: '保証', value: '1年' }
      ],
      body: [
        'テンキーを省いた無線キーボードです。横幅は312mmで、標準的なキーボードより約130mm短くなっています。',
        { h: '2台切り替え' },
        '接続先を2台まで登録し、キー操作で切り替えられます。PCとタブレットを併用する場合に便利です。',
        { h: '注意点' },
        '電池は乾電池式で、充電式ではありません。交換の手間はありますが、電池切れの際に手元の乾電池で復帰できる利点があります。',
        '数字の入力が多い作業では、別売のテンキーとの併用を検討してください。'
      ],
      posts: [
        { no: 1, name: 'あさの', date: '2025/12/20', likes: 3, text: '机が広く使えるようになりました。切り替えも問題なく動きます。' },
        { no: 2, name: 'とみ', date: '2026/02/14', likes: 2, text: '数字入力が多い日はやはりテンキーが欲しくなります。用途次第。' }
      ],
      related: ['/product/kb-104q']
    },
    {
      path: '/product/ms-2200',
      title: 'MS-2200 静音マウス',
      kind: 'product',
      category: '入力機器',
      date: '2025-06-17',
      keywords: ['マウス', '静音', 'PC', '周辺機器', 'おすすめ'],
      art: 'product-mouse',
      views: 7200,
      excerpt: 'クリック音を抑えたマウス。手のひら全体で持つ形状で、長時間の作業に向いています。',
      data: {
        price: 3280,
        brand: 'モノマーケット取扱',
        rating: 4,
        reviews: 91,
        stock: 'in'
      },
      facts: [
        { label: '接続', value: '無線（レシーバー）' },
        { label: 'ボタン数', value: '5' },
        { label: '重量', value: '92g（電池含む）' },
        { label: '電池', value: '乾電池1本（約10か月）' },
        { label: '保証', value: '1年' }
      ],
      body: [
        'クリック音を抑えたマウスです。押した感触は残しつつ、音は明らかに小さくなっています。',
        '形状は手のひら全体で覆う型で、指先でつまむ持ち方には向きません。手の大きさが小さめの方は、店頭で持ち比べることをおすすめします。',
        '横スクロールに対応しており、表計算で横に長い表を扱う作業では効率が変わります。'
      ],
      posts: [
        { no: 1, name: 'shirokuma', date: '2025/09/02', likes: 6, text: '静かで持ちやすい。手が小さい家族には少し大きいようでした。' },
        { no: 2, name: 'kaz', date: '2025/07/22', likes: 4, text: '横スクロールが思ったより便利。表計算をよく使う人向け。' }
      ],
      related: ['/product/kb-104q']
    },
    {
      path: '/product/dp-2409',
      title: 'DP-2409 24インチ モニター',
      kind: 'product',
      category: '表示機器',
      date: '2026-01-23',
      keywords: ['モニター', '24インチ', '表示', 'PC', '周辺機器'],
      art: 'product-monitor',
      views: 11300,
      excerpt: '24インチのモニター。高さ調整と縦回転に対応し、2枚並べての使用に向いています。',
      data: {
        price: 21800,
        listPrice: 24800,
        brand: 'モノマーケット取扱',
        rating: 4,
        reviews: 47,
        stock: 'in'
      },
      facts: [
        { label: '画面サイズ', value: '23.8インチ' },
        { label: '解像度', value: '1920×1080' },
        { label: '端子', value: 'HDMI×2／DisplayPort×1' },
        { label: '調整', value: '高さ130mm／縦回転対応' },
        { label: '保証', value: '3年' }
      ],
      body: [
        '24インチのモニターです。特徴は台座の調整範囲の広さで、高さを130mmまで変えられます。',
        { h: '2枚並べる場合' },
        '高さを揃えられることが、2枚並べる際にはもっとも重要です。台座で調整できるため、本を積んで高さを合わせる必要がありません。',
        { h: '縦回転' },
        '縦向きにできるため、文書や長い表の確認に向いています。回転時のケーブルの取り回しに余裕を持たせてください。',
        { note: 'スピーカーは内蔵していません。音声出力が必要な場合は別途ご用意ください。', label: 'ご注意' }
      ],
      posts: [
        { no: 1, name: 'つくだ', date: '2026/04/10', likes: 5, text: '2枚目として買いました。高さが合わせられるのが本当に楽です。' },
        { no: 2, name: 'みなみ', date: '2026/03/02', likes: 2, text: 'スピーカーがないのは購入前に気づきました。用途上問題なし。' }
      ]
    },
    {
      path: '/product/ss-1tb',
      title: 'SS-1TB 外付け半導体記憶装置 1TB',
      kind: 'product',
      category: '記録装置',
      date: '2025-09-05',
      keywords: ['SSD', '外付け', '1TB', '記録装置', 'バックアップ'],
      art: 'product-ssd',
      views: 14700,
      excerpt: '手のひらに収まる外付けSSD。写真や書類の控えを置く用途に向いています。',
      data: {
        price: 12800,
        brand: 'モノマーケット取扱',
        rating: 5,
        reviews: 128,
        stock: 'in'
      },
      facts: [
        { label: '容量', value: '1TB' },
        { label: '接続', value: 'USB Type-C（Type-A変換付属）' },
        { label: '読み込み速度', value: '最大540MB/s' },
        { label: '大きさ', value: '78×52×9mm／48g' },
        { label: '保証', value: '3年' }
      ],
      body: [
        '手のひらに収まる大きさの外付け記憶装置です。可動部がないため、持ち運びに向いています。',
        { h: '用途' },
        { ul: [
          '写真や書類の控えを置く',
          '複数のPC間でデータを持ち運ぶ',
          '古いPCから新しいPCへの移行作業'
        ] },
        { h: '控えの取り方について' },
        '控えは2か所以上、種類の違う場所に置くことが基本です。本製品1台だけに保存するのではなく、PC本体との2か所構成にしてください。',
        '装置自体も数年で劣化します。重要なデータは、定期的に新しい装置へ移すことを想定した運用をおすすめします。'
      ],
      posts: [
        { no: 1, name: 'かまた', date: '2025/11/18', likes: 9, text: '写真の持ち出し用に。軽くて速く、不満がありません。' },
        { no: 2, name: 'log_keeper', date: '2025/10/07', likes: 7, text: '移行作業に使いました。速度が出るので待ち時間が短い。' },
        { no: 3, name: 'まさ', date: '2026/01/29', likes: 3, text: '変換が付属しているので古いPCでも使えました。' }
      ]
    },
    {
      path: '/product/nb-a5',
      title: 'A5方眼ノート（5冊組）',
      kind: 'product',
      category: '文房具',
      date: '2024-08-19',
      keywords: ['ノート', '方眼', 'A5', '文房具'],
      art: 'commerce-lifestyle',
      views: 6100,
      excerpt: '5mm方眼のA5ノート5冊組。裏写りしにくい紙を使っています。',
      data: {
        price: 1180,
        brand: 'モノマーケット取扱',
        rating: 4,
        reviews: 54,
        stock: 'in'
      },
      facts: [
        { label: '大きさ', value: 'A5（148×210mm）' },
        { label: '罫線', value: '5mm方眼' },
        { label: 'ページ数', value: '80ページ／冊' },
        { label: '内容', value: '5冊組' },
        { label: '紙質', value: '中性紙・80g/m²' }
      ],
      body: [
        '5mm方眼のA5ノートの5冊組です。紙は80g/m²で、水性ペンでも裏写りしにくくなっています。',
        '表紙は無地で、上部に記入欄があります。用途や期間を書いて並べる使い方に向いています。',
        '綴じは糸かがりで、開いた状態で平らになります。書き込みながら使う用途で扱いやすい構造です。'
      ],
      posts: [
        { no: 1, name: 'あさの', date: '2025/02/11', likes: 5, text: '平らに開くのがいいです。方眼は図を書くときに助かる。' }
      ]
    }
  ]
})

export const commerceSites = Object.freeze([monoMarket])
