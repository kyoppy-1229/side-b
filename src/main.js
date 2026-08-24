// Must stay first: it fixes the URL and the storage scope before the router and
// the stores are evaluated.
import './boot.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './assets/styles.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
