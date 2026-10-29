// An ordinary, disconnected trail of computer-literacy articles. They teach
// harmless, read-only commands used by the fictional school archive terminal.
// The articles never mention the case, names, game URL or secret file paths.

const guides = {
  'pc-archive': [{
    path: '/articles/2016/command-prompt-basics',
    title: '昔のWindowsを思い出す：コマンドプロンプトの基本操作',
    date: '2016-06-12', category: 'PC', art: 'product-keyboard',
    excerpt: '黒い画面でも、まずHELPとDIRを知っておけば保存ファイルを読むことができる。',
    body: [
      '古いパソコンを整理していると、黒い画面に文字で操作を入力する道具に出会う。マウスで使う画面とは違うが、慣れれば大量のファイルを確認するのに便利だ。',
      { h: '最初の二つはHELPとDIR' },
      { code: 'HELP\nDIR', lang: 'bat' },
      'HELPは使える命令の一覧を表示し、DIRは現在のフォルダーにあるファイルを列挙する。表示された名前と拡張子を確かめてから次の操作へ進む。',
      { h: '読むだけならTYPE' },
      { code: 'TYPE README.TXT', lang: 'bat' },
      'TYPEはテキストファイルの内容を表示する命令。対象にしたいファイル名の空白や拡張子を間違えないこと。保存資料はまずコピーを作り、元の記録を直接編集しないようにする。',
      { note: '画面や使用可能な命令はOSの種類・版によって異なります。権限のある端末でのみ操作してください。' }
    ]
  }],
  'web-koubou': [{
    path: '/columns/2018/searching-text-records',
    title: '古いサイトの運用ログを読む：文字列検索から始める調査',
    date: '2018-11-07', category: 'Web', art: 'web-2018-web-design',
    excerpt: '何千行もある記録から日時や端末番号を探す際の基本は、原本を残して検索すること。',
    body: [
      '古いWebサイトの管理を引き継ぐと、当時の担当者が残したテキストの運用記録だけが手掛かりになることがある。',
      { h: 'ファイル名を確かめる' },
      'まずDIRで一覧を見る。ファイルを一つ開くにはTYPEを使い、検索したい文字が分かっている場合にはFINDSTRを使う。',
      { code: 'DIR\nTYPE ACCESS.LOG\nFINDSTR "19:44" ACCESS.LOG', lang: 'bat' },
      'これは説明用の架空ログ名であり、日時もサンプルだ。検索結果は文脈が切れていることがあるため、前後の行も必ず確認したい。',
      { h: '一件の記録だけで判断しない' },
      'アクセスがあった時刻は利用者本人の操作を必ずしも証明しない。セッション情報、端末の配置、配布ファイルの履歴など複数の種類の記録を突き合わせる。',
      { note: 'この解説は保存済みの読み取り権限があるログを対象としています。未知のシステムに接続する手順ではありません。' }
    ]
  }],
  'digital-scope': [{
    path: '/articles/2020/log-retention-comparison',
    title: 'アクセスログと認証ログは何が違う？ 調査で読み分ける基本',
    date: '2020-05-27', category: 'PC', art: 'web-2020-home-learning',
    excerpt: 'アクセス・認証・ファイル転送は似ているようで記録する事実が異なる。時刻をそろえて比較したい。',
    body: [
      '障害調査や記録の確認では、複数のログに同じ時刻が現れる。だが、アクセスの痕跡とユーザーの認証成功とファイルの転送は、別々の出来事を指している。',
      { table: { head: ['種類', '主に分かること', '分からないこと'], rows: [
        ['アクセスログ', '要求時刻・端末・接続先', '実際に入力した人物'],
        ['セッションログ', 'アカウントの利用時間帯', '本人が端末の前にいた証明'],
        ['転送ログ', '送信されたファイル名と時刻', '中身を誰が作ったか']
      ] } },
      { h: '秒単位で並べる' },
      '時計にずれがあることを前提に、時刻の補正を調べる。二つの資料が一致しても、共通の誤記がある可能性は残る。独立した記録を増やすことが大切だ。',
      '過去の記録は当時の端末名やアカウント名のまま残す。後から分かりやすい名前に置換すると、調査の根拠が失われることがある。'
    ]
  }],
  'pc-life': [{
    path: '/notes/2022/compare-text-files',
    title: '二つのテキスト記録を見比べる：FCとタイムスタンプの考え方',
    date: '2022-07-09', category: 'PC', art: 'web-2022-retro-game-desk',
    excerpt: '似たファイルを見比べるときに重要なのは、違いだけでなく共通の時刻も残すこと。',
    body: [
      '作業メモの古い版と新しい版、あるいは異なる端末で残ったログを比べたいとき、行単位の差分を取ると見落としが減る。',
      { h: 'FCコマンド' },
      { code: 'FC ACCESS.LOG SESSION.LOG', lang: 'bat' },
      'FCは二つのファイルを比較する命令だ。ファイル名は例示で、実際には所有者から閲覧を許可された資料だけを扱う。',
      '時刻が同じというだけで原因を決めつけず、端末番号や保存元が一致するかを確認する。片方のファイルにしかない行も重要な手掛かりになる。',
      { quote: '一致している行よりも、なぜ片方だけに残ったのかを考える。', cite: 'PC-Life編集ノート' }
    ]
  }],
  'q-link': [{
    path: '/questions/2024/old-terminal-help',
    kind: 'question',
    title: '古い保存端末でHELP、DIR、TYPEだけ使えるのはなぜですか？',
    date: '2024-03-16', category: 'パソコン', art: 'product-keyboard',
    excerpt: '読み取り専用のアーカイブ端末では安全上、使える命令を限定していることがあります。',
    posts: [
      { name: '保存担当', date: '2024/03/16 10:23', text: '古いアーカイブを開く画面で、HELP・DIR・TYPEなどしか使えません。故障でしょうか？' },
      { name: '資料室', date: '2024/03/16 14:50', text: '故障ではなく、資料保護のための制限かもしれません。まずHELPで対応するコマンドを確認してください。' },
      { name: 'PCの人', date: '2024/03/17 08:12', text: 'FINDSTRやFCが使えるなら文字列検索と比較もできます。元データを変更しないのが重要です。' }
    ],
    body: [
      '保存資料を閲覧するためだけに設計された端末では、コマンドの種類が制限されている場合がある。外部通信やファイル変更の命令を使えなくすることで、原本を守るためだ。',
      { code: 'HELP\nDIR\nTYPE README.TXT', lang: 'bat' },
      'まず使用可能な命令を確認し、資料の目録やREADMEを読むところから始めたい。'
    ]
  }],
  'web-keeper': [{
    path: '/guides/2025/archive-date-check',
    title: '2015年の記事を2025年に読むとき、何の日付を見るべきか',
    date: '2025-04-22', category: '保存・復元', art: 'web-2024-data-archive',
    excerpt: '掲載日、更新日、保存日が異なるのは普通のこと。10年前の記録を読むための確認項目。',
    body: [
      '十年前のページを今開くと、公開日と最終更新日、アーカイブされた日付が三つとも異なることがある。内容が新しいとは限らないため、意味を区別したい。',
      { table: { head: ['日付', '意味'], rows: [
        ['公開日', '記事が最初に世に出た日'],
        ['更新日', '掲載内容が最後に変更された日'],
        ['保存日', 'アーカイブ側がその時点の画面を取得した日']
      ] } },
      '保存された画面にリンク切れがあっても、リンク先のURLが残っていれば、別の時点の記録を探す助けになる。',
      { h: '引用する前の確認' },
      '同じ話題を扱う別の資料があるか、改訂履歴や訂正記事があるかを確認する。単独のページだけで結論を急がない。'
    ]
  }]
}

export function terminalGuidePagesFor(site){
  return (guides[site.id] || []).map((guide) => ({
    kind: 'article',
    author: site.defaultAuthor || `${site.name}編集部`,
    tags: ['コマンドプロンプト', 'テキスト', 'アーカイブ'],
    keywords: ['ログ', 'コマンド', 'HELP', 'DIR', 'TYPE', 'FINDSTR', 'FC', '履歴'],
    lead: guide.excerpt,
    ...guide
  }))
}
