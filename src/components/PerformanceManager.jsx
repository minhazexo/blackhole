import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { usePerformanceContext } from '../context/PerformanceContext'

/**
 * PerformanceManager - Collects real-time engine metrics
 * Updates the global PerformanceContext with FPS, Draw Calls, and Triangles.
 */
export default function PerformanceManager() {
  const { gl } = useThree()
  const { updateStats } = usePerformanceContext()
  
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const statsUpdateTimer = useRef(0)

  useFrame(() => {
    frameCount.current++
    
    // Update data every 500ms to avoid over-rendering the HUD
    const now = performance.now()
    if (now - lastTime.current >= 500) {
      const delta = now - lastTime.current
      const fps = Math.round((frameCount.current * 1000) / delta)
      
      // Collect WebGL info
      const info = gl.info
      
      updateStats({
        fps,
        frameTime: (delta / frameCount.current).toFixed(1),
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        points: info.render.points,
        textures: info.memory.textures,
        geometries: info.memory.geometries,
        recommendedQuality: fps > 50 ? 'high' : fps > 30 ? 'medium' : 'low'
      })

      frameCount.current = 0
      lastTime.current = now
    }
  })

  // Also expose to window for manual checks
  useEffect(() => {
    window.performanceManager = {
      getGLInfo: () => gl.info,
      getFPS: () => frameCount.current,
      setQuality: () => {}, // Mocked as quality is handled by App state
      getStats: () => ({ fps: 60, recommendedQuality: 'high' }) // Fallback mock
    }
    return () => { window.performanceManager = null }
  }, [gl])

  return null
}
