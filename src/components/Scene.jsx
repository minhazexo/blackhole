import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import BlackHole from './BlackHole'
import StarField from './StarField'
import Nebula from './Nebula'
import ParticleSystem from './ParticleSystem'
import DustField from './DustField'
import PostProcessing from './PostProcessing'
import CameraControls from './CameraControls'
import PerformanceManager from './PerformanceManager'
import { useScroll } from '../hooks/useScroll'
import { getDeviceCapabilities } from '../utils/deviceCapabilities'
import { throttle, debounce } from '../utils/performance'

// Performance optimization: LOD system for distant objects
function LODManager({ children, quality }) {
  const groupRef = useRef()
  const { camera } = useThree()

  useFrame(() => {
    if (groupRef.current && quality !== undefined && quality !== null && quality >= 1) {
      const distance = camera.position.distanceTo(groupRef.current.position)
      
      // Adjust detail based on distance - only in medium/high quality
      if (distance > 30) {
        groupRef.current.visible = false
      } else {
        groupRef.current.visible = true
      }
    }
  })

  return <group ref={groupRef}>{children}</group>
}

// Scroll-triggered space transitions - optimized with throttling
function SpaceTransition({ scrollProgress, quality }) {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current && scrollProgress !== undefined && scrollProgress !== null) {
      // Smooth camera movement based on scroll
      const targetZ = 8 - scrollProgress * 5
      const targetY = scrollProgress * 2
      
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        targetZ,
        0.05
      )
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.05
      )
      
      // Rotate scene slightly based on scroll - only in medium/high quality
      if (quality >= 1) {
        groupRef.current.rotation.y = scrollProgress * Math.PI * 0.5
      }
    }
  })

  return <group ref={groupRef} />
}

