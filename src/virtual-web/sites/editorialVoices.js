// Everyday pages should sound like their publishers, not like a single
// narrator wearing 34 different logos. This module gives the background
// archive different editorial structures for each kind of publication.
//
// All content concerns ordinary public life. The mystery's actual records
// remain in their own, chapter-gated pages.

function dateWithOffset(date, offset, hour){
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + offset)
  return `${value.toISOString().slice(0, 10).replace(/-/g, '/') } ${hour}`
}

function conversation(date, topic, kind){
  if(kind === 'forum'){
    return [
      { name: 'スレ主', date: dateWithOffset(date, 0, '18:04'), text: `${topic}の昔の状況を調べています。最近どう変わりましたか？` },
      { name: '通りがかり', date: dateWithOffset(date, 0, '18:26'), replyTo: 1, text: '一気に変わったというより、少しずつ使い方が変わった印象があります。' },
      { name: 'いつもの人', date: dateWithOffset(date, 0, '21:17'), replyTo: 1, text: '前の案内が残っていると分かりやすいですね。消えてしまった情報もあります。' },
      { name: '名無しさん', date: dateWithOffset(date, 1, '07:42'), replyTo: 3, text: '日付が違うページを混ぜないようにしたい。更新日を見てから比べています。' },
      { name: 'スレ主', date: dateWithOffset(date, 2, '19:08'), replyTo: 4, text: 'ありがとうございます。当時の写真や配布資料も探してみます。' }
    ]
  }
  if(kind === 'qa'){
    return [
      { name: '質問者', date: dateWithOffset(date, 0, '09:12'), text: `${topic}について、以前と現在の違いが分かる資料はありますか？` },
      { name: '古い資料好き', date: dateWithOffset(date, 0, '11:40'), text: '公式案内の公開日と最終更新日を確認するのが先です。古い画面の説明をそのまま使わないようにしましょう。' },
      { name: '現場の人', date: dateWithOffset(date, 1, '08:53'), text: '当時の利用者の話も参考になります。ただし、一人の記憶だけでは確かな記録になりません。', best: true },
      { name: '質問者', date: dateWithOffset(date, 2, '20:05'), text: '保存されている説明と、現在の案内を分けて読むことにします。' }
    ]
  }
  return []
}

const SITE_VOICES = Object.freeze({
  'asanagi-townnavi': { place: '朝凪駅から商店街までの通り', audience: '買い物に訪れる人' },
  'asanagi-shimbun': { place: '朝凪市内', audience: '地域の住民' },
  'tohto-news': { place: '東都・朝凪地域', audience: '利用者や事業者' },
  'asanagi-city': { place: '朝凪市内', audience: '市民' },
  'asanagi-kanko': { place: '朝凪の海辺と商店街', audience: '観光客' },
  'machikado-photo': { place: '朝凪駅前', audience: '写真を見に来る人' },
  'hibi-yohaku': { place: 'いつもの住宅街', audience: 'このブログの読者' },
  'mapsquare': { place: '朝凪市周辺', audience: '初めて訪れる人' },
  'manabi-navi': { place: '学校と家庭', audience: '保護者や教員' },
  'shinro-databank': { place: '学校の進路相談室', audience: '進路を考える生徒' }
})

function angle(site, topic, trend, counterpoint){
  const voice = SITE_VOICES[site.id]
  const place = voice?.place || (site.kind.includes('tech') ? '仕事や家庭の机' : '日常の現場')
  const audience = voice?.audience || '利用者'
  return { topic, trend, counterpoint, place, audience }
}

