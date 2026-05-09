import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { starsVertexShader, starsFragmentShader } from '../shaders/stars'

export default function StarField({ 
  count = 3000, 
  intensity = 1, 
  quality = 2, 
  brightness = 1.0,
  minRadius = 10,
  maxRadius = 50,
  sizeMultiplier = 1.0
}) {
  const pointsRef = useRef()
  const mousePos = useRef({ x: 0, y: 0 })

  const [positions, sizes, speeds, randoms, twinkles, temperatures] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const spd = new Float32Array(count)
    const rnd = new Float32Array(count * 3)
    const twk = new Float32Array(count)
    const temp = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Use cubic distribution for more realistic uniform volume density
      const radius = minRadius + Math.pow(Math.random(), 0.5) * (maxRadius - minRadius)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i3 + 2] = radius * Math.cos(phi)

      siz[i] = (0.5 + Math.random() * 2) * sizeMultiplier
      spd[i] = 0.1 + Math.random() * 0.5
      rnd[i3] = Math.random()
      rnd[i3 + 1] = Math.random()
      rnd[i3 + 2] = Math.random()
      twk[i] = Math.random()
      
      // Star temperature: 0.0 (cool/red) to 1.0 (hot/blue)
      // Larger stars tend to be hotter
      temp[i] = Math.random() * 0.8 + (siz[i] / 3.0) * 0.2
    }

    return [pos, siz, spd, rnd, twk, temp]
  }, [count])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uIntensity: { value: intensity ?? 1 },
    uQuality: { value: quality ?? 2 },
    uBrightness: { value: brightness ?? 1.0 }
  }), [intensity, quality])

  useEffect(() => {
    const handleMouse = (e) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  useFrame((state) => {
    if (uniforms) {
      if (uniforms.uTime) uniforms.uTime.value = state.clock.elapsedTime
      if (uniforms.uMouse && uniforms.uMouse.value) {
        uniforms.uMouse.value.x += (mousePos.current.x - uniforms.uMouse.value.x) * 0.05
        uniforms.uMouse.value.y += (mousePos.current.y - uniforms.uMouse.value.y) * 0.05
      }
      if (uniforms.uIntensity) uniforms.uIntensity.value = intensity
      if (uniforms.uBrightness) uniforms.uBrightness.value = brightness
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={count} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={3} />
        <bufferAttribute attach="attributes-aTwinkle" count={count} array={twinkles} itemSize={1} />
        <bufferAttribute attach="attributes-aTemperature" count={count} array={temperatures} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={starsVertexShader}
        fragmentShader={starsFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
