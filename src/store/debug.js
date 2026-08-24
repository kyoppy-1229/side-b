import { defineStore } from 'pinia'
import { readJson, writeJson } from './storage.js'

export const DEBUG_PREFS_STORAGE_KEY = 'side-b:debug-prefs:v1'

// Commands the console pushes at components that own local (non-persisted)
// progress — today that is the DM thread, whose reveal index lives in ChatApp.
export const DEBUG_CHAT_COMMANDS = Object.freeze({
  RESTART: 'restart',
  STEP: 'step',
  REVEAL: 'reveal'
})

function loadPrefs(){
  const stored = readJson(DEBUG_PREFS_STORAGE_KEY)
  return {
    autoRevealChat: Boolean(stored?.autoRevealChat),
    openSections: stored?.openSections && typeof stored.openSections === 'object' ? stored.openSections : null,
    sidebarOpen: stored?.sidebarOpen !== false,
    viewport: typeof stored?.viewport === 'string' ? stored.viewport : 'fill',
    zoom: Number(stored?.zoom) || 1
  }
}

export const useDebugStore = defineStore('debug', {
  state: () => ({
    ...loadPrefs(),
    chatTick: 0,
    chatCommand: null,
    lastMessage: ''
  }),
  actions: {
    persistPrefs(){
      writeJson(DEBUG_PREFS_STORAGE_KEY, {
        autoRevealChat: this.autoRevealChat,
        openSections: this.openSections,
        sidebarOpen: this.sidebarOpen,
        viewport: this.viewport,
        zoom: this.zoom
      })
    },
    setPref(key, value){
      if(!(key in this.$state)) return false
      this[key] = value
      this.persistPrefs()
      return true
    },
    sendChatCommand(command){
      this.chatCommand = command
      this.chatTick += 1
      return command
    },
    restartChat(){
      return this.sendChatCommand(DEBUG_CHAT_COMMANDS.RESTART)
    },
    stepChat(){
      return this.sendChatCommand(DEBUG_CHAT_COMMANDS.STEP)
    },
    revealChat(){
      return this.sendChatCommand(DEBUG_CHAT_COMMANDS.REVEAL)
    }
  }
})
