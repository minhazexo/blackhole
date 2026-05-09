import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dustVertexShader, dustFragmentShader } from '../shaders/dust'

export default function DustField({ count = 2500, intensity = 1, quality = 2, brightness = 1.0 }) {
  const pointsRef = useRef()

  const [positions, sizes, speeds, offsets, lives, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const spd = new Float32Array(count)
    const off = new Float32Array(count * 3)
    const lif = new Float32Array(count)
    const vel = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 1.8 + Math.random() * 6
      const angle = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 1.2

      pos[i3] = radius * Math.cos(angle)
      pos[i3 + 1] = y
      pos[i3 + 2] = radius * Math.sin(angle)

      siz[i] = 0.5 + Math.random() * 2
      spd[i] = 0.15 + Math.random() * 0.6
      off[i3] = Math.random()
      off[i3 + 1] = Math.random()
      off[i3 + 2] = Math.random()
      lif[i] = 0.3 + Math.random() * 0.7
      vel[i3] = (Math.random() - 0.5) * 0.1
      vel[i3 + 1] = (Math.random() - 0.5) * 0.05
      vel[i3 + 2] = (Math.random() - 0.5) * 0.1
    }

    return [pos, siz, spd, off, lif, vel]
  }, [count])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
    uGravity: { value: intensity ?? 1 },
    uQuality: { value: quality ?? 2 },
    uBrightness: { value: brightness ?? 1.0 }
  }), [intensity, quality])

  useFrame((state) => {
    if (uniforms) {
      if (uniforms.uTime) uniforms.uTime.value = state.clock.elapsedTime
      if (uniforms.uGravity) uniforms.uGravity.value = intensity
      if (uniforms.uBrightness) uniforms.uBrightness.value = brightness
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={count} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aOffset" count={count} array={offsets} itemSize={3} />
        <bufferAttribute attach="attributes-aLife" count={count} array={lives} itemSize={1} />
        <bufferAttribute attach="attributes-aVelocity" count={count} array={velocities} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={dustVertexShader}
        fragmentShader={dustFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
