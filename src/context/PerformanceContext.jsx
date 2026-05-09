import { createContext, useContext, useState, useCallback } from 'react'

const PerformanceContext = createContext(null)

export function PerformanceProvider({ children }) {
  const [stats, setStats] = useState({
    fps: 0,
    frameTime: 0,
    memory: { used: 0, total: 0, limit: 0 },
    recommendedQuality: 'high',
    isBelowTarget: false
  })
  const [quality, setQuality] = useState('high')

  const updateStats = useCallback((newStats) => {
    setStats(newStats)
  }, [])

  const updateQuality = useCallback((newQuality) => {
    setQuality(newQuality)
  }, [])

  return (
    <PerformanceContext.Provider value={{ stats, quality, updateStats, updateQuality }}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformanceContext() {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformanceContext must be used within PerformanceProvider')
  }
  return context
}
