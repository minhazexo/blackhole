import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { nebulaVertexShader, nebulaFragmentShader } from '../shaders/nebula'

export default function Nebula() {
  const meshRef = useRef()

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uColor1: { value: new THREE.Color('#0a0018') },  // Deep violet
    uColor2: { value: new THREE.Color('#001840') },  // Deep ocean blue
    uColor3: { value: new THREE.Color('#100030') }   // Dark purple
  }), [])

  useFrame((state) => {
    if (uniforms && uniforms.uTime) {
      uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <group>
      {/* Main nebula backdrop */}
      <mesh ref={meshRef} position={[0, 0, -20]}>
        <planeGeometry args={[50, 50, 1, 1]} />
        <shaderMaterial
          vertexShader={nebulaVertexShader}
          fragmentShader={nebulaFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Side nebula panel — adds depth */}
      <mesh position={[-20, 0, -10]} rotation={[0, Math.PI / 3, 0]}>
        <planeGeometry args={[40, 40, 1, 1]} />
        <shaderMaterial
          vertexShader={nebulaVertexShader}
          fragmentShader={nebulaFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Top nebula panel */}
      <mesh position={[18, 8, -12]} rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
        <planeGeometry args={[35, 35, 1, 1]} />
        <shaderMaterial
          vertexShader={nebulaVertexShader}
          fragmentShader={nebulaFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
