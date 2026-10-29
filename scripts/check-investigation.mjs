import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { ARCHIVE_FILES, ALIBI_IDS, FINAL_FILES, SUSPECTS, evaluateCase } from '../src/investigation/data.js'
import { runArchiveCommand } from '../src/investigation/terminal.js'
import { virtualWebSites } from '../src/virtual-web/sites/index.js'
import { resolveVirtualUrl } from '../src/virtual-web/registry.js'
import { VIRTUAL_PAGE_TYPES, VIRTUAL_URLS } from '../src/virtual-web/constants.js'
import { TRIAL_BLOCKED_URLS } from '../src/trial/restrictions.js'

assert.equal(SUSPECTS.length, 9, '9 classmates need interviews')
assert.equal(new Set(SUSPECTS.map((person) => person.id)).size, 9)
assert.equal(ALIBI_IDS.length, 8, '8 alibis should eliminate 8 people')
assert.ok(SUSPECTS.some((person) => person.id === 'mizuno' && !person.file))

assert.match(runArchiveCommand('help').output, /FINDSTR/)
assert.match(runArchiveCommand('dir').output, /ACCESS.LOG/)
assert.equal(runArchiveCommand('type ACCESS.LOG').file, 'ACCESS.LOG')
assert.equal(runArchiveCommand('type C:\\ARCHIVE\\20150301\\SHOP.TXT').file, 'SHOP.TXT')
assert.match(runArchiveCommand('findstr "PC-17" ACCESS.LOG').output, /PC-17/)
assert.match(runArchiveCommand('fc ACCESS.LOG SESSION.LOG').output, /比較対象/)
assert.match(runArchiveCommand('totally-unknown').output, /使用できません/)

const interviewed = SUSPECTS.map((person) => person.id)
const allFiles = Object.keys(ARCHIVE_FILES)
assert.equal(evaluateCase(interviewed, allFiles, ALIBI_IDS).ready, true)
assert.equal(evaluateCase(interviewed, allFiles, ALIBI_IDS).remaining[0].id, 'mizuno')
assert.equal(evaluateCase(interviewed.slice(1), allFiles, ALIBI_IDS).ready, false)
assert.equal(evaluateCase(interviewed, allFiles.filter((file) => file !== FINAL_FILES[0]), ALIBI_IDS).ready, false)
assert.equal(evaluateCase(interviewed, allFiles, ALIBI_IDS.slice(1)).ready, false)

assert.equal(resolveVirtualUrl(VIRTUAL_URLS.SCHOOL_TERMINAL).pageType, VIRTUAL_PAGE_TYPES.SCHOOL_TERMINAL)
assert.ok(TRIAL_BLOCKED_URLS.includes(VIRTUAL_URLS.SCHOOL_TERMINAL))
const investigationSource = readFileSync(new URL('../src/components/pages/InvestigationPage.vue', import.meta.url), 'utf8')
assert.match(investigationSource, /hasReached\(STORY_CHAPTERS.CH8_TEN_PEOPLE\)/)
assert.match(investigationSource, /isTrialMode\(\)/)

const allPages = virtualWebSites.flatMap((site) => site.pages)
assert.ok(allPages.length >= 800, 'decade-long archive must have substantial content')
for(const site of virtualWebSites){
  const paths = new Set(site.pages.map((page) => page.path))
  assert.equal(paths.size, site.pages.length, `duplicate paths on ${site.id}`)
  if(site.status === 'closed'){
    assert.ok(site.pages.every((page) => page.publishedAt <= site.closedAt), `${site.id} publishes after closure`)
  }
}
const guidePages = allPages.filter((page) => /command-prompt-basics|searching-text-records|log-retention-comparison|compare-text-files|old-terminal-help|archive-date-check/.test(page.path))
assert.equal(guidePages.length, 6)
for(let year = 2016; year <= 2025; year++){
  const name = {
    2016: 'pc-tablet', 2017: 'shopping-street', 2018: 'web-design', 2019: 'rail-station',
    2020: 'home-learning', 2021: 'community-event', 2022: 'retro-game-desk',
    2023: 'town-cafe', 2024: 'data-archive', 2025: 'current-city'
  }[year]
  const art = `web-${year}-${name}`
  assert.ok(existsSync(new URL(`../src/assets/web/generated/${art}.webp`, import.meta.url)), `missing ${art}`)
  assert.ok(allPages.some((page) => page.art === art), `unused ${art}`)
}

console.log(`Investigation OK: ${SUSPECTS.length} interviews, ${ALIBI_IDS.length} alibis, ${allFiles.length} files, ${allPages.length} web pages, ${guidePages.length} scattered guides, 10 new art assets`)
