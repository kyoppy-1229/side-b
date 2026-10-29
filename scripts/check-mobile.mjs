import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const checks = [
  ['iPhone safe-area viewport', 'index.html', /viewport-fit=cover/],
  ['viewport height tracks keyboard', 'src/components/browser/VirtualBrowser.vue', /visualViewport\?\.addEventListener\('resize', syncVisibleViewport\)/],
  ['browser has no fixed mobile minimum height', 'src/components/browser/VirtualBrowser.vue', /height:var\(--browser-visible-height,100dvh\)/],
  ['browser scroll stays in page panel', 'src/components/browser/VirtualBrowser.vue', /overscroll-behavior:contain/],
  ['touch movement starts on pointer down', 'src/components/game/SceneStage.vue', /@pointerdown\.prevent="startTouchDirection/],
  ['touch movement ends when cancelled', 'src/components/game/SceneStage.vue', /@pointercancel="endTouchDirection/],
  ['touch interaction is available', 'src/components/game/SceneStage.vue', /class="scene-touch-action"/],
  ['movement responds to touch directions', 'src/components/game/SceneStage.vue', /touchDirections\.values\(\)/],
  ['portrait camera keeps characters legible', 'src/components/game/SceneStage.vue', /const portraitFloor = vw <= 720/],
  ['search suggestions accept touch', 'src/components/search/TraceSearch.vue', /@pointerdown\.prevent="searchSuggestion/],
  ['keyboard avoids address auto zoom', 'src/components/browser/BrowserAddressBar.vue', /\.address-input\{\s*font-size:16px;/],
  ['mobile interviews use swipeable roster', 'src/components/pages/InvestigationPage.vue', /\.case-roster__list\{[^}]*overflow-x:auto/],
  ['terminal input stays visible under output', 'src/components/pages/InvestigationPage.vue', /class="case-console__output"/],
  ['chat has phone navigation', 'src/components/chat/ChatApp.vue', /class="chat-mobile-nav"/],
  ['virtual articles have mobile styling', 'src/assets/web/base.css', /\.web-nav__list\{flex-wrap:nowrap;overflow-x:auto/]
]

for(const [label, path, pattern] of checks){
  assert.match(read(path), pattern, label)
  console.log(`✓ ${label}`)
}

console.log(`Mobile interaction contracts: ${checks.length} passed`)
