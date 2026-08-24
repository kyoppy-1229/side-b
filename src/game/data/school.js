// The school, drawn to scale.
//
// Everything in this file is authored in METRES and converted once, so the
// building keeps the proportions of a real Japanese junior-high school
// (片廊下型 / single-loaded corridor):
//
//   北 ─ 教室・特別教室のブロック（廊下側に前後の引戸）
//   │
//   ├── 廊下 3.0m（両端に階段室）
//   │
//   南 ─ 連続窓（校庭側）。1階のみ昇降口への扉が開く。
//
// Standard module: 普通教室 = 9.0m × 7.5m, 特別教室 = 1.5 units (13.5m),
// 小部屋 = 0.75 unit (6.75m). Corridor 3.0m, stairwell 4.0m at each end.

export const EDITIONS = Object.freeze({
  REVIVAL: 'revival',
  ORIGINAL: 'original'
})

export const EDITION_VALUES = Object.freeze(Object.values(EDITIONS))

export const FLOOR_ORDER = Object.freeze(['1F', '2F', '3F', 'B1'])

// ---------------------------------------------------------------- scale
export const PX_PER_M = 44
export const m = (metres) => Math.round(metres * PX_PER_M)

// Wall thicknesses are drawn as elevation bands (2.5D), not true plan depth:
// the north band carries the sliding doors and name plates, the south band the
// continuous window wall.
export const WALL = Object.freeze({ north: 60, south: 34, side: 18 })

const DIRECTIONS = Object.freeze({ north: '北', south: '南', west: '西', east: '東' })

const GROUND_ARCHITECTURE = Object.freeze([
  'north-corridor',
  'north-entry',
  'south-exterior-windows',
  'west-teaching-front',
  'east-storage-zone'
])
const CLASSROOM_ARCHITECTURE = Object.freeze([
  ...GROUND_ARCHITECTURE,
  'north-sliding-door-front',
  'north-sliding-door-rear',
  'south-continuous-windows',
  'west-blackboard',
  'east-lockers'
])
const BASEMENT_ARCHITECTURE = Object.freeze([
  'north-corridor',
  'north-entry',
  'windowless-exterior',
  'utility-pipes',
  'metal-shelving'
])

// ---------------------------------------------------------------- geometry
function geometry(widthM, depthM){
  const iw = m(widthM)
  const ih = m(depthM)
  return {
    widthM,
    depthM,
    dimensions: Object.freeze({ width: iw + WALL.side * 2, height: ih + WALL.north + WALL.south }),
    interior: Object.freeze({ x: WALL.side, y: WALL.north, w: iw, h: ih })
  }
}

/**
 * Placement helper. Every room body receives one of these and places furniture
 * in metres measured from the interior north-west corner (廊下側・黒板側の角),
 * which is how a real floor plan is dimensioned.
 */
function placer(geo){
  const i = geo.interior
  const px = (metres) => i.x + m(metres)
  const py = (metres) => i.y + m(metres)

  function at(id, label, [x, y], [w, h], opts = {}){
    const node = {
      id,
      type: opts.type || 'furniture',
      label,
      position: { x: px(x), y: py(y) },
      size: { width: Math.max(6, m(w)), height: Math.max(6, m(h)) },
      collision: opts.collision !== false,
      interactable: Boolean(opts.text || opts.interactable),
      priority: opts.priority || 'C'
    }
    if(opts.text) node.interactionTextId = opts.text
    if(opts.art) node.art = opts.art
    return node
  }

  // A rectangular block of identical furniture (desk rows, PC benches, ...).
  function grid(idPrefix, label, { x, y, cols, rows, dx, dy, w, h }, opts = {}){
    const out = []
    for(let row = 0; row < rows; row += 1){
      for(let col = 0; col < cols; col += 1){
        out.push(at(`${idPrefix}-${row + 1}-${col + 1}`, label, [x + row * dx, y + col * dy], [w, h], opts))
      }
    }
    return out
  }

  return { at, grid, widthM: geo.widthM, depthM: geo.depthM }
}

function freezeFurniture(items){
  return Object.freeze(items.flat().map((item) => Object.freeze(item)))
}

// Doorways are authored as "atM metres from the west edge of the room".
function doorways(defs){
  return Object.freeze(defs.map((d) => Object.freeze({
    id: d.id,
    label: d.label,
    x: WALL.side + m(d.atM),
    w: m(d.widthM),
    cx: WALL.side + m(d.atM + d.widthM / 2)
  })))
}

function defineRoom(config){
  const geo = geometry(config.widthM, config.depthM)
  const g = placer(geo)
  const basement = config.floor === 'B1'
  return {
    id: config.id,
    floor: config.floor,
    order: config.order,
    name: config.name,
    kind: config.kind,
    schoolYear: config.schoolYear || null,
    orientation: DIRECTIONS,
    // where this room sits relative to the corridor, and how much frontage it
    // takes along it — the corridor lays its doors out from these.
    corridorSide: config.side || 'north',
    spanM: config.spanM ?? config.widthM,
    corridorOffsetM: config.corridorOffsetM ?? null,
    widthM: config.widthM,
    depthM: config.depthM,
    dimensions: geo.dimensions,
    interior: geo.interior,
    walls: WALL,
    floorStyle: config.floorStyle || (basement ? 'concrete' : 'vinyl'),
    windows: config.windows !== false && !basement,
    doors: doorways(config.doors),
    fixedArchitecture: config.architecture || (basement ? BASEMENT_ARCHITECTURE : GROUND_ARCHITECTURE),
    furniture: freezeFurniture(config.build(g)),
    atmosphere: config.atmosphere || 'school-life',
    exploration: Object.freeze(config.exploration || [])
  }
}

// ---------------------------------------------------------------- 普通教室
// 9.0m × 7.5m. Corridor north, windows south, blackboard on the west wall so
// students sit with the windows on their left — the standard orientation.
const CLASSROOM_DOORS = [
  { id: 'north-front', label: '前の引戸', atM: 0.5, widthM: 1.6 },
  { id: 'north-rear', label: '後ろの引戸', atM: 6.9, widthM: 1.6 }
]

