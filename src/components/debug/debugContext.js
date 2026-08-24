import { inject, provide } from 'vue'

// The console shell hands its panels the sandbox stores plus a few shell
// services (status line, section open/close, stage remount).
export const DEBUG_CONSOLE_KEY = Symbol('side-b:debug-console')

export function provideDebugConsole(api){
  provide(DEBUG_CONSOLE_KEY, api)
}

export function useDebugConsole(){
  const api = inject(DEBUG_CONSOLE_KEY, null)
  if(!api) throw new Error('debug panels must live inside the debug console shell')
  return api
}
