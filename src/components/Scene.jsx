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
  viewMode = 'cinematic'
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
      camera={{ position: [0, 0, 8], fov: 55 }} 
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
      <CameraControls autoRotate={safeAutoRotate} autoRotateSpeed={0.5} viewMode={viewMode} />
      
      {/* Post-processing pipeline with quality settings */}
      <PostProcessing quality={safeQuality} />
      
      {/* Scroll-triggered space transitions */}
      <SpaceTransition scrollProgress={scroll.current?.target ?? 0} quality={safeQuality} />
      
      <Suspense fallback={null}>
        {/* Background elements - only in medium/high quality */}
        {safeQuality >= 1 && <Nebula />}
        
        {/* Star field with enhanced mouse interaction */}
        <StarField count={starCount} intensity={safeIntensity} quality={safeQuality} />
        
        {/* Particle system - integrated with intensity */}
        {safeEnableParticles && safeQuality >= 0 && (
          <ParticleSystem count={particleCount} intensity={safeIntensity} quality={safeQuality} />
        )}
        
        {/* Dust field - integrated with intensity */}
        {safeEnableDust && safeQuality >= 0 && (
          <DustField count={dustCount} intensity={safeIntensity} quality={safeQuality} />
        )}
        
        {/* Main black hole with enhanced shader */}
        <BlackHole intensity={safeIntensity} quality={safeQuality} />
      </Suspense>
    </Canvas>
  )
}
