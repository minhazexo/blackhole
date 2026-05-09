import * as THREE from 'three'

// Audio utility functions for spatial audio positioning

export function createAudioListener(camera) {
  const listener = new THREE.AudioListener()
  camera.add(listener)
  return listener
}

export function createPositionalAudio(listener, url, loop = false) {
  const audio = new THREE.PositionalAudio(listener)
  const loader = new THREE.AudioLoader()

  loader.load(url, (buffer) => {
    audio.setBuffer(buffer)
    audio.setLoop(loop)
    audio.setRefDistance(1)
    audio.setMaxDistance(100)
    audio.setRolloffFactor(1)
  })

  return audio
}

export function createAmbientAudio(listener, url, loop = true) {
  const audio = new THREE.Audio(listener)
  const loader = new THREE.AudioLoader()

  loader.load(url, (buffer) => {
    audio.setBuffer(buffer)
    audio.setLoop(loop)
    audio.setVolume(0.3)
  })

  return audio
}

export function playSpatialSoundAtPosition(audio, position, volume = 1) {
  audio.position.copy(position)
  audio.setVolume(volume)
  audio.play()
}

export function stopAudio(audio) {
  if (audio.isPlaying) {
    audio.stop()
  }
}

export function fadeAudio(audio, targetVolume, duration = 1) {
  const startVolume = audio.getVolume()
  const startTime = performance.now()

  function animateFade() {
    const elapsed = (performance.now() - startTime) / 1000
    const progress = Math.min(elapsed / duration, 1)

    const currentVolume = startVolume + (targetVolume - startVolume) * progress
    audio.setVolume(currentVolume)

    if (progress < 1) {
      requestAnimationFrame(animateFade)
    }
  }

  animateFade()
}

// Generate procedural space sounds using Web Audio API
export function generateSpaceDrone() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const ctx = new AudioContext()

  // Create multiple oscillators for rich drone sound
  const oscillators = []
  const gains = []

  const frequencies = [40, 60, 80, 120]
  const volumes = [0.02, 0.015, 0.01, 0.005]

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = i % 2 === 0 ? 'sine' : 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(volumes[i], ctx.currentTime + 2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)

    oscillators.push(osc)
    gains.push(gain)
  })

  return {
    ctx,
    oscillators,
    gains,
    stop: () => {
      gains.forEach((gain) => {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1)
      })
      setTimeout(() => {
        oscillators.forEach((osc) => osc.stop())
        ctx.close()
      }, 1200)
    }
  }
}

export function generateWhooshSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const ctx = new AudioContext()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(200, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5)

  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.5)

  return { ctx, osc, gain }
}

export function generatePulseSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const ctx = new AudioContext()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(100, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3)

  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.3)

  return { ctx, osc, gain }
}
