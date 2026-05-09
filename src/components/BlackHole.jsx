import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { blackHoleVertexShader, blackHoleFragmentShader } from '../shaders/blackHole'

export default function BlackHole({ intensity = 1, quality = 2, brightness = 1.0 }) {
  const meshRef   = useRef()
  const groupRef  = useRef()
  const glowRef   = useRef()
  const outerRef  = useRef()
  const mousePos  = useRef({ x: 0, y: 0 })

  const uniforms = useMemo(() => ({
    uTime:          { value: 0 },
    uIntensity:     { value: intensity ?? 1 },
    uShockwaveTime: { value: 0 },
    uMouse:         { value: new THREE.Vector2(0, 0) },
    uQuality:       { value: quality ?? 2 },
    uBrightness:    { value: brightness ?? 1.0 }
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (uniforms) {
      uniforms.uTime.value          = t
      uniforms.uShockwaveTime.value = t
      uniforms.uIntensity.value     = intensity
      uniforms.uQuality.value       = quality
      uniforms.uBrightness.value    = brightness

      // Smooth mouse interpolation
      uniforms.uMouse.value.x += (mousePos.current.x - uniforms.uMouse.value.x) * 0.05
      uniforms.uMouse.value.y += (mousePos.current.y - uniforms.uMouse.value.y) * 0.05
    }

    // Subtle pulse
    if (groupRef.current) {
      const pulse = 1 + Math.sin(t * 0.45 * intensity) * 0.018 * intensity
      groupRef.current.scale.setScalar(pulse)
    }

    // Glow corona pulsing
    if (glowRef.current) {
      const gPulse = 0.04 + Math.sin(t * 0.7) * 0.012 * intensity
      glowRef.current.material.opacity = gPulse
    }

    // Outer atmospheric halo slow rotation
    if (outerRef.current) {
      outerRef.current.rotation.z = t * 0.05
    }
  })

  const handleMouseMove = (e) => {
    mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1
    mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  // Gravitational lensing ring geometry (very thin torus)
  const photonRingMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), [])

  return (
    <group ref={groupRef}>
      {/* ── True Raymarched Black Hole Shader Sphere ── */}
      {/* This sphere acts as the bounding volume. Rays are cast from the camera through this volume. */}
      <mesh ref={meshRef} onPointerMove={handleMouseMove}>
        <sphereGeometry args={[3.2, 64, 64]} />
        <shaderMaterial
          vertexShader={blackHoleVertexShader}
          fragmentShader={blackHoleFragmentShader}
          uniforms={uniforms}
          side={THREE.FrontSide}
          transparent={true}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
    </group>
  )
}
