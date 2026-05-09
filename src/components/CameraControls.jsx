import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export default function CameraControls({ 
  autoRotate = false, 
  autoRotateSpeed = 0.5, 
  viewMode = 'cinematic' 
}) {
  const { camera, gl } = useThree()
  const controlsRef = useRef()
  const targetPosition = useRef(new THREE.Vector3(0, 0, 8))
  const currentPosition = useRef(new THREE.Vector3(0, 0, 8))
  
  // Momentum tracking for drag releases
  const angularVelocity = useRef({ x: 0, y: 0 })
  const lastMousePosition = useRef({ x: 0, y: 0 })
  const lastMouseTime = useRef(0)
  const isDragging = useRef(false)
  const momentumActive = useRef(false)
  
  // Cinematic handheld motion
  const handheldOffset = useRef(new THREE.Vector3())
  const handheldPhase = useRef({ x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 100 })

  // Detect device type for adaptive settings
  const deviceType = useMemo(() => {
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
  }, [])

  // Adaptive settings based on device type
  const adaptiveSettings = useMemo(() => {
    switch (deviceType) {
      case 'mobile':
        return {
          dampingFactor: 0.15,
          rotateSpeed: 1.2,
          zoomSpeed: 1.0,
          panSpeed: 0.8,
          minDistance: 3.5,
          maxDistance: 1500
        }
      case 'tablet':
        return {
          dampingFactor: 0.12,
          rotateSpeed: 1.0,
          zoomSpeed: 0.9,
          panSpeed: 0.6,
          minDistance: 3.2,
          maxDistance: 1500
        }
      case 'desktop':
      default:
        return {
          dampingFactor: 0.12,
          rotateSpeed: 0.8,
          zoomSpeed: 0.8,
          panSpeed: 0.5,
          minDistance: 3.0,
          maxDistance: 1500
        }
    }
  }, [deviceType])

  // Track mouse movement for momentum calculation
  const handleMouseDown = (event) => {
    isDragging.current = true
    momentumActive.current = false
    lastMousePosition.current = { x: event.clientX, y: event.clientY }
    lastMouseTime.current = performance.now()
    angularVelocity.current = { x: 0, y: 0 }
  }

  const handleMouseMove = (event) => {
    if (!isDragging.current) return
    
    const currentTime = performance.now()
    const deltaTime = currentTime - lastMouseTime.current
    
    if (deltaTime > 0) {
      const deltaX = event.clientX - lastMousePosition.current.x
      const deltaY = event.clientY - lastMousePosition.current.y
      
      // Calculate angular velocity (pixels per millisecond)
      angularVelocity.current = {
        x: deltaX / deltaTime,
        y: deltaY / deltaTime
      }
      
      lastMousePosition.current = { x: event.clientX, y: event.clientY }
      lastMouseTime.current = currentTime
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
    
    // Only activate momentum if velocity is significant
    const velocityMagnitude = Math.sqrt(
      angularVelocity.current.x ** 2 + angularVelocity.current.y ** 2
    )
    
    if (velocityMagnitude > 0.1) {
      momentumActive.current = true
    }
  }

  const views = useMemo(() => ({
    cinematic:   new THREE.Vector3(0, 2, 8),
    top:         new THREE.Vector3(0, 20, 0.1),
    edge:        new THREE.Vector3(20, 0, 0),
    nadir:       new THREE.Vector3(0, -20, 0.1),
    close:       new THREE.Vector3(0, 1, 6),
    distant:     new THREE.Vector3(0, 15, 60),
    oblique:     new THREE.Vector3(15, 10, 15),
    wormhole:    new THREE.Vector3(0, 0, 3.5), // Safety: > minDistance (3)
    horizon:     new THREE.Vector3(8, 0.5, 8),
    galactic:    new THREE.Vector3(120, 60, 200)
  }), [])

  // View transitioning state
  const isTransitioning = useRef(false)

  const targetViewPos = useRef(null)

  useEffect(() => {
    if (viewMode && views[viewMode]) {
      targetViewPos.current = views[viewMode].clone()
    }
  }, [viewMode, views])

  // Native damping from OrbitControls with cinematic inertia
  useFrame((state, delta) => {
    if (controlsRef.current) {
      const time = state.clock.elapsedTime
      
      // If we have a target view position to animate to
      if (targetViewPos.current) {
        isTransitioning.current = true
        // Smooth cinematic lerp with inertia
        const lerpFactor = Math.min(delta * 2.5, 1.0)
        camera.position.lerp(targetViewPos.current, lerpFactor)
        
        // If close enough, stop animating so user can take control
        if (camera.position.distanceTo(targetViewPos.current) < 0.05) {
          targetViewPos.current = null
          isTransitioning.current = false
        }
      }
      
      // Update OrbitControls with transition-aware autoRotate
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate && !isTransitioning.current
        controlsRef.current.update()
      }

      // Subtle rotation wobble for handheld feel (non-drifting, non-accumulating)
      if (!isTransitioning.current) {
        camera.rotation.z = Math.sin(time * 1.2) * 0.004
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={adaptiveSettings.dampingFactor}
      rotateSpeed={adaptiveSettings.rotateSpeed}
      zoomSpeed={adaptiveSettings.zoomSpeed}
      panSpeed={adaptiveSettings.panSpeed}
      minDistance={adaptiveSettings.minDistance}
      maxDistance={adaptiveSettings.maxDistance}
      minPolarAngle={Math.PI / 12}
      maxPolarAngle={Math.PI - Math.PI / 12}
      autoRotate={autoRotate && !isTransitioning.current}
      autoRotateSpeed={autoRotateSpeed}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      onStart={() => {
        // Cancel any ongoing programmatic transition if the user takes over
        targetViewPos.current = null
        isTransitioning.current = false
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
    />
  )
}
