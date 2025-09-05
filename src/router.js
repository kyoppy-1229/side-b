import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'
import GameRevivalPixi from './views/GameRevivalPixi.vue'
import GameInitialPixi from './views/GameInitialPixi.vue'
import BBSView from './views/BBSView.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/revival', name: 'revival', component: GameRevivalPixi },
  { path: '/initial', name: 'initial', component: GameInitialPixi },
  { path: '/bbs', name: 'bbs', component: BBSView },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(){ return { top: 0 } }
})

export default router
