import { useEffect, useRef } from 'react';
import { parseAadhaarQr } from '../utils/aadhaar/parse.js';

/**
 * Custom React hook listening globally for USB 2D Barcode Scanner HID streams
 */
export function useHardwareScanner(onScanned, options = {}) {
  const { enabled = true, minLength = 30, maxDelayMs = 250 } = options;
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = async (e) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Ignore input elements if typing manually, UNLESS it's a super fast scanner stream
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

      if (e.key === 'Enter') {
        const payload = bufferRef.current.trim();
        bufferRef.current = '';

        if (payload.length >= minLength) {
          try {
            const parsed = await parseAadhaarQr(payload);
            if (onScanned) onScanned(parsed);
          } catch (err) {
            console.warn('Hardware scanner payload parsing skipped:', err.message);
          }
        }
        return;
      }

      // Reset buffer if delay between keystrokes is too long (manual human typing)
      if (timeDiff > maxDelayMs && bufferRef.current.length > 0 && !isInputFocused) {
        bufferRef.current = '';
      }

      // Capture single printable characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, minLength, maxDelayMs, onScanned]);
}
