// Accretion disk GLSL shader — full custom GPU disk with Doppler beaming and plasma effects

export const accretionDiskVertexShader = `
  attribute vec3 aColor;
  attribute float aSize;

  varying vec3 vColor;
  varying float vOrbitRadius;
  varying vec3 vWorldPos;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform int uQuality;

  const float INNER = 0.45;
  const float OUTER = 2.8;
  const float RS    = 0.15;

  void main() {
    vColor = aColor;
    vWorldPos = position;

    float r = length(position.xz);
    vOrbitRadius = r;

    float orbVel = 1.0 / sqrt(max(r, 0.3));
    float angle  = atan(position.z, position.x);
    float newAngle = angle + uTime * orbVel;

    vec3 pos;
    pos.x = r * cos(newAngle);
    pos.y = position.y;
    pos.z = r * sin(newAngle);

    // Vertical oscillation (MHD waves)
    if (uQuality >= 1) {
      float mhd = sin(uTime * 0.4 + r * 8.0) * 0.06 * exp(-r * 0.8);
      pos.y += mhd;
    }

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float d = -mvPos.z;
    gl_PointSize = aSize * uPixelRatio * (90.0 / max(d, 0.1));
  }
`;

export const accretionDiskFragmentShader = `
  varying vec3 vColor;
  varying float vOrbitRadius;

  uniform float uTime;
  uniform float uIntensity;

  const float INNER = 0.45;
  const float OUTER = 2.8;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;

    float relR = (vOrbitRadius - INNER) / (OUTER - INNER);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha *= (0.7 + 0.3 * sin(uTime * 1.8 + vOrbitRadius * 12.0));
    alpha *= (0.6 + 0.4 * (1.0 - relR));
    alpha  = clamp(alpha, 0.0, 1.0);

    vec3 color = vColor;

    // Plasma flicker
    float flicker = hash(vOrbitRadius * 47.3 + uTime * 0.1) * 0.3;
    color *= (0.85 + flicker);

    // Bright inner ring
    float innerGlow = exp(-pow(vOrbitRadius - INNER, 2.0) * 30.0) * 2.0;
    color += vec3(1.0, 0.95, 0.8) * innerGlow * uIntensity;

    gl_FragColor = vec4(color * uIntensity, alpha * 0.85);
  }
`;
