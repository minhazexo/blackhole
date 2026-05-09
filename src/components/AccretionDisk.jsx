import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { accretionDiskVertexShader, accretionDiskFragmentShader } from '../shaders/accretionDisk'

// Temperature-based color for a given normalized radius
function diskColor(relR) {
  // Inner: white-hot → blue → cyan → orange → red-purple (outer)
  if (relR < 0.08) return new THREE.Color(1.0, 1.0, 1.0)          // white hot
  if (relR < 0.20) return new THREE.Color(0.85, 0.92, 1.0)        // blue-white
  if (relR < 0.35) return new THREE.Color(0.4,  0.75, 1.0)        // cyan
  if (relR < 0.55) return new THREE.Color(0.0,  0.5,  1.0)        // blue
  if (relR < 0.70) return new THREE.Color(1.0,  0.45, 0.08)       // orange
  if (relR < 0.85) return new THREE.Color(0.9,  0.15, 0.4)        // red-pink
  return new THREE.Color(0.55, 0.05, 0.85)                         // purple outer
}

export default function AccretionDisk({
  count       = 8000,
  innerRadius = 0.45,
  outerRadius = 2.8,
  quality     = 2,
  intensity   = 1
}) {
  const pointsRef = useRef()

  const { positions, colors, sizes } = useMemo(() => {
    const pos  = new Float32Array(count * 3)
    const col  = new Float32Array(count * 3)
    const siz  = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Log-weighted distribution → more particles near inner edge
      const t      = Math.pow(Math.random(), 0.55)
      const radius = innerRadius + (outerRadius - innerRadius) * t
      const angle  = Math.random() * Math.PI * 2

      pos[i3]     = radius * Math.cos(angle)
      pos[i3 + 1] = (Math.random() - 0.5) * 0.025 * (1 - t * 0.7)  // very thin disk
      pos[i3 + 2] = radius * Math.sin(angle)

      const relR = t
      const c    = diskColor(relR)

      // Vary brightness per particle
      const bright = 0.7 + Math.random() * 0.6
      col[i3]     = Math.min(c.r * bright, 1.0)
      col[i3 + 1] = Math.min(c.g * bright, 1.0)
      col[i3 + 2] = Math.min(c.b * bright, 1.0)

      // Inner particles are larger and brighter
      siz[i] = (0.6 + Math.random() * 2.4) * (1.2 - t * 0.5)
    }

    return { positions: pos, colors: col, sizes: siz }
  }, [count, innerRadius, outerRadius])

  const uniforms = useMemo(() => ({
    uTime:       { value: 0 },
    uPixelRatio: { value: Math.min(window?.devicePixelRatio ?? 1, 2) },
    uIntensity:  { value: intensity },
    uQuality:    { value: quality }
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state) => {
    if (uniforms) {
      uniforms.uTime.value      = state.clock.elapsedTime
      uniforms.uIntensity.value = intensity
      uniforms.uQuality.value   = quality
    }
  })

  return (
    // Tilt the disk 20° to show Doppler beaming asymmetry
    <group rotation={[0.35, 0, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-aColor"   count={count} array={colors}    itemSize={3} />
          <bufferAttribute attach="attributes-aSize"    count={count} array={sizes}     itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={accretionDiskVertexShader}
          fragmentShader={accretionDiskFragmentShader}
          uniforms={uniforms}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  )
}
