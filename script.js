const canvas = document.getElementById('shader-canvas');
const gl = canvas.getContext('webgl');

// Vertex Shader: A simple rectangle covering the entire screen
const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Fragment Shader: The mathematical magic creating the topography
const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;

  // Pseudo-random hash function
  vec2 hash(vec2 p) {
      p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
      return -1.0 + 2.0 * fract(sin(p)*43758.5453123);
  }

  // Simplex-style noise calculation
  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(dot(hash(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                     dot(hash(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
                 mix(dot(hash(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                     dot(hash(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
  }

  void main() {
      // Normalize screen coordinates
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      uv.x *= u_resolution.x / u_resolution.y;

      // Zoom out to show more detail
      uv *= 2.5;

      // Create an omnidirectional flowing movement over time
      vec2 movement = vec2(
          noise(uv + u_time * 0.05),
          noise(uv + vec2(4.2, 1.8) - u_time * 0.08)
      );

      // Distort the coordinates using the noise algorithm
      float n = noise(uv + movement * 2.0);

      // Create the contour "stripes" (Topography effect)
      // The multiplier (25.0) controls how many lines there are
      float lines = abs(sin(n * 25.0));

      // Sharpen the lines so they look like solid topography bands
      lines = smoothstep(0.85, 0.98, lines);

      // Colors setup
      vec3 bgColor = vec3(0.02, 0.02, 0.02); // Pure dark background (#050505)
      vec3 accentColor = vec3(0.66, 0.33, 0.97); // Bright purple (#a855f7)

      // Mix the colors based on where the lines are drawn (with a 0.4 opacity)
      vec3 finalColor = mix(bgColor, accentColor, lines * 0.4);

      gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Helper to compile the shaders
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

// Compile shaders and build the WebGL program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Create the geometry (Two triangles that make a full screen rectangle)
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0, -1.0,  1.0,  1.0
]), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Get variable locations so JavaScript can talk to the Shader
const timeLocation = gl.getUniformLocation(program, "u_time");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

// The Render Engine
function render(time) {
  time *= 0.001; // Convert time to seconds
  
  // Automatically adjust canvas resolution on window resize
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  
  // Pass the current time and screen size to the GPU
  gl.uniform1f(timeLocation, time);
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  
  // Draw the image
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  
  // Loop infinitely at max framerate
  requestAnimationFrame(render);
}

// Start the engine
requestAnimationFrame(render);
