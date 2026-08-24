// The single sound the chat makes: a new message arriving.
//
// Two short sine tones from the Web Audio API rather than an asset — the cue is
// half a second long and has to stay quiet enough to sit under the UI, which is
// not worth another file in the bundle.
//
// Playback is best effort in exactly the same sense as the reunion ambience: a
// browser without Web Audio, or one that has not been unlocked by a click yet,
// simply gets no sound. Nothing here ever throws at the caller.

const NOTES = Object.freeze([
  Object.freeze({ frequency: 880, at: 0, duration: 0.14 }),
  Object.freeze({ frequency: 1174.66, at: 0.11, duration: 0.22 })
])

// Well below the ambience: a notification, not an alert.
const PEAK_GAIN = 0.06

function audioContextClass(){
  if(typeof window === 'undefined') return null
  return window.AudioContext || window.webkitAudioContext || null
}

export function playChatNotification(){
  const Context = audioContextClass()
  if(!Context) return false

  let context = null
  try {
    context = new Context()
    // The player has clicked to sign in by the time this runs, so the context is
    // normally allowed to start; resume() is here for the cases where it is not.
    context.resume?.().catch(() => {})

    const startedAt = context.currentTime + 0.01
    for(const note of NOTES){
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const from = startedAt + note.at
      const to = from + note.duration

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(note.frequency, from)
      gain.gain.setValueAtTime(0, from)
      gain.gain.linearRampToValueAtTime(PEAK_GAIN, from + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, to)

      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(from)
      oscillator.stop(to)
    }

    // The context is single-use: it closes itself once the tail has played, so
    // nothing is left holding an audio device open.
    const total = Math.max(...NOTES.map((note) => note.at + note.duration)) + 0.1
    setTimeout(() => { context?.close?.().catch(() => {}) }, Math.ceil(total * 1000))
    return true
  } catch {
    try { context?.close?.() } catch { /* nothing left to do */ }
    return false
  }
}
