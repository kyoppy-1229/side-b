import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { TOWN_CHRONICLE } from '../src/virtual-web/sites/townChronicle.js'
import { virtualWebSites } from '../src/virtual-web/sites/index.js'
import { resolveVirtualUrl } from '../src/virtual-web/registry.js'
import { GENERATED_ART_KEYS } from '../src/virtual-web/art/generated.js'

assert.equal(virtualWebSites.length, 34)
assert.equal(TOWN_CHRONICLE.length, 6, 'six shared public-life events')

const byId = new Map(virtualWebSites.map((site) => [site.id, site]))
const chronicleArt = new Set()
let checked = 0

for(const event of TOWN_CHRONICLE){
  assert.ok(event.summary.length > 35, event.id)
  assert.ok(event.coverage.length >= 4, `${event.id} needs multiple viewpoints`)
  assert.equal(new Set(event.coverage.map((entry) => entry.siteId)).size, event.coverage.length)
  chronicleArt.add(event.art)

  for(const entry of event.coverage){
    const site = byId.get(entry.siteId)
    assert.ok(site, `Unknown publisher ${entry.siteId}`)
    assert.equal(Number(entry.date.slice(0, 4)), event.year)
    assert.ok(entry.date <= site.lastUpdated, `Article dated after publisher's last update: ${site.id}`)
    assert.ok(JSON.stringify([entry.body, entry.posts || []]).length >= 150, `Article should have real copy: ${entry.title}`)
    const page = site.pageByPath.get(`/town/${event.year}/${event.id}`)
    assert.ok(page, `Missing city chronicle article: ${site.id}/${event.id}`)
    assert.equal(page.title, entry.title)
    assert.equal(page.art, event.art)
    assert.ok(page.keywords.includes(event.summary))
    assert.equal(page.layout, event.year < 2020 ? '2010s' : event.year < 2023 ? '2020s' : '')
    const linkBlock = page.blocks.find((block) => block.type === 'links')
    for(const link of linkBlock?.items || []){
      const resolved = resolveVirtualUrl(link.path)
      assert.ok(resolved.found && !resolved.state?.notFound, `Broken cross-site link: ${link.path}`)
    }
    checked++
  }
}

for(const art of chronicleArt){
  assert.ok(GENERATED_ART_KEYS.includes(art), `Unregistered image ${art}`)
  const filename = new URL(`../src/assets/web/generated/${art}.webp`, import.meta.url)
  assert.ok(existsSync(filename), `Missing image ${art}.webp`)
  const header = readFileSync(filename).subarray(0, 12)
  assert.equal(header.toString('ascii', 0, 4), 'RIFF')
  assert.equal(header.toString('ascii', 8, 12), 'WEBP')
}

const allPages = virtualWebSites.flatMap((site) => site.pages)
const history = allPages.filter((page) => /^\/history\/20(1[6-9]|2[0-5])\//.test(page.path))
assert.equal(history.length, 590, '2016-25 background must remain populated')
assert.ok(allPages.length >= 837, 'custom chronicle articles should be additive')

for(const site of virtualWebSites){
  const pageNames = site.pages.map((page) => page.path)
  assert.equal(new Set(pageNames).size, pageNames.length, `Duplicate page path: ${site.id}`)
  if(site.status !== 'active'){
    assert.ok(site.pages.every((page) => page.publishedAt <= site.lastUpdated), `Inactive site published into the future: ${site.id}`)
  }
}

const samples = ['tohto-news', 'hibi-yohaku', 'q-link', 'minna-bbs', 'asanagi-city', 'web-yougo', 'mono-market', 'madobe-soft']
const firstYear = samples.map((id) => {
  const site = byId.get(id)
  return site.pageByPath.get('/history/2018/report')
})
assert.ok(firstYear.every(Boolean))
assert.equal(new Set(firstYear.map((page) => page.title)).size, samples.length, 'Each publishing style needs a distinct headline')
assert.ok(firstYear.some((page) => page.posts.length >= 4), 'Q&A and forums need real conversations')
assert.ok(firstYear.some((page) => page.blocks.some((block) => block.type === 'dl')), 'Software pages need specification-like content')

console.log(`Town chronicle OK: ${TOWN_CHRONICLE.length} events, ${checked} multi-site reports, ${chronicleArt.size} art assets, ${history.length} background pages`)
