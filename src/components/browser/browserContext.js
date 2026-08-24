import { inject } from 'vue'
import { VIRTUAL_BROWSER_NAME } from '../../virtual-web/constants.js'

export { VIRTUAL_BROWSER_NAME }
export const VIRTUAL_BROWSER_KEY = Symbol('virtual-browser')

export function useVirtualBrowser(){
  const browser = inject(VIRTUAL_BROWSER_KEY, null)

  if(!browser){
    throw new Error('useVirtualBrowser() must be used inside VirtualBrowser')
  }

  return browser
}
