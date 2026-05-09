/**
 * Performance monitoring utilities for the black hole simulation
 * Tracks FPS, frame time, memory usage, and GPU performance metrics
 */

export class PerformanceMonitor {
  constructor() {
    this.fps = 0
    this.frameTime = 0
    this.frames = 0
    this.lastTime = performance.now()
    this.fpsHistory = []
    this.frameTimeHistory = []
    this.maxHistoryLength = 60
    
    // Memory tracking
    this.memoryUsage = 0
    this.memoryHistory = []
    
    // Performance metrics
    this.metrics = {
      averageFPS: 0,
      minFPS: Infinity,
      maxFPS: 0,
      averageFrameTime: 0,
      droppedFrames: 0,
      targetFPS: 60
    }
    
    // Performance thresholds
    this.thresholds = {
      excellent: 55,  // FPS
      good: 45,
      acceptable: 30,
      poor: 20
    }
  }

  /**
   * Update performance metrics - call this once per frame
   */
  update() {
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    
    this.frames++
    
    // Update FPS every second
    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frames * 1000) / deltaTime)
      this.frameTime = deltaTime / this.frames
      
      // Update history
      this.fpsHistory.push(this.fps)
      this.frameTimeHistory.push(this.frameTime)
      
      // Trim history
      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift()
        this.frameTimeHistory.shift()
      }
      
      // Update metrics
      this.updateMetrics()
      
      // Track memory if available
      this.updateMemory()
      
      // Reset counters
      this.frames = 0
      this.lastTime = currentTime
    }
  }

  /**
   * Update performance metrics
   */
  updateMetrics() {
    if (this.fpsHistory.length === 0) return
    
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0)
    this.metrics.averageFPS = Math.round(sum / this.fpsHistory.length)
    this.metrics.minFPS = Math.min(...this.fpsHistory)
    this.metrics.maxFPS = Math.max(...this.fpsHistory)
    
    const frameTimeSum = this.frameTimeHistory.reduce((a, b) => a + b, 0)
    this.metrics.averageFrameTime = frameTimeSum / this.frameTimeHistory.length
    
    // Count dropped frames (below 30 FPS)
    this.metrics.droppedFrames = this.fpsHistory.filter(fps => fps < 30).length
  }

  /**
   * Update memory usage if available
   */
  updateMemory() {
    if (performance.memory) {
      this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576) // MB
      this.memoryHistory.push(this.memoryUsage)
      
      if (this.memoryHistory.length > this.maxHistoryLength) {
        this.memoryHistory.shift()
      }
    }
  }

  /**
   * Get current performance rating
   */
  getPerformanceRating() {
    if (this.fps >= this.thresholds.excellent) return 'excellent'
    if (this.fps >= this.thresholds.good) return 'good'
    if (this.fps >= this.thresholds.acceptable) return 'acceptable'
    if (this.fps >= this.thresholds.poor) return 'poor'
    return 'critical'
  }

  /**
   * Get recommended quality setting based on performance
   */
  getRecommendedQuality() {
    const rating = this.getPerformanceRating()
    
    switch (rating) {
      case 'excellent':
        return 'high'
      case 'good':
        return 'medium'
      case 'acceptable':
        return 'low'
      default:
        return 'very-low'
    }
  }

  /**
   * Check if performance is below target
   */
  isBelowTarget() {
    return this.fps < this.metrics.targetFPS
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      fps: this.fps,
      frameTime: this.frameTime.toFixed(2),
      averageFPS: this.metrics.averageFPS,
      minFPS: this.metrics.minFPS === Infinity ? 0 : this.metrics.minFPS,
      maxFPS: this.metrics.maxFPS,
      averageFrameTime: this.metrics.averageFrameTime.toFixed(2),
      droppedFrames: this.metrics.droppedFrames,
      memoryUsage: this.memoryUsage,
      rating: this.getPerformanceRating(),
      recommendedQuality: this.getRecommendedQuality()
    }
  }

  /**
   * Reset performance monitor
   */
  reset() {
    this.fps = 0
    this.frameTime = 0
    this.frames = 0
    this.lastTime = performance.now()
    this.fpsHistory = []
    this.frameTimeHistory = []
    this.memoryHistory = []
    this.metrics = {
      averageFPS: 0,
      minFPS: Infinity,
      maxFPS: 0,
      averageFrameTime: 0,
      droppedFrames: 0,
      targetFPS: 60
    }
  }
}

/**
 * Create a performance monitor instance
 */
export function createPerformanceMonitor() {
  return new PerformanceMonitor()
}

/**
 * Measure execution time of a function
 */
export function measurePerformance(name, fn) {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  const duration = end - start
  
  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
  
  return result
}

/**
 * Create a performance marker
 */
export function markPerformance(name) {
  performance.mark(`${name}-start`)
}

/**
 * End a performance marker and log the duration
 */
export function endPerformanceMark(name) {
  performance.mark(`${name}-end`)
  performance.measure(name, `${name}-start`, `${name}-end`)
  
  const measure = performance.getEntriesByName(name)[0]
  if (measure) {
    console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`)
    performance.clearMarks(`${name}-start`)
    performance.clearMarks(`${name}-end`)
    performance.clearMeasures(name)
  }
}

/**
 * Get memory usage in MB
 */
export function getMemoryUsage() {
  if (performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
    }
  }
  return null
}

/**
 * Check if device is low-end based on memory and performance
 */
export function isLowEndDevice() {
  const memory = getMemoryUsage()
  
  // Check memory limit (less than 2GB is considered low-end)
  if (memory && memory.limit < 2048) {
    return true
  }
  
  // Check for mobile device
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    if (mobileRegex.test(navigator.userAgent)) {
      return true
    }
  }
  
  return false
}

/**
 * Get device pixel ratio (capped at 2 for performance)
 */
export function getOptimalPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 2)
}

/**
 * Throttle function execution
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Debounce function execution
 */
export function debounce(func, wait) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}
