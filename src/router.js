import { createRouter, createWebHashHistory } from 'vue-router'
import { VIRTUAL_URLS } from './virtual-web/constants.js'
import BrowserWorkspace from './views/BrowserWorkspace.vue'
import { DEBUG_STORAGE_SCOPE, isDebugPath, requestBoot } from './debug/scope.js'
import { TRIAL_STORAGE_SCOPE, isTrialPath } from './trial/mode.js'

// The debug console is available in every build (including the deployed
// GitHub Pages one) so the whole game can be inspected from #/debug.
const debugRoutes = [
  {
    path: '/debug',
    name: 'game-debug',
    component: () => import('./views/GameDebugView.vue'),
    meta: { debugOnly: true }
  },
  {
    path: '/__debug/game',
    name: 'game-debug-legacy',
    component: () => import('./views/GameDebugView.vue'),
    meta: { debugOnly: true }
  }
]

const routes = [
  { path: '/', name: 'browser', component: BrowserWorkspace, meta: { browserShell: true } },
  // The trial. Same shell, same screens; what differs is the game mode and the
  // storage scope both picked at boot (see trial/mode.js and boot.js), so this
  // route needs nothing of its own beyond existing.
  { path: '/trial', name: 'trial', component: BrowserWorkspace, meta: { browserShell: true, trial: true } },
  {
    path: '/bbs',
    name: 'bbs',
    component: BrowserWorkspace,
    meta: { browserShell: true, virtualUrl: VIRTUAL_URLS.BBS_THREAD }
  },
  {
    path: '/news/20150302-17.html',
    name: 'news-20150302-17',
    component: BrowserWorkspace,
    meta: { browserShell: true, virtualUrl: VIRTUAL_URLS.NEWS_20150302 }
  },
  {
    path: '/revival',
    name: 'game-revival',
    component: BrowserWorkspace,
    meta: { browserShell: true, virtualUrl: VIRTUAL_URLS.GAME_REVIVAL }
  },
  {
    path: '/original',
    name: 'game-original',
    component: BrowserWorkspace,
    meta: { browserShell: true, virtualUrl: VIRTUAL_URLS.GAME_ORIGINAL }
  },
  {
    path: '/initial',
    name: 'game-initial-alias',
    component: BrowserWorkspace,
    meta: { browserShell: true, virtualUrl: VIRTUAL_URLS.GAME_ORIGINAL }
  },
  ...debugRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(){ return { top: 0 } }
})

// Which namespace a route saves into. Kept next to the guard below because that
// is the only thing it is for: boot.js decides the live scope from the URL.
function storageScopeForPath(path){
  if(isDebugPath(path)) return DEBUG_STORAGE_SCOPE
  if(isTrialPath(path)) return TRIAL_STORAGE_SCOPE
  return ''
}

// The storage scope is picked once at boot (see main.js), so walking in or out of
// the debug console — or of the trial — has to reboot the app instead of
// navigating in place; otherwise the console or the trial would keep writing into
// the real game's save data.
router.beforeEach((to, from) => {
  if(typeof window === 'undefined' || !from.matched.length) return true
  if(storageScopeForPath(to.path) === storageScopeForPath(from.path)) return true
  // Park the destination and reload: boot.js puts it back in the URL and picks
  // the matching storage scope. Aborting here also rewinds the hash, which is
  // why the target cannot simply be left in the URL.
  requestBoot(to.fullPath)
  window.location.reload()
  return false
})

export default router
