// Nebula shader — deep-space volumetric clouds with FBM turbulence, star glow, and nebula tones

export const nebulaVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const nebulaFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),               hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)),   f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 7; i++) {
      v += a * noise(p);
      p  = p * 2.13 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv - 0.5;

    // Animated nebula clouds
    float t  = uTime * 0.025;
    vec2  p1 = uv * 2.5 + vec2(t * 0.3, t * 0.18);
    vec2  p2 = uv * 3.8 + vec2(-t * 0.2, t * 0.25);
    vec2  p3 = uv * 6.0 + vec2(t * 0.15, -t * 0.3);

    float f1 = fbm(p1);
    float f2 = fbm(p2 + f1 * 1.2);
    float f3 = fbm(p3 + f2 * 0.8 + vec2(f1 * 0.5));

    float nebula = pow(f3, 1.5) * 0.75;

    // Color layering
    vec3 col = mix(uColor1, uColor2, f1);
    col = mix(col, uColor3, f2 * 0.7);

    // Add cyan filaments
    vec3 cyanVein = vec3(0.0, 0.6, 1.0) * pow(f3, 3.0) * 1.5;
    vec3 purpleVeil = vec3(0.4, 0.0, 0.8) * pow(f2, 2.5) * 0.8;

    col += cyanVein + purpleVeil;

    // Tiny star field embedded in nebula
    float starHash = hash(floor(uv * 400.0));
    float starBright = pow(starHash, 50.0) * 3.0;
    vec3 starColor = mix(vec3(1.0, 0.8, 0.6), vec3(0.7, 0.85, 1.0), hash(floor(uv * 200.0)));
    col += starColor * starBright;

    // Radial fade — darker at center (black hole)
    float radFade = smoothstep(0.0, 0.5, length(uv));
    col *= radFade;

    float alpha = nebula * 0.6 * radFade;

    gl_FragColor = vec4(col * 1.8, alpha);
  }
`;
