// Final-chapter case file. The protagonist is the tenth graduate; the other
// nine are interviewable. Nothing in this module is part of ordinary TRACE
// Search, and the chapter gate prevents accidental early-game spoilers.

export const INCIDENT_TIME = '2015-03-01 19:44:12'

export const SUSPECTS = Object.freeze([
  {
    id: 'tanaka', name: '田中シン', place: '駅前',
    testimony: 'あの時間は駅前の文具店にいた。卒業記念の色紙を買い直してたんだ。',
    followup: 'レシートはもうないと思ってたけど、店の人が当時の控えを学校に渡したらしい。',
    file: 'SHOP.TXT', clue: '19:43の購入控えと店員の確認記録が一致する。'
  },
  {
    id: 'ogawa', name: '小川トオル', place: '体育館',
    testimony: '運動部の片付けをしていた。顧問が最後まで残ってくれた。',
    followup: '鍵は顧問に返したよ。帰宅後じゃなくて体育館での記録があるはず。',
    file: 'CLUB.TXT', clue: '顧問と備品返却簿が19:40〜19:55の在室を裏付ける。'
  },
  {
    id: 'honda', name: '本田ナオキ', place: '診療所',
    testimony: '熱を出して、夜間の診療所で待ってた。ずっと具合が悪かったんだ。',
    followup: '受付番号は忘れたけど、診察券はまだ家にある。',
    file: 'CLINIC.TXT', clue: '受付・診察の二つの時刻が対象時間をまたいでいる。'
  },
  {
    id: 'sato', name: '佐藤ダイキ', place: '路線バス',
    testimony: 'バスで隣町に向かってた。親戚の家に泊まる日だった。',
    followup: '乗っただけじゃ証明にならないけど、車内の忘れ物記録なら残ってる。',
    file: 'BUS.TXT', clue: '乗車・忘れ物受付・降車の記録に時系列の矛盾がない。'
  },
  {
    id: 'yamada', name: '山田アヤ', place: '自宅',
    testimony: '家族と長電話していた。学校へ戻る理由なんてなかったよ。',
    followup: '母の携帯に通話明細が残っていた。開始と終了の両方を見て。',
    file: 'CALL.TXT', clue: '家族の固定電話への19:36〜20:03の通話が確認できる。'
  },
  {
    id: 'suzuki', name: '鈴木レナ', place: '河川敷',
    testimony: '河川敷で写真を撮ってた。暗くなる直前の空を残したくて。',
    followup: '写真は一枚じゃない。連続撮影の元データを確認してほしい。',
    file: 'PHOTO.TXT', clue: '連続した写真の元データと背景の時計が一致する。'
  },
  {
    id: 'hayashi', name: '林ミサキ', place: '市立図書館',
    testimony: '返却本の整理を手伝ってた。閉館作業で帰るのが遅くなった。',
    followup: 'ボランティアの出退館簿を見れば分かると思う。',
    file: 'LIBRARY.TXT', clue: '職員の確認と退館記録が19:48まで在館を裏付ける。'
  },
  {
    id: 'nakamura', name: '中村ユイ', place: '文化会館',
    testimony: '会館の発表会で受付をしてた。写真にも写ってるはず。',
    followup: '受付当番表と会場の写真、二つとも同じ時間を示してるよ。',
    file: 'HALL.TXT', clue: '当番表と会場写真が19:30〜20:00の在席を示す。'
  },
  {
    id: 'mizuno', name: '水野ヒロキ', place: '自宅（本人談）',
    testimony: 'その頃は家にいたよ。昔のゲームの話？ 俺も詳しくは覚えてない。',
    followup: '学校のPCには触ってない。誰かが俺の名前を使ったんじゃない？',
    file: null, clue: '本人の証言と、校内セッション・転送履歴が一致しない。'
  }
])

