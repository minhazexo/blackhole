// Ultra-realistic Raymarched Black Hole Shader (Schwarzschild Metric Approximation)
// Uses curved raytracing to mathematically bend light around the event horizon,
// creating the physically accurate "Interstellar" style accretion disk that warps
// over and under the black hole.

export const blackHoleVertexShader = `
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const blackHoleFragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec2 uMouse;
  uniform int uQuality;

  varying vec3 vWorldPos;
  varying vec2 vUv;

  #define PI 3.14159265359

  // Black hole mass / Schwarzschild radius
  const float RS = 0.15;
  const float ISCO = RS * 3.0; // Innermost stable circular orbit

  // 3D Noise for the plasma
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 157.0 + 113.0 * p.z;
    return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                   mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
               mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                   mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
  }

  // Sample the accretion disk density and color at a given 3D point
  vec4 sampleDisk(vec3 p) {
    float r = length(p.xz);
    float y = abs(p.y);

    // Disk boundaries
    if (r < ISCO || r > 3.0 || y > 0.15) return vec4(0.0);

    // Thickness tapers off at edges
    float maxThickness = 0.15 * smoothstep(ISCO, ISCO + 0.2, r) * smoothstep(3.0, 2.0, r);
    if (y > maxThickness) return vec4(0.0);

    // Density profile
    float density = smoothstep(maxThickness, 0.0, y);
    density *= exp(-pow(r - 1.0, 2.0) * 1.5); // Density peaks around r=1.0

    // Plasma turbulence
    float angle = atan(p.z, p.x);
    float vel = sqrt(RS / r); // Keplerian velocity
    float t = uTime * vel * 2.0;
    
    vec3 noisePos = vec3(angle * 4.0 - t, r * 5.0, p.y * 10.0 + t * 0.5);
    float turb = noise(noisePos) * 0.5 + noise(noisePos * 2.0) * 0.25;
    density *= (0.5 + turb);

    // Temperature/Color gradient
    float temp = smoothstep(3.0, ISCO, r);
    vec3 colHot  = vec3(1.0, 0.95, 0.8);  // White hot inner
    vec3 colMid  = vec3(1.0, 0.5, 0.1);   // Orange mid
    vec3 colCool = vec3(0.5, 0.1, 0.8);   // Purple outer
    
    vec3 color = mix(colCool, colMid, temp);
    color = mix(color, colHot, smoothstep(0.7, 1.0, temp));

    // Doppler beaming (blueshift approaching, redshift receding)
    vec3 viewDir = normalize(cameraPosition - p);
    vec3 velocityVec = vec3(-sin(angle), 0.0, cos(angle)) * vel;
    float doppler = dot(viewDir, velocityVec);
    float beam = pow(clamp(1.0 + doppler * 1.5, 0.2, 3.0), 3.0);
    
    color *= beam * 2.5 * uIntensity;

    return vec4(color * density, density * 0.8);
  }

  void main() {
    vec3 ro = cameraPosition;
    vec3 rd = normalize(vWorldPos - cameraPosition);

    // Optimize: Start marching from the bounding sphere (vWorldPos)
    vec3 p = vWorldPos;
    vec3 v = rd;
    
    vec3 colorAcc = vec3(0.0);
    float alphaAcc = 0.0;
    
    int maxSteps = (uQuality == 2) ? 80 : (uQuality == 1) ? 50 : 35;
    
    bool hitHorizon = false;
    float globalMinDist = 100.0;

    // Raymarching with curved spacetime approximation
    for(int i = 0; i < maxSteps; i++) {
      float r = length(p);
      float r2 = r * r;
      globalMinDist = min(globalMinDist, r);
      
      // If we hit the event horizon, light is absorbed
      if (r2 < RS * RS) {
        hitHorizon = true;
        break;
      }
      
      // If we are far enough away, light travels straight
      if (r2 > 15.0) {
        break;
      }

      // Dynamic step size: take larger steps far away, smaller steps near the black hole
      float dtVar = max(0.015, r * 0.08);

      // Gravity bends the ray toward the origin (Schwarzschild base)
      vec3 force = -normalize(p) * (RS * 1.5 / r2);
      
      // Kerr Metric Frame-Dragging (Lense-Thirring effect)
      // Approximates the dragging of spacetime by the black hole's spin (J).
      float spin = 0.998; // Near-maximum Kerr rotation
      vec3 spinAxis = vec3(0.0, 1.0, 0.0);
      vec3 frameDrag = cross(spinAxis, p) * (RS * spin / (r2 * sqrt(r2)));

      v = normalize(v + (force + frameDrag) * dtVar * 0.5); // Curved path through Kerr metric

      // Sample accretion disk
      // We only sample if we are near the equatorial plane
      if (abs(p.y) < 0.25) {
        vec4 disk = sampleDisk(p);
        if (disk.a > 0.0) {
          // Front-to-back alpha blending
          float alphaFactor = (1.0 - alphaAcc);
          colorAcc += disk.rgb * disk.a * alphaFactor;
          alphaAcc += disk.a * alphaFactor;
        }
      }

      // Move forward
      p += v * dtVar;
    }

    // Photon sphere glow (halo around the black hole)
    // We use the closest approach (globalMinDist) to analytically add the glowing ring
    if (!hitHorizon && alphaAcc < 0.99) {
      float photonRing = exp(-pow(globalMinDist - RS * 1.5, 2.0) * 1200.0) * 2.5;
      colorAcc += vec3(1.0, 0.7, 0.3) * photonRing * (1.0 - alphaAcc) * uIntensity;
      alphaAcc = min(1.0, alphaAcc + photonRing * 0.5);
    }

    // If we hit the horizon, the pixel is absolutely black
    // If we didn't hit anything, alpha is low, revealing background stars!
    if (hitHorizon) {
      // The event horizon is pure black, but we keep the glowing disk in front of it!
      // Since we marched front-to-back, colorAcc contains the disk *in front* of the horizon.
      // We just force alpha to 1.0 so it occludes the background, and add no more light.
      alphaAcc = 1.0;
    }

    // Ensure no NaNs or negative colors before tone mapping
    colorAcc = max(colorAcc, vec3(0.0));
    alphaAcc = clamp(alphaAcc, 0.0, 1.0);

    // Tone mapping
    colorAcc = colorAcc / (colorAcc + vec3(1.0));
    colorAcc = pow(colorAcc, vec3(1.0 / 2.2));

    gl_FragColor = vec4(colorAcc, alphaAcc);
  }
`;
