(function () {
  const scene = document.getElementById('scene');
  const container = document.getElementById('container');

  // CAMERA MOVEMENT
  window.addEventListener('mousemove', (e) => {
    const px = e.clientX / window.innerWidth - 0.5;
    const py = e.clientY / window.innerHeight - 0.5;

    scene.style.transform =
      `rotateY(${px * 12}deg) rotateX(${-py * 10}deg)`;

    container.style.transform =
      `translate(${px * -12}px, ${py * -8}px)`;
  });

  // 3D BUTTONS + LIGHT
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();

      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;

      const rx = (py - 0.5) * -20;
      const ry = (px - 0.5) * 20;

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