function classroomBody(g, { desks = true } = {}){
  return [
    // --- 前面（西） ---
    g.at('blackboard', '黒板', [0, 1.9], [0.3, 3.7], { text: 'blackboard', priority: 'B', art: 'blackboard' }),
    g.at('chalk-tray', 'チョーク受け', [0.3, 1.9], [0.16, 3.7], { collision: false }),
    g.at('class-motto', '学級目標', [0.1, 6.4], [0.3, 1.0], { type: 'document', collision: false, text: 'class-motto', priority: 'B', art: 'poster' }),
    g.at('teacher-desk', '教卓', [1.0, 3.1], [0.65, 1.25], { text: 'teacher-desk', priority: 'B', art: 'desk' }),
    g.at('lectern-shelf', '教材ワゴン', [1.0, 1.5], [0.6, 0.9], { art: 'cart' }),

    // --- 生徒机 5列×4行 = 20席。前後 0.70m / 左右 0.65m の通路を残し、
    //     後ろの引戸の前は 1.3m 空けて出入りを塞がない。 ---
    ...(desks
      ? g.grid('student-desk', '生徒机', { x: 2.5, y: 0.85, rows: 4, cols: 5, dx: 1.15, dy: 1.3, w: 0.45, h: 0.65 }, { art: 'school-desk' })
      : [
        // 空き教室では机は後方にまとめて積まれている
        g.at('stacked-desks', '積まれた机', [6.6, 1.5], [1.7, 2.0], { text: 'stacked-desks', priority: 'B', art: 'stack' }),
        g.at('stacked-chairs', '積まれた椅子', [6.6, 3.8], [1.7, 1.9], { text: 'stacked-chairs', priority: 'B', art: 'stack' })
      ]),

    // --- 後面（東） ---
    g.at('rear-board', '後方掲示板', [8.68, 0.5], [0.32, 2.2], { type: 'document', collision: false, text: 'class-board', priority: 'A', art: 'board' }),
    g.at('east-lockers', '生徒用ロッカー', [8.6, 2.9], [0.4, 2.6], { text: 'lockers', priority: 'B', art: 'lockers' }),
    g.at('cleaning-cupboard', '清掃用具庫', [8.55, 5.7], [0.45, 0.9], { text: 'cleaning-cupboard', priority: 'B', art: 'cabinet' }),
    g.at('class-library', '学級文庫', [8.55, 6.75], [0.45, 0.6], { text: 'class-library', priority: 'B', art: 'shelf-books' }),
    g.at('trash-bin', 'ごみ箱', [8.1, 1.5], [0.4, 0.4], { art: 'bin' }),
    g.at('broom-rack', 'ほうき掛け', [7.6, 0.4], [0.4, 0.35], { collision: false, art: 'tools' })
  ]
}

function ordinaryClassroom(id, floor, order, name, schoolYear){
  return defineRoom({
    id, floor, order, name, schoolYear,
    kind: 'ordinary-classroom',
    widthM: 9.0, depthM: 7.5, spanM: 9.0,
    floorStyle: 'wood',
    architecture: CLASSROOM_ARCHITECTURE,
    atmosphere: 'ordinary-school-life',
    doors: CLASSROOM_DOORS,
    build: (g) => classroomBody(g),
    exploration: ['blackboard', 'rear-board', 'class-library']
  })
}

function emptyClassroom(id, floor, order, name, note, atmosphere){
  return {
    ...defineRoom({
      id, floor, order, name, schoolYear: note,
      kind: 'empty-classroom',
      widthM: 9.0, depthM: 7.5, spanM: 9.0,
      floorStyle: 'wood',
      architecture: CLASSROOM_ARCHITECTURE,
      atmosphere,
      doors: CLASSROOM_DOORS,
      build: (g) => classroomBody(g, { desks: false }),
      exploration: ['rear-board', 'class-library']
    })
  }
}

