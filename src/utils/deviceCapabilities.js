/**
 * Device capability detection for adaptive performance
 * Detects device type, GPU capabilities, memory, and performance potential
 */

export class DeviceCapabilities {
  constructor() {
    this.deviceType = this.detectDeviceType()
    this.isMobile = this.deviceType === 'mobile'
    this.isTablet = this.deviceType === 'tablet'
    this.isDesktop = this.deviceType === 'desktop'
    
    this.memory = this.detectMemory()
    this.gpuInfo = this.detectGPU()
    this.performanceTier = this.determinePerformanceTier()
    this.supportsWebGL2 = this.detectWebGL2()
    this.pixelRatio = this.getOptimalPixelRatio()
    
    // Quality settings based on device
    this.qualitySettings = this.getQualitySettings()
  }

  /**
   * Detect device type (mobile, tablet, desktop)
   */
  detectDeviceType() {
    const userAgent = navigator.userAgent || ''
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height
    
    // Mobile detection
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      // Tablet detection (larger screen or iPad)
      if (/iPad|Android/i.test(userAgent) && (screenWidth >= 768 || screenHeight >= 768)) {
        return 'tablet'
      }
      return 'mobile'
    }
    
    // Tablet detection based on screen size
    if (screenWidth >= 768 && screenWidth < 1024) {
      return 'tablet'
    }
    
    return 'desktop'
  }

  /**
   * Detect available memory (in MB)
   */
  detectMemory() {
    if (performance.memory) {
      return {
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        used: Math.round(performance.memory.usedJSHeapSize / 1048576)
      }
    }
    
    // Estimate based on device type
    if (this.isMobile) return { limit: 512, total: 256, used: 0 }
    if (this.isTablet) return { limit: 1024, total: 512, used: 0 }
    return { limit: 2048, total: 1024, used: 0 }
  }

  /**
   * Detect GPU information
   */
  detectGPU() {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl) {
      return { vendor: 'Unknown', renderer: 'Unknown', maxTextureSize: 0 }
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    
    if (debugInfo) {
      return {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)
      }
    }
    
    return {
      vendor: 'Unknown',
      renderer: 'Unknown',
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)
    }
  }

  /**
   * Detect WebGL 2 support
   */
  detectWebGL2() {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  }

  /**
   * Determine performance tier based on device capabilities
   */
  determinePerformanceTier() {
    let score = 0
    
    // Device type score
    if (this.isDesktop) score += 3
    else if (this.isTablet) score += 2
    else score += 1
    
    // Memory score
    if (this.memory.limit >= 2048) score += 3
    else if (this.memory.limit >= 1024) score += 2
    else if (this.memory.limit >= 512) score += 1
    
    // WebGL 2 support
    if (this.supportsWebGL2) score += 2
    
    // GPU capabilities
    if (this.gpuInfo.maxTextureSize >= 4096) score += 2
    else if (this.gpuInfo.maxTextureSize >= 2048) score += 1
    
    // Determine tier
    if (score >= 8) return 'high'
    if (score >= 6) return 'medium'
    if (score >= 4) return 'low'
    return 'very-low'
  }

  /**
   * Get optimal pixel ratio for device
   */
  getOptimalPixelRatio() {
    const devicePixelRatio = window.devicePixelRatio || 1
    
    // Low-end devices: use 1x
    if (this.performanceTier === 'very-low') return 1
    
    // Mobile devices: cap at 1.5x
    if (this.isMobile) return Math.min(devicePixelRatio, 1.5)
    
    // Tablet devices: cap at 2x
    if (this.isTablet) return Math.min(devicePixelRatio, 2)
    
    // Desktop: cap at 2x for performance
    return Math.min(devicePixelRatio, 2)
  }

  /**
   * Get quality settings based on device capabilities
   */
  getQualitySettings() {
    const settings = {
      tier: this.performanceTier,
      pixelRatio: this.pixelRatio,
      antialias: true,
      shadows: true,
      postProcessing: true,
      bloom: true,
      chromaticAberration: true,
      noise: true,
      depthOfField: true,
      particleCount: 1500,
      starCount: 3000,
      dustCount: 2500,
      shaderQuality: 'high',
      textureQuality: 'high'
    }

    switch (this.performanceTier) {
      case 'high':
        // Desktop high-end
        settings.particleCount = 4000
        settings.starCount = 12000
        settings.dustCount = 6000
        settings.bloomIntensity = 1.5
        settings.chromaticAberrationOffset = 0.002
        settings.noiseOpacity = 0.08
        break

      case 'medium':
        // Desktop mid-range / Tablet high-end
        settings.particleCount = 3000
        settings.starCount = 8000
        settings.dustCount = 5000
        settings.bloomIntensity = 1.2
        settings.chromaticAberrationOffset = 0.0015
        settings.noiseOpacity = 0.06
        settings.depthOfField = false // Disable DoF for performance
        break

      case 'low':
        // Desktop low-end / Tablet mid-range
        settings.particleCount = 2000
        settings.starCount = 5000
        settings.dustCount = 3000
        settings.bloomIntensity = 1.0
        settings.chromaticAberrationOffset = 0.001
        settings.noiseOpacity = 0.04
        settings.depthOfField = false
        settings.shadows = false
        settings.shaderQuality = 'medium'
        settings.textureQuality = 'medium'
        break

      case 'very-low':
        // Mobile devices
        settings.particleCount = 500
        settings.starCount = 1000
        settings.dustCount = 800
        settings.bloomIntensity = 0.8
        settings.chromaticAberrationOffset = 0.0005
        settings.noiseOpacity = 0.02
        settings.depthOfField = false
        settings.shadows = false
        settings.antialias = false
        settings.postProcessing = true // Keep minimal post-processing
        settings.chromaticAberration = false // Disable chromatic aberration
        settings.noise = false // Disable noise
        settings.shaderQuality = 'low'
        settings.textureQuality = 'low'
        break
    }

    return settings
  }

  /**
   * Get particle count multiplier based on device
   */
  getParticleMultiplier() {
    switch (this.performanceTier) {
      case 'high': return 1.0
      case 'medium': return 0.75
      case 'low': return 0.5
      case 'very-low': return 0.25
      default: return 0.5
    }
  }

  /**
   * Check if device supports feature
   */
  supportsFeature(feature) {
    switch (feature) {
      case 'webgl2': return this.supportsWebGL2
      case 'postProcessing': return this.qualitySettings.postProcessing
      case 'bloom': return this.qualitySettings.bloom
      case 'chromaticAberration': return this.qualitySettings.chromaticAberration
      case 'noise': return this.qualitySettings.noise
      case 'depthOfField': return this.qualitySettings.depthOfField
      case 'shadows': return this.qualitySettings.shadows
      case 'antialias': return this.qualitySettings.antialias
      default: return true
    }
  }

  /**
   * Get device info for debugging
   */
  getDeviceInfo() {
    return {
      deviceType: this.deviceType,
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      isDesktop: this.isDesktop,
      performanceTier: this.performanceTier,
      memory: this.memory,
      gpu: this.gpuInfo,
      supportsWebGL2: this.supportsWebGL2,
      pixelRatio: this.pixelRatio,
      qualitySettings: this.qualitySettings
    }
  }
}

