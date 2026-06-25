const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0;

// Ensures the canvas stays crisp on high-res monitors and resizes perfectly
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// The main render loop
function draw() {
    // Clear the previous frame
    ctx.clearRect(0, 0, width, height);
    
    // Style the lines (Subtle glowing purple)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#a855f7';
    
    // How many horizontal wavy lines to draw
    const lines = 18; 
    const step = height / lines;
    
    for (let i = 0; i <= lines; i++) {
        ctx.beginPath();
        
        // Loop horizontally across the screen
        for (let x = 0; x <= width; x += 20) {
            // Combine three different mathematical waves at different speeds
            // to create an unpredictable, organic "liquid" shape
            const wave1 = Math.sin(x * 0.003 + time) * 45;
            const wave2 = Math.sin(x * 0.008 - time * 1.5 + i * 0.5) * 20;
            const wave3 = Math.cos(x * 0.005 + time * 0.5) * 35;
            
            // Calculate final vertical position
            const yOffset = (i * step) - 50; 
            const y = yOffset + wave1 + wave2 + wave3;
            
            // Connect the path
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        // Draw the finished line to the screen
        ctx.stroke();
    }
    
    // Advance time to make it move
    time += 0.006; 
    
    // Request the next frame (locks to monitor refresh rate)
    requestAnimationFrame(draw);
}

// Start the engine
draw();
