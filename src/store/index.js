import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    stageKeys: { s1:false, s2:false, s3:false },
    routeUnlocked: false,
    seenBBS: false,
    dmIndex: 0,
    revivalCleared: false,
  }),
  actions: {
    reset(){
      this.stageKeys = { s1:false, s2:false, s3:false }
      this.routeUnlocked = false
      this.seenBBS = false
      this.dmIndex = 0
      this.revivalCleared = false
    }
  }
})