/**
 * Create a device capabilities instance
 */
export function createDeviceCapabilities() {
  return new DeviceCapabilities()
}

/**
 * Get device capabilities singleton
 */
let deviceCapabilitiesInstance = null

export function getDeviceCapabilities() {
  if (!deviceCapabilitiesInstance) {
    try {
      deviceCapabilitiesInstance = new DeviceCapabilities()
    } catch (e) {
      // Fallback for server-side rendering or early initialization
      return {
        qualitySettings: {
          particleCount: 1500,
          dustCount: 2500,
          starCount: 3000,
          tier: 'medium'
        },
        pixelRatio: 1
      }
    }
  }
  return deviceCapabilitiesInstance
}

/**
 * Check if device is mobile
 */
export function isMobile() {
  return getDeviceCapabilities().isMobile
}

/**
 * Check if device is tablet
 */
export function isTablet() {
  return getDeviceCapabilities().isTablet
}

/**
 * Check if device is desktop
 */
export function isDesktop() {
  return getDeviceCapabilities().isDesktop
}

/**
 * Get performance tier
 */
export function getPerformanceTier() {
  return getDeviceCapabilities().performanceTier
}

/**
 * Get quality settings
 */
export function getQualitySettings() {
  return getDeviceCapabilities().qualitySettings
}

/**
 * Get optimal pixel ratio
 */
export function getOptimalPixelRatio() {
  return getDeviceCapabilities().pixelRatio
}
