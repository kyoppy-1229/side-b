import { EDITIONS, EDITION_VALUES, ROOM_DEFINITIONS } from './school.js'
import { trialInteractionText, trialMemoryIdFor } from '../../trial/memories.js'

export const CLOCK_STATES = Object.freeze(['normal', 'stopped', 'offset', 'reverse'])

const commonClock = Object.freeze({
  state: 'normal',
  speed: 1,
  direction: 1,
  normalTime: null
})

const revivalRoomOverrides = Object.freeze({
  'F1-01': Object.freeze({ lighting: 'day-warm', display: 'bright-and-orderly', audio: 'birds-wind-school-life' }),
  'F1-03': Object.freeze({ display: 'bright-and-clean', curtain: 'open', horror: false }),
  'F1-06': Object.freeze({ seating: 'movable-chairs', audio: 'quiet-piano' }),
  'F2-06': Object.freeze({ display: 'recently-cleared', anomalyLevel: 0 }),
  'F3-06': Object.freeze({ display: 'realistic-long-unused', anomalyLevel: 0 })
})

const originalRoomOverrides = Object.freeze({
  'F1-01': Object.freeze({ lighting: 'evening-cool', display: 'old-web-game', audio: 'wind-and-low-machine' }),
  'F1-03': Object.freeze({ display: 'dim-infirmary', movableObjects: ['curtain'], anomalyLevel: 0 }),
  'F2-03': Object.freeze({ movableObjects: ['skeleton-model'], anomalyLevel: 0 }),
  'F2-06': Object.freeze({ display: 'long-unused', movableObjects: ['chairs', 'boxes'], anomalyLevel: 0 }),
  'F3-03': Object.freeze({ computerEra: '2015-desktop', pcFiles: 'legacy-placeholders', anomalyLevel: 0 }),
  'F3-06': Object.freeze({ display: 'long-unused-and-cold', movableObjects: ['chairs', 'boxes'], anomalyLevel: 0 }),
  'B1-01': Object.freeze({ display: 'closed-utility-space', audio: 'environment-only' })
})

// Things light enough that "it was not like this last time" reads as a real
// observation rather than a glitch. Matched by prefix so the generated grids
// (music-chair-2-3, multipurpose-table-1-2, ...) are covered too.
const ORIGINAL_MOVABLE_PREFIXES = Object.freeze([
  'curtain',
  'skeleton-model',
  'music-chair',
  'music-stand',
  'folding-chairs',
  'multipurpose-table',
  'stacked-desks',
  'stacked-chairs',
  'chairs',
  'boxes'
])

function isMovableObject(objectId){
  return ORIGINAL_MOVABLE_PREFIXES.some((prefix) => objectId === prefix || objectId.startsWith(`${prefix}-`))
}

// A small, reusable memory layer keeps ordinary school-life discoveries
// meaningful without turning every piece of furniture into a collectible.
const MEMORY_BY_INTERACTION = Object.freeze({
  'school-map': 'memory:school-layout',
  'entrance-board': 'memory:school-notices',
  'graduation-notice': 'memory:graduation',
  'class-board': 'memory:class-life',
  'school-history': 'memory:school-history',
  yearbook: 'memory:class-photo',
  'old-newspaper': 'memory:school-news',
  'archive-files': 'memory:archive-record'
})

/**
 * The catalogue behind the ✦ counter. Every memory is listed even before it is
 * found, so the player can see how much is left; only recorded ones reveal
 * their text. The wording differs by edition — the revival remembers, the
 * original notices that the memory and the record disagree.
 */
export const MEMORY_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'memory:school-layout', title: '校舎の記憶', source: '昇降口・校内案内図',
    revival: '1階から3階までの並び。どの階段を上ればどの教室に着くか、体が覚えている。',
    original: '案内図の並びが、覚えている校舎と噛み合わない。どこかに書かれていない階がある気がする。'
  }),
  Object.freeze({
    id: 'memory:school-notices', title: '掲示板の記憶', source: '昇降口・掲示板',
    revival: '行事、図書室だより、美化活動。毎朝ここで足を止める子がいた。',
    original: '掲示の日付が前後している。同じ行事が二度告知されている回がある。'
  }),
  Object.freeze({
    id: 'memory:graduation', title: '卒業式の記憶', source: '昇降口・卒業式案内',
    revival: '式次第と日程。体育館に並べた椅子の数まで思い出せる。',
    original: '卒業式の案内に載った人数と、覚えている顔の数が合わない。'
  }),
  Object.freeze({
    id: 'memory:class-life', title: '教室の記憶', source: '普通教室・後方掲示板',
    revival: '時間割と係の分担表。自分の名前がどこにあったかも覚えている。',
    original: '名簿の並びが記憶と違う。見覚えのない名前が一つ混ざっている。'
  }),
  Object.freeze({
    id: 'memory:school-history', title: '学校史の記憶', source: '図書室・学校史',
    revival: '創立から現在までの沿革。ごく普通の、地域の学校の歴史だ。',
    original: '沿革の一時期だけ、記述が急に短い。何かが省かれている。'
  }),
  Object.freeze({
    id: 'memory:class-photo', title: 'クラス写真の記憶', source: '図書室・卒業アルバム',
    revival: '並んで撮った集合写真。誰がどこに立っていたか、順番まで浮かぶ。',
    original: '写真の人数を数え直すたび、結果が変わる気がする。'
  }),
  Object.freeze({
    id: 'memory:school-news', title: '新聞記事の記憶', source: '図書室・新聞架',
    revival: '地域のニュースと学校の話題。読み返すと当時の空気が戻ってくる。',
    original: '記事の日付と内容が噛み合わない紙面が綴じられている。'
  }),
  Object.freeze({
    id: 'memory:archive-record', title: '保管資料の記憶', source: '資料室・保管資料',
    revival: '年度ごとに整理された記録。学校の歩みがそのまま残っている。',
    original: '特定の期間の記録だけが薄い。抜き取られたのではなく、初めから無いように見える。'
  })
])

