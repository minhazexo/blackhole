// Ultra-realistic star field with gravitational lensing, Doppler shifts, and proper magnification

export const starsVertexShader = `
  attribute float aSize;
  attribute float aSpeed;
  attribute vec3 aRandom;
  attribute float aTwinkle;
  attribute float aTemperature;

  varying float vTwinkle;
  varying vec3 vRandom;
  varying float vDistortion;
  varying float vTemperature;
  varying vec3 vWorldPos;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uIntensity;
  uniform int uQuality;

  #define PI 3.14159265359
  const float SCHWARZSCHILD_RADIUS = 0.15;

  void main() {
    vTwinkle     = aTwinkle;
    vRandom      = aRandom;
    vTemperature = aTemperature;

    vec3 pos  = position;
    vWorldPos = pos;

    float r = length(pos.xz);

    // Gravitational lensing: α = 4GM/rc²
    float deflection = 4.0 * SCHWARZSCHILD_RADIUS / max(r * r, 0.01);

    if (uQuality >= 1) {
      vec3 toCenter = normalize(vec3(-pos.x, 0.0, -pos.z));
      float lensStr = deflection * 0.6;
      pos += toCenter * lensStr;
      vDistortion = lensStr;

      // Parallax drift
      pos.x += sin(uTime * aSpeed + aRandom.x * 6.28) * 0.025;
      pos.y += cos(uTime * aSpeed * 0.7 + aRandom.y * 6.28) * 0.025;
    } else {
      vDistortion = 0.0;
    }

    // Mouse gravitational bend
    if (uQuality >= 1) {
      vec4 proj = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      vec2 screenPos = proj.xy / proj.w;
      vec2 mDelta = uMouse - screenPos;
      float mDist = length(mDelta);
      float bend  = (0.45 * uIntensity) / (mDist * mDist + 0.12);
      float falloff = smoothstep(1.2, 0.0, mDist);
      pos.xy += normalize(mDelta) * bend * 0.045 * falloff;

      if (uQuality >= 2) {
        float wave = sin(mDist * 22.0 - uTime * 3.0) * 0.007 * falloff;
        pos.z += wave;
      }
    }

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Twinkle (time-dilated near BH)
    float twinkle;
    if (uQuality >= 1) {
      float td = sqrt(max(1.0 - SCHWARZSCHILD_RADIUS / max(r, SCHWARZSCHILD_RADIUS + 0.001), 0.0));
      float dt = uTime * td;
      twinkle = 0.5 + 0.5 * sin(dt * 2.2 + aRandom.z * 6.28);
      twinkle *= td;
      // Brightened by mouse proximity
      twinkle *= (1.0 + 0.5 * smoothstep(1.0, 0.0, length(uMouse - (gl_Position.xy / gl_Position.w))));
    } else {
      twinkle = 0.5 + 0.5 * sin(uTime + aRandom.z * 6.28);
    }

    // Gravitational magnification
    float mag = 1.0;
    if (uQuality >= 1) {
      float eA = sqrt(max(4.0 * SCHWARZSCHILD_RADIUS * (r - SCHWARZSCHILD_RADIUS), 0.0));
      mag = clamp(1.0 + pow(eA / max(r, 0.01), 2.0), 1.0, 4.0);
    }

    gl_PointSize = aSize * uPixelRatio * (0.5 + 0.5 * twinkle) * mag;
  }
`;

export const starsFragmentShader = `
  varying float vTwinkle;
  varying vec3 vRandom;
  varying float vDistortion;
  varying float vTemperature;
  varying vec3 vWorldPos;

  uniform float uTime;
  uniform float uIntensity;
  uniform int uQuality;
  uniform float uBrightness;

  // Blackbody approximation
  vec3 blackbody(float t) {
    vec3 cool   = vec3(1.0, 0.6, 0.35);
    vec3 medium = vec3(1.0, 0.95, 0.88);
    vec3 hot    = vec3(0.72, 0.87, 1.0);
    if (t < 0.5) return mix(cool, medium, t * 2.0);
    return mix(medium, hot, (t - 0.5) * 2.0);
  }

  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);

    if (uQuality >= 1) {
      alpha *= (0.55 + 0.45 * sin(uTime * 1.6 + vRandom.x * 6.28));
      alpha *= (1.0 + vDistortion * 0.9);
    }

    vec3 color = blackbody(vTemperature);

    if (uQuality >= 1) {
      color += vec3(0.08, 0.12, 0.18) * sin(vRandom.y * 6.28);
      float blue = smoothstep(0.0, 0.5, vDistortion);
      color = mix(color, vec3(0.7, 0.88, 1.0), blue * 0.35);
    }

    color *= (0.75 + 0.25 * uIntensity);

    // Star glow core
    float glow = exp(-dist * 3.5);
    if (uQuality >= 2) {
      color += vec3(0.18, 0.22, 0.35) * glow * 0.6;
    }

    // Chromatic fringe on highly lensed stars
    if (uQuality >= 2 && vDistortion > 0.28) {
      float ch = vDistortion * 0.12;
      color.r *= (1.0 + ch);
      color.b *= (1.0 - ch * 0.5);
    }

    gl_FragColor = vec4(color * uBrightness, alpha);
  }
`;
