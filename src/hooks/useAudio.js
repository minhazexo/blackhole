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
        
        // Error handling with fallback to cinematic remote track
        musicRef.current.onerror = () => {
          console.warn('videoplayback.mp3 failed to load. Using fallback cinematic track.')
          musicRef.current.src = 'https://assets.mixkit.co/music/preview/mixkit-deep-space-97.mp3'
          musicRef.current.load()
        }
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
          console.warn('Interstellar.mp3 not found or blocked. Falling back to synthetic drone.', err)
        })
      }

      // Maintain the procedural drone as a "thickener" layer
      const oscs = [
        { freq: 40, type: 'sine', gain: 0.04 },
        { freq: 60, type: 'sine', gain: 0.03 },
        { freq: 80, type: 'triangle', gain: 0.02 },
        { freq: 220, type: 'sine', gain: 0.015 }
      ];

      oscs.forEach(cfg => {
        const osc = audioContextRef.current.createOscillator();
        const g = audioContextRef.current.createGain();
        osc.type = cfg.type;
        osc.frequency.setValueAtTime(cfg.freq, currentTime);
        osc.frequency.exponentialRampToValueAtTime(cfg.freq * 0.9, currentTime + 10);
        
        g.gain.setValueAtTime(0, currentTime);
        g.gain.linearRampToValueAtTime(cfg.gain, currentTime + 2);
        
        osc.connect(g);
        g.connect(ambientGainRef.current);
        osc.start(currentTime);
        activeOscillators.current.push(osc);
      });

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

    // Proactive resume for interaction sounds
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }

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
