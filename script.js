(function () {
  const glow = document.getElementById('glow');

  // A simple, lightweight cursor tracker for the background light
  window.addEventListener('mousemove', (e) => {
    if (glow) {
      // Use requestAnimationFrame for smooth performance
      requestAnimationFrame(() => {
        glow.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      });
    }
  });
})();
