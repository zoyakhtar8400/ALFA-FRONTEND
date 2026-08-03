import { BrowserQRCodeReader, BrowserMultiFormatReader } from '@zxing/library';
import { Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';

const zxingQrReader = new BrowserQRCodeReader();
const zxingMultiReader = new BrowserMultiFormatReader();
const jsQrScanner = typeof jsQR === 'function' ? jsQR : (jsQR?.default || jsQR);

/**
 * Native Browser BarcodeDetector Engine (Chrome, Edge, Android, Safari)
 */
async function scanNativeBarcodeDetector(imageOrCanvas) {
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await detector.detect(imageOrCanvas);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return barcodes[0].rawValue.trim();
      }
    } catch (e) {
      /* fallback */
    }
  }
  return null;
}

/**
 * Creates 2D context with willReadFrequently: true
 */
function getCanvasCtx(canvas) {
  return canvas.getContext('2d', { willReadFrequently: true });
}

/**
 * Secondary jsQR pass
 */
function tryJsQr(imageData) {
  if (!imageData || !imageData.width || !imageData.height) return null;
  try {
    const code = jsQrScanner(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });
    if (code && code.data && code.data.trim().length > 10) {
      return code.data.trim();
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

/**
 * Binarizes image data
 */
function binarizeImageData(imageData, threshold = 128) {
  const d = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < d.length; i += 4) {
    const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    const val = lum > threshold ? 255 : 0;
    d[i] = val;
    d[i + 1] = val;
    d[i + 2] = val;
  }
  return new ImageData(d, imageData.width, imageData.height);
}

/**
 * Scans image canvas using Native BarcodeDetector + ZXing + Canvas multi-scale fallback
 */
export async function scanCanvasMultiScale(canvas) {
  // 1. Try Native GPU BarcodeDetector API (Ultra fast & accurate)
  const nativeResult = await scanNativeBarcodeDetector(canvas);
  if (nativeResult) return nativeResult;

  const ctx = getCanvasCtx(canvas);
  if (!ctx) return null;

  const width = canvas.width;
  const height = canvas.height;
  if (width < 20 || height < 20) return null;

  // 2. Direct jsQR pass
  let result = tryJsQr(ctx.getImageData(0, 0, width, height));
  if (result) return result;

  // 3. Multi-resolution downscaling
  const targetWidths = [1200, 800, 1600, 600, 2000];
  for (const tw of targetWidths) {
    if (Math.abs(width - tw) < 80) continue;

    const scale = tw / width;
    const th = Math.round(height * scale);
    if (tw < 40 || th < 40 || tw * th > 16_000_000) continue;

    try {
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = tw;
      scaledCanvas.height = th;
      const sCtx = getCanvasCtx(scaledCanvas);
      if (!sCtx) continue;

      sCtx.drawImage(canvas, 0, 0, tw, th);

      // Try native detector on scaled canvas
      const nativeScaled = await scanNativeBarcodeDetector(scaledCanvas);
      if (nativeScaled) return nativeScaled;

      const imgData = sCtx.getImageData(0, 0, tw, th);
      result = tryJsQr(imgData);
      if (result) return result;

      result = tryJsQr(binarizeImageData(imgData, 128));
      if (result) return result;
    } catch (e) {
      /* continue */
    }
  }

  // 4. Sub-Region Crop Passes
  const crops = [
    { x: 0.2, y: 0.2, w: 0.6, h: 0.6 },
    { x: 0.35, y: 0.25, w: 0.65, h: 0.75 },
    { x: 0.0, y: 0.3, w: 0.7, h: 0.7 },
    { x: 0.4, y: 0.0, w: 0.6, h: 0.6 },
  ];

  for (const c of crops) {
    try {
      const cx = Math.round(width * c.x);
      const cy = Math.round(height * c.y);
      const cw = Math.round(width * c.w);
      const ch = Math.round(height * c.h);

      if (cw < 40 || ch < 40) continue;

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cw;
      cropCanvas.height = ch;
      const cCtx = getCanvasCtx(cropCanvas);
      if (!cCtx) continue;

      cCtx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);

      const nativeCrop = await scanNativeBarcodeDetector(cropCanvas);
      if (nativeCrop) return nativeCrop;

      const imgData = cCtx.getImageData(0, 0, cw, ch);
      result = tryJsQr(imgData);
      if (result) return result;

      result = tryJsQr(binarizeImageData(imgData, 128));
      if (result) return result;
    } catch (err) {
      /* continue */
    }
  }

  return null;
}

/**
 * Reads image File object using Html5Qrcode + Native BarcodeDetector + ZXing + Canvas fallback
 */
export async function scanImageFile(file) {
  // 1. Try Html5Qrcode.scanFile engine
  try {
    const html5QrCode = new Html5Qrcode('temp-qr-reader-div-' + Date.now(), { verbose: false });
    const text = await html5QrCode.scanFile(file, true);
    if (text && text.trim().length > 10) {
      return text.trim();
    }
  } catch (err) {
    /* continue to next engine */
  }

  // 2. Try ZXing BrowserQRCodeReader
  const url = URL.createObjectURL(file);
  try {
    const zxingResult = await zxingQrReader.decodeFromImageUrl(url);
    URL.revokeObjectURL(url);
    if (zxingResult && zxingResult.getText()) {
      return zxingResult.getText().trim();
    }
  } catch (err) {
    URL.revokeObjectURL(url);
  }

  // 3. Try ZXing MultiFormatReader
  const url2 = URL.createObjectURL(file);
  try {
    const zxingResult2 = await zxingMultiReader.decodeFromImageUrl(url2);
    URL.revokeObjectURL(url2);
    if (zxingResult2 && zxingResult2.getText()) {
      return zxingResult2.getText().trim();
    }
  } catch (err) {
    URL.revokeObjectURL(url2);
  }

  // 4. Try Canvas Multi-Scale + Native BarcodeDetector + jsQR fallback
  return new Promise((resolve, reject) => {
    const img = new Image();
    const imgUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(imgUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = getCanvasCtx(canvas);
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const result = await scanCanvasMultiScale(canvas);
      resolve(result);
    };

    img.onerror = () => {
      URL.revokeObjectURL(imgUrl);
      reject(new Error('Failed to load image file'));
    };

    img.src = imgUrl;
  });
}

export const scanAadhaarFile = scanImageFile;

