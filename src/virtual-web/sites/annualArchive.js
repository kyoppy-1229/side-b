// Background history for the ordinary virtual internet. These are deliberately
// unrelated to the mystery: the reader should be able to browse ten uneventful
// years without every search turning into a clue.
//
// The two recurring editorial formats per year (a report and a reader-facing
// follow-up) are generated from each publication's beat. Closed and dormant
// sites stop publishing at their actual recorded final update.

const BEATS = Object.freeze({
  naviweb: ['ポータルのトップ画面', 'スマートフォン向け検索', 'おすすめリンク'],
  'asanagi-townnavi': ['駅前商店街', '公共施設の利用案内', '地域の催し'],
  matome24: ['暮らしの小さな工夫', 'ネット上の話題', '便利なサービス'],
  'tohto-news': ['通勤・通学の変化', '地域の働き方', '都市の暮らし'],
  'asanagi-shimbun': ['朝凪駅前の変化', '市民活動', '地域行事'],
  'digital-scope': ['PCの使われ方', 'Webブラウザー', '校内・職場の情報管理'],
  'web-koubou': ['Webサイト制作', 'アクセシビリティ', '古いサイトの保守'],
  'pc-archive': ['中古パソコン', '昔の周辺機器', '古いOSの記録'],
  'minna-pedia': ['百科事典の記事編集', '出典の整理', 'インターネットの歴史'],
  'web-yougo': ['Web用語の解説', 'ネット上の安全', '検索とアーカイブ'],
  'q-link': ['パソコンの疑問', 'スマートフォンの設定', '家庭内ネットワーク'],
  'shitsumon-hiroba': ['パソコンの相談', '写真の保存', 'メールの使い方'],
  'hibi-yohaku': ['休日の喫茶店', '雨の日の散歩', '写真の整理'],
  'houkago-log': ['放課後の記録', '昔のゲーム', '通学路の風景'],
  'pc-life': ['自宅のPC環境', 'データの整理', '買い替えの判断'],
  'machikado-photo': ['街角写真', '駅前の景色', '季節の光'],
  'minna-bbs': ['雑談板の近況', '写真とPCの話', '地域の話題'],
  'madobe-soft': ['定番フリーソフト', 'ファイル整理ツール', 'バックアップの工夫'],
  vectoria: ['小さな便利ソフト', 'ソフトウェア公開', '利用者レビュー'],
  'indie-game-log': ['個人制作ゲーム', '短編アドベンチャー', 'ブラウザーゲーム'],
  'game-tana': ['思い出のゲーム', '小規模ゲーム', '遊びやすさの変化'],
  'cinema-pocket': ['ミニシアター', '短編映画', '配信と映画館'],
  'sound-shelf': ['音楽の聴き方', '地元のライブ', '古い音源の保存'],
  'asanagi-city': ['市の窓口案内', '公共施設の運営', '防災情報の伝え方'],
  'asanagi-kanko': ['季節の散策コース', '地域の小さな店', '観光案内所'],
  'manabi-navi': ['学習の進め方', '地域の学びの場', '家庭学習の資料'],
  'shinro-databank': ['進学情報', '学校選びの調査', '進路相談'],
  'mono-market': ['日用品の選び方', '収納用品', '机まわりの道具'],
  weatherline: ['天気の見方', '季節の気象', '予報の使い方'],
  mapsquare: ['地図の更新', '街歩きと地図', '経路案内'],
  'web-keeper': ['ページ保存', 'Webアーカイブ', '古いリンクの整理'],
  'yozora-note': ['夜の散歩', '写真日記', '日々の覚え書き'],
  'soft-hozon': ['古いソフトの保存', '配布ページの整理', 'ファイルの説明書'],
  'machi-tsushin': ['駅前の出来事', '地域の小さなニュース', '町内の掲示板']
})

