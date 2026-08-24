// The reunion scene's ambience, and nothing else.
//
// One looping room tone, faded in and out. It is deliberately not a game-wide
// audio engine: the scene owns a single instance, and everything here is either
// loading it, moving its level, or tearing it down.
//
// Playback is best effort. A browser that refuses autoplay, or a device that
// cannot decode the file, must never stop the scene — every entry point resolves
// instead of throwing, and the caller can retry after the first real click.

import ambienceUrl from '../assets/audio/reunion/restaurant_ambience.ogg'

export const REUNION_AMBIENCE_URL = ambienceUrl

// Low enough that the subtitles stay the loudest thing in the room.
export const REUNION_AMBIENCE_VOLUME = 0.24

const TICK_MS = 50
// The recording is a real room, so its head and tail do not line up. Dipping the
// level across the wrap hides the seam without a gap — cheaper and quieter than
// crossfading two elements.
const SEAM_SECONDS = 0.6
const SEAM_FLOOR = 0.35

function clamp01(value){
  if(!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function createReunionAmbience({ src = ambienceUrl, volume = REUNION_AMBIENCE_VOLUME } = {}){
  let element = null
  let ticker = null
  let target = clamp01(volume)   // the level the scene asked for
  let gain = 0                   // where the fade currently is, 0..1
  let ramp = null                // { from, to, startedAt, durationMs, resolve }
  let disposed = false

  function seamGain(){
    if(!element) return 1
    const duration = Number(element.duration)
    const at = Number(element.currentTime)
    if(!Number.isFinite(duration) || duration <= SEAM_SECONDS * 2 || !Number.isFinite(at)) return 1
    const remaining = duration - at
    if(remaining < SEAM_SECONDS) return Math.max(SEAM_FLOOR, remaining / SEAM_SECONDS)
    if(at < SEAM_SECONDS) return Math.max(SEAM_FLOOR, at / SEAM_SECONDS)
    return 1
  }

  function applyVolume(){
    if(!element) return
    try {
      element.volume = clamp01(target * gain * seamGain())
    } catch {
      // Some environments reject volume writes; the scene carries on regardless.
    }
  }

  function stopTicker(){
    if(ticker === null) return
    clearInterval(ticker)
    ticker = null
  }

  function startTicker(){
    if(ticker !== null || typeof setInterval !== 'function') return
    ticker = setInterval(() => {
      if(ramp){
        const elapsed = Date.now() - ramp.startedAt
        const progress = ramp.durationMs > 0 ? clamp01(elapsed / ramp.durationMs) : 1
        gain = ramp.from + (ramp.to - ramp.from) * progress
        if(progress >= 1){
          gain = ramp.to
          const done = ramp.resolve
          ramp = null
          if(done) done()
        }
      }
      applyVolume()
      if(!ramp && gain === 0) stopTicker()
    }, TICK_MS)
  }

  function load(){
    if(disposed) return null
    if(element) return element
    if(typeof Audio !== 'function') return null
    try {
      element = new Audio(src)
      element.loop = true
      element.preload = 'auto'
      element.volume = 0
    } catch {
      element = null
    }
    return element
  }

  function rampTo(to, durationMs){
    return new Promise((resolve) => {
      if(!element || disposed){
        gain = to
        resolve(false)
        return
      }
      if(durationMs <= 0){
        ramp = null
        gain = to
        applyVolume()
        resolve(true)
        return
      }
      ramp = { from: gain, to, startedAt: Date.now(), durationMs, resolve: () => resolve(true) }
      startTicker()
    })
  }

  // Resolves false when the browser refused to start; the caller retries on the
  // next user gesture instead of treating it as an error.
  async function play(){
    if(disposed) return false
    const audio = load()
    if(!audio) return false
    if(!audio.paused) return true
    try {
      const started = audio.play()
      if(started && typeof started.then === 'function') await started
    } catch {
      return false
    }
    applyVolume()
    startTicker()
    return true
  }

  async function fadeIn(durationMs = 1500){
    const started = await play()
    if(!started) return false
    await rampTo(1, durationMs)
    return true
  }

  async function fadeOut(durationMs = 1200){
    if(!element) return false
    await rampTo(0, durationMs)
    pause()
    return true
  }

  function pause(){
    ramp = null
    stopTicker()
    if(!element) return
    try {
      element.pause()
    } catch {
      // Nothing to recover from: the scene keeps running either way.
    }
  }

  function stop(){
    pause()
    gain = 0
    if(!element) return
    try {
      element.currentTime = 0
      element.volume = 0
    } catch {
      // Seeking can fail before metadata loads; harmless here.
    }
  }

  function setVolume(next){
    target = clamp01(next)
    applyVolume()
  }

  function cleanup(){
    disposed = true
    stop()
    if(element){
      try {
        element.src = ''
        element.removeAttribute('src')
        element.load()
      } catch {
        // The element is being dropped anyway.
      }
    }
    element = null
  }

  return {
    load,
    play,
    pause,
    stop,
    fadeIn,
    fadeOut,
    setVolume,
    cleanup,
    get isPlaying(){
      return Boolean(element) && !element.paused
    },
    get volume(){
      return target
    },
    get src(){
      return src
    }
  }
}
