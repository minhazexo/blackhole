import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { particleVertexShader, particleFragmentShader } from '../shaders/particles'

export default function ParticleSystem({ count = 1500, intensity = 1, quality = 2 }) {
  const pointsRef = useRef()

  const [positions, sizes, speeds, offsets, lives, orbitRadii, orbitAngles, inclinations] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const spd = new Float32Array(count)
    const off = new Float32Array(count * 3)
    const lif = new Float32Array(count)
    const orbRad = new Float32Array(count)
    const orbAng = new Float32Array(count)
    const inc = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Orbital radius - distributed from inner to outer disk
      const radius = 0.5 + Math.random() * 3.5
      const angle = Math.random() * Math.PI * 2
      const inclination = (Math.random() - 0.5) * 0.3 // Slight orbital tilt
      
      // Initial position
      pos[i3] = radius * Math.cos(angle)
      pos[i3 + 1] = (Math.random() - 0.5) * 0.3
      pos[i3 + 2] = radius * Math.sin(angle)

      // Particle properties
      siz[i] = 1 + Math.random() * 4
      spd[i] = 0.5 + Math.random() * 1.5 // Orbital speed multiplier
      off[i3] = Math.random()
      off[i3 + 1] = Math.random()
      off[i3 + 2] = Math.random()
      lif[i] = 0.5 + Math.random() * 0.5
      
      // Orbital parameters
      orbRad[i] = radius
      orbAng[i] = angle
      inc[i] = inclination
    }

    return [pos, siz, spd, off, lif, orbRad, orbAng, inc]
  }, [count])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
    uGravity: { value: intensity ?? 1 },
    uQuality: { value: quality ?? 2 }
  }), [intensity, quality])

  useFrame((state) => {
    if (uniforms) {
      if (uniforms.uTime) uniforms.uTime.value = state.clock.elapsedTime
      if (uniforms.uGravity) uniforms.uGravity.value = intensity
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
        <bufferAttribute attach="attributes-aOrbitRadius" count={count} array={orbitRadii} itemSize={1} />
        <bufferAttribute attach="attributes-aOrbitAngle" count={count} array={orbitAngles} itemSize={1} />
        <bufferAttribute attach="attributes-aInclination" count={count} array={inclinations} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
