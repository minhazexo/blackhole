import { useState, useCallback, useRef, useEffect } from 'react'

export function useGravitationalIntensity(initialLevelIdx = 1) {
  const intensityLevels = [0.5, 1.0, 2.0, 3.5, 5.0]
  const levelNames = ['MINIMAL', 'LOW', 'STABLE', 'HIGH', 'CRITICAL']
  
  const [levelIdx, setLevelIdx] = useState(initialLevelIdx)
  const [intensity, setIntensity] = useState(intensityLevels[initialLevelIdx])
  
  const targetIntensityRef = useRef(intensityLevels[initialLevelIdx])
  const currentIntensityRef = useRef(intensityLevels[initialLevelIdx])

  // Smoothly update the intensity state
  useEffect(() => {
    let animationFrame;
    const update = () => {
      const delta = (targetIntensityRef.current - currentIntensityRef.current) * 0.08
      if (Math.abs(delta) > 0.0001) {
        currentIntensityRef.current += delta
        setIntensity(currentIntensityRef.current)
      }
      animationFrame = requestAnimationFrame(update)
    }
    animationFrame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  const cycleIntensity = useCallback(() => {
    const nextIdx = (levelIdx + 1) % intensityLevels.length
    setLevelIdx(nextIdx)
    targetIntensityRef.current = intensityLevels[nextIdx]
  }, [levelIdx, intensityLevels.length])

  const setLevel = useCallback((idx) => {
    if (idx >= 0 && idx < intensityLevels.length) {
      setLevelIdx(idx)
      targetIntensityRef.current = intensityLevels[idx]
    }
  }, [intensityLevels.length])

  return {
    intensity,
    levelIdx,
    levelName: levelNames[levelIdx],
    isHighIntensity: levelIdx >= 3,
    cycleIntensity,
    setLevel,
    targetIntensityRef,
    currentIntensityRef
  }
}