const PERIODS = Object.freeze({
  2016: ['スマートフォンから閲覧する人が増えた', '紙の案内とWebの情報がまだ並んでいた'],
  2017: ['写真や短い動画で情報を伝える試みが広がった', '古いページを残すべきかが話題になった'],
  2018: ['小さな画面でも読みやすい表示が求められた', '利用者から情報の探しづらさが指摘された'],
  2019: ['更新作業の引き継ぎが課題になった', '長く使われるサービスの使い勝手が見直された'],
  2020: ['自宅から情報を利用する機会が急増した', '対面の案内をWebで補う必要が出てきた'],
  2021: ['オンラインでの参加や手続きが定着し始めた', '保存した資料を再利用する動きがあった'],
  2022: ['外出とオンラインの両方を選べるようになった', '情報の鮮度と出典を確認する人が増えた'],
  2023: ['使い慣れた仕組みを残しながら画面を更新した', '小規模な運営でも継続できる方法が模索された'],
  2024: ['スマートフォンでの操作を前提に再設計された', '古い情報と新しい情報の区別が重視された'],
  2025: ['数年分の記録を振り返る記事が増えた', '次の更新に向けて利用者の声が整理された']
})

// Give each year a distinct illustration only where that site's subject fits.
// Other pages keep their established artwork, preventing a repeated image on
// every unrelated site in the same year.
const EDITORIAL_ART = Object.freeze({
  2016: { art: 'web-2016-pc-tablet', sites: ['digital-scope', 'pc-archive', 'q-link', 'pc-life', 'manabi-navi'] },
  2017: { art: 'web-2017-shopping-street', sites: ['asanagi-townnavi', 'asanagi-shimbun', 'machikado-photo', 'asanagi-kanko'] },
  2018: { art: 'web-2018-web-design', sites: ['web-koubou', 'digital-scope', 'naviweb', 'web-yougo', 'madobe-soft'] },
  2019: { art: 'web-2019-rail-station', sites: ['mapsquare', 'asanagi-kanko', 'tohto-news', 'asanagi-townnavi'] },
  2020: { art: 'web-2020-home-learning', sites: ['manabi-navi', 'shinro-databank', 'pc-life', 'asanagi-city'] },
  2021: { art: 'web-2021-community-event', sites: ['asanagi-city', 'asanagi-townnavi', 'tohto-news', 'manabi-navi'] },
  2022: { art: 'web-2022-retro-game-desk', sites: ['indie-game-log', 'game-tana', 'pc-life', 'digital-scope'] },
  2023: { art: 'web-2023-town-cafe', sites: ['hibi-yohaku', 'asanagi-kanko', 'matome24', 'machikado-photo'] },
  2024: { art: 'web-2024-data-archive', sites: ['web-keeper', 'digital-scope', 'minna-pedia', 'web-yougo'] },
  2025: { art: 'web-2025-current-city', sites: ['tohto-news', 'asanagi-shimbun', 'naviweb', 'asanagi-townnavi'] }
})

function yearFrom(value){
  const match = String(value || '').match(/\d{4}/)
  return match ? Number(match[0]) : null
}

function lastPublishedDate(site){
  // lastUpdated is authoritative for inactive/closed sites, and also keeps
  // generated pages from appearing in a publication's imagined future.
  return [site.lastUpdated, site.closedAt]
    .filter(Boolean)
    .sort()[0] || '2026-08-31'
}

function pageKind(site){
  if(site.template === 'forum') return 'thread'
  if(site.template === 'qa') return 'question'
  return 'article'
}

function discussionPosts(site, topic, dateText){
  if(site.template !== 'forum' && site.template !== 'qa') return []
  const [year, month, day] = dateText.split('-').map(Number)
  const dateOf = (dayOffset) => `${year}/${String(month).padStart(2, '0')}/${String(day + dayOffset).padStart(2, '0')}`
  return [
    { name: '投稿者', date: `${dateOf(0)} 16:20`, text: `${topic}について、最近の状況や使い方を教えてください。` },
    { name: '通りすがり', date: `${dateOf(1)} 09:12`, text: 'まず公式の案内や当時の日付を確認すると、情報を整理しやすいと思います。' },
    { name: '常連さん', date: `${dateOf(2)} 21:48`, text: '古い手順も残っていますが、今の画面と異なる部分は読み替えが必要でした。' }
  ]
}

