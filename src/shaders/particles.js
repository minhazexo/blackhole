// Keplerian particle orbital shader — ultra-realistic accretion disk dynamics
// Tidal stretching, relativistic Doppler, time dilation, color gradients

export const particleVertexShader = `
  attribute float aSize;
  attribute float aSpeed;
  attribute vec3 aOffset;
  attribute float aLife;
  attribute float aOrbitRadius;
  attribute float aOrbitAngle;
  attribute float aInclination;

  varying float vLife;
  varying vec3 vOffset;
  varying float vOrbitRadius;
  varying vec3 vWorldPos;
  varying float vVelocity;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uGravity;
  uniform int uQuality;

  #define PI 3.14159265359
  const float SCHWARZSCHILD_RADIUS = 0.15;

  void main() {
    vLife        = aLife;
    vOffset      = aOffset;
    vOrbitRadius = aOrbitRadius;

    // Keplerian velocity: v ∝ 1/sqrt(r)
    float orbVel = 1.0 / sqrt(max(aOrbitRadius, 0.3));

    float currentAngle = aOrbitAngle + uTime * orbVel * aSpeed;

    float cosInc = cos(aInclination);
    float sinInc = sin(aInclination);

    float x = aOrbitRadius * cos(currentAngle);
    float z = aOrbitRadius * sin(currentAngle);

    vec3 pos;
    pos.x = x * cosInc;
    pos.y = x * sinInc;
    pos.z = z;

    // Vertical wobble (magnetic field oscillation)
    if (uQuality >= 1) {
      pos.y += sin(uTime * 0.25 + aOffset.y * PI * 2.0) * 0.12 * aOrbitRadius;
    }

    // Tidal stretching
    float r = length(pos.xz);
    float tidalFactor = 1.0;
    if (uQuality >= 1) {
      tidalFactor = 1.0 + (SCHWARZSCHILD_RADIUS * 2.5) / max(pow(r, 3.0), 0.001);
      vec3 radDir = normalize(pos);
      pos += radDir * (tidalFactor - 1.0) * 0.08;
    }

    // Time dilation
    float td = sqrt(max(1.0 - SCHWARZSCHILD_RADIUS / max(r, SCHWARZSCHILD_RADIUS + 0.001), 0.0));
    vVelocity = orbVel * td;
    vWorldPos = pos;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float dist = -mvPos.z;
    gl_PointSize = aSize * uPixelRatio * (80.0 / max(dist, 0.1));

    if (uQuality >= 1) {
      gl_PointSize *= tidalFactor;
    }
  }
`;

export const particleFragmentShader = `
  varying float vLife;
  varying vec3 vOffset;
  varying float vOrbitRadius;
  varying vec3 vWorldPos;
  varying float vVelocity;

  uniform float uTime;
  uniform int uQuality;
  uniform float uBrightness;

  const float SCHWARZSCHILD_RADIUS = 0.15;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha *= vLife;

    // Horizon absorption - particles fade near event horizon
    float horizonFade = smoothstep(SCHWARZSCHILD_RADIUS, SCHWARZSCHILD_RADIUS * 1.5, vOrbitRadius);
    alpha *= horizonFade;

    // Temperature gradient: inner = blue-hot, outer = orange-cool
    float temp = 1.0 - smoothstep(0.4, 3.5, vOrbitRadius);

    vec3 ultraHot = vec3(0.9, 0.95, 1.0);
    vec3 hot      = vec3(0.4, 0.75, 1.0);
    vec3 mid      = vec3(0.3, 0.55, 1.0);
    vec3 cool     = vec3(1.0, 0.45, 0.12);
    vec3 purple   = vec3(0.7, 0.15, 1.0);

    vec3 color;
    if      (temp > 0.75) color = mix(hot,    ultraHot, (temp - 0.75) / 0.25);
    else if (temp > 0.50) color = mix(mid,    hot,      (temp - 0.50) / 0.25);
    else if (temp > 0.25) color = mix(cool,   mid,      (temp - 0.25) / 0.25);
    else                  color = mix(purple, cool,     temp / 0.25);

    // Variation
    float v = hash(vOffset.x * 37.1 + vOffset.y * 91.7);
    color *= 0.75 + 0.5 * v;

    // Relativistic Doppler brightening
    if (uQuality >= 1) {
      float doppler = 1.0 / sqrt(max(1.0 - min(vVelocity * vVelocity, 0.98), 0.001));
      color *= clamp(doppler, 0.5, 3.0);
    }

    // Animated pulse
    if (uQuality >= 1) {
      float pulse = sin(uTime * 2.2 + vOffset.z * 6.28) * 0.5 + 0.5;
      color *= 0.8 + 0.4 * pulse;
    }

    // Glow core
    float glow = exp(-dist * 4.5);
    if (uQuality >= 2) {
      color += vec3(0.25, 0.45, 0.7) * glow * 0.6;
    }

    float edgeFade = smoothstep(0.5, 0.25, dist);
    alpha *= edgeFade;

    gl_FragColor = vec4(color * uBrightness, alpha * 0.75);
  }
`;