// ---------------------------------------------------------------- 各室
export const ROOM_DEFINITIONS = Object.freeze({
  // ============================ 1F ============================
  // 昇降口だけは廊下の南側（校庭側）にある。
  'F1-01': defineRoom({
    id: 'F1-01', floor: '1F', order: 1, name: '昇降口', kind: 'entrance',
    side: 'south', corridorOffsetM: 16.0, spanM: 12.0,
    widthM: 12.0, depthM: 6.0,
    floorStyle: 'entrance',
    doors: [{ id: 'north-main', label: '廊下への扉', atM: 5.2, widthM: 1.8 }],
    build: (g) => [
      // 上がり框（廊下側）とたたき（南側）の境目
      g.at('step-edge', '上がり框', [0, 1.5], [12.0, 0.14], { collision: false, art: 'step' }),
      // 下駄箱は島状に3列。学年ごとに並ぶ。
      g.at('shoe-lockers-1', '生徒用靴箱', [0.8, 2.4], [3.4, 0.5], { text: 'shoe-lockers', priority: 'B', art: 'lockers' }),
      g.at('shoe-lockers-2', '生徒用靴箱', [4.6, 2.4], [3.4, 0.5], { text: 'shoe-lockers', priority: 'B', art: 'lockers' }),
      g.at('shoe-lockers-3', '生徒用靴箱', [8.4, 2.4], [2.8, 0.5], { text: 'shoe-lockers', priority: 'B', art: 'lockers' }),
      g.at('shoe-lockers-4', '生徒用靴箱', [0.8, 3.9], [3.4, 0.5], { text: 'shoe-lockers', priority: 'B', art: 'lockers' }),
      g.at('shoe-lockers-5', '生徒用靴箱', [4.6, 3.9], [3.4, 0.5], { text: 'shoe-lockers', priority: 'B', art: 'lockers' }),
      g.at('teacher-shoe-lockers', '職員用靴箱', [8.4, 3.9], [2.8, 0.5], { art: 'lockers' }),
      // 廊下側の壁面
      g.at('school-map', '校内案内図', [1.2, 0.05], [2.2, 0.22], { type: 'document', collision: false, text: 'school-map', priority: 'A', art: 'map' }),
      g.at('entrance-board', '掲示板', [7.6, 0.05], [2.6, 0.22], { type: 'document', collision: false, text: 'entrance-board', priority: 'B', art: 'board' }),
      g.at('graduation-notice', '卒業式案内', [3.7, 0.06], [1.7, 0.5], { type: 'document', collision: false, text: 'graduation-notice', priority: 'B', art: 'poster' }),
      // たたき（土間）側
      g.at('umbrella-stand', '傘立て', [1.0, 5.1], [1.5, 0.5], { text: 'umbrella-stand', priority: 'B', art: 'umbrella' }),
      g.at('visitor-slippers', '来客用スリッパ', [3.2, 5.2], [1.1, 0.45], { text: 'visitor-slippers', priority: 'B', art: 'shelf' }),
      g.at('lost-and-found', '落とし物箱', [9.6, 5.1], [1.4, 0.6], { text: 'lost-and-found', priority: 'B', art: 'boxes' }),
      g.at('entrance-mat', '泥落としマット', [5.4, 5.5], [2.2, 0.4], { collision: false, art: 'mat' }),
      // 外扉（校庭へ）— まだ開かない
      g.at('outer-door', '外扉（校庭側）', [5.0, 5.85], [3.0, 0.15], { collision: false, text: 'outer-door', priority: 'B', art: 'glass-door' })
    ],
    exploration: ['school-map', 'entrance-board', 'lost-and-found']
  }),

  'F1-02': defineRoom({
    id: 'F1-02', floor: '1F', order: 2, name: '職員室', kind: 'staff-room',
    widthM: 13.5, depthM: 7.5, spanM: 13.5,
    floorStyle: 'vinyl',
    doors: [{ id: 'north-main', label: '職員室前扉', atM: 11.2, widthM: 1.8 }],
    build: (g) => [
      // 管理職の机は窓際・奥（西）。教頭が入口寄りで全体を見る。
      g.at('principal-desk', '校長机', [0.6, 0.7], [1.9, 0.95], { text: 'staff-files', priority: 'B', art: 'desk' }),
      g.at('vice-principal-desk', '教頭机', [0.6, 2.3], [1.9, 0.95], { text: 'vice-principal-desk', priority: 'B', art: 'desk' }),
      g.at('staff-reception', '応接セット', [0.6, 4.4], [2.6, 2.4], { text: 'staff-reception', priority: 'B', art: 'sofa' }),
      // 事務机の島（向かい合わせ2列 × 2ブロック）
      ...g.grid('staff-desk-a', '事務机', { x: 3.9, y: 0.9, rows: 2, cols: 4, dx: 0.72, dy: 1.35, w: 0.7, h: 1.2 }, { art: 'desk' }),
      ...g.grid('staff-desk-b', '事務机', { x: 6.3, y: 0.9, rows: 2, cols: 4, dx: 0.72, dy: 1.35, w: 0.7, h: 1.2 }, { art: 'desk' }),
      ...g.grid('staff-desk-c', '事務机', { x: 8.7, y: 0.9, rows: 2, cols: 4, dx: 0.72, dy: 1.35, w: 0.7, h: 1.2 }, { art: 'desk' }),
      g.at('attendance-ledger', '出席簿棚', [4.2, 6.5], [1.6, 0.55], { type: 'document', text: 'attendance-ledger', priority: 'A', art: 'shelf-files' }),
      g.at('staff-phone', '電話', [3.95, 0.1], [0.55, 0.4], { collision: false, text: 'staff-phone', priority: 'B', art: 'phone' }),
      g.at('schedule-board', '予定ボード', [5.4, 0.05], [3.4, 0.25], { type: 'document', collision: false, text: 'schedule-board', priority: 'B', art: 'whiteboard' }),
      g.at('staff-key-box', '鍵箱', [9.2, 0.06], [0.9, 0.3], { collision: false, text: 'staff-key-box', priority: 'B', art: 'cabinet' }),
      // 東壁：書庫・複合機・給湯
      g.at('staff-lockers', '職員用収納', [12.9, 2.0], [0.6, 2.0], { art: 'cabinet' }),
      g.at('copy-machine', 'コピー機', [12.2, 4.3], [1.3, 1.1], { text: 'copy-machine', priority: 'B', art: 'machine' }),
      g.at('staff-kitchenette', '給湯コーナー', [12.0, 6.0], [1.5, 1.0], { text: 'staff-kitchenette', priority: 'B', art: 'sink' }),
      g.at('staff-mailboxes', '職員メールボックス', [10.4, 6.5], [1.3, 0.55], { text: 'staff-mailboxes', priority: 'B', art: 'lockers' })
    ],
    exploration: ['attendance-ledger', 'principal-desk']
  }),

  'F1-03': defineRoom({
    id: 'F1-03', floor: '1F', order: 3, name: '保健室', kind: 'infirmary',
    widthM: 9.0, depthM: 7.5, spanM: 9.0,
    floorStyle: 'vinyl',
    doors: [{ id: 'north-main', label: '保健室前扉', atM: 6.9, widthM: 1.6 }],
    build: (g) => [
      // ベッドは日当たりのよい南窓側、カーテンで仕切る
      g.at('bed-1', 'ベッド', [0.7, 5.1], [2.0, 1.0], { text: 'bed', priority: 'B', art: 'bed' }),
      g.at('bed-2', 'ベッド', [3.1, 5.1], [2.0, 1.0], { text: 'bed', priority: 'B', art: 'bed' }),
      g.at('curtain-rail', 'カーテン', [0.6, 4.85], [4.7, 0.14], { collision: false, text: 'curtain', priority: 'B', art: 'curtain' }),
      g.at('nurse-desk', '養護教諭机', [6.6, 1.5], [1.6, 1.0], { text: 'nurse-desk', priority: 'B', art: 'desk' }),
      g.at('visit-log', '来室記録', [6.7, 2.75], [1.2, 0.5], { type: 'document', collision: false, text: 'visit-log', priority: 'A', art: 'ledger' }),
      g.at('medicine-cabinet', '薬品戸棚', [8.4, 3.0], [0.6, 2.6], { text: 'medicine-cabinet', priority: 'B', art: 'cabinet' }),
      g.at('health-board', '健康掲示', [2.6, 0.05], [2.8, 0.25], { type: 'document', collision: false, text: 'health-board', priority: 'B', art: 'board' }),
      g.at('measurement-corner', '身長・体重計', [0.6, 0.7], [1.2, 1.3], { text: 'measurement-corner', priority: 'B', art: 'scale' }),
      g.at('eye-chart', '視力検査表', [0.1, 2.4], [0.28, 1.0], { type: 'document', collision: false, text: 'eye-chart', priority: 'B', art: 'poster' }),
      g.at('health-consultation', '相談スペース', [2.6, 2.4], [2.4, 1.6], { text: 'health-consultation', priority: 'B', art: 'sofa' }),
      g.at('wash-basin', '洗面台', [6.3, 6.2], [1.8, 0.7], { text: 'wash-basin', priority: 'B', art: 'sink' }),
      g.at('first-aid-cart', '救急ワゴン', [5.7, 3.4], [0.8, 0.6], { text: 'first-aid-cart', priority: 'B', art: 'cart' })
    ],
    exploration: ['health-board', 'curtain-rail', 'visit-log']
  }),

  'F1-04': defineRoom({
    id: 'F1-04', floor: '1F', order: 4, name: '図書室', kind: 'library',
    widthM: 13.5, depthM: 7.5, spanM: 13.5,
    floorStyle: 'wood',
    doors: [{ id: 'north-main', label: '図書室前扉', atM: 1.0, widthM: 1.8 }],
    build: (g) => [
      // 貸出カウンターは入口の正面
      g.at('checkout-desk', '貸出カウンター', [0.7, 1.9], [2.6, 0.8], { text: 'checkout-desk', priority: 'B', art: 'counter' }),
      g.at('library-search-pc', '蔵書検索PC', [0.8, 3.1], [0.9, 0.7], { type: 'computer', text: 'library-search-pc', priority: 'B', art: 'pc' }),
      g.at('return-box', '返却箱', [2.2, 3.1], [0.8, 0.6], { text: 'return-box', priority: 'B', art: 'boxes' }),
      // 書架は南北方向に並ぶ島。通路は 1.0m。
      ...[0, 1, 2, 3, 4].map((i) => g.at(
        `book-shelf-${i + 1}`, '本棚', [4.4 + i * 1.55, 0.6], [0.55, 4.6],
        { text: 'book-shelves', priority: 'B', art: 'shelf-books' }
      )),
      // 参考図書・郷土資料は壁面書架
      g.at('school-history', '学校史', [12.95, 0.6], [0.55, 1.6], { type: 'document', text: 'school-history', priority: 'A', art: 'shelf-files' }),
      g.at('yearbook', '卒業アルバム', [12.95, 2.4], [0.55, 1.6], { type: 'document', text: 'yearbook', priority: 'B', art: 'shelf-files' }),
      g.at('old-newspaper', '新聞架', [12.6, 4.3], [0.9, 1.1], { type: 'document', text: 'old-newspaper', priority: 'A', art: 'newspaper' }),
      // 閲覧机は南窓側の明るい場所
      ...g.grid('reading-table', '閲覧机', { x: 4.6, y: 5.9, rows: 3, cols: 2, dx: 2.6, dy: 1.05, w: 1.8, h: 0.75 }, { text: 'reading-tables', priority: 'C', art: 'table' }),
      g.at('reading-corner', '読書コーナー', [0.7, 5.6], [2.4, 1.4], { text: 'reading-corner', priority: 'B', art: 'sofa' }),
      g.at('library-notice', '図書だより', [2.2, 0.05], [1.8, 0.24], { type: 'document', collision: false, text: 'library-notice', priority: 'B', art: 'poster' })
    ],
    exploration: ['school-history', 'yearbook', 'book-shelf-1', 'old-newspaper']
  }),

  'F1-05': defineRoom({
    id: 'F1-05', floor: '1F', order: 5, name: '多目的室', kind: 'multipurpose',
    widthM: 13.5, depthM: 7.5, spanM: 13.5,
    floorStyle: 'vinyl',
    doors: [{ id: 'north-main', label: '多目的室前扉', atM: 11.0, widthM: 1.8 }],
    build: (g) => [
      // 前方（西）はスクリーンとホワイトボード、床は広く空けてある
      g.at('projection-screen', 'スクリーン', [0.12, 2.2], [0.22, 3.2], { collision: false, art: 'screen' }),
      g.at('whiteboard', 'ホワイトボード', [0.12, 0.7], [0.22, 1.3], { collision: false, text: 'whiteboard', priority: 'B', art: 'whiteboard' }),
      g.at('projector-stand', 'プロジェクター台', [3.4, 3.4], [0.8, 0.7], { text: 'projector-stand', priority: 'B', art: 'cart' }),
      g.at('microphone', 'マイクスタンド', [1.4, 4.4], [0.4, 0.4], { collision: false, text: 'microphone', priority: 'B', art: 'mic' }),
      // 可動机・折り畳み椅子は端に寄せてある
      ...g.grid('multipurpose-table', '可動机', { x: 5.4, y: 0.7, rows: 3, cols: 3, dx: 1.5, dy: 1.6, w: 1.2, h: 0.6 }, { art: 'table' }),
      g.at('folding-chairs', '折り畳み椅子', [12.4, 1.4], [1.1, 1.8], { text: 'folding-chairs', priority: 'B', art: 'stack' }),
      g.at('av-rack', 'AV機器棚', [12.3, 3.4], [1.2, 1.8], { text: 'av-rack', priority: 'B', art: 'machine' }),
      g.at('multipurpose-storage', '備品収納', [12.2, 5.4], [1.3, 1.7], { text: 'multipurpose-storage', priority: 'B', art: 'cabinet' }),
      g.at('broadcast-desk', '放送補助机', [0.7, 6.2], [2.0, 0.8], { text: 'broadcast-desk', priority: 'B', art: 'desk' }),
      g.at('broadcast-log', '放送ログ', [2.9, 6.35], [1.0, 0.5], { type: 'document', collision: false, text: 'broadcast-log', priority: 'A', art: 'ledger' }),
      g.at('exhibition-panel', '展示パネル', [5.4, 6.3], [3.4, 0.3], { type: 'document', collision: false, text: 'exhibition-panel', priority: 'B', art: 'board' }),
      g.at('stage-blocks', '簡易ステージ台', [9.4, 5.9], [2.2, 1.2], { text: 'stage-blocks', priority: 'B', art: 'stack' })
    ],
    exploration: ['av-rack', 'exhibition-panel', 'broadcast-log']
  }),

  'F1-06': defineRoom({
    id: 'F1-06', floor: '1F', order: 6, name: '音楽室', kind: 'music',
    widthM: 13.5, depthM: 7.5, spanM: 13.5,
    floorStyle: 'wood',
    doors: [{ id: 'north-main', label: '音楽室前扉', atM: 1.0, widthM: 1.8 }],
    build: (g) => [
      // グランドピアノは前方（西）の窓寄り、指揮台の脇
      g.at('piano', 'グランドピアノ', [0.8, 4.4], [2.4, 2.0], { text: 'piano', priority: 'B', art: 'piano' }),
      g.at('conductor-stand', '指揮台', [1.4, 3.1], [0.9, 0.9], { text: 'conductor-stand', priority: 'B', art: 'podium' }),
      g.at('music-blackboard', '五線黒板', [0.12, 0.7], [0.22, 2.1], { collision: false, text: 'music-blackboard', priority: 'B', art: 'blackboard' }),
      // 椅子は段状に前を向いて並ぶ（合唱隊形）
      ...g.grid('music-chair', '可動椅子', { x: 4.2, y: 1.0, rows: 4, cols: 5, dx: 1.15, dy: 1.05, w: 0.45, h: 0.45 }, { art: 'chair' }),
      ...g.grid('music-stand', '譜面台', { x: 4.4, y: 1.5, rows: 4, cols: 4, dx: 1.15, dy: 1.05, w: 0.32, h: 0.32 }, { collision: false, art: 'mic' }),
      g.at('music-board', '楽譜棚', [12.95, 0.6], [0.55, 2.6], { text: 'music-board', priority: 'B', art: 'shelf-files' }),
      g.at('instrument-cabinet', '楽器収納', [12.3, 3.5], [1.2, 2.0], { text: 'instrument-cabinet', priority: 'B', art: 'cabinet' }),
      g.at('composer-portraits', '音楽家の肖像', [4.4, 0.05], [5.6, 0.24], { type: 'document', collision: false, text: 'composer-portraits', priority: 'B', art: 'portraits' }),
      g.at('choir-risers', '合唱台', [4.6, 5.9], [4.6, 1.1], { text: 'choir-risers', priority: 'B', art: 'stack' }),
      g.at('percussion-corner', '打楽器', [10.4, 5.9], [1.6, 1.1], { text: 'percussion-corner', priority: 'B', art: 'machine' })
    ],
    exploration: ['piano', 'music-board', 'composer-portraits']
  }),

  // ============================ 2F ============================
  'F2-01': ordinaryClassroom('F2-01', '2F', 1, '1年教室', '1年'),
  'F2-02': ordinaryClassroom('F2-02', '2F', 2, '2年教室', '2年'),

  'F2-03': defineRoom({
    id: 'F2-03', floor: '2F', order: 3, name: '理科室', kind: 'science',
    widthM: 13.5, depthM: 7.5, spanM: 13.5,
    floorStyle: 'vinyl',
    doors: [{ id: 'north-main', label: '理科室前扉', atM: 0.9, widthM: 1.8 }],
    build: (g) => [
      g.at('science-teacher-table', '教師実験台', [0.7, 2.9], [1.1, 2.6], { text: 'science-teacher-table', priority: 'B', art: 'lab-bench' }),
      g.at('periodic-table', '周期表', [0.12, 0.6], [0.24, 1.9], { type: 'document', collision: false, text: 'periodic-table', priority: 'B', art: 'poster' }),
      g.at('science-blackboard', '黒板', [0.12, 5.0], [0.26, 2.2], { collision: false, text: 'blackboard', priority: 'B', art: 'blackboard' }),
      // 生徒実験台は 6 班。各台に流しがつく。
      ...g.grid('science-table', '生徒実験台', { x: 3.2, y: 1.0, rows: 3, cols: 2, dx: 2.7, dy: 3.1, w: 1.8, h: 1.2 }, { text: 'science-tables', priority: 'C', art: 'lab-bench' }),
      ...g.grid('science-table-sink', '実験台の流し', { x: 3.2, y: 2.25, rows: 3, cols: 2, dx: 2.7, dy: 3.1, w: 1.8, h: 0.4 }, { art: 'sink' }),
      g.at('science-sink', '流し・給水', [11.4, 0.6], [2.1, 0.9], { text: 'science-sink', priority: 'B', art: 'sink' }),
      g.at('fume-hood', 'ドラフト', [11.9, 1.9], [1.6, 1.2], { text: 'fume-hood', priority: 'B', art: 'machine' }),
      g.at('specimen-shelf', '器具・標本棚', [12.6, 3.4], [0.9, 2.4], { text: 'specimens', priority: 'B', art: 'shelf-glass' }),
      g.at('skeleton-model', '骨格模型', [11.9, 6.2], [0.7, 1.1], { text: 'skeleton', priority: 'B', art: 'figure' }),
      g.at('microscopes', '顕微鏡棚', [9.6, 6.3], [1.8, 0.8], { text: 'microscopes', priority: 'B', art: 'shelf-glass' }),
      g.at('eyewash', '洗眼器', [0.8, 6.4], [0.7, 0.6], { text: 'eyewash', priority: 'B', art: 'sink' })
    ],
    exploration: ['specimen-shelf', 'skeleton-model', 'periodic-table']
  }),

  'F2-04': defineRoom({
    id: 'F2-04', floor: '2F', order: 4, name: '美術室', kind: 'art',
    widthM: 13.5, depthM: 7.5, spanM: 13.5,
    floorStyle: 'vinyl',
    doors: [{ id: 'north-main', label: '美術室前扉', atM: 11.0, widthM: 1.8 }],
    build: (g) => [
      g.at('art-blackboard', '黒板', [0.12, 1.4], [0.26, 3.0], { collision: false, text: 'blackboard', priority: 'B', art: 'blackboard' }),
      g.at('plaster-statue', '石膏像', [0.9, 0.7], [0.8, 0.8], { text: 'plaster-statue', priority: 'B', art: 'figure' }),
      g.at('plaster-statue-2', '石膏像（トルソ）', [0.9, 6.1], [0.8, 0.8], { text: 'plaster-statue', priority: 'B', art: 'figure' }),
      // 大型制作机 6台（4人掛け）
      ...g.grid('art-table', '大型制作机', { x: 3.0, y: 0.9, rows: 3, cols: 2, dx: 2.8, dy: 3.2, w: 2.0, h: 1.4 }, { text: 'art-tables', priority: 'C', art: 'table' }),
      g.at('art-sink', '流し・水切り', [11.0, 6.3], [2.5, 0.8], { text: 'art-sink', priority: 'B', art: 'sink' }),
      g.at('drying-rack', '乾燥棚', [12.6, 1.5], [0.9, 2.2], { text: 'artwork', priority: 'B', art: 'shelf' }),
      g.at('art-supply-shelf', '画材棚', [12.6, 3.9], [0.9, 2.0], { text: 'art-supply-shelf', priority: 'B', art: 'cabinet' }),
      g.at('easels', 'イーゼル', [10.8, 1.6], [1.6, 1.3], { text: 'easels', priority: 'B', art: 'easel' }),
      g.at('student-artwork', '生徒作品の展示', [3.0, 0.05], [5.4, 0.24], { type: 'document', collision: false, text: 'student-artwork', priority: 'B', art: 'portraits' }),
      g.at('kiln', '陶芸窯', [9.8, 6.2], [1.0, 1.0], { text: 'kiln', priority: 'B', art: 'machine' })
    ],
    exploration: ['drying-rack', 'plaster-statue', 'student-artwork']
  }),

  'F2-05': defineRoom({
    id: 'F2-05', floor: '2F', order: 5, name: '学習室', kind: 'study-room',
    widthM: 6.75, depthM: 7.5, spanM: 6.75,
    floorStyle: 'wood',
    doors: [{ id: 'north-main', label: '学習室前扉', atM: 4.6, widthM: 1.6 }],
    build: (g) => [
      ...g.grid('study-table', '学習机', { x: 2.4, y: 1.5, rows: 2, cols: 4, dx: 1.6, dy: 1.4, w: 1.1, h: 0.7 }, { text: 'study-tables', priority: 'C', art: 'desk' }),
      g.at('consultation-desk', '相談机', [0.7, 5.7], [1.6, 1.1], { text: 'consultation-desk', priority: 'B', art: 'table' }),
      g.at('support-shelf', '支援教材棚', [6.15, 1.5], [0.6, 2.4], { text: 'support-shelf', priority: 'B', art: 'shelf-files' }),
      g.at('study-whiteboard', 'ホワイトボード', [0.12, 0.7], [0.22, 2.0], { collision: false, text: 'whiteboard', priority: 'B', art: 'whiteboard' }),
      g.at('quiet-corner', '個別ブース', [0.7, 3.1], [1.2, 2.0], { text: 'quiet-corner', priority: 'B', art: 'booth' }),
      g.at('study-notice', '学習の記録', [2.6, 0.05], [1.6, 0.24], { type: 'document', collision: false, text: 'study-notice', priority: 'B', art: 'poster' })
    ],
    exploration: ['consultation-desk', 'support-shelf']
  }),

  'F2-06': emptyClassroom('F2-06', '2F', 6, '空き教室', '用途停止', 'quiet-and-realistic'),

  // ============================ 3F ============================
  'F3-01': ordinaryClassroom('F3-01', '3F', 1, '3年教室', '3年'),

  'F3-02': defineRoom({
    id: 'F3-02', floor: '3F', order: 2, name: '家庭科室', kind: 'home-ec',
    widthM: 13.5, depthM: 7.5, spanM: 13.5,
    floorStyle: 'vinyl',
    doors: [{ id: 'north-main', label: '家庭科室前扉', atM: 0.9, widthM: 1.8 }],
    build: (g) => [
      g.at('home-ec-demo', '教師実演台', [0.7, 2.8], [1.2, 2.4], { text: 'home-ec-demo', priority: 'B', art: 'lab-bench' }),
      g.at('home-ec-mirror', '実演用ミラー', [0.12, 0.7], [0.22, 1.7], { collision: false, text: 'home-ec-mirror', priority: 'B', art: 'screen' }),
      // 調理実習台 6班：各台にシンクとコンロ
      ...g.grid('cooking-table', '調理実習台', { x: 3.2, y: 1.0, rows: 3, cols: 2, dx: 2.7, dy: 3.1, w: 1.9, h: 1.3 }, { text: 'cooking-tables', priority: 'C', art: 'lab-bench' }),
      ...g.grid('cooking-stove', 'コンロ', { x: 3.2, y: 2.35, rows: 3, cols: 2, dx: 2.7, dy: 3.1, w: 0.9, h: 0.4 }, { art: 'stove' }),
      ...g.grid('cooking-sink', 'シンク', { x: 4.2, y: 2.35, rows: 3, cols: 2, dx: 2.7, dy: 3.1, w: 0.9, h: 0.4 }, { art: 'sink' }),
      g.at('stove-sink', '流し・加熱設備', [11.6, 0.6], [1.9, 1.0], { text: 'stove-sink', priority: 'B', art: 'sink' }),
      g.at('refrigerator', '冷蔵庫', [12.8, 1.9], [0.7, 0.75], { text: 'refrigerator', priority: 'B', art: 'fridge' }),
      g.at('dish-cabinet', '食器棚', [12.7, 3.0], [0.8, 2.2], { text: 'dish-cabinet', priority: 'B', art: 'shelf-glass' }),
      g.at('sewing-storage', 'ミシン収納', [11.0, 6.3], [2.5, 0.8], { text: 'sewing-storage', priority: 'B', art: 'cabinet' }),
      ...g.grid('sewing-table', '被服テーブル', { x: 3.4, y: 6.2, rows: 3, cols: 1, dx: 2.4, dy: 1.0, w: 1.8, h: 0.9 }, { text: 'sewing-tables', priority: 'C', art: 'table' }),
      g.at('nutrition-chart', '栄養の掲示', [3.2, 0.05], [4.4, 0.24], { type: 'document', collision: false, text: 'nutrition-chart', priority: 'B', art: 'poster' })
    ],
    exploration: ['dish-cabinet', 'sewing-storage', 'nutrition-chart']
  }),

  'F3-03': defineRoom({
    id: 'F3-03', floor: '3F', order: 3, name: 'コンピュータ室', kind: 'computer',
    widthM: 13.5, depthM: 7.5, spanM: 13.5,
    floorStyle: 'carpet',
    doors: [{ id: 'north-main', label: 'コンピュータ室前扉', atM: 11.0, widthM: 1.8 }],
    build: (g) => [
      g.at('computer-screen', '西側スクリーン', [0.12, 2.0], [0.24, 3.4], { collision: false, art: 'screen' }),
      g.at('teacher-pc', '教師PC', [0.9, 0.8], [1.4, 0.8], { type: 'computer', text: 'teacher-pc', priority: 'A', art: 'pc' }),
      // 生徒PCは壁沿いのロの字＋中央島。実際のPC室によくある配置。
      ...g.grid('student-pc-north', '生徒PC', { x: 3.4, y: 0.5, rows: 5, cols: 1, dx: 1.5, dy: 1, w: 1.3, h: 0.75 }, { type: 'computer', text: 'student-pcs', priority: 'A', art: 'pc' }),
      ...g.grid('student-pc-south', '生徒PC', { x: 3.4, y: 6.25, rows: 6, cols: 1, dx: 1.5, dy: 1, w: 1.3, h: 0.75 }, { type: 'computer', text: 'student-pcs', priority: 'A', art: 'pc' }),
      ...g.grid('student-pc-mid', '生徒PC', { x: 4.2, y: 3.0, rows: 5, cols: 2, dx: 1.5, dy: 0.9, w: 1.3, h: 0.75 }, { type: 'computer', text: 'student-pcs', priority: 'A', art: 'pc' }),
      g.at('printer', 'プリンタ', [12.4, 1.5], [1.1, 0.9], { type: 'computer', text: 'printer', priority: 'B', art: 'machine' }),
      g.at('lan-shelf', '周辺機器棚', [12.7, 2.7], [0.8, 1.8], { text: 'lan-shelf', priority: 'B', art: 'shelf' }),
      g.at('lan-power-rack', 'LAN・電源設備', [12.6, 4.8], [0.9, 1.6], { text: 'lan-power-rack', priority: 'B', art: 'machine' }),
      g.at('pc-usage-rules', '利用のきまり', [3.4, 0.05], [3.2, 0.24], { type: 'document', collision: false, text: 'pc-usage-rules', priority: 'B', art: 'poster' })
    ],
    exploration: ['teacher-pc', 'student-pc-mid-1-1', 'printer']
  }),

  'F3-04': defineRoom({
    id: 'F3-04', floor: '3F', order: 4, name: '技術室', kind: 'technology',
    widthM: 13.5, depthM: 7.5, spanM: 13.5,
    floorStyle: 'concrete',
    doors: [{ id: 'north-main', label: '技術室前扉', atM: 0.9, widthM: 1.8 }],
    build: (g) => [
      g.at('tech-blackboard', '黒板', [0.12, 2.4], [0.26, 2.8], { collision: false, text: 'blackboard', priority: 'B', art: 'blackboard' }),
      g.at('tech-demo-bench', '教師作業台', [0.8, 1.5], [1.2, 1.4], { text: 'tech-demo-bench', priority: 'B', art: 'workbench' }),
      // 作業台 6台。万力が各台の角につく。
      ...g.grid('workbench', '中央作業台', { x: 3.2, y: 1.0, rows: 3, cols: 2, dx: 2.7, dy: 3.1, w: 2.0, h: 1.3 }, { text: 'workbench', priority: 'C', art: 'workbench' }),
      ...g.grid('bench-vise', '万力', { x: 3.2, y: 0.65, rows: 3, cols: 2, dx: 2.7, dy: 3.1, w: 0.4, h: 0.35 }, { text: 'vise', priority: 'B', art: 'tools' }),
      g.at('tool-wall', '工具壁', [12.8, 0.6], [0.7, 3.2], { text: 'tools', priority: 'B', art: 'tools' }),
      g.at('material-shelf', '材料棚', [12.6, 4.0], [0.9, 2.2], { text: 'material-shelf', priority: 'B', art: 'shelf' }),
      g.at('machine-safety-zone', '工作機械（安全区画）', [9.4, 6.0], [3.0, 1.2], { text: 'machine-safety-zone', priority: 'B', art: 'machine' }),
      g.at('dust-collector', '集塵機', [8.2, 6.2], [0.9, 0.9], { text: 'dust-collector', priority: 'B', art: 'machine' }),
      g.at('safety-poster', '安全のきまり', [3.2, 0.05], [3.4, 0.24], { type: 'document', collision: false, text: 'safety-poster', priority: 'B', art: 'poster' })
    ],
    exploration: ['tool-wall', 'bench-vise-1-1', 'safety-poster']
  }),

  'F3-05': defineRoom({
    id: 'F3-05', floor: '3F', order: 5, name: '進路・生徒会室', kind: 'career-council',
    widthM: 6.75, depthM: 7.5, spanM: 6.75,
    floorStyle: 'vinyl',
    doors: [{ id: 'north-main', label: '進路・生徒会室前扉', atM: 4.6, widthM: 1.6 }],
    build: (g) => [
      g.at('career-shelf', '進路資料棚', [0.12, 0.7], [0.6, 3.2], { type: 'document', text: 'career-files', priority: 'A', art: 'shelf-files' }),
      g.at('student-council-records', '生徒会記録', [6.15, 1.5], [0.6, 2.4], { type: 'document', text: 'council-records', priority: 'A', art: 'shelf-files' }),
      g.at('meeting-table', '会議机', [2.0, 2.2], [2.8, 1.6], { text: 'meeting-table', priority: 'C', art: 'table' }),
      g.at('interview-desk', '面談机', [2.4, 5.6], [2.0, 1.0], { text: 'interview-desk', priority: 'B', art: 'desk' }),
      g.at('council-meeting-records', '会議記録', [1.6, 0.05], [2.6, 0.24], { type: 'document', collision: false, text: 'council-meeting-records', priority: 'A', art: 'board' }),
      g.at('career-notice', '進路だより', [0.9, 4.4], [1.4, 0.5], { type: 'document', collision: false, text: 'career-notice', priority: 'B', art: 'poster' }),
      g.at('council-banner', '生徒会の横断幕', [5.0, 4.3], [1.4, 0.7], { text: 'council-banner', priority: 'B', art: 'stack' })
    ],
    exploration: ['career-shelf', 'student-council-records']
  }),

  'F3-06': emptyClassroom('F3-06', '3F', 6, '空き教室', '長期用途停止', 'long-unused'),

  // ============================ B1 ============================
  'B1-01': defineRoom({
    id: 'B1-01', floor: 'B1', order: 1, name: '倉庫', kind: 'storage',
    widthM: 9.0, depthM: 6.0, spanM: 9.0,
    doors: [{ id: 'north-main', label: '倉庫の扉', atM: 0.8, widthM: 1.4 }],
    build: (g) => [
      // 金属棚は通路 1.0m をとって南北に並ぶ
      ...[0, 1, 2].map((i) => g.at(
        `metal-shelf-${i + 1}`, '金属棚', [3.0 + i * 1.7, 0.6], [0.6, 3.6],
        { text: 'storage-shelves', priority: 'B', art: 'shelf' }
      )),
      g.at('old-supplies', '古い備品', [0.8, 4.9], [3.2, 0.9], { text: 'old-supplies', priority: 'B', art: 'boxes' }),
      g.at('boxes', '撤去用の箱', [4.6, 4.9], [2.6, 0.9], { text: 'boxes', priority: 'B', art: 'boxes' }),
      g.at('storage-pipes', '配管', [8.7, 0.4], [0.3, 5.2], { art: 'pipes' }),
      g.at('storage-inspection-lamp', '点検灯', [4.4, 0.06], [0.5, 0.3], { type: 'ambient', collision: false, text: 'inspection-lamp', priority: 'B', art: 'lamp' }),
      g.at('storage-ledger', '備品台帳', [0.8, 2.6], [1.2, 0.5], { type: 'document', text: 'storage-ledger', priority: 'A', art: 'ledger' })
    ],
    exploration: ['metal-shelf-1', 'old-supplies', 'boxes']
  }),

  'B1-02': defineRoom({
    id: 'B1-02', floor: 'B1', order: 2, name: 'ボイラー室', kind: 'boiler',
    widthM: 6.75, depthM: 6.0, spanM: 6.75,
    doors: [{ id: 'north-main', label: 'ボイラー室の扉', atM: 0.8, widthM: 1.4 }],
    build: (g) => [
      g.at('boiler', 'ボイラー設備', [2.4, 1.6], [3.0, 2.8], { text: 'boiler', priority: 'B', art: 'machine' }),
      g.at('pipes', '配管', [0.1, 1.5], [0.4, 4.0], { art: 'pipes' }),
      g.at('ceiling-pipes', '天井配管', [1.4, 0.06], [4.8, 0.3], { collision: false, art: 'pipes' }),
      g.at('control-panel', '点検操作盤', [6.0, 1.8], [0.75, 1.6], { text: 'control-panel', priority: 'B', art: 'panel' }),
      g.at('fuel-tank', '燃料タンク', [5.4, 4.4], [1.3, 1.3], { text: 'fuel-tank', priority: 'B', art: 'machine' }),
      g.at('inspection-log', '点検記録', [1.5, 5.0], [1.2, 0.5], { type: 'document', text: 'inspection-log', priority: 'A', art: 'ledger' })
    ],
    exploration: ['boiler', 'control-panel']
  }),

  'B1-03': defineRoom({
    id: 'B1-03', floor: 'B1', order: 3, name: '資料室', kind: 'archive',
    widthM: 9.0, depthM: 6.0, spanM: 9.0,
    doors: [{ id: 'north-main', label: '資料室の扉', atM: 6.8, widthM: 1.4 }],
    build: (g) => [
      ...[0, 1, 2, 3].map((i) => g.at(
        `archive-shelf-${i + 1}`, '資料棚', [0.8 + i * 1.5, 0.6], [0.55, 3.4],
        { text: 'archive-shelves', priority: 'A', art: 'shelf-files' }
      )),
      g.at('archive-files', '保管資料', [0.8, 4.7], [3.4, 1.0], { type: 'document', text: 'archive-files', priority: 'A', art: 'boxes' }),
      g.at('archive-metal-cabinets', '金属保管庫', [8.1, 1.5], [0.9, 2.2], { text: 'archive-metal-cabinets', priority: 'B', art: 'cabinet' }),
      g.at('archive-desk', '閲覧机', [5.0, 4.7], [1.8, 0.9], { text: 'archive-desk', priority: 'B', art: 'desk' }),
      g.at('inspection-lamp', '点検灯', [4.4, 0.06], [0.5, 0.3], { type: 'ambient', collision: false, text: 'inspection-lamp', priority: 'B', art: 'lamp' }),
      g.at('archive-pipes', '配管', [8.7, 3.2], [0.3, 2.4], { art: 'pipes' })
    ],
    exploration: ['archive-shelf-1', 'archive-files']
  })
})

