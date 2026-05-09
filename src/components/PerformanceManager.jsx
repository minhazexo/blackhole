import { useEffect } from 'react'

/**
 * PerformanceManager - Simple placeholder without complex hooks
 * to avoid Canvas context issues
 */
export default function PerformanceManager({ options = {} }) {
  // Expose minimal methods to window
  useEffect(() => {
    window.performanceManager = {
      getStats: () => ({ fps: 60, recommendedQuality: 'medium' }),
      getQuality: () => 'medium',
      setQuality: () => {}
    }
    return () => {
      window.performanceManager = null
    }
  }, [])

  return null
}
