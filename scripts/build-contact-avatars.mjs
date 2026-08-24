// Rebuilds the chat contact icons in src/photo/contacts/.
//
// The classmates' portraits in src/photo/solo/ are the 2015 ones — school
// uniform, classroom behind them. The story is set eleven years later, so the
// address book needs faces the same people would actually be using today. These
// are drawn by DiceBear's "Lorelei" style (https://dicebear.com), which is
// released under CC0 1.0 by Lisa Wischofsky: free to use, no attribution
// required. See src/photo/contacts/README.md.
//
// Every feature is pinned rather than left to the seed, so re-running this
// produces the same faces. 水野ヒロキ is deliberately absent: he keeps the
// portrait he already has, because he is the one contact the story talks to.
//
//   node scripts/build-contact-avatars.mjs

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'photo', 'contacts')
const ENDPOINT = 'https://api.dicebear.com/9.x/lorelei/png'

// Shared across the whole set so the icons read as one address book: no
// glasses, beards, freckles or earrings unless a character is given them below.
const COMMON = {
  size: '256',
  clip: 'true',
  skinColor: 'f2d3b1',
  beardProbability: '0',
  frecklesProbability: '0',
  hairAccessoriesProbability: '0',
  glassesProbability: '0',
  earringsProbability: '0'
}

// One entry per contact. The comment on each is the 一言 it was drawn against
// (see src/components/chat/contacts.js), which is what the expression follows.
const CAST = [
  {
    file: '田中シン.png',            // 幹事はもうやらない
    seed: 'shin2026',
    hair: 'variant07', hairColor: '1f1a15',
    eyes: 'variant11', eyebrows: 'variant07', mouth: 'happy02', nose: 'variant02',
    backgroundColor: 'dfe8f3'
  },
  {
    file: '山田アヤ.png',            // 引っ越しました
    seed: 'aya2026',
    hair: 'variant13', hairColor: '2b2119',
    eyes: 'variant04', eyebrows: 'variant03', mouth: 'happy03', nose: 'variant04',
    backgroundColor: 'f3e3e3'
  },
  {
    file: '中村ユイ.png',            // 通知はあまり見ていません
    seed: 'yui2026',
    hair: 'variant21', hairColor: '141414',
    eyes: 'variant18', eyebrows: 'variant08', mouth: 'sad05', nose: 'variant01',
    backgroundColor: 'e3e9f0'
  },
  {
    file: '佐藤ダイキ.png',          // 出張続きです
    seed: 'daiki2026',
    hair: 'variant03', hairColor: '231c14',
    eyes: 'variant16', eyebrows: 'variant05', mouth: 'happy10', nose: 'variant01',
    backgroundColor: 'e6e9ef'
  },
  {
    file: '小川トオル.png',          // ぼちぼちやっています
    seed: 'toru2026',
    hair: 'variant09', hairColor: '2b2119',
    eyes: 'variant06', eyebrows: 'variant09', mouth: 'happy04', nose: 'variant03',
    backgroundColor: 'e4ecdf'
  },
  {
    file: '本田ナオキ.png',          // 一言メッセージなし
    seed: 'naoki2026',
    hair: 'variant47', hairColor: '191919',
    eyes: 'variant20', eyebrows: 'variant11', mouth: 'sad05', nose: 'variant02',
    backgroundColor: 'e9eaec'
  },
  {
    file: '林ミサキ.png',            // 返信は遅めです
    seed: 'misaki2026',
    hair: 'variant16', hairColor: '3a2a1e',
    eyes: 'variant14', eyebrows: 'variant04', mouth: 'happy01', nose: 'variant05',
    backgroundColor: 'efe8f4'
  },
  {
    file: '鈴木レナ.png',            // 猫と暮らしています
    seed: 'rena2026',
    hair: 'variant33', hairColor: '241a12',
    eyes: 'variant08', eyebrows: 'variant02', mouth: 'happy05', nose: 'variant02',
    backgroundColor: 'f6ece0'
  }
]

function avatarUrl({ file, ...options }){
  const params = new URLSearchParams({ ...COMMON, ...options })
  return `${ENDPOINT}?${params}`
}

async function build(){
  await mkdir(OUT_DIR, { recursive: true })

  for(const contact of CAST){
    const url = avatarUrl(contact)
    const response = await fetch(url)
    if(!response.ok) throw new Error(`${contact.file}: ${response.status} ${response.statusText}`)

    const body = Buffer.from(await response.arrayBuffer())
    // A JSON error body comes back with a 200 in some failure modes, so the
    // PNG signature is checked rather than trusted.
    if(body.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a'){
      throw new Error(`${contact.file}: response is not a PNG`)
    }

    await writeFile(join(OUT_DIR, contact.file), body)
    console.log(`${contact.file.padEnd(20)} ${(body.length / 1024).toFixed(1)} kB`)
  }

  console.log(`\nContact avatars OK: ${CAST.length} icons in src/photo/contacts/`)
}

build().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