export const FLOOR_DEFINITIONS = Object.freeze({
  '1F': Object.freeze({ label: '1F', name: '1階', corridorId: 'F1-CORRIDOR', rooms: Object.freeze(['F1-01', 'F1-02', 'F1-03', 'F1-04', 'F1-05', 'F1-06']) }),
  '2F': Object.freeze({ label: '2F', name: '2階', corridorId: 'F2-CORRIDOR', rooms: Object.freeze(['F2-01', 'F2-02', 'F2-03', 'F2-04', 'F2-05', 'F2-06']) }),
  '3F': Object.freeze({ label: '3F', name: '3階', corridorId: 'F3-CORRIDOR', rooms: Object.freeze(['F3-01', 'F3-02', 'F3-03', 'F3-04', 'F3-05', 'F3-06']) }),
  B1: Object.freeze({ label: 'B1', name: '地下1階', corridorId: 'B1-CORRIDOR', rooms: Object.freeze(['B1-01', 'B1-02', 'B1-03']) })
})

export const ROOM_IDS = Object.freeze(Object.values(FLOOR_DEFINITIONS).flatMap((floor) => floor.rooms))

export const CORRIDOR_DEFINITIONS = Object.freeze(Object.fromEntries(
  FLOOR_ORDER.map((floor) => [FLOOR_DEFINITIONS[floor].corridorId, Object.freeze({
    id: FLOOR_DEFINITIONS[floor].corridorId,
    floor,
    north: 'rooms',
    stairs: Object.freeze({ west: `${floor}-STAIR-WEST`, east: `${floor}-STAIR-EAST` }),
    rooms: FLOOR_DEFINITIONS[floor].rooms
  })])
))

