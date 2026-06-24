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
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      btn.style.setProperty('--ry', (px * 16).toFixed(2) + 'deg');
      btn.style.setProperty('--rx', (-py * 16).toFixed(2) + 'deg');
    });
    btn.addEventListener('pointerleave', function () {
      btn.style.setProperty('--rx', '0deg');
      btn.style.setProperty('--ry', '0deg');
    });
  });
})();