function annualPage(site, year, edition){
  const beats = BEATS[site.id] || ['サイトの更新', '暮らしの話題', '利用者の声']
  const topic = beats[(year + edition) % beats.length]
  const [trend, counterpoint] = PERIODS[year]
  const report = edition === 0
  const title = report
    ? `${topic}の変化を振り返る――${year}年の記録`
    : `${topic}をめぐる利用者の声と、残された課題`
  const month = (report ? 2 : 8) + ((site.id.length + year) % 4)
  const day = 6 + ((year * 3 + site.id.length + edition) % 17)
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const yearLabel = `${year}年`
  const body = report ? [
    `${yearLabel}、${topic}を取り巻く環境は少しずつ変わった。${trend}ことが一つの背景にある。${site.name}では、この年に見られた変化を過去の記録と照らして整理した。`,
    { h: '現場で見えてきたこと' },
    `${counterpoint}。急いで切り替えるより、使い続ける人が困らないことを優先した例もある。見た目の新しさだけでは判断できないという声が多かった。`,
    `特に${topic}では、最初に情報を知った日付と、その後に内容が更新された日付が異なる。読者からは「いつの状況なのかを明示してほしい」という意見が寄せられた。`,
    { h: '来年に向けて' },
    `すべてが一度に変わったわけではない。${yearLabel}の記録は、以前からの利用方法がどのように残ったかを知る手掛かりにもなる。新しい情報だけでなく、当時の案内も参照できる状態を保ちたい。`,
    { links: [{ label: '年別アーカイブ', path: '/archive' }] }
  ] : [
    `${yearLabel}の後半、${topic}に関する質問が読者から寄せられた。話題になったのは新しい機能そのものより、日常の中でどう使うかという点だった。`,
    { h: '寄せられた三つの疑問' },
    { ol: [
      `以前の${topic}と何が変わったのか。`,
      '更新された情報を、どこで確認できるのか。',
      '古い資料を残すときに注意すべきことは何か。'
    ] },
    `${trend}一方で、${counterpoint}。新旧どちらか一方を選ぶのではなく、利用目的に合わせることが重要だと分かった。`,
    { quote: '便利になった部分を知りたいし、以前の記録も見返せると助かる。', cite: '読者アンケートより' },
    `編集部では質問と回答を記録し、${yearLabel}の記事一覧からたどれるようにした。ここに書かれた内容は公開当時のもので、現在の環境と一致するとは限らない。`,
    { links: [{ label: '同年の振り返り', path: `/history/${year}/report` }] }
  ]

  return {
    path: `/history/${year}/${report ? 'report' : 'voices'}`,
    kind: pageKind(site),
    title,
    category: site.categories?.[0]?.label || '記録',
    date,
    author: site.defaultAuthor || `${site.name}編集部`,
    tags: [topic, String(year), 'アーカイブ'],
    keywords: [topic, String(year), `${year}年`, '当時', '過去記事'],
    excerpt: report
      ? `${yearLabel}の${topic}について、当時の変化と残された課題を振り返る。`
      : `${topic}について寄せられた疑問と、その時点での回答をまとめた。`,
    lead: report ? `${yearLabel}の出来事を、当時の記録からたどる。` : '読者の疑問を出発点に、時代背景を整理する。',
    body,
    posts: discussionPosts(site, topic, date),
    art: report && EDITORIAL_ART[year]?.sites.includes(site.id)
      ? EDITORIAL_ART[year].art
      : site.pages?.find((page) => page.art)?.art || 'abstract',
    layout: year < 2020 ? '2010s' : '',
    views: Math.max(180, (year - 2015) * 327 + site.id.length * 47 + edition * 163),
    comments: (year + site.id.length + edition) % 23,
    weight: 0.5,
    related: report ? [] : [`/history/${year}/report`]
  }
}

export function makeAnnualArchive(site){
  const cutoff = lastPublishedDate(site)
  const startYear = Math.max(2016, yearFrom(site.established) || 2016)
  const authoredPaths = new Set((site.pages || []).map((page) => page.path))
  const added = []
  for(let year = startYear; year <= 2025; year++){
    for(let edition = 0; edition < 2; edition++){
      const page = annualPage(site, year, edition)
      if(page.date > cutoff || authoredPaths.has(page.path)) continue
      added.push(page)
    }
  }
  return added
}
