import { useRef, useCallback, useEffect } from 'react'

export function useAudio() {
  const audioContextRef = useRef(null)
  const ambientGainRef = useRef(null)
  const spatialGainRef = useRef(null)
  const isInitializedRef = useRef(false)

  const initializeAudio = useCallback(() => {
    if (isInitializedRef.current) return

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioContextRef.current = new AudioContext()

      // Create gain nodes for volume control
      ambientGainRef.current = audioContextRef.current.createGain()
      ambientGainRef.current.gain.value = 0

      spatialGainRef.current = audioContextRef.current.createGain()
      spatialGainRef.current.gain.value = 0

      // Connect to destination
      ambientGainRef.current.connect(audioContextRef.current.destination)
      spatialGainRef.current.connect(audioContextRef.current.destination)

      isInitializedRef.current = true
    } catch (error) {
      console.error('Failed to initialize audio:', error)
    }
  }, [])

  const playAmbientSound = useCallback((enabled = true) => {
    if (!audioContextRef.current || !ambientGainRef.current) return

    const currentTime = audioContextRef.current.currentTime

    if (enabled) {
      // Create deep space drone
      const oscillator1 = audioContextRef.current.createOscillator()
      const oscillator2 = audioContextRef.current.createOscillator()
      const oscillator3 = audioContextRef.current.createOscillator()

      oscillator1.type = 'sine'
      oscillator1.frequency.setValueAtTime(40, currentTime)
      oscillator1.frequency.exponentialRampToValueAtTime(35, currentTime + 10)

      oscillator2.type = 'sine'
      oscillator2.frequency.setValueAtTime(60, currentTime)
      oscillator2.frequency.exponentialRampToValueAtTime(55, currentTime + 15)

      oscillator3.type = 'triangle'
      oscillator3.frequency.setValueAtTime(80, currentTime)
      oscillator3.frequency.exponentialRampToValueAtTime(75, currentTime + 20)

      const gain1 = audioContextRef.current.createGain()
      const gain2 = audioContextRef.current.createGain()
      const gain3 = audioContextRef.current.createGain()

      gain1.gain.setValueAtTime(0, currentTime)
      gain1.gain.linearRampToValueAtTime(0.02, currentTime + 2)

      gain2.gain.setValueAtTime(0, currentTime)
      gain2.gain.linearRampToValueAtTime(0.015, currentTime + 3)

      gain3.gain.setValueAtTime(0, currentTime)
      gain3.gain.linearRampToValueAtTime(0.01, currentTime + 4)

      oscillator1.connect(gain1)
      oscillator2.connect(gain2)
      oscillator3.connect(gain3)

      gain1.connect(ambientGainRef.current)
      gain2.connect(ambientGainRef.current)
      gain3.connect(ambientGainRef.current)

      oscillator1.start(currentTime)
      oscillator2.start(currentTime)
      oscillator3.start(currentTime)

      // Fade in ambient
      ambientGainRef.current.gain.linearRampToValueAtTime(1, currentTime + 3)
    } else {
      // Fade out ambient
      ambientGainRef.current.gain.linearRampToValueAtTime(0, currentTime + 1)
    }
  }, [])

  const playSpatialSound = useCallback((position, intensity = 1) => {
    if (!audioContextRef.current || !spatialGainRef.current) return

    const currentTime = audioContextRef.current.currentTime

    // Create spatial whoosh effect
    const oscillator = audioContextRef.current.createOscillator()
    const gain = audioContextRef.current.createGain()
    const panner = audioContextRef.current.createStereoPanner()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(200 + Math.random() * 100, currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, currentTime + 0.5)

    gain.gain.setValueAtTime(0, currentTime)
    gain.gain.linearRampToValueAtTime(0.05 * intensity, currentTime + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.5)

    // Pan based on position
    panner.pan.setValueAtTime(position.x * 0.5, currentTime)

    oscillator.connect(gain)
    gain.connect(panner)
    panner.connect(spatialGainRef.current)

    oscillator.start(currentTime)
    oscillator.stop(currentTime + 0.5)
  }, [])

  const playInteractionSound = useCallback((type = 'click') => {
    if (!audioContextRef.current || !spatialGainRef.current) return

    const currentTime = audioContextRef.current.currentTime

    const oscillator = audioContextRef.current.createOscillator()
    const gain = audioContextRef.current.createGain()

    if (type === 'click') {
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, currentTime + 0.1)
      gain.gain.setValueAtTime(0.03, currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1)
    } else if (type === 'hover') {
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(600, currentTime)
      gain.gain.setValueAtTime(0.01, currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.05)
    } else if (type === 'pulse') {
      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(100, currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(50, currentTime + 0.3)
      gain.gain.setValueAtTime(0.02, currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3)
    }

    oscillator.connect(gain)
    gain.connect(spatialGainRef.current)

    oscillator.start(currentTime)
    oscillator.stop(currentTime + 0.3)
  }, [])

  const setVolume = useCallback((ambient = 1, spatial = 1) => {
    if (ambientGainRef.current) {
      ambientGainRef.current.gain.linearRampToValueAtTime(
        ambient,
        audioContextRef.current.currentTime + 0.1
      )
    }
    if (spatialGainRef.current) {
      spatialGainRef.current.gain.linearRampToValueAtTime(
        spatial,
        audioContextRef.current.currentTime + 0.1
      )
    }
  }, [])

  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
      isInitializedRef.current = false
    }
  }, [])

  return {
    initializeAudio,
    playAmbientSound,
    playSpatialSound,
    playInteractionSound,
    setVolume,
    cleanup,
    isInitialized: isInitializedRef.current
  }
}
