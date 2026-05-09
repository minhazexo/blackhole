import { useState, useCallback, useRef } from 'react'

export function useGravitationalIntensity(initialIntensity = 1) {
  const [intensity, setIntensity] = useState(initialIntensity)
  const [isHighIntensity, setIsHighIntensity] = useState(false)
  const targetIntensityRef = useRef(initialIntensity)
  const currentIntensityRef = useRef(initialIntensity)

  const increaseIntensity = useCallback(() => {
    setIsHighIntensity(true)
    targetIntensityRef.current = 2.5
  }, [])

  const decreaseIntensity = useCallback(() => {
    setIsHighIntensity(false)
    targetIntensityRef.current = 1.0
  }, [])

  const toggleIntensity = useCallback(() => {
    if (isHighIntensity) {
      decreaseIntensity()
    } else {
      increaseIntensity()
    }
  }, [isHighIntensity, increaseIntensity, decreaseIntensity])

  const setCustomIntensity = useCallback((value) => {
    targetIntensityRef.current = Math.max(0.5, Math.min(3.0, value))
    setIsHighIntensity(targetIntensityRef.current > 1.5)
  }, [])

  return {
    intensity,
    isHighIntensity,
    increaseIntensity,
    decreaseIntensity,
    toggleIntensity,
    setCustomIntensity,
    targetIntensityRef,
    currentIntensityRef
  }
}