const MEMORY_INDEX = Object.freeze(Object.fromEntries(MEMORY_DEFINITIONS.map((entry) => [entry.id, entry])))

export function getMemoryDefinition(memoryId){
  return MEMORY_INDEX[memoryId] || null
}

/**
 * The full catalogue for one edition, each entry flagged with whether this
 * session has recorded it. Unrecorded entries keep their text hidden.
 */
export function getMemoryCatalogue(edition, session = null){
  const config = getEditionConfig(edition)
  const found = new Set(session?.memories || [])
  const known = MEMORY_DEFINITIONS.map((entry) => ({
    id: entry.id,
    title: entry.title,
    source: entry.source,
    recorded: found.has(entry.id),
    text: found.has(entry.id) ? (config.id === EDITIONS.ORIGINAL ? entry.original : entry.revival) : ''
  }))
  // Debug scenarios and future content can seed ids the catalogue does not
  // describe yet; surface them rather than silently dropping them.
  const extras = [...found]
    .filter((id) => !MEMORY_INDEX[id])
    .map((id) => ({ id, title: id.replace(/^memory:/, ''), source: '', recorded: true, text: '記録済みの思い出。' }))
  return [...known, ...extras]
}

function originalAnomalyLevel(session, roomId, edition = session?.edition){
  if(!session || edition !== EDITIONS.ORIGINAL) return 0
  const base = Math.max(0, Math.min(4, Number(session.anomalyLevel) || 0))
  const revisited = Number(session.roomVisitCount?.[roomId]) > 1 ? 1 : 0
  const storyBoost = session.storyFlags?.anomalyPhase === true ? 1 : 0
  return Math.min(4, base + revisited + storyBoost)
}

const baseClocks = Object.freeze({
  'clock-1f-hall': Object.freeze({ clockId: 'clock-1f-hall', roomId: 'F1-01', ...commonClock }),
  'clock-2f-hall': Object.freeze({ clockId: 'clock-2f-hall', roomId: 'F2-01', ...commonClock }),
  'clock-3f-hall': Object.freeze({ clockId: 'clock-3f-hall', roomId: 'F3-01', ...commonClock }),
  'clock-f1-entrance': Object.freeze({ clockId: 'clock-f1-entrance', roomId: 'F1-01', ...commonClock })
})

export const EDITION_CONFIGS = Object.freeze({
  [EDITIONS.REVIVAL]: Object.freeze({
    id: EDITIONS.REVIVAL,
    title: 'SIDE-B',
    subtitle: 'REVIVAL',
    menu: Object.freeze(['START', 'CONTINUE', 'SETTINGS']),
    loadLabel: 'CONTINUE',
    version: 'REVIVAL ver.1.0',
    palette: Object.freeze({ background: '#e9d7ae', surface: '#fff8e7', accent: '#9e663f', text: '#3e2b22', muted: '#8d7865' }),
    atmosphere: Object.freeze({ time: 'day', temperature: 'warm', light: 'natural', mood: 'nostalgic', noise: 'light-grain' }),
    roomOverrides: revivalRoomOverrides,
    clocks: baseClocks,
    initialClockState: 'normal',
    horror: false,
    creator: null,
    unresolved: Object.freeze(['basementUnlockCondition', 'creator', 'mizunoInvolvement', 'clockMeaning', 'blueBirdMeaning', 'ending'])
  }),
  [EDITIONS.ORIGINAL]: Object.freeze({
    id: EDITIONS.ORIGINAL,
    title: 'SIDE-B',
    subtitle: '',
    menu: Object.freeze(['START', 'LOAD', 'CONFIG']),
    loadLabel: 'LOAD',
    version: 'ver 1.00',
    palette: Object.freeze({ background: '#111827', surface: '#1d2635', accent: '#8ba8ca', text: '#dae6f4', muted: '#708198' }),
    atmosphere: Object.freeze({ time: 'evening-night', temperature: 'cold', light: 'fluorescent', mood: 'old-web-game', noise: 'scanline' }),
    roomOverrides: originalRoomOverrides,
    clocks: Object.freeze({
      ...baseClocks,
      'clock-2f-hall': Object.freeze({ ...baseClocks['clock-2f-hall'], state: 'stopped', speed: 0 }),
      'clock-3f-hall': Object.freeze({ ...baseClocks['clock-3f-hall'], state: 'offset', speed: 1 }),
      'clock-f1-entrance': Object.freeze({ ...baseClocks['clock-f1-entrance'], state: 'normal' })
    }),
    initialClockState: 'normal',
    horror: 'staged',
    creator: null,
    unresolved: Object.freeze(['basementAccess', 'creator', 'mizunoInvolvement', 'incidentTruth', 'clockMeaning', 'blueBirdMeaning', 'ending'])
  })
})