export const ARCHIVE_FILES = Object.freeze({
  'README.TXT': `ASANAGI SCHOOL / BACKUP VIEWER 1.5\n2015年度 卒業記録の読み取り専用コピー。\n\n閲覧可能: DIR / TYPE / FINDSTR / FC / TIMELINE / CLS / HELP\n外部ネットワークには接続しません。すべて保存データの表示です。`,
  'CLASS.TXT': `2015年度 3年生 名簿（10名）\n主人公 / 水野ヒロキ / 田中シン / 小川トオル / 本田ナオキ\n佐藤ダイキ / 山田アヤ / 鈴木レナ / 林ミサキ / 中村ユイ\n\n卒業＝閉校。主人公は発熱のため集合写真を別日に撮影。`,
  'SHOP.TXT': `2015-03-01 文具店控え / 提供者: 店主\n19:43:08 購入者: 田中シン / 色紙・ペン\n19:46:31 精算後、店内防犯カメラで受け取りを再確認。\n店舗は学校から徒歩18分。`,
  'CLUB.TXT': `2015-03-01 体育館 備品・施錠記録\n19:40 小川トオル 備品整理（顧問確認）\n19:47 ボール倉庫の点検（顧問・小川の署名）\n19:55 体育館施錠。`,
  'CLINIC.TXT': `2015-03-01 夜間診療所 / 同意取得済みの時刻情報のみ\n19:31 本田ナオキ 受付\n19:46 本田ナオキ 診察開始\n20:04 会計。診療内容は非公開。`,
  'BUS.TXT': `2015-03-01 路線バス 乗務記録\n19:32 佐藤ダイキ 乗車（運転手証言）\n19:45 車内で忘れ物を申し出た記録\n20:01 終点で下車。`,
  'CALL.TXT': `2015-03-01 提出済み通話明細（番号は伏せ字）\n19:36:17 山田アヤ → 家族の固定電話\n20:03:44 通話終了\n通話中の映像通話記録も家族が確認。`,
  'PHOTO.TXT': `2015-03-01 河川敷で撮影された元データ\n19:38:41 鈴木レナ IMG_0314\n19:44:21 鈴木レナ IMG_0315\n19:49:02 鈴木レナ IMG_0316\nいずれも背景の駅時計と撮影順序が一致。`,
  'LIBRARY.TXT': `2015-03-01 市立図書館 ボランティア出退館記録\n19:30 林ミサキ 返却本整理\n19:44 職員確認 / 返却処理継続\n19:48:55 退館。`,
  'HALL.TXT': `2015-03-01 文化会館 発表会受付\n19:30 中村ユイ 当番開始\n19:44:04 会場写真に本人が写る\n20:00 当番終了。`,
  'ACCESS.LOG': `grad2015.school.local / 2015-03-01\n19:42:55 local session accepted / workstation PC-17\n19:44:12 source 203.0.113.32 / workstation PC-17\n19:46:03 session closed / workstation PC-17\n備考: このIPは資料用例示アドレス。`,
  'SESSION.LOG': `2015-03-01 校内端末 PC-17 認証記録\n19:42:55 user: mzn-02 / login: success\n19:44:12 user: mzn-02 / archive service access\n19:46:03 user: mzn-02 / logout\n備考: 名前からの自動断定は禁止。別の記録と照合すること。`,
  'BACKUP.LOG': `2015-03-01 校内配布サーバー 転送記録\n19:44:12 /upload/side-b_v1.zip / device PC-17\nSHA256 recorded separately in sealed catalog.\n19:44:13 /archive/version-index updated\n検証: 転送時刻と利用端末を ACCESS.LOG / SESSION.LOG と突き合わせること。`
})

export const FINAL_FILES = Object.freeze(['ACCESS.LOG', 'SESSION.LOG', 'BACKUP.LOG'])
export const ALIBI_IDS = Object.freeze(SUSPECTS.filter((suspect) => suspect.file).map((suspect) => suspect.id))

export function evaluateCase(interviewed, inspectedFiles, cleared){
  const interviewedSet = new Set(interviewed)
  const fileSet = new Set(inspectedFiles)
  const clearedSet = new Set(cleared)
  const ready = SUSPECTS.every((person) => interviewedSet.has(person.id)) &&
    ALIBI_IDS.every((id) => {
      const person = SUSPECTS.find((suspect) => suspect.id === id)
      return clearedSet.has(id) && fileSet.has(person.file)
    }) &&
    !clearedSet.has('mizuno') &&
    FINAL_FILES.every((name) => fileSet.has(name))
  return {
    ready,
    interviews: interviewedSet.size,
    verified: clearedSet.size,
    logFiles: FINAL_FILES.filter((name) => fileSet.has(name)).length,
    remaining: SUSPECTS.filter((suspect) => !clearedSet.has(suspect.id))
  }
}
