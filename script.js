// Drives the interactive "camera": tilts the 3D tunnel and gives the
// foreground text a touch of opposite parallax. Skipped entirely if the
// visitor prefers reduced motion — the tunnel still moves on its own via CSS.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var scene = document.getElementById('scene');
  var container = document.getElementById('container');

  if (scene) {
    window.addEventListener('mousemove', function (e) {
      var px = e.clientX / window.innerWidth - 0.5;
      var py = e.clientY / window.innerHeight - 0.5;

      scene.style.transform =
        'rotateY(' + (px * 10).toFixed(2) + 'deg) ' +
        'rotateX(' + (-py * 8).toFixed(2) + 'deg)';

      if (container) {
        container.style.transform =
          'translate(' + (px * -10).toFixed(2) + 'px, ' + (py * -6).toFixed(2) + 'px)';
      }
    });
  }

  // Per-button cursor-tilt for a real 3D "press" feel
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('pointermove', e => {
    const r = btn.getBoundingClientRect();

    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    const rx = (py - 0.5) * -20;
    const ry = (px - 0.5) * 20;

    btn.style.setProperty('--rx', rx + 'deg');
    btn.style.setProperty('--ry', ry + 'deg');

    // lighting position
    btn.style.setProperty('--mx', px * 100 + '%');
    btn.style.setProperty('--my', py * 100 + '%');
  });

  btn.addEventListener('pointerleave', () => {
    btn.style.setProperty('--rx', '0deg');
    btn.style.setProperty('--ry', '0deg');
  });
});
})();
