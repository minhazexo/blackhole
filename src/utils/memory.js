/**
 * Memory management utilities for the black hole simulation
 * Provides cleanup functions and memory optimization strategies
 */

import * as THREE from 'three'

/**
 * Dispose of Three.js objects to prevent memory leaks
 */
export function disposeObject(object) {
  if (!object) return

  // Dispose geometry
  if (object.geometry) {
    object.geometry.dispose()
  }

  // Dispose material
  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach(material => disposeMaterial(material))
    } else {
      disposeMaterial(object.material)
    }
  }

  // Dispose children recursively
  if (object.children) {
    object.children.forEach(child => disposeObject(child))
  }
}

/**
 * Dispose of Three.js material
 */
function disposeMaterial(material) {
  if (!material) return

  // Dispose textures
  if (material.map) material.map.dispose()
  if (material.normalMap) material.normalMap.dispose()
  if (material.roughnessMap) material.roughnessMap.dispose()
  if (material.metalnessMap) material.metalnessMap.dispose()
  if (material.aoMap) material.aoMap.dispose()
  if (material.emissiveMap) material.emissiveMap.dispose()
  if (material.alphaMap) material.alphaMap.dispose()
  if (material.envMap) material.envMap.dispose()

  // Dispose uniforms for shader materials
  if (material.uniforms) {
    Object.values(material.uniforms).forEach(uniform => {
      if (uniform.value && uniform.value.dispose) {
        uniform.value.dispose()
      }
    })
  }

  material.dispose()
}

/**
 * Dispose of renderer and related resources
 */
export function disposeRenderer(renderer) {
  if (!renderer) return

  renderer.dispose()
  renderer.forceContextLoss()
}

/**
 * Clear unused textures from memory
 */
export function clearUnusedTextures(renderer) {
  if (!renderer || !renderer.info) return

  const textures = renderer.info.memory.textures
  console.log(`[Memory] Active textures: ${textures}`)
}

/**
 * Optimize texture memory by reducing texture sizes
 */
export function optimizeTexture(texture, maxSize = 1024) {
  if (!texture) return texture

  const width = texture.image.width
  const height = texture.image.height

  if (width > maxSize || height > maxSize) {
    const scale = Math.min(maxSize / width, maxSize / height)
    const newWidth = Math.floor(width * scale)
    const newHeight = Math.floor(height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = newWidth
    canvas.height = newHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(texture.image, 0, 0, newWidth, newHeight)

    const newTexture = new THREE.CanvasTexture(canvas)
    newTexture.wrapS = texture.wrapS
    newTexture.wrapT = texture.wrapT
    newTexture.minFilter = texture.minFilter
    newTexture.magFilter = texture.magFilter

    texture.dispose()
    return newTexture
  }

  return texture
}

/**
 * Create a memory pool for reusable objects
 */
export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.pool = []
    this.active = new Set()

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  get() {
    let obj = this.pool.pop()
    if (!obj) {
      obj = this.createFn()
    }
    this.active.add(obj)
    return obj
  }

  release(obj) {
    if (this.active.has(obj)) {
      this.active.delete(obj)
      this.resetFn(obj)
      this.pool.push(obj)
    }
  }

  dispose() {
    this.pool.forEach(obj => {
      if (obj.dispose) obj.dispose()
    })
    this.active.forEach(obj => {
      if (obj.dispose) obj.dispose()
    })
    this.pool = []
    this.active.clear()
  }
}

/**
 * Memory usage tracker
 */
export class MemoryTracker {
  constructor() {
    this.snapshots = []
    this.maxSnapshots = 100
    this.startTracking()
  }

  startTracking() {
    if (!performance.memory) {
      console.warn('[Memory] Memory tracking not available in this browser')
      return
    }

    this.interval = setInterval(() => {
      this.takeSnapshot()
    }, 1000)
  }

  takeSnapshot() {
    if (!performance.memory) return

    const snapshot = {
      timestamp: Date.now(),
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    }

    this.snapshots.push(snapshot)

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift()
    }
  }

  getStats() {
    if (this.snapshots.length === 0) return null

    const latest = this.snapshots[this.snapshots.length - 1]
    const used = latest.used / 1048576 // Convert to MB
    const total = latest.total / 1048576
    const limit = latest.limit / 1048576

    // Calculate trend
    let trend = 0
    if (this.snapshots.length > 10) {
      const old = this.snapshots[this.snapshots.length - 10]
      trend = ((latest.used - old.used) / old.used) * 100
    }

    return {
      used: Math.round(used),
      total: Math.round(total),
      limit: Math.round(limit),
      percentage: Math.round((used / limit) * 100),
      trend: Math.round(trend)
    }
  }

  stopTracking() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  clear() {
    this.snapshots = []
  }
}

/**
 * Check for memory leaks
 */
export function checkMemoryLeaks(threshold = 50) {
  if (!performance.memory) return false

  const used = performance.memory.usedJSHeapSize / 1048576 // MB
  const limit = performance.memory.jsHeapSizeLimit / 1048576
  const percentage = (used / limit) * 100

  if (percentage > threshold) {
    console.warn(`[Memory] High memory usage: ${percentage.toFixed(1)}% (${used.toFixed(1)}MB / ${limit.toFixed(1)}MB)`)
    return true
  }

  return false
}

/**
 * Force garbage collection (if available)
 */
export function forceGarbageCollection() {
  if (typeof gc !== 'undefined') {
    gc()
    console.log('[Memory] Forced garbage collection')
  } else {
    console.log('[Memory] Garbage collection not available')
  }
}

/**
 * Get memory usage summary
 */
export function getMemorySummary() {
  if (!performance.memory) {
    return {
      available: false,
      message: 'Memory API not available in this browser'
    }
  }

  const used = performance.memory.usedJSHeapSize / 1048576
  const total = performance.memory.totalJSHeapSize / 1048576
  const limit = performance.memory.jsHeapSizeLimit / 1048576

  return {
    available: true,
    used: Math.round(used),
    total: Math.round(total),
    limit: Math.round(limit),
    percentage: Math.round((used / limit) * 100),
    message: `${Math.round(used)}MB / ${Math.round(limit)}MB (${Math.round((used / limit) * 100)}%)`
  }
}
