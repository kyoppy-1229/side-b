import { inject } from 'vue'

// Context every virtual-site component reads: which site is rendering, how to
// turn a site-relative path into a virtual URL, and how to navigate (same tab)
// or open (new tab) inside the SIDE-B browser. Story-only pages may also ask
// the browser shell to return to Messages after the player finishes reading.
export const WEB_SITE_KEY = Symbol('virtual-web-site')

export function useWebSite(){
  const context = inject(WEB_SITE_KEY, null)
  if(!context) throw new Error('useWebSite() must be used inside WebSitePage')
  return context
}
