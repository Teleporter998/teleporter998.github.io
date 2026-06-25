const canvas = document.getElementById('shader-canvas');

if (!canvas) {
  console.error("CRITICAL ERROR: Canvas element not found!");
}

const gl = canvas.getContext('webgl');

if (!gl) {
  console.error("CRITICAL ERROR: WebGL is not supported.");
}

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// NEW FRAGMENT SHADER: Organic, 10-Color Horror Glitch with Animated Noise
const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;

  // High-frequency hash for the raw, animated static texture
  float hash(vec2 p) {
      vec3 p3  = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
  }

  // Smooth value noise for base shapes
  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                 mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  // Fractional Brownian Motion: Creates highly detailed, irregular, cloud-like damage
  float fbm(vec2 x) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
      for (int i = 0; i < 5; ++i) { // 5 layers of detail
          v += a * noise(x);
          x = rot * x * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }

  // Maps the fluid noise into exactly 10 distinct, jagged colors
  vec3 getPurplePalette(float v) {
      // Force the smooth math into 10 harsh steps
      float stepV = floor(v * 10.0) / 9.0;
      
      vec3 c1 = vec3(0.02, 0.01, 0.03); // 1. Deep void black
      vec3 c2 = vec3(0.08, 0.02, 0.12); // 2. Very dark abyss
      vec3 c3 = vec3(0.18, 0.05, 0.25); // 3. Dark plum shadow
      vec3 c4 = vec3(0.30, 0.00, 0.35); // 4. Blood violet
      vec3 c5 = vec3(0.45, 0.08, 0.55); // 5. Amethyst
      vec3 c6 = vec3(0.55, 0.15, 0.75); // 6. Royal purple
      vec3 c7 = vec3(0.66, 0.15, 0.97); // 7. Toxic neon purple
      vec3 c8 = vec3(0.75, 0.40, 0.98); // 8. Electric lavender
      vec3 c9 = vec3(0.85, 0.65, 0.99); // 9. Pale ghostly violet
      vec3 c10= vec3(0.95, 0.90, 1.00); // 10. Piercing corrupted white

      if(stepV < 0.1) return c1;
      if(stepV < 0.2) return c2;
      if(stepV < 0.3) return c3;
      if(stepV < 0.4) return c4;
      if(stepV < 0.5) return c5;
      if(stepV < 0.6) return c6;
      if(stepV < 0.7) return c7;
      if(stepV < 0.8) return c8;
      if(stepV < 0.9) return c9;
      return c10;
  }

  void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float t = u_time * 0.6; // Overall speed of the organic mutation

      // 1. ORGANIC SHAPE DISTORTION
      // We warp the screen coordinates using the fractal noise to create fluid, non-square tearing
      vec2 warp = vec2(
          fbm(uv * 3.0 + vec2(t * 0.2, 0.0)),
          fbm(uv * 3.0 + vec2(0.0, t * 0.3))
      );
      vec2 distortedUv = uv + (warp - 0.5) * 0.4;

      // 2. REALISTIC DAMAGE GENERATION
      // Base fluid damage
      float damage = fbm(distortedUv * 4.0 - t * 0.4);
      
      // Add high-frequency jagged edges to the fluid shapes
      damage += fbm(distortedUv * 15.0 + t) * 0.25;
      
      // 3. APPLY THE 10-PURPLE PALETTE
      // Add a tiny bit of animated static to the damage input so the colors "shimmer" and fight each other
      float colorInput = clamp(damage + hash(uv + t * 10.0) * 0.08, 0.0, 1.0);
      vec3 finalColor = getPurplePalette(colorInput);

      // 4. HEAVY ANIMATED NOISE (Realistic TV Static / Film Grain)
      float staticNoise = hash(uv * u_resolution + u_time * 50.0);
      
      // Blend the harsh static into the darker areas more aggressively to create a suffocating atmosphere
      float grainIntensity = 0.20;
      finalColor = mix(finalColor, vec3(staticNoise * 0.5 + 0.2), grainIntensity * (1.2 - colorInput));

      // 5. SUFFOCATING VIGNETTE & WARPED SCANLINES
      // Crush the edges into darkness
      float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
      vig = clamp(pow(vig * 15.0, 0.35), 0.0, 1.0);
      finalColor *= vig;

      // Organic scanlines that bend and warp alongside the fluid damage
      float scanlines = abs(sin(distortedUv.y * 900.0)) * 0.04;
      finalColor -= scanlines;

      gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("SHADER COMPILE ERROR:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error("PROGRAM LINK ERROR:", gl.getProgramInfoLog(program));
}

gl.useProgram(program);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0, -1.0,  1.0,  1.0
]), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const timeLocation = gl.getUniformLocation(program, "u_time");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

function render(time) {
  time *= 0.001; 
  
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  
  gl.uniform1f(timeLocation, time);
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
