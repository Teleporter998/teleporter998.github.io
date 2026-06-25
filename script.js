const canvas = document.getElementById('shader-canvas');

if (!canvas) {
  console.error("CRITICAL ERROR: Canvas element not found! Make sure your index.html has <canvas id='shader-canvas'></canvas>");
}

const gl = canvas.getContext('webgl');

if (!gl) {
  console.error("CRITICAL ERROR: WebGL is not supported or is disabled in this browser.");
}

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// NEW FRAGMENT SHADER: High-Detail Horror Glitch
const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;

  // Pseudo-random noise
  float rand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  // 1D Noise for organic flickering
  float noise(float p) {
      float fl = floor(p);
      float fc = fract(p);
      return mix(rand(vec2(fl, fl)), rand(vec2(fl + 1.0, fl + 1.0)), fc);
  }

  void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      
      // HORROR MECHANIC 1: Uneasy, irregular time pacing
      // Mixes sharp digital ticks with organic, dying-light flickering
      float digitalTime = floor(u_time * 18.0); 
      float organicFlicker = noise(u_time * 6.0);
      
      // Screen shake hazard (triggers violently on high noise peaks)
      float shake = step(0.96, rand(vec2(u_time, u_time))) * 0.03;
      vec2 distortedUv = uv;
      distortedUv.x += (rand(vec2(digitalTime, 0.0)) - 0.5) * shake;

      // HORROR MECHANIC 2: Tearing the screen into macro (chunky) and micro (fine) damage
      float macroRow = floor(distortedUv.y * 15.0);
      float microRow = floor(distortedUv.y * 200.0);
      
      float isMacroGlitch = step(0.92, rand(vec2(macroRow, digitalTime * 0.5)));
      float isMicroGlitch = step(0.82, rand(vec2(microRow, digitalTime)));

      // Apply horizontal tearing
      float shift = 0.0;
      if (isMacroGlitch > 0.0) shift += (rand(vec2(macroRow, digitalTime + 1.0)) - 0.5) * 0.4;
      if (isMicroGlitch > 0.0) shift += (rand(vec2(microRow, digitalTime + 2.0)) - 0.5) * 0.08;
      
      distortedUv.x += shift;

      // DETAIL: Extremely dense mathematical grid for static artifacts
      float blockX = floor(distortedUv.x * 250.0);
      float blockY = floor(distortedUv.y * 250.0);
      float detailNoise = rand(vec2(blockX, blockY + digitalTime));

      // HORROR MECHANIC 3: "Bleeding" vertical pixels dragging down
      float bleedNoise = rand(vec2(floor(distortedUv.x * 120.0), floor(distortedUv.y * 8.0 - u_time * 4.0)));
      float bleed = step(0.96, bleedNoise) * step(0.5, rand(vec2(distortedUv.x, digitalTime)));

      // MULTIPLE PURPLE COLORS: Deep void to corrupted neon
      vec3 voidBlack   = vec3(0.02, 0.01, 0.03); // Suffocating dark
      vec3 darkPlum    = vec3(0.12, 0.02, 0.18); // Bruised shadow
      vec3 bloodViolet = vec3(0.40, 0.00, 0.35); // Sinister magenta-purple
      vec3 neonPurple  = vec3(0.66, 0.15, 0.97); // Electric/toxic purple
      vec3 ghostWhite  = vec3(0.90, 0.80, 1.00); // Piercing, dead monitor white

      vec3 finalColor = voidBlack;

      // Base volatile background static
      if (rand(distortedUv + u_time) > 0.85) finalColor = darkPlum;

      // Paint the digital destruction layers
      if (isMacroGlitch > 0.0 || isMicroGlitch > 0.0) {
          if (detailNoise > 0.96) finalColor = ghostWhite;
          else if (detailNoise > 0.80) finalColor = neonPurple;
          else if (detailNoise > 0.45) finalColor = bloodViolet;
          else if (detailNoise > 0.15) finalColor = darkPlum;
      }

      // Apply the bleeding anomaly
      if (bleed > 0.0) {
          finalColor = mix(finalColor, bloodViolet, 0.85);
      }

      // HORROR MECHANIC 4: Claustrophobic Vignette (crushes the edges)
      float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
      vig = clamp(pow(vig * 25.0, 0.25), 0.0, 1.0);
      finalColor *= vig;

      // Dim the whole screen during organic flicker drops (simulated power failure)
      finalColor *= mix(0.4, 1.0, organicFlicker);

      // Heavy industrial scanlines
      finalColor -= abs(sin(uv.y * 1200.0)) * 0.04;

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
