import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export default function CameraControls({ autoRotate = false, autoRotateSpeed = 0.5, viewMode = 'cinematic' }) {
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
          minDistance: 4,
          maxDistance: 25
        }
      case 'tablet':
        return {
          dampingFactor: 0.12,
          rotateSpeed: 1.0,
          zoomSpeed: 0.9,
          panSpeed: 0.6,
          minDistance: 3.5,
          maxDistance: 22
        }
      case 'desktop':
      default:
        return {
          dampingFactor: 0.12,
          rotateSpeed: 0.8,
          zoomSpeed: 0.8,
          panSpeed: 0.5,
          minDistance: 3,
          maxDistance: 20
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
    cinematic: new THREE.Vector3(0, 2, 8),
    top: new THREE.Vector3(0, 9, 0.1),
    edge: new THREE.Vector3(9, 0, 0)
  }), [])

  const targetViewPos = useRef(null)

  useEffect(() => {
    if (viewMode && views[viewMode]) {
      targetViewPos.current = views[viewMode].clone()
    }
  }, [viewMode, views])

  // Native damping from OrbitControls
  useFrame((state, delta) => {
    if (controlsRef.current) {
      // If we have a target view position to animate to
      if (targetViewPos.current) {
        camera.position.lerp(targetViewPos.current, delta * 3)
        // If close enough, stop animating so user can take control
        if (camera.position.distanceTo(targetViewPos.current) < 0.1) {
          targetViewPos.current = null
        }
      }
      controlsRef.current.update()
    }
  })

  // Set up event listeners for momentum tracking
  useEffect(() => {
    const canvas = gl.domElement
    
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    
    // Touch events for mobile devices
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        handleMouseDown(e.touches[0])
      }
    })
    
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        handleMouseMove(e.touches[0])
      }
    })
    
    canvas.addEventListener('touchend', handleMouseUp)
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('touchstart', handleMouseDown)
      canvas.removeEventListener('touchmove', handleMouseMove)
      canvas.removeEventListener('touchend', handleMouseUp)
    }
  }, [gl.domElement])

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
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI - Math.PI / 6}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      // Touch-specific settings for better mobile experience
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
    />
  )
}
