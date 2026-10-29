/**
 * Utility to fix and lock the display scale at 100%,
 * completely disabling browser zoom in and zoom out via:
 * - Ctrl + Mouse Wheel
 * - Trackpad pinch-to-zoom
 * - Ctrl + '+' / '-' / '0' / '=' / '_' shortcuts
 * - Multi-touch pinch gestures
 * - Double-tap to zoom
 */
export function initZoomPrevention() {
  if (typeof window === 'undefined') return;

  // 1. Prevent Ctrl + Mouse Wheel and Trackpad pinch-to-zoom
  window.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 2. Prevent Ctrl + '+', '-', '0', '=', '_' zoom keyboard shortcuts
  window.addEventListener(
    'keydown',
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        const zoomKeys = ['+', '-', '=', '_', '0'];
        const zoomKeyCodes = [187, 189, 107, 109, 96, 48];
        if (
          zoomKeys.includes(e.key) ||
          zoomKeyCodes.includes(e.keyCode) ||
          e.code === 'NumpadAdd' ||
          e.code === 'NumpadSubtract' ||
          e.code === 'Equal' ||
          e.code === 'Minus' ||
          e.code === 'Digit0'
        ) {
          e.preventDefault();
        }
      }
    },
    { capture: true }
  );

  // 3. Prevent Touch Pinch-to-Zoom (multi-touch)
  document.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 4. Prevent Double-Tap zoom on touch screens
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );

  // 5. Prevent Safari gesture zooming
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());
}
