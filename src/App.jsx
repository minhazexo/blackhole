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
  const [viewMode, setViewMode] = useState('oblique')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [quality, setQuality] = useState(0) // 0 = low, 1 = medium, 2 = high
  const [showStats, setShowStats] = useState(false)
  const [brightnessLevelIdx, setBrightnessLevelIdx] = useState(2) // 0=DIM, 1=LOW, 2=NOMINAL, 3=HIGH, 4=MAX
  const [showNebula, setShowNebula] = useState(false)
  const [autoRotateSpeedIdx, setAutoRotateSpeedIdx] = useState(1) // 0=SLOW, 1=NORMAL, 2=FAST, 3=WARP

  const orbitSpeeds = [0.1, 0.5, 2.0, 5.0]
  const currentOrbitSpeed = orbitSpeeds[autoRotateSpeedIdx]
  
  const brightnessLevels = [0.2, 0.5, 1.0, 1.5, 2.0]
  const currentBrightness = brightnessLevels[brightnessLevelIdx]
  
  // Initialize device capabilities
  const deviceCapabilities = getDeviceCapabilities()
  
  // Set initial quality (Static default: Low)
  useEffect(() => {
    setQuality(0)
    console.log('%c ◎ PROJECT SINGULARITY INITIALIZED ', 'background: #000; color: #00ffff; font-weight: bold; border: 1px solid #00ffff; padding: 4px;');
    console.log('%c > STATUS: NOMINAL \n > VERSION: 2.8.4 \n > CORE_METRIC: KERR_VACUUM ', 'color: #00ffff; font-family: monospace;');
  }, [])
  
  // Performance context - stats and quality are managed by PerformanceManager inside Canvas
  const { stats, quality: recommendedQuality, updateQuality } = usePerformanceContext()
  
  // Track if user manually set quality
  const manualQualityRef = useRef(false)
  

  
  // Gravitational intensity state
  const { 
    intensity, 
    levelIdx,
    levelName,
    isHighIntensity, 
    cycleIntensity,
    targetIntensityRef,
    currentIntensityRef 
  } = useGravitationalIntensity(0)
  
  // Audio system
  const { 
    initializeAudio, 
    playAmbientSound,
    playSpatialSound, 
    playInteractionSound,
    setVolume 
  } = useAudio()

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

  useEffect(() => {
    console.log('%c ◎ HUD_INTERFACE: LINKED ', 'color: #00ffff; font-family: monospace;');
  }, [])

  // Handle intensity toggle
  const handleIntensityToggle = useCallback(() => {
    cycleIntensity()
    playInteractionSound('pulse')
  }, [cycleIntensity, playInteractionSound])

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

  // Global hotkey for Datalog (P key)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.key === 'p' || e.key === 'P') && !loading) {
        toggleStats()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleStats, loading])

  // Handle brightness change
  const handleBrightnessChange = useCallback((newIdx) => {
    setBrightnessLevelIdx(newIdx)
    playInteractionSound('click')
  }, [playInteractionSound])

  const toggleNebula = useCallback(() => {
    setShowNebula(prev => !prev)
    playInteractionSound('click')
  }, [playInteractionSound])

  const cycleOrbitSpeed = useCallback(() => {
    setAutoRotateSpeedIdx(prev => (prev + 1) % orbitSpeeds.length)
    playInteractionSound('click')
  }, [playInteractionSound, orbitSpeeds.length])



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
        brightness={currentBrightness}
        viewMode={viewMode}
        showNebula={showNebula}
        autoRotateSpeed={currentOrbitSpeed}
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
            onViewToggle={(mode) => {
              const modes = ['cinematic', 'top', 'edge', 'nadir', 'close', 'distant', 'oblique', 'wormhole', 'horizon', 'galactic'];
              if (mode) {
                setViewMode(mode);
              } else {
                setViewMode(prev => modes[(modes.indexOf(prev) + 1) % modes.length]);
              }
              playInteractionSound('click');
            }}
            onIntensityToggle={handleIntensityToggle}
            gravityLevelName={levelName}
            onSoundToggle={handleSoundToggle}
            onAutoRotateToggle={handleAutoRotateToggle}
            onQualityChange={handleQualityChange}
            onToggleStats={toggleStats}
            brightnessLevelIdx={brightnessLevelIdx}
            onBrightnessChange={handleBrightnessChange}
            showNebula={showNebula}
            onNebulaToggle={toggleNebula}
            autoRotateSpeedIdx={autoRotateSpeedIdx}
            onOrbitSpeedChange={cycleOrbitSpeed}
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
