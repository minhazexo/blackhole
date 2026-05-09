import { useRef, useCallback, useEffect, useMemo } from 'react'

export function useAudio() {
  const audioContextRef = useRef(null)
  const ambientGainRef = useRef(null)
  const spatialGainRef = useRef(null)
  const musicRef = useRef(null)
  const isInitializedRef = useRef(false)

  const initializeAudio = useCallback(() => {
    if (isInitializedRef.current) {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }
      return
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioContextRef.current = new AudioContext()

      // Handle suspended state (common in modern browsers)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }

      // Create gain nodes for volume control
      ambientGainRef.current = audioContextRef.current.createGain()
      ambientGainRef.current.gain.value = 0

      spatialGainRef.current = audioContextRef.current.createGain()
      spatialGainRef.current.gain.value = 0

      ambientGainRef.current.connect(audioContextRef.current.destination)
      spatialGainRef.current.connect(audioContextRef.current.destination)

      // Initialize background music element
      if (!musicRef.current) {
        const baseUrl = import.meta.env.BASE_URL || '/'
        musicRef.current = new Audio(`${baseUrl}videoplayback.mp3`)
        musicRef.current.loop = true
        musicRef.current.volume = 0.7 // Increased volume for better presence
      }

      isInitializedRef.current = true
    } catch (error) {
      console.error('Failed to initialize audio:', error)
    }
  }, [])

  const activeOscillators = useRef([])

  const playAmbientSound = useCallback((enabled = true) => {
    if (!audioContextRef.current || !ambientGainRef.current) return

    const currentTime = audioContextRef.current.currentTime

    if (enabled) {
      console.log('Audio: Starting Interstellar soundscape')
      
      // Stop any existing oscillators first
      activeOscillators.current.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      activeOscillators.current = [];

      // Ensure context is running
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }

      // Try to play the background music file
      if (musicRef.current) {
        musicRef.current.play().catch(err => {
          console.warn('videoplayback.mp3 not found or blocked.', err)
        })
      }

      // Fade in ambient
      ambientGainRef.current.gain.setTargetAtTime(1, currentTime, 1.5)
    } else {
      console.log('Audio: Stopping soundscape')
      
      // Stop music
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
      }

      // Fade out ambient
      ambientGainRef.current.gain.setTargetAtTime(0, currentTime, 0.5)
      
      // Stop oscillators after fade
      setTimeout(() => {
        activeOscillators.current.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        activeOscillators.current = [];
      }, 1000);
    }
  }, [])

  const playSpatialSound = useCallback((position, intensity = 1) => {
    // Disabled as per user request: only videoplayback.mp3 allowed.
  }, [])

  const playInteractionSound = useCallback((type = 'click') => {
    // Disabled as per user request: only videoplayback.mp3 allowed.
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

  return useMemo(() => ({
    initializeAudio,
    playAmbientSound,
    playSpatialSound,
    playInteractionSound,
    setVolume,
    cleanup,
    isInitialized: isInitializedRef.current
  }), [initializeAudio, playAmbientSound, playSpatialSound, playInteractionSound, setVolume, cleanup])
}