// 地下は西階段の下り口からのみ入る。上りは同じ西階段で 1F に戻る。
export const STAIR_CONNECTIONS = Object.freeze({
  west: Object.freeze({ '1F': Object.freeze(['2F']), '2F': Object.freeze(['1F', '3F']), '3F': Object.freeze(['2F']), B1: Object.freeze(['1F']) }),
  east: Object.freeze({ '1F': Object.freeze(['2F']), '2F': Object.freeze(['1F', '3F']), '3F': Object.freeze(['2F']), B1: Object.freeze([]) })
})

export const BASEMENT_ROOM_IDS = Object.freeze(FLOOR_DEFINITIONS.B1.rooms)
export const GROUND_FLOOR_ROOM_IDS = Object.freeze(FLOOR_ORDER.slice(0, 3).flatMap((floor) => FLOOR_DEFINITIONS[floor].rooms))

export function getRoomDefinition(roomId){
  return ROOM_DEFINITIONS[roomId] || null
}

export function isBasementRoom(roomId){
  return BASEMENT_ROOM_IDS.includes(roomId)
}

export function canEnterRoom(roomId, session){
  const room = getRoomDefinition(roomId)
  if(!room) return false
  if(isBasementRoom(roomId)) return canAccessBasement(session)
  return true
}

/**
 * Basement content is a foundation for the original edition only. Keep this
 * gate in the shared model so UI, debug helpers, and room transitions cannot
 * accidentally make B1 visible in the revival edition.
 */
export function canAccessBasement(session, edition = session?.edition){
  const candidate = session?.sessions?.[edition] || session
  return edition === EDITIONS.ORIGINAL && Boolean(candidate?.basementUnlocked && candidate?.canAccessBasement)
}

export function getFloorRoomIds(floor){
  return FLOOR_DEFINITIONS[floor]?.rooms || []
}

export function getRoomConnections(roomId){
  const room = getRoomDefinition(roomId)
  if(!room) return []
  return Object.freeze([
    { type: 'corridor', id: FLOOR_DEFINITIONS[room.floor].corridorId, side: room.order <= 3 ? 'west' : 'east' },
    ...room.doors.map((door) => ({ type: 'door', id: `${roomId}-${door.id}`, direction: room.corridorSide === 'south' ? 'south' : 'north' }))
  ])
}

export const ROOM_LAYOUT_RULES = Object.freeze({
  north: 'corridor-and-doors',
  south: 'exterior-windows',
  west: 'blackboard-or-teaching-front',
  east: 'storage-and-preparation',
  basement: 'windowless-utility-space'
})
