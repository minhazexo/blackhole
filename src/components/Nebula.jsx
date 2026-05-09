import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { nebulaVertexShader, nebulaFragmentShader } from '../shaders/nebula'

export default function Nebula({ brightness = 1.0, position = [0, 0, -20], scale = 1.0, rotation = [0, 0, 0] }) {
  const meshRef = useRef()

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uColor1: { value: new THREE.Color('#0a0018') },  // Deep violet
    uColor2: { value: new THREE.Color('#001840') },  // Deep ocean blue
    uColor3: { value: new THREE.Color('#100030') },   // Dark purple
    uBrightness: { value: brightness ?? 1.0 }
  }), [])

  const { camera } = useThree()
  useFrame((state) => {
    if (uniforms) {
      if (uniforms.uTime) uniforms.uTime.value = state.clock.elapsedTime
      if (uniforms.uBrightness) uniforms.uBrightness.value = brightness
    }
    
    // Billboarding: Make nebula face the camera for a realistic volumetric appearance
    if (meshRef.current) {
      meshRef.current.quaternion.copy(camera.quaternion)
    }
  })

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Main nebula backdrop */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
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