function clone(value){
  if(value === null || typeof value !== 'object') return value
  if(Array.isArray(value)) return value.map(clone)
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]))
}

export function isEdition(value){
  return EDITION_VALUES.includes(value)
}

export function getEditionConfig(edition){
  return EDITION_CONFIGS[isEdition(edition) ? edition : EDITIONS.REVIVAL]
}

export function resolveRoom(roomId, edition, session = null){
  const base = ROOM_DEFINITIONS[roomId]
  if(!base) return null
  const config = getEditionConfig(edition)
  const override = config.roomOverrides[roomId] || {}
  return {
    ...clone(base),
    ...clone(override),
    edition: config.id,
    anomalyLevel: originalAnomalyLevel(session, roomId, config.id),
    visitCount: Math.max(0, Number(session?.roomVisitCount?.[roomId]) || 0)
  }
}

export function resolveClock(clockId, edition){
  const config = getEditionConfig(edition)
  const base = config.clocks[clockId]
  if(!base) return null
  return { ...clone(base), edition: config.id }
}

export function resolveObject(object, edition, session = null){
  const config = getEditionConfig(edition)
  const state = session?.objectState?.[object.id]
  const override = config.roomOverrides[object.roomId]?.objects?.[object.id] || {}
  if(state === 'hidden' || override.visible === false) return null
  const anomalyLevel = originalAnomalyLevel(session, object.roomId, config.id)
  const levelForObject = object.type === 'clock' || object.type === 'document'
    ? 1
    : object.type === 'computer'
      ? 2
      : isMovableObject(object.id)
        ? 3
        : 99
  const anomalyApplied = config.id === EDITIONS.ORIGINAL && anomalyLevel >= levelForObject
  const anomaly = anomalyApplied
    ? object.type === 'clock' && anomalyLevel >= 4
      ? { state: 'clock-reverse', displayVariant: 'explicit-clock-anomaly', clockState: 'reverse' }
      : object.type === 'computer' || object.type === 'document'
        ? { state: 'record-difference', displayVariant: anomalyLevel >= 2 ? 'legacy-record' : 'dated-difference' }
        : { state: 'moved', displayVariant: 'revisit-move' }
    : {}
  // The trial hangs its own required memories on a handful of ordinary objects
  // (trial/memories.js). Outside the trial the lookup is a no-op, so the full
  // game's memory layer is exactly the one above.
  const trialMemoryId = trialMemoryIdFor(object.roomId, object.interactionTextId || object.id, config.id)

  return {
    ...clone(object),
    ...clone(override),
    memoryId: trialMemoryId || object.memoryId || MEMORY_BY_INTERACTION[object.interactionTextId] || null,
    ...anomaly,
    state: anomaly.state || state || 'default',
    edition: config.id,
    anomalyLevel,
    visitCount: Math.max(0, Number(session?.roomVisitCount?.[object.roomId]) || 0)
  }
}

export function getRoomObjects(roomId, edition, session = null){
  const room = resolveRoom(roomId, edition, session)
  if(!room) return []
  return room.furniture.map((object) => resolveObject({ ...object, roomId }, edition, session)).filter(Boolean)
}

export function getClockState(clockId, edition, session = null){
  const clock = resolveClock(clockId, edition)
  if(!clock) return null
  return session?.clockState?.[clockId] || clock.state
}

export { originalAnomalyLevel }

