import { useState, useEffect, useCallback } from 'react'
import { useAudio } from '../hooks/useAudio'

export default function SoundToggle({ onToggle }) {
  const [enabled, setEnabled] = useState(false)
  const { initializeAudio, playAmbientSound, setVolume, cleanup } = useAudio()

  const toggleSound = useCallback(() => {
    if (!enabled) {
      // Initialize and enable audio
      initializeAudio()
      playAmbientSound(true)
      setEnabled(true)
    } else {
      // Disable audio
      playAmbientSound(false)
      setEnabled(false)
    }
    
    // Notify parent component
    if (onToggle) {
      onToggle(!enabled)
    }
  }, [enabled, initializeAudio, playAmbientSound, onToggle])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enabled) {
        cleanup()
      }
    }
  }, [enabled, cleanup])

  // This component doesn't render anything visible
  // It's controlled by the UI component
  return null
}
