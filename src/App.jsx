import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import Scene from './components/Scene'
import UI from './components/UI'
import LoadingScreen from './components/LoadingScreen'
import SoundToggle from './components/SoundToggle'
import PerformanceStats from './components/PerformanceStats'
import { PerformanceProvider, usePerformanceContext } from './context/PerformanceContext'
import { useGravitationalIntensity } from './hooks/useGravitationalIntensity'
import { useAudio } from './hooks/useAudio'
import { getDeviceCapabilities } from './utils/deviceCapabilities'
import { debounce } from './utils/performance'

function AppContent() {
  const [loading, setLoading] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)
  const [viewMode, setViewMode] = useState('cinematic')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [quality, setQuality] = useState(2) // 0 = low, 1 = medium, 2 = high
  const [showStats, setShowStats] = useState(false)
  
  // Initialize device capabilities
  const deviceCapabilities = getDeviceCapabilities()
  
  // Set initial quality based on device
  useEffect(() => {
    const initialQuality = deviceCapabilities.qualitySettings.tier === 'high' ? 2 :
                          deviceCapabilities.qualitySettings.tier === 'medium' ? 1 : 0
    setQuality(initialQuality)
  }, [deviceCapabilities])
  
  // Performance context - stats and quality are managed by PerformanceManager inside Canvas
  const { stats, quality: recommendedQuality, updateQuality } = usePerformanceContext()
  
  // Track if user manually set quality
  const manualQualityRef = useRef(false)
  
  // Sync quality from performance context (auto-adjustments)
  useEffect(() => {
    if (!manualQualityRef.current && recommendedQuality) {
      const qualityMap = { 'high': 2, 'medium': 1, 'low': 0, 'very-low': 0 }
      setQuality(qualityMap[recommendedQuality] || 1)
    }
  }, [recommendedQuality])
  
  // Gravitational intensity state
  const { 
    intensity, 
    isHighIntensity, 
    toggleIntensity,
    targetIntensityRef,
    currentIntensityRef 
  } = useGravitationalIntensity(1)
  
  // Audio system
  const { 
    initializeAudio, 
    playAmbientSound,
    playSpatialSound, 
    playInteractionSound,
    setVolume 
  } = useAudio()

  // Smooth intensity transition
  useEffect(() => {
    const interval = setInterval(() => {
      currentIntensityRef.current += (targetIntensityRef.current - currentIntensityRef.current) * 0.02
    }, 16)
    return () => clearInterval(interval)
  }, [])

  // Handle sound toggle
  const handleSoundToggle = useCallback((enabled) => {
    setSoundEnabled(enabled)
    if (enabled) {
      initializeAudio()
      playAmbientSound(true)
    } else {
      playAmbientSound(false)
    }
  }, [initializeAudio, playAmbientSound])

  // Handle intensity toggle
  const handleIntensityToggle = useCallback(() => {
    toggleIntensity()
    playInteractionSound('pulse')
  }, [toggleIntensity, playInteractionSound])

  // Handle auto-rotate toggle
  const handleAutoRotateToggle = useCallback(() => {
    setAutoRotate(prev => !prev)
    playInteractionSound('click')
  }, [playInteractionSound])

  // Handle scroll for space transitions - optimized with debouncing
  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1)
      
      // Trigger spatial sound on scroll - reduced frequency for performance
      if (soundEnabled && Math.random() > 0.98) {
        playSpatialSound(
          { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: 0 },
          0.5
        )
      }
    }, 50)

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [soundEnabled, playSpatialSound])
  
  // Handle quality change
  const handleQualityChange = useCallback((newQuality) => {
    manualQualityRef.current = true
    setQuality(newQuality)
    // Update performance manager via window API
    if (window.performanceManager) {
      window.performanceManager.setQuality(['low', 'medium', 'high'][newQuality])
    }
  }, [])
  
  // Toggle performance stats
  const toggleStats = useCallback(() => {
    setShowStats(prev => !prev)
  }, [])

  // Handle mouse click for gravitational intensity
  useEffect(() => {
    const handleClick = (e) => {
      // Check if click is on canvas (not UI)
      if (e.target.tagName === 'CANVAS') {
        handleIntensityToggle()
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [handleIntensityToggle])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Performance Stats - toggle with P key */}
      {showStats && <PerformanceStats position="top-right" showDeviceInfo={true} stats={stats} />}
      {/* Three.js Scene */}
      <Scene
        intensity={intensity}
        autoRotate={autoRotate}
        enableParticles={quality >= 0}
        enableDust={quality >= 0}
        quality={quality}
        viewMode={viewMode}
      />
      

      {/* Sound Toggle Component */}
      <SoundToggle onToggle={handleSoundToggle} />

      {/* Loading Screen */}
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      {/* Main UI - fades in after loading completes */}
      {!loading && (
        <div className="animate-fade-in">
          <UI
            intensity={intensity}
            isHighIntensity={isHighIntensity}
            soundEnabled={soundEnabled}
            autoRotate={autoRotate}
            quality={quality}
            viewMode={viewMode}
            onViewToggle={() => {
              const modes = ['cinematic', 'top', 'edge'];
              setViewMode(prev => modes[(modes.indexOf(prev) + 1) % modes.length]);
              playInteractionSound('click');
            }}
            onIntensityToggle={handleIntensityToggle}
            onSoundToggle={handleSoundToggle}
            onAutoRotateToggle={handleAutoRotateToggle}
            onQualityChange={handleQualityChange}
            onToggleStats={toggleStats}
          />
        </div>
      )}
    </div>
  )
}

// Wrap App with PerformanceProvider
export default function App() {
  return (
    <PerformanceProvider>
      <AppContent />
    </PerformanceProvider>
  )
}
