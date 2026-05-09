import { useState, useCallback } from 'react'

/**
 * SoundToggle Component
 * Logic-only component that handles sound state notifications.
 * The actual audio context is managed in App.jsx.
 */
export default function SoundToggle({ onToggle }) {
  const [enabled, setEnabled] = useState(false)

  // This function is kept for legacy compatibility if called directly
  // though the main control now happens via the UI.jsx component.
  const toggleSound = useCallback(() => {
    const newState = !enabled
    setEnabled(newState)
    
    if (onToggle) {
      onToggle(newState)
    }
  }, [enabled, onToggle])

  return null
}
