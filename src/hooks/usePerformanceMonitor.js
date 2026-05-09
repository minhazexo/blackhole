import { useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { createPerformanceMonitor, getMemoryUsage } from '../utils/performance'
import { getDeviceCapabilities } from '../utils/deviceCapabilities'

/**
 * Performance monitoring hook for tracking FPS, frame time, and memory usage
 * Provides adaptive quality settings based on performance
 */
export function usePerformanceMonitor(options = {}) {
  const {
    enabled = true,
    targetFPS = 60,
    onPerformanceUpdate = null,
    onQualityChange = null,
    autoAdjustQuality = true,
    adjustmentInterval = 5000 // Check every 5 seconds
  } = options

  const monitorRef = useRef(null)
  const lastAdjustmentRef = useRef(0)
  const currentQualityRef = useRef('high')
  const deviceCapabilities = useRef(getDeviceCapabilities())

  // Initialize performance monitor
  useEffect(() => {
    if (!enabled) return

    monitorRef.current = createPerformanceMonitor()
    monitorRef.current.metrics.targetFPS = targetFPS

    // Set initial quality based on device
    const initialQuality = deviceCapabilities.current?.qualitySettings?.tier || 'medium'
    currentQualityRef.current = initialQuality

    if (onQualityChange) {
      onQualityChange(initialQuality)
    }

    return () => {
      monitorRef.current = null
    }
  }, [enabled, targetFPS, onQualityChange])

  // Update performance metrics every frame
  useFrame(() => {
    if (!enabled || !monitorRef.current) return

    monitorRef.current.update()

    // Notify performance updates
    if (onPerformanceUpdate) {
      onPerformanceUpdate(monitorRef.current.getStats())
    }
  })

  // Auto-adjust quality based on performance
  const adjustQuality = useCallback(() => {
    if (!enabled || !autoAdjustQuality || !monitorRef.current) return

    const now = Date.now()
    if (now - lastAdjustmentRef.current < adjustmentInterval) return

    const stats = monitorRef.current.getStats()
    const recommendedQuality = stats.recommendedQuality

    // Only adjust if quality should change
    if (recommendedQuality !== currentQualityRef.current) {
      currentQualityRef.current = recommendedQuality
      lastAdjustmentRef.current = now

      if (onQualityChange) {
        onQualityChange(recommendedQuality)
      }
    }
  }, [enabled, autoAdjustQuality, adjustmentInterval, onQualityChange])

  // Periodically check and adjust quality
  useEffect(() => {
    if (!enabled || !autoAdjustQuality) return

    const interval = setInterval(adjustQuality, adjustmentInterval)
    return () => clearInterval(interval)
  }, [enabled, autoAdjustQuality, adjustmentInterval, adjustQuality])

  /**
   * Get current performance statistics
   */
  const getStats = useCallback(() => {
    if (!monitorRef.current) return null
    return monitorRef.current.getStats()
  }, [])

  /**
   * Get current quality setting
   */
  const getQuality = useCallback(() => {
    return currentQualityRef.current
  }, [])

  /**
   * Manually set quality
   */
  const setQuality = useCallback((quality) => {
    currentQualityRef.current = quality
    if (onQualityChange) {
      onQualityChange(quality)
    }
  }, [onQualityChange])

  /**
   * Reset performance monitor
   */
  const reset = useCallback(() => {
    if (monitorRef.current) {
      monitorRef.current.reset()
    }
  }, [])

  /**
   * Get device capabilities
   */
  const getDeviceInfo = useCallback(() => {
    return deviceCapabilities.current?.getDeviceInfo?.() || {
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      performanceTier: 'medium',
      memory: { limit: 2048, total: 1024, used: 0 },
      gpu: { vendor: 'Unknown', renderer: 'Unknown', maxTextureSize: 4096 },
      supportsWebGL2: true,
      pixelRatio: 1,
      qualitySettings: { particleCount: 1500, dustCount: 2500, starCount: 3000, tier: 'medium' }
    }
  }, [])

  /**
   * Get quality settings for current device
   */
  const getQualitySettings = useCallback(() => {
    return deviceCapabilities.current?.qualitySettings || {
      particleCount: 1500,
      dustCount: 2500,
      starCount: 3000,
      tier: 'medium'
    }
  }, [])

  /**
   * Check if performance is below target
   */
  const isBelowTarget = useCallback(() => {
    if (!monitorRef.current) return false
    return monitorRef.current.isBelowTarget()
  }, [])

  return {
    getStats,
    getQuality,
    setQuality,
    reset,
    getDeviceInfo,
    getQualitySettings,
    isBelowTarget,
    adjustQuality
  }
}

/**
 * Simple FPS counter hook
 */
export function useFPSCounter() {
  const fpsRef = useRef(0)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  useFrame(() => {
    frameCountRef.current++
    const now = performance.now()
    const delta = now - lastTimeRef.current

    if (delta >= 1000) {
      fpsRef.current = Math.round((frameCountRef.current * 1000) / delta)
      frameCountRef.current = 0
      lastTimeRef.current = now
    }
  })

  return fpsRef.current
}

/**
 * Memory usage hook
 */
export function useMemoryMonitor() {
  const memoryRef = useRef({ used: 0, total: 0, limit: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      const memory = getMemoryUsage()
      if (memory) {
        memoryRef.current = memory
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return memoryRef.current
}

/**
 * Performance metrics hook for debugging
 */
export function usePerformanceMetrics() {
  const metricsRef = useRef({
    fps: 0,
    frameTime: 0,
    memory: 0,
    drawCalls: 0,
    triangles: 0,
    textures: 0,
    programs: 0
  })

  const updateMetrics = useCallback((renderer) => {
    if (!renderer) return

    const info = renderer.info
    metricsRef.current = {
      fps: metricsRef.current.fps,
      frameTime: metricsRef.current.frameTime,
      memory: metricsRef.current.memory,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      textures: info.memory.textures,
      programs: info.programs?.length || 0
    }
  }, [])

  return {
    metrics: metricsRef.current,
    updateMetrics
  }
}
