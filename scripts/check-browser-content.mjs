import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { VIRTUAL_PAGE_TYPES, VIRTUAL_URLS } from '../src/virtual-web/constants.js'
import { searchVirtualWeb, virtualWebDocuments } from '../src/virtual-web/searchIndex.js'
import { getSiteByDomain } from '../src/virtual-web/sites/index.js'

const prologue = JSON.parse(await readFile(new URL('../src/data/dm_prologue.json', import.meta.url), 'utf8'))
const afterBbs = JSON.parse(await readFile(new URL('../src/data/dm_after_bbs.json', import.meta.url), 'utf8'))
const registry = await readFile(new URL('../src/virtual-web/registry.js', import.meta.url), 'utf8')
const workspace = await readFile(new URL('../src/views/BrowserWorkspace.vue', import.meta.url), 'utf8')
const chatApp = await readFile(new URL('../src/components/chat/ChatApp.vue', import.meta.url), 'utf8')
const bbs = await readFile(new URL('../src/views/BBSView.vue', import.meta.url), 'utf8')

// The prologue script itself is asserted line by line in check-story.mjs; here
// it only has to line up with what the browser screens expect of it.
assert.equal(prologue.length, 22)
assert.equal(afterBbs.length, 45)
assert.ok(prologue.every((entry) => typeof entry.id === 'string' && entry.id.startsWith('prologue-dm-')))
assert.ok(prologue.some((entry) => entry.text === 'それっぽいの見つけた'))
assert.ok(afterBbs.some((entry) => entry.input?.expected === '見つけた'))
assert.ok(afterBbs.some((entry) => entry.input?.expected === '確認した'))
assert.ok(afterBbs.some((entry) => entry.input?.expected === 'QRを読み込んだ'))
assert.ok(afterBbs.some((entry) => entry.input?.expected === 'アクセスコードを入力した'))

assert.equal(new Set(virtualWebDocuments.map((document) => document.id)).size, virtualWebDocuments.length)
assert.ok(!searchVirtualWeb('SIDE-B 2015').some((document) => document.url === VIRTUAL_URLS.BBS_THREAD))
assert.equal(getSiteByDomain('minna-bbs.net').pageByPath.get('/archive/private/20150307').posts.length, 95)
assert.equal(getSiteByDomain('minna-bbs.net').pageByPath.get('/archive/private/20150307').noindex, true)
assert.equal(getSiteByDomain('minna-bbs.net').pageByPath.get('/archive/private/20150307').data.postIds.length, 95)
assert.equal(getSiteByDomain('minna-bbs.net').pageByPath.get('/archive/private/20150307').data.postIds[0], 'TWl6dW5v')
assert.ok(searchVirtualWeb('卒業式 青い鳥').some((document) => document.url === VIRTUAL_URLS.SCHOOL_GRADUATION_2015))
assert.deepEqual(searchVirtualWeb('登録されていない語句'), [])

for(const pageTypeKey of Object.keys(VIRTUAL_PAGE_TYPES)){
  if(pageTypeKey === 'ERROR') continue
  assert.ok(workspace.includes(`PAGE.${pageTypeKey}`))
}
assert.ok(workspace.includes('v-else'))

assert.ok(registry.includes('virtualWebRoutes'))
assert.ok(chatApp.includes("id: `chat-${newStep}`"))
assert.ok(chatApp.includes('notifiedStep = ref(step.value)'))
assert.ok(chatApp.includes('STORY_EVENTS.PROLOGUE_DM_COMPLETE'))
assert.ok(chatApp.includes('dmAfterRevival'))
assert.ok(chatApp.includes('PRIVATE ARCHIVE'))
assert.ok(bbs.includes('@click="openNews"'))
assert.ok(!bbs.includes('href="https://news.example.jp'))
assert.ok(!workspace.includes('SchoolGame'))

console.log(`Browser content OK: ${virtualWebDocuments.length} indexed documents, ${prologue.length + afterBbs.length} DM entries`)
