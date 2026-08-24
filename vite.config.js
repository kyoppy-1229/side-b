import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Print the debug console URL (#/debug) right after Vite prints its own URLs
// so `npm run dev` shows where to open the whole-game debug page.
function printDebugUrl(){
  return {
    name: 'print-debug-url',
    configureServer(server){
      const original = server.printUrls
      server.printUrls = () => {
        original()
        const base = (server.resolvedUrls?.local?.[0]) || `http://localhost:${server.config.server.port || 5173}${server.config.base}`
        const debugUrl = `${base.replace(/\/$/, '')}/#/debug`
        const c = server.config.logger
        c.info('')
        c.info(`  \x1b[32m➜\x1b[0m  \x1b[1mDebug\x1b[22m:   \x1b[36m${debugUrl}\x1b[0m`)
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), printDebugUrl()],
  base: '/side-b/',
  build: {
    rollupOptions: {
      output: {
        // The general virtual web is a large body of static data plus its own
        // set of templates. Splitting it off keeps the app chunk small and lets
        // the browser cache the site data separately from the game code.
        manualChunks(id){
          if(id.includes('/src/virtual-web/sites/') || id.includes('/src/virtual-web/art/')) return 'virtual-web-data'
          if(id.includes('/src/components/web/')) return 'virtual-web-ui'
          return null
        }
      }
    }
  },
  optimizeDeps: {
    entries: ['index.html']
  }
})
