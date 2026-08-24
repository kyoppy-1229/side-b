// The two machines the prologue is about, named once.
//
// The setup scene migrates from the old one to the new one and the chat app then
// says which machine it is running on; both read these names so the two screens
// can never disagree about what the player is sitting in front of.

export const OLD_DEVICE = Object.freeze({
  id: 'RE-7',
  label: '旧PC / RE-7',
  full: 'RE-7（旧PC）'
})

export const NEW_DEVICE = Object.freeze({
  id: 'RE-12',
  label: 'このPC / RE-12',
  full: 'RE-12（このPC）'
})