export default function Scene({ 
  intensity = 1, 
  autoRotate = false,
  enableParticles = true,
  enableDust = true,
  quality = 2,
  brightness = 1.0,
  viewMode = 'cinematic',
  showNebula = true,
  autoRotateSpeed = 0.5
}) {
  // Ensure all props have safe default values
  const safeIntensity = intensity ?? 1
  const safeQuality = quality ?? 2
  const safeAutoRotate = autoRotate ?? false
  const safeEnableParticles = enableParticles ?? true
  const safeEnableDust = enableDust ?? true

  const scroll = useScroll()
  const deviceCapabilities = useMemo(() => {
    const caps = getDeviceCapabilities()
    // Ensure deviceCapabilities has required properties
    return caps || {
      qualitySettings: { particleCount: 1500, dustCount: 2500, starCount: 3000, tier: 'medium' },
      pixelRatio: 1
    }
  }, [])

  // Adaptive particle counts based on device capabilities and quality
  const particleCount = useMemo(() => {
    const baseCount = deviceCapabilities?.qualitySettings?.particleCount ?? 1500
    const multiplier = safeQuality === 2 ? 1.0 : safeQuality === 1 ? 0.75 : 0.5
    return Math.round(baseCount * multiplier)
  }, [deviceCapabilities, safeQuality])

  const dustCount = useMemo(() => {
    const baseCount = deviceCapabilities?.qualitySettings?.dustCount ?? 2500
    const multiplier = safeQuality === 2 ? 1.0 : safeQuality === 1 ? 0.75 : 0.5
    return Math.round(baseCount * multiplier)
  }, [deviceCapabilities, safeQuality])

  const starCount = useMemo(() => {
    const baseCount = deviceCapabilities?.qualitySettings?.starCount ?? 3000
    const multiplier = safeQuality === 2 ? 1.0 : safeQuality === 1 ? 0.75 : 0.5
    return Math.round(baseCount * multiplier)
  }, [deviceCapabilities, safeQuality])

  // Optimize pixel ratio based on device and quality
  const pixelRatio = useMemo(() => {
    const devicePixelRatio = deviceCapabilities?.pixelRatio ?? 1
    return safeQuality === 2 ? devicePixelRatio : Math.min(devicePixelRatio, 1.5)
  }, [deviceCapabilities, safeQuality])

  // Optimize antialiasing based on quality
  const antialias = safeQuality >= 1

  return (
    <Canvas 
      camera={{ position: [0, 0, 8], fov: 55, far: 2000 }} 
      dpr={[1, pixelRatio]}
      gl={{ 
        antialias: antialias,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      }}
      frameloop="always"
      performance={{ min: 0.5 }}
    >
      <color attach="background" args={['#000005']} />
      <fog attach="fog" args={['#000010', 20, 60]} />
      
      {/* Performance monitoring - runs inside Canvas */}
      <PerformanceManager />
      
      {/* Camera controls with smooth interactions */}
      <CameraControls autoRotate={safeAutoRotate} autoRotateSpeed={autoRotateSpeed} viewMode={viewMode} />
      
      {/* Post-processing pipeline with quality settings */}
      <PostProcessing quality={safeQuality} brightness={brightness} />
      
      {/* Scroll-triggered space transitions */}
      <SpaceTransition scrollProgress={scroll.current?.target ?? 0} quality={safeQuality} />
      
      <Suspense fallback={null}>
        {/* Background elements - Layered Nebulae distributed spherically for immersion */}
        {showNebula && safeQuality >= 1 && (
          <>
            <Nebula brightness={brightness * 1.2} position={[0, 0, -40]} scale={2.5} />
            <Nebula brightness={brightness * 0.8} position={[-80, 40, -120]} scale={6.0} />
            <Nebula brightness={brightness * 0.6} position={[100, -50, -200]} scale={10.0} />
            <Nebula brightness={brightness * 0.5} position={[-150, -100, -350]} scale={20.0} />
            <Nebula brightness={brightness * 0.4} position={[250, 180, -500]} scale={35.0} />
            <Nebula brightness={brightness * 0.3} position={[0, -300, -800]} scale={60.0} />
            {/* Add some behind the camera for full 360 immersion */}
            <Nebula brightness={brightness * 0.5} position={[150, 80, 300]} scale={25.0} />
            <Nebula brightness={brightness * 0.4} position={[-200, -60, 450]} scale={35.0} />
          </>
        )}
        
        {/* VAST STAR FIELD LAYERS */}
        {/* Layer 1: Proximate High-Detail Stars */}
        <StarField count={starCount} intensity={safeIntensity} quality={safeQuality} brightness={brightness} minRadius={15} maxRadius={80} sizeMultiplier={1.0} />
        
        {/* Layer 2: Mid-range Galactic Stars */}
        <StarField count={Math.round(starCount * 1.5)} intensity={safeIntensity} quality={safeQuality} brightness={brightness * 0.75} minRadius={80} maxRadius={250} sizeMultiplier={0.7} />
        
        {/* Layer 3: Distant Deep-Space Stars (Background) */}
        <StarField count={Math.round(starCount * 12.0)} intensity={safeIntensity} quality={safeQuality} brightness={brightness * 0.4} minRadius={300} maxRadius={1200} sizeMultiplier={0.3} />
        
        {/* Particle system - integrated with intensity */}
        {safeEnableParticles && safeQuality >= 0 && (
          <ParticleSystem count={particleCount} intensity={safeIntensity} quality={safeQuality} brightness={brightness} />
        )}
        
        {/* Dust field - integrated with intensity */}
        {safeEnableDust && safeQuality >= 0 && (
          <DustField count={dustCount} intensity={safeIntensity} quality={safeQuality} brightness={brightness} />
        )}
        
        {/* Main black hole with enhanced shader */}
        <BlackHole intensity={safeIntensity} quality={safeQuality} brightness={brightness} />
      </Suspense>
    </Canvas>
  )
}
// Final Production Check Log
console.log('%c ◎ OPTICS_ENGINE: ACTIVE ', 'color: #00ffff; font-family: monospace; font-weight: bold;');
