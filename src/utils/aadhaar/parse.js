import { parseSecureQr } from './secureQr.js';
import { parseLegacyXml } from './legacyXml.js';
import { decodePhotoToDataUrl } from './photo.js';

/**
 * Parses raw Aadhaar QR string payload (BigInt base10, XML text, or scanner string)
 */
export async function parseAadhaarQr(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Invalid or empty QR payload string');
  }

  const trimmed = raw.trim().replace(/^["']|["']$/g, '');
  const digitsOnly = trimmed.replace(/\s+/g, '');

  let parsedResult = null;

  // 1. Numeric BigInt string check (UIDAI Secure QR)
  if (/^\d+$/.test(digitsOnly) || digitsOnly.length > 80) {
    try {
      parsedResult = parseSecureQr(digitsOnly);
    } catch (e) {
      if (trimmed.includes('<') || trimmed.includes('xml')) {
        parsedResult = parseLegacyXml(trimmed);
      } else {
        throw e;
      }
    }
  }
  // 2. Legacy XML check (<PrintLetterBarcodeData ... />)
  else if (trimmed.includes('<PrintLetterBarcodeData') || trimmed.includes('xml') || trimmed.includes('co=')) {
    parsedResult = parseLegacyXml(trimmed);
  } else {
    // Fallback attempt secure QR
    try {
      parsedResult = parseSecureQr(digitsOnly);
    } catch (e) {
      throw new Error('Unrecognized Aadhaar QR code format. Please ensure you are scanning a valid UIDAI Aadhaar QR code.');
    }
  }

  // 3. Decode biometric photo if present
  let photoDataUrl = null;
  if (parsedResult.photoBytes) {
    try {
      photoDataUrl = await decodePhotoToDataUrl(parsedResult.photoBytes);
    } catch (err) {
      console.warn('Biometric photo decoding warning:', err);
    }
  }

  return {
    ...parsedResult,
    photoDataUrl
  };
}
