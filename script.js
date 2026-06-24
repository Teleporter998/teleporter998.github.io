(function () {
  const scene = document.getElementById('scene');
  const container = document.getElementById('container');
  const ambientLight = document.getElementById('ambientLight');
  const glassCard = document.querySelector('.glass-card');

  // INTERACTIVE MOUSE MATRIX
  window.addEventListener('mousemove', (e) => {
    const mX = e.clientX;
    const mY = e.clientY;
    
    const px = mX / window.innerWidth - 0.5;
    const py = mY / window.innerHeight - 0.5;

    // 1. Smoothly track the ambient backdrop glow position
    ambientLight.style.transform = `translate3d(${mX}px, ${mY}px, 0)`;

    // 2. Parallax orientation for the overall viewport layout
    scene.style.transform = `rotateY(${px * 16}deg) rotateX(${-py * 14}deg)`;
    container.style.transform = `translate3d(${px * -20}px, ${py * -15}px, 0)`;

    // 3. Dynamic glass illumination reflecting over the central profile card
    if (glassCard) {
      const cardRect = glassCard.getBoundingClientRect();
      const cardX = ((mX - cardRect.left) / cardRect.width) * 100;
      const cardY = ((mY - cardRect.top) / cardRect.height) * 100;
      
      glassCard.style.setProperty('--mx', `${cardX}%`);
      glassCard.style.setProperty('--my', `${cardY}%`);
    }
  });

  // 3D BUTTON CONTROL MATRIX
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();

      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;

      // Tilts button faces dynamically against mouse coordinate inputs
      const rx = (py - 0.5) * -25;
      const ry = (px - 0.5) * 25;

      btn.style.setProperty('--rx', rx + 'deg');
      btn.style.setProperty('--ry', ry + 'deg');

      btn.style.setProperty('--mx', px * 100 + '%');
      btn.style.setProperty('--my', py * 100 + '%');
    });

    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--rx', '0deg');
      btn.style.setProperty('--ry', '0deg');
    });
  });

})();
