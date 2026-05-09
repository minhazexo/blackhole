import { useMemo } from 'react'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// BlendFunction constants from postprocessing (match actual enum values)
// NORMAL = 27, ADD = 4, MULTIPLY = 20
const BF_NORMAL   = 27
const BF_ADD      = 4

export default function PostProcessing({ quality = 2 }) {
  const chromaticOffset = useMemo(() => new THREE.Vector2(
    quality >= 2 ? 0.0035 : 0.002,
    quality >= 2 ? 0.0035 : 0.002
  ), [quality])

  if (quality < 0) return null

  return (
    <EffectComposer disableNormalPass multisampling={quality >= 2 ? 4 : 0}>

      {/* Primary bloom — event horizon & disk highlights */}
      <Bloom
        luminanceThreshold={quality >= 2 ? 0.12 : 0.22}
        luminanceSmoothing={quality >= 2 ? 0.95 : 0.80}
        mipmapBlur
        intensity={quality >= 2 ? 2.5 : quality >= 1 ? 1.8 : 1.2}
        radius={quality >= 2 ? 0.65 : 0.45}
        levels={quality >= 2 ? 6 : 4}
      />

      {/* Secondary bloom — wide ambient corona */}
      {quality >= 1 && (
        <Bloom
          luminanceThreshold={quality >= 2 ? 0.35 : 0.45}
          luminanceSmoothing={quality >= 2 ? 0.90 : 0.80}
          mipmapBlur
          intensity={quality >= 2 ? 1.5 : 1.0}
          radius={quality >= 2 ? 1.8 : 1.2}
          levels={quality >= 2 ? 5 : 3}
        />
      )}

      {/* Chromatic aberration — lens/gravity distortion */}
      {quality >= 1 && (
        <ChromaticAberration
          offset={chromaticOffset}
          radialModulation={true}
          modulationOffset={0.15}
          blendFunction={BF_NORMAL}
        />
      )}

      {/* Film grain — cinematic texture */}
      {quality >= 1 && (
        <Noise
          opacity={quality >= 2 ? 0.055 : 0.038}
          premultiply={false}
          blendFunction={BF_ADD}
        />
      )}

      {/* Vignette — dark cinematic frame */}
      <Vignette
        eskil={false}
        offset={quality >= 2 ? 0.28 : 0.38}
        darkness={quality >= 2 ? 0.72 : 0.82}
        blendFunction={BF_NORMAL}
      />
    </EffectComposer>
  )
}