export function getInteractionText(interactionTextId, edition, context = {}){
  const config = getEditionConfig(edition)
  const original = config.id === EDITIONS.ORIGINAL

  // A required memory of the trial reads differently from everything else: the
  // plain description first, then a short line from the protagonist himself.
  // Empty outside the trial, so nothing below changes for the full game.
  const trialText = trialInteractionText(context.object?.roomId, interactionTextId, config.id)
  if(trialText) return trialText

  const texts = {
    // --- 共通 ---
    door: '廊下側の扉へ戻る。入室した扉の前に復帰する。',

    // --- F1-01 昇降口 ---
    clock: original
      ? '秒針の音は聞こえない。表示の正確な時刻はまだ決められていない。'
      : '大型時計は正常に動いている。学校の時間が静かに進んでいる。',
    'school-map': original
      ? '古い校内案内図。記載内容には、記憶と一致しない差分がある。'
      : '校内案内図には1F・2F・3Fの各階と主な部屋が載っている。',
    'entrance-board': original
      ? '古い掲示が残っている。日付や人数は記録として確定していない。'
      : '行事、図書室、美化活動の案内。ごく普通の学校掲示だ。',
    'shoe-lockers': original
      ? '靴箱の名前札が一部剥がれている。配置に覚えと違う箇所がある。'
      : '生徒用の靴箱。上履きと外履きを入れ替える場所。懐かしい匂いがする。',
    'lost-and-found': original
      ? '落とし物箱に、持ち主不明の品が残っている。いつからあるのか分からない。'
      : '忘れ物や落とし物が入っている箱。先生が集めていたものだ。',
    'visitor-slippers': original
      ? '来客用スリッパ。使われた形跡がない。'
      : '来客用のスリッパ。参観日や三者面談で保護者が使っていた。',
    'graduation-notice': original
      ? '卒業式の案内が貼られている。日付と参加者の記載に違和感がある。'
      : '卒業式のお知らせ。式次第と日程が書かれている。',

    // --- F1-02 職員室 ---
    'staff-files': original
      ? '引き出しに資料が残っている。整理の仕方が記憶と異なる。'
      : '校長先生の机。書類が几帳面に整理されている。',
    'attendance-ledger': original
      ? '出席簿の数字を追うと、在籍人数の記載に揺れがある。'
      : '出席簿。毎日の出欠が丁寧に記録されている。',
    'copy-machine': original
      ? 'コピー機は停止している。最後の使用履歴の日付が読み取れない。'
      : '職員室のコピー機。テスト用紙の印刷によく使われていた。',
    'staff-phone': original
      ? '受話器を取ると通話音がない。接続されていない。'
      : '職員室の電話。保護者からの連絡や欠席届を受けていた。',
    'schedule-board': original
      ? '予定ボードに書かれた行事日程が、掲示板の記載と一致しない。'
      : '職員用の予定ボード。会議や行事の日程が書かれている。',

    // --- F1-03 保健室 ---
    'health-board': original
      ? '健康掲示のデータに、年度の表記がおかしい箇所がある。'
      : '保健室の掲示。身長・体重の平均値や健康目標が書かれている。',
    curtain: original
      ? 'カーテンを引くと、ベッドの向こう側が見えなくなる。閉めたままにしておくか。'
      : 'ベッドのカーテン。体調が悪い時にここで休んだ。',
    'measurement-corner': original
      ? '身長計のメモリが微かに歪んでいる気がする。'
      : '身長と体重を測る場所。定期健診の思い出がある。',
    'health-consultation': original
      ? '相談スペースの椅子が、前回来た時と違う向きを向いている。'
      : '養護教諭との面談ができるスペース。相談に来る子もいた。',
    'visit-log': original
      ? '来室記録の名前と日付を辿ると、途中で筆跡が変わっている。'
      : '保健室の来室記録。風邪やケガで訪れた生徒の記録だ。',

    // --- F1-04 図書室 ---
    'book-shelves': original
      ? '本棚の並びが記憶と一致しない。分類番号がずれている棚がある。'
      : '図書室の本棚。教科書以外の本を読む場所だった。',
    'school-history': original
      ? '学校史の記述には、記憶と少し違う箇所がある。'
      : '学校の沿革と卒業生の記録。重大な真相は書かれていない。',
    yearbook: original
      ? '写真の人数を数えると、覚えていた記憶と一致しない。'
      : '卒業アルバム。学校生活の写真が並んでいる。',
    'checkout-desk': original
      ? '貸出カウンターの日誌が途中で途切れている。'
      : '本を借りる時のカウンター。図書委員が交代で座っていた。',
    'return-box': original
      ? '返却箱に、貸出記録のない本が一冊入っている。'
      : '読み終わった本を返す箱。ここに入れれば図書委員が棚に戻す。',
    'library-search-pc': original
      ? '蔵書検索の画面が古い。検索結果の件数に矛盾がある。'
      : '蔵書検索用のPC。本のタイトルや分類で探すことができた。',
    'old-newspaper': original
      ? '新聞の日付と記事の内容に、微かな食い違いがある。'
      : '古い新聞が綴じてある。地域のニュースや学校の話題が載っている。',

    // --- F1-05 多目的室 ---
    'av-rack': original
      ? 'AV機器の型番が古い。電源ランプが一つだけ、不規則に点滅している。'
      : 'プロジェクターやDVDプレーヤーが並ぶ棚。映画鑑賞会に使われた。',
    whiteboard: original
      ? 'ホワイトボードに薄く文字の跡が残っている。消し切れていない。'
      : 'ホワイトボード。発表や話し合いの時に使われていた。',
    microphone: original
      ? 'マイクのスイッチを入れても音は出ない。'
      : '放送用のマイク。朝礼や行事の司会で使われていた。',
    'exhibition-panel': original
      ? '展示パネルの写真が一部外れている。裏に日付のメモがある。'
      : '文化祭や総合学習の展示パネル。生徒が作った発表資料だ。',
    'broadcast-log': original
      ? '放送ログの記録に、放送されていない日付の記載がある。'
      : '放送委員の活動ログ。昼の放送の曲名やアナウンス内容が記録されている。',

    // --- F1-06 音楽室 ---
    piano: original
      ? 'ピアノの蓋を開けると、調律がわずかにずれている。最後に弾いたのはいつだろう。'
      : 'グランドピアノ。合唱コンクールの伴奏練習でよく使われていた。',
    'music-board': original
      ? '楽譜棚の中に、曲目リストにない楽譜が一枚挟まっている。'
      : '楽譜が整理された棚。授業で歌った曲の楽譜が並んでいる。',

    // --- F2-01〜F2-02 普通教室 ---
    blackboard: original
      ? '黒板に薄く文字の跡が残っている。消されたはずの板書だ。'
      : '授業で使う黒板。チョークの粉の匂いが懐かしい。',
    lockers: original
      ? 'ロッカーの名前札が一部入れ替わっている気がする。'
      : '生徒用のロッカー。教科書やノートを入れていた。',
    'class-library': original
      ? '学級文庫の本の並びが変わっている。一冊だけ背表紙の色が違う。'
      : '学級文庫。クラスのみんなが持ち寄った本が並んでいる。',
    'class-board': original
      ? '後方掲示板の時間割と委員会名簿の内容が、記憶と少し違う。'
      : '後方掲示板。時間割や係の分担表が貼られている。',

    // --- F2-03 理科室 ---
    specimens: original
      ? '標本瓶の中身が、前に見た時と配置が変わっている。'
      : '理科室の標本と器具。実験の授業を思い出す。',
    skeleton: original
      ? '骨格模型が、前回来た時と違う方向を向いている。'
      : '人体骨格模型。理科室のシンボルのような存在だった。',
    microscopes: original
      ? '顕微鏡のレンズに指紋が残っている。最後に使ったのは誰だろう。'
      : '光学顕微鏡。プレパラートを覗いて細胞を観察した。',
    'periodic-table': original
      ? '周期表の元素記号の並びに、微かな違和感がある。'
      : '壁に貼られた周期表。元素記号を覚えるのに苦労した。',

    // --- F2-04 美術室 ---
    artwork: original
      ? '乾燥棚の作品に、署名のない絵が一枚混ざっている。'
      : '生徒の作品が乾燥棚に並んでいる。色とりどりの絵や立体作品。',
    'plaster-statue': original
      ? '石膏像の視線が、入口を向いている。前はこの角度だっただろうか。'
      : 'デッサン用の石膏像。美術の時間に鉛筆で描いた。',

    // --- F2-05 学習室 ---
    'consultation-desk': original
      ? '相談机の引き出しに、途中で止まったメモが残っている。'
      : '個別学習や面談のための机。先生と一対一で勉強した。',
    'support-shelf': original
      ? '教材棚の資料に、使用履歴のない教材が混ざっている。'
      : '補充教材や支援プリントが整理された棚。',

    // --- F3-01 3年教室 ---
    // (blackboard, lockers, class-library, class-board は F2-01と共通)

    // --- F3-02 家庭科室 ---
    'dish-cabinet': original
      ? '食器棚の中の食器の数が、調理台の数と合わない。'
      : '調理実習で使う食器が収められている。班ごとに分けられていた。',
    'sewing-storage': original
      ? 'ミシンの使用記録ノートの最終ページに、日付のない記入がある。'
      : 'ミシンが収納されている棚。被服の授業で使った。',

    // --- F3-03 コンピュータ室 ---
    'teacher-pc': original
      ? '古いデスクトップ。保存ファイルの内容は手がかり候補に留まっている。'
      : '比較的新しいPC。電源は入っているが、特別な表示はない。',
    'student-pcs': original
      ? '2015年頃のPCが並ぶ。ファイル名やURL断片を調べられそうだ。'
      : '授業用のPC。学校の思い出を補強する道具として置かれている。',
    printer: original
      ? 'プリンタの印刷キューに、取り消されていないジョブが残っている。'
      : '授業のプリント印刷に使われていたプリンタ。',

    // --- F3-04 技術室 ---
    tools: original
      ? '工具壁の工具が、掛かるべき場所と一つずつずれている。'
      : '技術の授業で使う工具が壁に整理されている。',
    vise: original
      ? '万力のハンドルが動かない。何かを挟んだまま固定されている。'
      : '木工作業に使う万力。本棚を作った授業を思い出す。',

    // --- F3-05 進路・生徒会室 ---
    'career-files': original
      ? '進路資料の一部に、他の資料と時期が矛盾する記載がある。'
      : '高校や専門学校のパンフレットが並ぶ棚。進路相談の季節を思い出す。',
    'council-records': original
      ? '生徒会記録の議事録に、出席者名簿と本文の人数が合わない回がある。'
      : '生徒会活動の記録。行事の企画や予算の話し合いが記されている。',
    'council-meeting-records': original
      ? '会議記録の日付が一箇所だけ訂正されている。元の日付が読めない。'
      : '各種会議の記録。年間行事計画や委員会の報告が綴じられている。',

    // --- B1-01 倉庫 ---
    'storage-shelves': original
      ? '金属棚に古い備品が詰め込まれている。整理された形跡がない。'
      : '倉庫の金属棚。使わなくなった備品が保管されている。',
    'old-supplies': original
      ? '古い備品の中に、どの教室にも帰属しない物がある。'
      : '撤去された教室の備品。椅子や実験器具が埃をかぶっている。',
    boxes: original
      ? '段ボール箱のラベルと中身が一致しないものがある。'
      : '撤去用に梱包された箱。中身は確認できない。',
    'inspection-lamp': original
      ? '点検灯が不規則に明滅している。配線が劣化しているのかもしれない。'
      : '点検用の照明。薄暗い空間をわずかに照らしている。',

    // --- B1-02 ボイラー室 ---
    boiler: original
      ? 'ボイラーの計器が一つだけ動いている。稼働しているはずはない。'
      : 'ボイラー設備。冬の暖房と給湯を担っていた。',
    'control-panel': original
      ? '操作盤のランプが一つ点灯している。電源は切られているはずだ。'
      : 'ボイラーの点検操作盤。管理者が定期的に確認していた。',

    // --- B1-03 資料室 ---
    'archive-shelves': original
      ? '資料棚のファイルに、分類番号が欠番になっている箇所がある。'
      : '学校の資料が保管された棚。年度ごとに整理されている。',
    'archive-files': original
      ? '保管資料を調べると、特定の期間の記録だけが薄い。'
      : '古い書類や記録が保管されている。学校の歴史を辿れそうだ。',
    'archive-metal-cabinets': original
      ? '金属保管庫の鍵が一つだけ開いている。中身は空だ。'
      : '厳重な金属製の保管庫。重要書類が保管されていたようだ。',

    // --- F1-01 昇降口（追加） ---
    'umbrella-stand': original
      ? '傘立てに、一本だけ乾いていない傘が残っている。'
      : '傘立て。雨の日はここが一番混み合った。',
    'outer-door': original
      ? '外扉の向こうは暗い。今は出られそうにない。'
      : '校庭へ出る扉。今日はもう外へ出る用事はない。',

    // --- F1-02 職員室（追加） ---
    'vice-principal-desk': original
      ? '教頭机の書類は途中で止まっている。決裁欄が空のままだ。'
      : '教頭先生の机。学校全体を見渡せる位置にある。',
    'staff-reception': original
      ? '応接セットのソファに、座った形の跡が残っている。'
      : '来客用の応接セット。三者面談でここに座ったことがある。',
    'staff-key-box': original
      ? '鍵箱のフックが一つ空いている。台帳に持ち出しの記録はない。'
      : '各教室の鍵を掛けておく箱。放課後は先生がここで受け渡していた。',
    'staff-kitchenette': original
      ? '給湯ポットの電源は入っている。誰も使っていないはずなのに。'
      : '職員用の給湯コーナー。休み時間の先生たちの休息の場所。',
    'staff-mailboxes': original
      ? '職員メールボックスに、宛名の消えた封筒が一通ある。'
      : '先生ごとのメールボックス。プリントや連絡票が入る。',

    // --- F1-03 保健室（追加） ---
    bed: original
      ? 'ベッドのシーツが、寝ていた形のまま残っている。'
      : '保健室のベッド。熱を出した日にここで休ませてもらった。',
    'nurse-desk': original
      ? '養護教諭の机。記入途中の書類が伏せて置かれている。'
      : '養護の先生の机。生徒の記録が丁寧に整理されている。',
    'medicine-cabinet': original
      ? '薬品戸棚の在庫表と中身の数が合わない。'
      : '消毒薬や湿布が並んだ戸棚。きちんと施錠されている。',
    'eye-chart': original
      ? '視力検査表の一段だけ、印刷が滲んで読めない。'
      : '視力検査表。健康診断の日に並んで測った。',
    'wash-basin': original
      ? '洗面台の水が、蛇口を締めても細く落ち続けている。'
      : '手当ての前に手を洗う洗面台。石鹸の香りが残っている。',
    'first-aid-cart': original
      ? '救急ワゴンの中身が、使った形跡のないまま減っている。'
      : '救急用品を載せたワゴン。運動会の日はいつも校庭に出ていた。',

    // --- F1-04 図書室（追加） ---
    'reading-tables': original
      ? '閲覧机に、閉じられていない本が伏せて置かれている。'
      : '窓際の閲覧机。放課後、ここで本を読む生徒がいた。',
    'reading-corner': original
      ? '読書コーナーのクッションが、直前まで使われていたように凹んでいる。'
      : '低い椅子とクッションの読書コーナー。昼休みの人気の場所。',
    'library-notice': original
      ? '図書だよりの発行日が、次の号と入れ替わっている。'
      : '図書委員が作った図書だより。今月のおすすめが紹介されている。',

    // --- F1-05 多目的室（追加） ---
    'projector-stand': original
      ? 'プロジェクターの冷却ファンが、電源を切っても回り続けている。'
      : '映写のためのプロジェクター台。集会や発表で使われた。',
    'folding-chairs': original
      ? '折り畳み椅子の数が、記録された貸出数と合わない。'
      : '壁際に寄せられた折り畳み椅子。集会のたびに並べ直した。',
    'multipurpose-storage': original
      ? '備品収納の扉が、少しだけ開いている。'
      : '行事の道具をしまっておく収納。文化祭前はいつも空になった。',
    'broadcast-desk': original
      ? '放送補助机のスイッチが一つだけ入っている。'
      : '放送を手伝うための机。昼の放送はここから流れていた。',
    'stage-blocks': original
      ? '簡易ステージ台の並びが、片付けた時と違っている。'
      : '発表用の簡易ステージ台。合唱や劇のときに組み立てた。',

    // --- F1-06 音楽室（追加） ---
    'conductor-stand': original
      ? '指揮台の上に、指揮棒が一本だけ残されている。'
      : '指揮台。合唱コンクールの練習でここに立った。',
    'music-blackboard': original
      ? '五線黒板に、消し残された音符が数個だけ並んでいる。'
      : '五線の引かれた黒板。音符の書き取りに使われた。',
    'instrument-cabinet': original
      ? '楽器収納の中で、一つだけケースが開いている。'
      : '楽器をしまう収納。木管の匂いがかすかに残っている。',
    'composer-portraits': original
      ? '音楽家の肖像が一枚、他と違う向きに掛かっている。'
      : '壁に並ぶ音楽家の肖像。音楽室といえばこの並びだ。',
    'choir-risers': original
      ? '合唱台の段に、乾いていない足跡がある。'
      : '合唱のときに並ぶひな壇。背の順に立った記憶がある。',
    'percussion-corner': original
      ? '打楽器のシンバルが、触れていないのに微かに鳴った。'
      : '大太鼓やシンバルが置かれた一角。運動会の練習で活躍した。',

    // --- 普通教室（追加） ---
    'class-motto': original
      ? '学級目標の字が、途中から違う筆跡で書かれている。'
      : '学級目標。クラスみんなで話し合って決めた言葉だ。',
    'teacher-desk': original
      ? '教卓の引き出しが半分開いている。中は空だ。'
      : '教卓。先生がここに立って授業が始まった。',
    'cleaning-cupboard': original
      ? '清掃用具庫のほうきが、掛けた本数と合わない。'
      : '掃除道具をしまう用具庫。当番表の順に使った。',
    'stacked-desks': original
      ? '積まれた机の高さが、前に見た時と変わっている。'
      : '使われなくなった机が教室の後ろに積まれている。',
    'stacked-chairs': original
      ? '積まれた椅子の一脚だけ、埃がかぶっていない。'
      : '椅子も同じように積み上げられている。',

    // --- F2-03 理科室（追加） ---
    'science-teacher-table': original
      ? '教師実験台のガスの元栓が開いている。使われた形跡はない。'
      : '教師用の実験台。演示実験はいつもここで行われた。',
    'science-tables': original
      ? '実験台の班番号が、名簿の並びと食い違っている。'
      : '班ごとの実験台。流しとガス栓がついている。',
    'science-sink': original
      ? '給水の蛇口から、水が一定の間隔で落ちている。'
      : '器具を洗う流し。実験の後はここが混み合った。',
    'fume-hood': original
      ? 'ドラフトの排気音が、電源を切っても止まらない。'
      : '薬品を扱うときに使うドラフト。普段は閉じられている。',
    eyewash: original
      ? '洗眼器のレバーが下りたままになっている。'
      : '目を洗うための設備。使わずに済むのが一番いい。',

    // --- F2-04 美術室（追加） ---
    'art-tables': original
      ? '制作机の天板の絵の具の跡が、日を追うごとに増えている気がする。'
      : '四人で囲む大きな制作机。絵の具の跡が層になっている。',
    'art-sink': original
      ? '流しの筆洗いバケツの水が、濁ったまま澄まない。'
      : '筆やパレットを洗う流し。授業の終わりはここに列ができた。',
    'art-supply-shelf': original
      ? '画材棚の絵の具のチューブが、使用量と合わない減り方をしている。'
      : '絵の具や筆が整理された画材棚。学年ごとに分けられている。',
    easels: original
      ? 'イーゼルの一つに、まだ描きかけのキャンバスが載っている。'
      : 'デッサン用のイーゼル。石膏像を囲むように立てた。',
    'student-artwork': original
      ? '展示された作品の一枚だけ、署名の欄が空白になっている。'
      : '生徒の作品が壁に展示されている。力作が並んでいる。',
    kiln: original
      ? '陶芸窯の温度計が、電源が落ちているのに常温を指していない。'
      : '陶芸用の窯。焼き上がりを待つ時間が楽しみだった。',

    // --- F2-05 学習室（追加） ---
    'study-tables': original
      ? '学習机の一つに、途中で止まった書き込みが残っている。'
      : '少人数で使う学習机。落ち着いて課題に取り組める。',
    'quiet-corner': original
      ? '個別ブースの仕切りの内側に、細かい書き込みがある。'
      : '集中したい時のための個別ブース。静かな場所だ。',
    'study-notice': original
      ? '学習の記録の日付が、飛んでいる週がある。'
      : '学習の記録。取り組んだ内容が丁寧に貼り出されている。',

    // --- F3-02 家庭科室（追加） ---
    'home-ec-demo': original
      ? '教師実演台のコンロが、消えているのに温かい。'
      : '調理の手本を見せるための実演台。手元がよく見えた。',
    'home-ec-mirror': original
      ? '実演用のミラーに映る調理台の数が、実際と合わない。'
      : '手元を映すためのミラー。後ろの席からもよく見えた。',
    'cooking-tables': original
      ? '調理実習台の班の並びが、記録された班分けと違う。'
      : '班ごとの調理実習台。シンクとコンロが一体になっている。',
    'stove-sink': original
      ? '流しと加熱設備。元栓は閉じているのに、金属が温い。'
      : '共用の流しと加熱設備。片付けはいつも時間との勝負だった。',
    refrigerator: original
      ? '冷蔵庫は動いている。中身は空のままだ。'
      : '実習用の食材を入れる冷蔵庫。今は空になっている。',
    'sewing-tables': original
      ? '被服テーブルに、縫いかけの布が置かれたままになっている。'
      : '被服実習のテーブル。エプロンを縫った授業を思い出す。',
    'nutrition-chart': original
      ? '栄養の掲示の数値が、別の年度のものと入れ替わっている。'
      : '五大栄養素の掲示。給食の献立と結びつけて習った。',

    // --- F3-03 コンピュータ室（追加） ---
    'lan-shelf': original
      ? '周辺機器棚のケーブルが、繋がっていない機器に挿さっている。'
      : 'スキャナやプロジェクタがしまわれた棚。',
    'lan-power-rack': original
      ? 'LAN設備のランプが、規則的でない間隔で明滅している。'
      : 'ネットワークと電源の設備。授業中は静かに唸っていた。',
    'pc-usage-rules': original
      ? '利用のきまりの条文が、途中から番号が飛んでいる。'
      : 'コンピュータ室の利用のきまり。最初の授業で読み合わせた。',

    // --- F3-04 技術室（追加） ---
    'tech-demo-bench': original
      ? '教師作業台に、加工途中の材料が固定されたままになっている。'
      : '手本を見せるための教師用作業台。',
    workbench: original
      ? '作業台の傷の位置が、班の座席と噛み合わない。'
      : '木工の作業台。のこぎりの跡がいくつも残っている。',
    'material-shelf': original
      ? '材料棚の板の枚数が、発注記録と一致しない。'
      : '木材や金属材が寝かせてある棚。授業ごとに切り出した。',
    'machine-safety-zone': original
      ? '安全区画の黄色い線が、以前より内側に引き直されている。'
      : '工作機械の周りに引かれた安全区画。線の内側は先生の許可が要る。',
    'dust-collector': original
      ? '集塵機のタンクが、使っていないのに満杯になっている。'
      : '削り屑を吸い込む集塵機。作業の後は必ず動かした。',
    'safety-poster': original
      ? '安全のきまりの一項目が、上から貼り直されている。'
      : '作業の安全のきまり。毎回声に出して確認した。',

    // --- F3-05 進路・生徒会室（追加） ---
    'meeting-table': original
      ? '会議机の椅子が、出席者の人数より一脚多く引かれている。'
      : '生徒会の会議机。行事の企画をここで話し合った。',
    'interview-desk': original
      ? '面談机に、記入されていない面談票が一枚残っている。'
      : '進路面談のための机。先生と向かい合って将来を話した。',
    'career-notice': original
      ? '進路だよりの号数が一つ抜けている。'
      : '進路だより。説明会や入試の日程が知らせてある。',
    'council-banner': original
      ? '生徒会の横断幕が、畳み方を変えて置き直されている。'
      : '行事で掲げる生徒会の横断幕。文化祭のスローガンが書かれている。',

    // --- B1（追加） ---
    'storage-ledger': original
      ? '備品台帳の一部の行が、後から書き足されている。'
      : '倉庫の備品台帳。何がどこにあるか記録されている。',
    'fuel-tank': original
      ? '燃料タンクの残量計が、使われていないのに減っている。'
      : 'ボイラーの燃料タンク。定期的に補充されていた。',
    'inspection-log': original
      ? '点検記録の署名が、途中から同じ筆跡で埋められている。'
      : '設備の点検記録。月に一度、管理者が確認していた。',
    'archive-desk': original
      ? '閲覧机に、戻されていないファイルが積まれている。'
      : '資料を広げて確認するための机。',

    // --- fallback ---
    default: original
      ? '記録の差分を調べられるが、ここではまだ結論は出ない。'
      : '昔の学校生活を思い出す、身近なものだ。'
  }
  return texts[interactionTextId] || texts.default
}
