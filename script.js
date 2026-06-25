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

// NEW FRAGMENT SHADER: Digital Glitch Effect
const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;

  // Pseudo-random number generator
  float rand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      
      // Create a snappy timeline that "jumps" instead of flowing smoothly
      // The multiplier (12.0) controls the framerate of the glitch
      float time = floor(u_time * 12.0);

      // Split the screen into horizontal rows
      float row = floor(uv.y * 90.0);
      
      // Determine if this specific row is "glitching" right now
      float isGlitchRow = step(0.92, rand(vec2(row, time)));
      
      // Calculate how much to shift the row horizontally to simulate a tear
      float shift = (rand(vec2(row, time + 1.0)) - 0.5) * 0.3;
      
      // Apply the shift only to the active glitching rows
      vec2 distortedUv = uv;
      distortedUv.x += shift * isGlitchRow;

      // Create digital "blocks" along the X axis
      // Stretching them out so they look like horizontal data streaks
      float block = floor(distortedUv.x * 12.0);
      
      // Generate noise to decide which blocks get colored
      float noise = rand(vec2(block, row + time));

      // Color Palette
      vec3 black = vec3(0.03, 0.02, 0.04);       // Deep background void
      vec3 purpleBright = vec3(0.66, 0.33, 0.97); // Main accent
      vec3 purpleDark = vec3(0.25, 0.05, 0.4);    // Faded digital artifact

      // Start with a black canvas
      vec3 finalColor = black;

      // If this row is glitching, scatter some colored blocks across it
      if (isGlitchRow > 0.0) {
          if (noise > 0.8) {
              finalColor = purpleBright; // Sharp, bright streaks
          } else if (noise > 0.5) {
              finalColor = purpleDark;   // Muted, background streaks
          }
      }

      // Add a very subtle, static scanline overlay to sell the CRT monitor feel
      finalColor -= abs(sin(uv.y * 1200.0)) * 0.015;

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
