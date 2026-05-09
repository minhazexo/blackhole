import { useEffect, useState, useRef } from 'react'
import { getDeviceCapabilities } from '../utils/deviceCapabilities'

/**
 * Performance stats component for displaying FPS, frame time, and memory usage
 * Can be toggled on/off and positioned anywhere on screen
 * Works outside Canvas - receives stats via props from PerformanceContext
 */
export default function PerformanceStats({
  position = 'top-right',
  showMemory = true,
  showDeviceInfo = false,
  showQuality = true,
  compact = false,
  style = {},
  stats: externalStats = null
}) {
  const [stats, setStats] = useState({
    fps: 0,
    frameTime: 0,
    averageFPS: 0,
    minFPS: 0,
    maxFPS: 0,
    droppedFrames: 0,
    memoryUsage: 0,
    rating: 'good',
    recommendedQuality: 'medium',
    drawCalls: 0,
    triangles: 0
  })
  
  const [deviceInfo, setDeviceInfo] = useState(null)
  const [visible, setVisible] = useState(true)

  // Get device info
  useEffect(() => {
    const capabilities = getDeviceCapabilities()
    setDeviceInfo(capabilities.getDeviceInfo())
  }, [])

  // Update stats from external source (PerformanceContext)
  useEffect(() => {
    if (externalStats) {
      setStats(externalStats)
    }
  }, [externalStats])

  // Toggle visibility with 'P' key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'p' || e.key === 'P') {
        setVisible(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Get position styles
  const getPositionStyles = () => {
    const positions = {
      'top-left': { top: '10px', left: '10px' },
      'top-right': { top: '10px', right: '10px' },
      'bottom-left': { bottom: '10px', left: '10px' },
      'bottom-right': { bottom: '10px', right: '10px' },
      'top-center': { top: '10px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-center': { bottom: '10px', left: '50%', transform: 'translateX(-50%)' }
    }
    return positions[position] || positions['top-right']
  }

  // Get rating color
  const getRatingColor = (rating) => {
    const colors = {
      'excellent': '#00ff00',
      'good': '#88ff00',
      'acceptable': '#ffcc00',
      'poor': '#ff8800',
      'critical': '#ff0000'
    }
    return colors[rating] || '#ffffff'
  }

  // Format memory
  const formatMemory = (mb) => {
    if (mb < 1024) return `${mb} MB`
    return `${(mb / 1024).toFixed(1)} GB`
  }

  if (!visible) return null

  const containerStyle = {
    position: 'absolute',
    ...getPositionStyles(),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: compact ? '10px' : '12px',
    padding: compact ? '8px' : '12px',
    borderRadius: '4px',
    zIndex: 1000,
    minWidth: compact ? '120px' : '200px',
    pointerEvents: 'none',
    ...style
  }

  return (
    <div style={containerStyle}>
      {/* FPS Display */}
      <div style={{ marginBottom: '4px' }}>
        <span style={{ color: getRatingColor(stats.rating) }}>
          FPS: {stats.fps}
        </span>
        {!compact && (
          <span style={{ marginLeft: '8px', color: '#888' }}>
            ({stats.averageFPS} avg)
          </span>
        )}
      </div>

      {!compact && (
        <>
          {/* Frame Time */}
          <div style={{ marginBottom: '4px', color: '#00ccff' }}>
            Frame: {stats.frameTime}ms
          </div>

          {/* FPS Range */}
          <div style={{ marginBottom: '4px', color: '#888' }}>
            Min: {stats.minFPS} | Max: {stats.maxFPS}
          </div>

          {/* Dropped Frames */}
          {stats.droppedFrames > 0 && (
            <div style={{ marginBottom: '4px', color: '#ff8800' }}>
              Dropped: {stats.droppedFrames}
            </div>
          )}

          {/* Memory Usage */}
          {showMemory && stats.memoryUsage > 0 && (
            <div style={{ marginBottom: '4px', color: '#ff00ff' }}>
              Memory: {formatMemory(stats.memoryUsage)}
            </div>
          )}

          {/* Draw Calls */}
          <div style={{ marginBottom: '4px', color: '#ffff00' }}>
            Draw Calls: {stats.drawCalls}
          </div>

          {/* Triangles */}
          <div style={{ marginBottom: '4px', color: '#ff8800' }}>
            Triangles: {stats.triangles}
          </div>

          {/* Quality Setting */}
          {showQuality && (
            <div style={{ marginBottom: '4px', color: '#00ffff' }}>
              Quality: {stats.recommendedQuality.toUpperCase()}
            </div>
          )}

          {/* Device Info */}
          {showDeviceInfo && deviceInfo && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #333' }}>
              <div style={{ color: '#888' }}>
                Device: {deviceInfo.deviceType}
              </div>
              <div style={{ color: '#888' }}>
                Tier: {deviceInfo.performanceTier}
              </div>
              <div style={{ color: '#888' }}>
                WebGL2: {deviceInfo.supportsWebGL2 ? 'Yes' : 'No'}
              </div>
            </div>
          )}
        </>
      )}

      {/* Compact mode indicator */}
      {compact && (
        <div style={{ fontSize: '8px', color: '#888', marginTop: '2px' }}>
          Press P to toggle
        </div>
      )}
    </div>
  )
}

/**
 * Minimal FPS counter component
 * Works outside Canvas using requestAnimationFrame
 */
export function FPSCounter({ position = 'top-right' }) {
  const [fps, setFps] = useState(0)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  useEffect(() => {
    const animate = () => {
      frameCountRef.current++
      const now = performance.now()
      const delta = now - lastTimeRef.current

      if (delta >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / delta))
        frameCountRef.current = 0
        lastTimeRef.current = now
      }
      requestAnimationFrame(animate)
    }
    
    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  const containerStyle = {
    position: 'absolute',
    ...(position === 'top-right' ? { top: '10px', right: '10px' } : {}),
    ...(position === 'top-left' ? { top: '10px', left: '10px' } : {}),
    ...(position === 'bottom-right' ? { bottom: '10px', right: '10px' } : {}),
    ...(position === 'bottom-left' ? { bottom: '10px', left: '10px' } : {}),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '2px',
    zIndex: 1000,
    pointerEvents: 'none'
  }

  return (
    <div style={containerStyle}>
      {fps} FPS
    </div>
  )
}
