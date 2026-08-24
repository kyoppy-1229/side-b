// The protagonist's identity, in one place.
//
// Two different things are called "主人公" in this project and they must not be
// confused: the *speaker id* the scripts use to mark a line as the player's
// (data/dm_prologue.json, data/reunion_prologue.json), and the *display name*
// the player can change from the chat home. The id is internal and never
// changes; the name is save data and belongs to the story state.
//
// No assets are imported here on purpose: the node check scripts load this
// module directly. The picture lives in components/chat/avatars.js.

export const DEFAULT_PLAYER_NAME = '主人公'

// Long enough for a full Japanese name, short enough that a conversation row,
// a bubble label and the profile card all still fit.
export const PLAYER_NAME_MAX_LENGTH = 20

// What a script line means by "this one is the player's".
export const PLAYER_SPEAKER_ID = '主人公'

export function isPlayerSpeaker(speaker){
  return speaker === PLAYER_SPEAKER_ID
}

// Trims, flattens every kind of whitespace and caps the length by code point.
// Returns '' for anything unusable, which is what the callers treat as "do not
// save this".
export function sanitizePlayerName(value){
  if(typeof value !== 'string') return ''
  const flattened = value.replace(/\s+/g, ' ').trim()
  if(!flattened) return ''
  return Array.from(flattened).slice(0, PLAYER_NAME_MAX_LENGTH).join('')
}

export function playerNameLength(value){
  return typeof value === 'string' ? Array.from(value.trim()).length : 0
}

// The name as it is shown. A missing, empty or damaged stored value reads as the
// default rather than leaving the player nameless.
export function resolvePlayerName(value){
  return sanitizePlayerName(value) || DEFAULT_PLAYER_NAME
}
