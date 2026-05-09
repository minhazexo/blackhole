// Dust field — space dust spiraling toward the black hole with scattering glow

export const dustVertexShader = `
  attribute float aSize;
  attribute float aSpeed;
  attribute vec3 aOffset;
  attribute float aLife;
  attribute vec3 aVelocity;

  varying float vLife;
  varying vec3 vColor;
  varying float vDist;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uGravity;
  uniform int uQuality;

  const float RS = 0.15;

  void main() {
    vLife = aLife;

    // Dust species: 0=cyan, 0.33=purple, 0.66=orange, 1=white
    float species = fract(aOffset.x * 17.3);
    vec3 cCyan   = vec3(0.0, 0.8, 1.0);
    vec3 cPurple = vec3(0.6, 0.1, 1.0);
    vec3 cOrange = vec3(1.0, 0.5, 0.1);
    vec3 cWhite  = vec3(0.9, 0.9, 1.0);

    if      (species < 0.25) vColor = mix(cCyan,   cPurple, species * 4.0);
    else if (species < 0.50) vColor = mix(cPurple, cOrange, (species - 0.25) * 4.0);
    else if (species < 0.75) vColor = mix(cOrange, cWhite,  (species - 0.50) * 4.0);
    else                     vColor = mix(cWhite,  cCyan,   (species - 0.75) * 4.0);

    vec3 pos = position;

    // Differential (Keplerian) rotation
    float r  = length(pos.xz);
    float orbVel = aSpeed / sqrt(max(r, 0.4));
    float ang    = atan(pos.z, pos.x) + uTime * orbVel;
    pos.x = r * cos(ang);
    pos.z = r * sin(ang);

    // Spiral infall toward black hole
    float infall = uGravity * 0.002 * (RS / max(r, RS + 0.01));
    pos.x *= (1.0 - infall);
    pos.z *= (1.0 - infall);

    // Gravity-driven vertical oscillation
    if (uQuality >= 1) {
      float grav = uGravity / (r * r + 0.8);
      pos.y += sin(uTime * 0.35 + aOffset.y * 6.28) * 0.06 * grav;
      pos   += aVelocity * sin(uTime * 0.4 + aOffset.z * 3.14) * 0.015;
    }

    vDist = r;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float d = max(-mvPos.z, 0.1);
    gl_PointSize = aSize * uPixelRatio * (80.0 / d);
  }
`;

export const dustFragmentShader = `
  varying float vLife;
  varying vec3 vColor;
  varying float vDist;

  uniform float uTime;
  uniform int uQuality;

  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);

    if (uQuality >= 1) {
      alpha *= vLife * (0.5 + 0.5 * sin(uTime * 1.8 + vDist * 4.5));
    } else {
      alpha *= vLife * 0.7;
    }

    // Light scattering: dust glows brighter near the accretion disk
    float scatter = 1.0 / (vDist * vDist * 0.5 + 0.8);
    vec3 color = vColor + vec3(0.2, 0.4, 0.8) * scatter * 0.5;

    // Soft particle glow
    float glow = exp(-dist * 5.0) * 0.4;
    color += vColor * glow;

    gl_FragColor = vec4(color, alpha * 0.45);
  }
`;
