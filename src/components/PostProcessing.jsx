import { useMemo } from 'react'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { isMobile } from '../utils/deviceCapabilities'

// BlendFunction constants from postprocessing (match actual enum values)
// NORMAL = 27, ADD = 4, MULTIPLY = 20
const BF_NORMAL   = 27
const BF_ADD      = 4

export default function PostProcessing({ quality = 2, brightness = 1.0 }) {
  const mobile = isMobile()
  const chromaticOffset = useMemo(() => new THREE.Vector2(
    quality >= 2 ? (mobile ? 0.001 : 0.0035) : 0.002,
    quality >= 2 ? (mobile ? 0.001 : 0.0035) : 0.002
  ), [quality, mobile])

  if (quality < 0) return null

  return (
    <EffectComposer 
      disableNormalPass 
      multisampling={mobile ? 0 : (quality >= 2 ? 4 : 0)}
      frameBufferType={mobile ? THREE.HalfFloatType : THREE.UnsignedByteType}
    >
      {/* Optimized Bloom for Mobile/Desktop */}
      <Bloom
        luminanceThreshold={quality >= 2 ? 0.35 : 0.45}
        luminanceSmoothing={quality >= 2 ? 0.90 : 0.75}
        mipmapBlur={!mobile || quality >= 2} // Only use mipmap blur on high mobile or desktop
        intensity={(quality >= 2 ? (mobile ? 1.8 : 2.5) : quality >= 1 ? 1.5 : 1.0) * brightness}
        radius={quality >= 2 ? 0.65 : 0.45}
        levels={mobile ? 3 : (quality >= 2 ? 6 : 4)}
      />

      {/* Secondary bloom — Only on Desktop High Quality */}
      {!mobile && quality >= 2 && (
        <Bloom
          luminanceThreshold={0.35}
          luminanceSmoothing={0.90}
          mipmapBlur
          intensity={1.5 * brightness}
          radius={1.8}
          levels={5}
        />
      )}

      {/* Chromatic aberration — Simplified for Mobile */}
      {quality >= 1 && (
        <ChromaticAberration
          offset={chromaticOffset}
          radialModulation={!mobile} // Disable radial modulation on mobile for performance
          modulationOffset={0.15}
          blendFunction={BF_NORMAL}
        />
      )}

      {/* Film grain — Only on Desktop or High Quality Mobile */}
      {((!mobile && quality >= 1) || (mobile && quality >= 2)) && (
        <Noise
          opacity={quality >= 2 ? 0.045 : 0.03}
          premultiply={false}
          blendFunction={BF_ADD}
        />
      )}

      {/* Vignette — dark cinematic frame */}
      <Vignette
        eskil={false}
        offset={mobile ? 0.35 : (quality >= 2 ? 0.28 : 0.38)}
        darkness={quality >= 2 ? 0.72 : 0.82}
        blendFunction={BF_NORMAL}
      />
    </EffectComposer>
  )
}