export function editorialVoice(site, year, edition, topic, trend, counterpoint, date){
  const isReport = edition === 0
  const a = angle(site, topic, trend, counterpoint)
  const label = `${year}年`
  const later = isReport ? '当時' : 'その後'
  const baseTags = [topic, String(year), '過去記事']
  const heading = isReport ? '当時の状況' : '寄せられた声'
  const commentary = `${a.counterpoint}。新しい方法が広がる一方で、前から利用していた人への案内も必要だった。`
  const comparison = `${label}の情報は公開された時点の記録です。現在の利用方法や制度と同じとは限りません。`

  switch(site.template){
    case 'news':
      return {
        title: isReport ? `${topic}に変化、${a.place}でも対応進む` : `${topic}の見直し続く　利用者の声から見えた課題`,
        lead: `${label}、${a.place}で${topic}を巡る動きがあった。`,
        body: [
          `${label}、${a.place}では${topic}について新しい取り組みが始まった。${a.trend}ことを背景に、関係者は従来の仕組みを少しずつ見直している。`,
          { h: heading },
          `${a.audience}からは、便利さを評価する声と、以前の情報も残してほしいという声の両方が聞かれた。${commentary}`,
          { quote: '分かりやすくなったところはあります。ただ、変更した理由も説明してほしい。', cite: `${a.place}の利用者` },
          `運営側は${later}の利用状況も確認し、必要に応じて案内を修正する方針だ。日付の異なる資料を比較する際は、当時の条件を揃える必要がある。`,
          { note: comparison, label: '掲載時点の情報' }
        ],
        tags: [...baseTags, '地域ニュース']
      }

    case 'portal':
      return {
        title: isReport ? `${label}の${topic}をまとめて確認` : `${topic}はどう変わった？ よくある質問と利用者の声`,
        lead: `調べたい情報へ、${label}の記録からたどるガイドです。`,
        body: [
          `${topic}に関して${a.trend}。この時期の案内を探す人に向けて、確認する順番をまとめた。`,
          { h: 'まず確認したい3点' },
          { ol: ['案内が掲載された年月日を確認する', '地域や施設ごとに条件が異ならないか確認する', '変更前の手順が必要ならアーカイブを探す'] },
          `${a.place}では${commentary} ${a.audience}は、必要な情報の掲載先を把握しておくと便利だ。`,
          { h: '過去の記事を探すには' },
          `${comparison} カテゴリ別の記事と年別アーカイブを併用してください。`,
          { links: [{ label: `${label}の記事一覧`, path: `/archive/${year}` }] }
        ],
        tags: [...baseTags, 'まとめ']
      }

    case 'qa':
      return {
        title: isReport ? `${topic}は${label}にどう変わりましたか？` : `${topic}の古い説明を今も参考にして大丈夫ですか？（${label}）`,
        lead: `利用者同士が${topic}について質問と回答を残した記録。`,
        body: [
          `${label}には${a.trend}こともあり、${topic}を巡る相談が増えた。`,
          { h: 'ベストアンサーの補足' },
          `状況によって使える方法は違います。${commentary} 保存された回答は当時の情報としてお読みください。`
        ],
        posts: conversation(date, topic, 'qa'),
        tags: [...baseTags, '質問']
      }

    case 'forum':
      return {
        title: isReport ? `【${year}年】${topic}のこと覚えてる？` : `【雑談】${topic}、昔と今でどう違う？`,
        lead: `${label}に立てられた雑談スレッド。`,
        body: [
          `${topic}についての利用者のやり取り。${label}当時の話題のため、現在の状況とは異なる場合があります。`
        ],
        posts: conversation(date, topic, 'forum'),
        tags: [...baseTags, '雑談']
      }

    case 'wiki':
      return {
        title: isReport ? `${topic}（${year}年の状況）` : `${topic}の記録と更新履歴（${year}年）`,
        lead: `${topic}に関する当時の用語と利用状況を整理した項目。`,
        body: [
          `${topic}とは、${a.place}で用いられる情報や活動の一つである。${label}には${a.trend}。`,
          { h: '概要' },
          `${commentary} 内容を読む際は、実際に使用されていた時期を区別する必要がある。`,
          { h: '記録を調べる際の注意' },
          { ul: ['公開された日付と後日の改訂日を分ける', '別の資料からも同じ情報を確認する', '当時の表現を現在の状況にそのまま当てはめない'] },
          { h: '関連項目' },
          `年ごとの変化を知るには、同じ分野の関連項目と保存された記事の改訂履歴が参考になる。`
        ],
        tags: [...baseTags, '解説']
      }

    case 'blog':
    case 'retro-blog':
      return {
        title: isReport ? `${topic}について、${label}のメモ` : `${topic}の続き。あの頃のことを少しだけ`,
        lead: `${a.place}で過ごした日の、小さな記録。`,
        body: [
          `この前、${a.place}で${topic}のことを考えた。${a.trend}のは、前から気になっていた変化でもある。`,
          `メモ帳をめくると、少し前のやり方が書き残されている。今なら当たり前のことも、当時は一つずつ試していた。`,
          { h: '忘れないうちに' },
          `${commentary} 使っている側としては、便利さよりも慣れるまでの時間の方が印象に残ることがある。`,
          { quote: '変わったもののことより、変わらなかったものを先に覚えている。' },
          `あとで読み返せるように日付を残しておく。${comparison}`
        ],
        tags: [...baseTags, '日記']
      }

    case 'software':
      return {
        title: isReport ? `${label}の${topic}を振り返る：使い続けた道具` : `${topic}の古い版を残しておくときの注意点`,
        lead: `小さな道具を無理なく使い続けるための保存メモ。`,
        body: [
          `${topic}について${a.trend}。${label}のソフトウェア環境では、機能よりも導入しやすさを重視する声もあった。`,
          { h: '確認したい仕様' },
          { dl: [{ label: '対象', value: `${label}当時の利用環境` }, { label: '確認事項', value: '対応OSとファイル形式' }, { label: '保存', value: '配布元と取得日時を記録' }] },
          `${commentary} 不明な配布ファイルを無理に実行せず、説明書と入手元を確かめることを推奨する。`,
          { note: comparison, label: '旧版の利用について' }
        ],
        tags: [...baseTags, 'フリーソフト']
      }

    case 'media':
      return {
        title: isReport ? `${topic}を通して振り返る${label}の作品` : `${topic}の楽しみ方は変わった？ 小さなレビュー`,
        lead: `${label}の作品と、その周辺にあった体験を振り返る。`,
        body: [
          `${topic}をテーマにした作品や企画を見直した。${a.trend}という変化の中でも、小さな表現にしかない魅力が残っている。`,
          { h: '印象に残ったところ' },
          `派手な仕掛けではなく、手触りや余白に気を配った作りがよかった。使い続けて初めて分かる部分もある。`,
          { h: '今になって思うこと' },
          `${commentary} ${later}の見方で評価しすぎず、発表当時の環境を想像しながら触れたい。`
        ],
        tags: [...baseTags, 'レビュー']
      }

    case 'civic':
      return {
        title: isReport ? `【${year}年度】${topic}に関するお知らせ` : `${topic}の利用案内とよくあるお問い合わせ（${year}年度）`,
        lead: `${label}時点の案内を記録しています。`,
        body: [
          `${topic}について、${a.place}では利用案内を見直しました。${a.trend}ことを踏まえ、以下の点をお知らせします。`,
          { h: '対象となる方' },
          `${a.audience}。詳しい条件は利用する施設や手続きによって異なります。`,
          { h: '主な変更点' },
          { ul: ['案内の掲載先を整理しました', '以前の資料を参照する方法を残しました', '不明点は担当窓口にご確認ください'] },
          { note: `${commentary} ${comparison}`, label: '過去のお知らせ' }
        ],
        tags: [...baseTags, 'お知らせ']
      }

    case 'shop':
      return {
        title: isReport ? `${label}の${topic}、買う前に確認したこと` : `${topic}の選び直し：使い方別に整理する`,
        lead: `使い続けることを前提に、必要な条件を確認する。`,
        body: [
          `${topic}について${a.trend}。新製品だけでなく、以前から使っている道具との相性にも目を向けたい。`,
          { h: '選ぶ前のチェックリスト' },
          { ul: ['手元の道具と大きさ・規格が合うか', '日常の使い方に必要な機能があるか', '長期間使ったときの修理や交換ができるか'] },
          `${commentary} 値段だけを比較すると、使わなくなる機能まで選んでしまうことがある。`,
          { note: comparison, label: '掲載当時の情報' }
        ],
        tags: [...baseTags, '選び方']
      }

    default:
      return {
        title: isReport ? `${topic}の記録：${label}の更新内容` : `${topic}を調べる人のための案内（${year}年）`,
        lead: `${topic}に関する記録と利用案内。`,
        body: [
          `${label}、${a.place}では${topic}について${a.trend}。`,
          { h: '利用時に確認すること' },
          `${commentary} 情報を利用するときは対象地域と日付を確認する。`,
          { ul: ['利用時点の案内を確認する', '掲載された日付を記録する', '過去の内容は保存資料として参照する'] },
          comparison
        ],
        tags: baseTags
      }
  }
}
