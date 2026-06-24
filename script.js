(function () {
  const scene = document.getElementById('scene');
  const container = document.getElementById('container');
  const ambientLight = document.getElementById('ambientLight');
  const glassCard = document.querySelector('.glass-card');

  window.addEventListener('mousemove', (e) => {
    const mX = e.clientX;
    const mY = e.clientY;
    
    const px = mX / window.innerWidth - 0.5;
    const py = mY / window.innerHeight - 0.5;

    // Ambient tracking
    ambientLight.style.transform = `translate3d(${mX}px, ${mY}px, 0)`;

    // Parallax orientation limits
    scene.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 12}deg)`;
    container.style.transform = `translate3d(${px * -15}px, ${py * -12}px, 0)`;

    // Glass glare card update
    if (glassCard) {
      const cardRect = glassCard.getBoundingClientRect();
      const cardX = ((mX - cardRect.left) / cardRect.width) * 100;
      const cardY = ((mY - cardRect.top) / cardRect.height) * 100;
      
      glassCard.style.setProperty('--mx', `${cardX}%`);
      glassCard.style.setProperty('--my', `${cardY}%`);
    }
  });

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();

      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;

      const rx = (py - 0.5) * -22;
      const ry = (px - 0.5) * 22;

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
